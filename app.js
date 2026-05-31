if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schemas');
const { reviewSchema } = require('./schemas');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
}

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'dev-secret-set-SESSION_SECRET-in-env',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
if (process.env.NODE_ENV !== 'test') {
    const store = MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        touchAfter: 24 * 3600
    });
    store.on('error', (e) => {
        console.error('SESSION STORE ERROR', e);
    });
    sessionConfig.store = store;
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user ?? null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.get('/', async (req, res) => {
    const [campgroundCount, reviewCount, userCount] = await Promise.all([
        Campground.countDocuments(),
        Review.countDocuments(),
        User.countDocuments()
    ]);
    res.render('home', {
        stats: { campgroundCount, reviewCount, userCount }
    });
});
app.get('/home', (req, res) => {
    res.redirect('/');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404));
});
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'Each image must be under 2MB');
        return res.redirect('back');
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        req.flash('error', 'You can upload a maximum of 6 images');
        return res.redirect('back');
    }
    const statusCode = (err && err.statusCode) || 500;
    const message = (err && err.message) ? err.message : 'Something went wrong';
    const safeErr = err || {};
    safeErr.message = message;
    safeErr.statusCode = statusCode;
    if (!err.message) err.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error', { err: safeErr });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Serving on port ${PORT}`);
    });
    process.on('SIGTERM', () => {
        mongoose.connection.close(() => {
            process.exit(0);
        });
    });
}
module.exports = app;
