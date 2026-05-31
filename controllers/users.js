const passport = require('passport');
const User = require('../models/user');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { getSafeRedirectUrl } = require('../utils/safeRedirect');

module.exports.renderRegister = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    const { email, username, password } = req.body;
    if (!email?.trim() || !username?.trim() || !password) {
        req.flash('error', 'Email, username, and password are required');
        return res.redirect('/register');
    }

    try {
        const user = new User({ email: email.trim(), username: username.trim() });
        const registeredUser = await User.register(user, password);
        req.session.regenerate((regenErr) => {
            if (regenErr) return next(regenErr);
            req.login(registeredUser, (loginErr) => {
                if (loginErr) return next(loginErr);
                req.flash('success', 'welcome to yelp Camp!!');
                res.redirect('/campgrounds');
            });
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.renderLogin = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }
    res.render('users/login');
};

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info?.message || 'Invalid username or password');
            return res.redirect('/login');
        }
        const redirectUrl = getSafeRedirectUrl(req.session.returnTo);
        delete req.session.returnTo;
        req.session.regenerate((regenErr) => {
            if (regenErr) return next(regenErr);
            req.login(user, (loginErr) => {
                if (loginErr) return next(loginErr);
                req.flash('success', 'welcome back!');
                res.redirect(redirectUrl);
            });
        });
    })(req, res, next);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.regenerate((regenErr) => {
            if (regenErr) return next(regenErr);
            req.flash('success', 'good bye!');
            res.redirect('/campgrounds');
        });
    });
};

module.exports.showProfile = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/campgrounds');
    }
    const campgrounds = await Campground.find({ author: req.params.id });
    const reviews = await Review.find({ author: req.params.id }).populate('campground');
    res.render('users/show', { user, campgrounds, reviews });
};
