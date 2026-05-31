const { campgroundSchema, reviewSchema, replySchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const Notification = require('./models/notification');
module.exports.isloggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed-in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body, { stripUnknown: true });
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, { stripUnknown: true });
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found');
        return res.redirect(`/campgrounds/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.reviewBelongsToCampground = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review || !review.campground.equals(id)) {
        req.flash('error', 'Review not found');
        return res.redirect(`/campgrounds/${id}`);
    }
    req.review = review;
    next();
};

module.exports.validateReply = (req, res, next) => {
    const { error } = replySchema.validate(req.body, { stripUnknown: true });
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports.isReplyAuthor = async (req, res, next) => {
    const { id, reviewId, replyId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review || !review.campground.equals(id)) {
        req.flash('error', 'Review not found');
        return res.redirect(`/campgrounds/${id}`);
    }
    const reply = review.replies.id(replyId);
    if (!reply) {
        req.flash('error', 'Reply not found');
        return res.redirect(`/campgrounds/${id}`);
    }
    if (!reply.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.loadNotifications = async (req, res, next) => {
    if (!req.user) {
        res.locals.notifications = [];
        res.locals.unreadCount = 0;
        return next();
    }

    const [notifications, unreadCount] = await Promise.all([
        Notification.find({ recipient: req.user._id })
            .sort('-createdAt')
            .limit(10)
            .populate('actor', 'username')
            .populate('campground', 'title'),
        Notification.countDocuments({ recipient: req.user._id, read: false })
    ]);

    res.locals.notifications = notifications;
    res.locals.unreadCount = unreadCount;
    next();
};