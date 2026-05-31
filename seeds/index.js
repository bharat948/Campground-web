require('dotenv').config();
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const User = require('../models/user');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const campImages = [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84e?w=800&q=80',
    'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80',
    'https://images.unsplash.com/photo-1533873984035-25970ab5101e?w=800&q=80',
    'https://images.unsplash.com/photo-1496080174650-637e023f3991?w=800&q=80',
    'https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=800&q=80',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80',
    'https://images.unsplash.com/photo-1455780589734-7da578839f88?w=800&q=80',
];

const ensureSeedUser = async () => {
    const seedPassword = process.env.SEED_USER_PASSWORD?.trim();
    if (!seedPassword) {
        throw new Error(
            'SEED_USER_PASSWORD is required to run seeds. Set it in .env (local dev only).'
        );
    }
    let user = await User.findOne({ username: 'seeduser' });
    if (!user) {
        const newUser = new User({ email: 'seed@yelpcamp.com', username: 'seeduser' });
        user = await User.register(newUser, seedPassword);
        console.log('Created seed user: seeduser');
    }
    return user;
};

const seedDB = async () => {
    const author = await ensureSeedUser();
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100) + 10;
        const camp = new Campground({
            author: author._id,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Nestled among scenic trails and starry skies, this campground offers a peaceful retreat for hikers, families, and solo adventurers alike. Enjoy fire pits, clean facilities, and easy access to nearby lakes and hiking paths.',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: sample(campImages),
                    filename: `seed/campground-${i}`,
                }
            ]
        });
        await camp.save();
    }
    console.log('Seeded 50 campgrounds');
};

seedDB().then(() => {
    mongoose.connection.close();
});
