/**
 * MongoDB index performance benchmark — before/after comparison.
 *
 * Usage: node scripts/benchmark-indexes.js
 *
 * Uses mongodb-memory-server (no external DB required).
 * Seeds synthetic data, runs explain() on hot queries, reports COLLSCAN vs IXSCAN.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const ITERATIONS = 50;
const CAMPGROUND_COUNT = 2000;
const REVIEW_COUNT = 8000;
const USER_COUNT = 500;

function buildCampgroundSchema(withIndexes) {
    const Schema = mongoose.Schema;
    const schema = new Schema({
        title: String,
        location: String,
        price: Number,
        description: String,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        geometry: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }
        }
    });

    if (withIndexes) {
        schema.index({ author: 1 });
        schema.index({ geometry: '2dsphere' });
        schema.index({ title: 'text', location: 'text' });
    }

    return schema;
}

function buildReviewSchema(withIndexes) {
    const Schema = mongoose.Schema;
    const schema = new Schema({
        body: String,
        rating: Number,
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        campground: { type: Schema.Types.ObjectId, ref: 'Campground' }
    });

    if (withIndexes) {
        schema.index({ campground: 1 });
        schema.index({ author: 1 });
    }

    return schema;
}

function buildUserSchema() {
    const Schema = mongoose.Schema;
    return new Schema({
        username: String,
        email: { type: String, unique: true }
    });
}

const LOCATIONS = [
    'Austin, TX', 'Denver, CO', 'Portland, OR', 'Seattle, WA',
    'Miami, FL', 'Boston, MA', 'Phoenix, AZ', 'Chicago, IL'
];
const TITLES = [
    'Pine Ridge', 'Sunset Valley', 'Crystal Lake', 'Mountain View',
    'Redwood Grove', 'Desert Oasis', 'River Bend', 'Starlight Camp'
];

async function seedData(User, Campground, Review) {
    const users = await User.insertMany(
        Array.from({ length: USER_COUNT }, (_, i) => ({
            username: `user${i}`,
            email: `user${i}@bench.test`
        }))
    );

    const campgrounds = [];
    for (let i = 0; i < CAMPGROUND_COUNT; i++) {
        const author = users[i % users.length]._id;
        campgrounds.push({
            title: `${TITLES[i % TITLES.length]} ${i}`,
            location: LOCATIONS[i % LOCATIONS.length],
            price: 10 + (i % 40),
            description: `Campground description ${i}`,
            author,
            geometry: {
                type: 'Point',
                coordinates: [-97.7431 + (i % 100) * 0.01, 30.2672 + (i % 100) * 0.01]
            }
        });
    }
    const insertedCampgrounds = await Campground.insertMany(campgrounds);

    const reviews = [];
    for (let i = 0; i < REVIEW_COUNT; i++) {
        reviews.push({
            body: `Review body ${i}`,
            rating: 1 + (i % 5),
            author: users[i % users.length]._id,
            campground: insertedCampgrounds[i % insertedCampgrounds.length]._id
        });
    }
    await Review.insertMany(reviews);

    return {
        sampleAuthor: users[0]._id,
        sampleCampground: insertedCampgrounds[0]._id,
        searchTerm: 'Austin'
    };
}

function getWinningPlan(explain) {
    const stage = explain.executionStats?.executionStages
        || explain.queryPlanner?.winningPlan;
    return stage;
}

function findStage(plan, stageName) {
    if (!plan) return null;
    if (plan.stage === stageName || plan.inputStage?.stage === stageName) {
        return plan.stage === stageName ? plan : plan.inputStage;
    }
    if (plan.inputStage) return findStage(plan.inputStage, stageName);
    if (plan.inputStages) {
        for (const s of plan.inputStages) {
            const found = findStage(s, stageName);
            if (found) return found;
        }
    }
    return null;
}

function summarizeExplain(explain) {
    const stats = explain.executionStats || {};
    const plan = getWinningPlan(explain);
    const collscan = findStage(plan, 'COLLSCAN');
    const ixscan = findStage(plan, 'IXSCAN');
    const text = findStage(plan, 'TEXT');
    const geoNear = findStage(plan, 'GEO_NEAR_2DSPHERE') || findStage(plan, '2DSPHERE');

    return {
        stage: collscan ? 'COLLSCAN' : ixscan ? 'IXSCAN' : text ? 'TEXT' : geoNear ? '2DSPHERE' : plan?.stage || 'UNKNOWN',
        docsExamined: stats.totalDocsExamined ?? 0,
        keysExamined: stats.totalKeysExamined ?? 0,
        nReturned: stats.nReturned ?? 0,
        executionTimeMs: stats.executionTimeMillis ?? 0
    };
}

async function timeQuery(fn, iterations = ITERATIONS) {
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6 / iterations;
}

async function runBenchmarks(Campground, Review, samples, useTextSearch, withIndexes) {
    const searchQuery = useTextSearch
        ? { $text: { $search: samples.searchTerm } }
        : {
            $or: [
                { title: { $regex: samples.searchTerm, $options: 'i' } },
                { location: { $regex: samples.searchTerm, $options: 'i' } }
            ]
        };

    const queries = [
        {
            name: 'Campground search (index page)',
            run: () => Campground.find(searchQuery).limit(8).lean(),
            explain: () => Campground.find(searchQuery).limit(8).explain('executionStats')
        },
        {
            name: 'Campground by author (user profile)',
            run: () => Campground.find({ author: samples.sampleAuthor }).lean(),
            explain: () => Campground.find({ author: samples.sampleAuthor }).explain('executionStats')
        },
        {
            name: 'Reviews by author (user profile)',
            run: () => Review.find({ author: samples.sampleAuthor }).lean(),
            explain: () => Review.find({ author: samples.sampleAuthor }).explain('executionStats')
        },
        {
            name: 'Reviews by campground',
            run: () => Review.find({ campground: samples.sampleCampground }).lean(),
            explain: () => Review.find({ campground: samples.sampleCampground }).explain('executionStats')
        },
        {
            name: 'Geo near query (map proximity)',
            skipWithoutGeoIndex: true,
            run: () => Campground.find({
                geometry: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [-97.7431, 30.2672] },
                        $maxDistance: 50000
                    }
                }
            }).limit(20).lean(),
            explain: () => Campground.find({
                geometry: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [-97.7431, 30.2672] },
                        $maxDistance: 50000
                    }
                }
            }).limit(20).explain('executionStats')
        }
    ].filter(q => !q.skipWithoutGeoIndex || withIndexes);

    const results = [];
    for (const q of queries) {
        const explain = await q.explain();
        const summary = summarizeExplain(explain);
        const avgMs = await timeQuery(q.run);
        results.push({ name: q.name, ...summary, avgMs: avgMs.toFixed(3) });
    }
    return results;
}

async function runPhase(withIndexes, useTextSearch) {
    await mongoose.connection.dropDatabase();

    const User = mongoose.model('BenchUser', buildUserSchema());
    const Campground = mongoose.model(
        withIndexes ? 'BenchCampgroundIndexed' : 'BenchCampgroundPlain',
        buildCampgroundSchema(withIndexes)
    );
    const Review = mongoose.model(
        withIndexes ? 'BenchReviewIndexed' : 'BenchReviewPlain',
        buildReviewSchema(withIndexes)
    );

    await Campground.syncIndexes();
    await Review.syncIndexes();

    const samples = await seedData(User, Campground, Review);
    const results = await runBenchmarks(Campground, Review, samples, useTextSearch, withIndexes);

    await mongoose.deleteModel(withIndexes ? 'BenchCampgroundIndexed' : 'BenchCampgroundPlain');
    await mongoose.deleteModel(withIndexes ? 'BenchReviewIndexed' : 'BenchReviewPlain');
    await mongoose.deleteModel('BenchUser');

    return results;
}

function printComparison(before, after) {
    console.log('\n=== MongoDB Index Benchmark ===');
    console.log(`Dataset: ${CAMPGROUND_COUNT} campgrounds, ${REVIEW_COUNT} reviews, ${USER_COUNT} users`);
    console.log(`Iterations per query: ${ITERATIONS}\n`);

    console.log(
        'Query'.padEnd(38),
        'Before'.padEnd(12),
        'After'.padEnd(12),
        'Docs↓'.padEnd(10),
        'Time(ms)'.padEnd(18),
        'Speedup'
    );
    console.log('-'.repeat(100));

    const afterByName = Object.fromEntries(after.map(r => [r.name, r]));

    for (const b of before) {
        const a = afterByName[b.name];
        if (!a) continue;
        const docReduction = b.docsExamined > 0
            ? `${((1 - a.docsExamined / b.docsExamined) * 100).toFixed(0)}%`
            : '—';
        const speedup = b.avgMs > 0 ? `${(b.avgMs / a.avgMs).toFixed(1)}x` : '—';

        console.log(
            b.name.padEnd(38),
            b.stage.padEnd(12),
            a.stage.padEnd(12),
            docReduction.padEnd(10),
            `${b.avgMs} → ${a.avgMs}`.padEnd(18),
            speedup
        );
    }

    const geoOnly = after.find(r => r.name.includes('Geo near'));
    if (geoOnly && !before.find(r => r.name.includes('Geo near'))) {
        console.log(
            'Geo near query (map proximity)'.padEnd(38),
            'N/A (no index)'.padEnd(12),
            geoOnly.stage.padEnd(12),
            '—'.padEnd(10),
            `— → ${geoOnly.avgMs}`.padEnd(18),
            'new capability'
        );
    }
}

async function main() {
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());

    try {
        const before = await runPhase(false, false);
        const after = await runPhase(true, true);
        printComparison(before, after);

        console.log('\n--- Detailed After Stats ---');
        after.forEach(r => {
            console.log(`  ${r.name}: ${r.stage}, docsExamined=${r.docsExamined}, keysExamined=${r.keysExamined}, avg=${r.avgMs}ms`);
        });
    } finally {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongod.stop();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
