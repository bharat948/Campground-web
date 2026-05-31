const Review = require('../models/review');
const Campground = require('../models/campground');
const Notification = require('../models/notification');
const {
    createLikeNotification,
    createReplyNotification,
    removeLikeNotification
} = require('../utils/notifications');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    review.campground = campground._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'posted new review');

    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Notification.deleteMany({ review: reviewId });
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'deleted  review');

    res.redirect(`/campgrounds/${id}`);
};

module.exports.toggleLikeReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const userId = req.user._id;
    const hasLiked = (req.review.likes || []).some(likeId => likeId.equals(userId));

    if (hasLiked) {
        await Review.findByIdAndUpdate(reviewId, { $pull: { likes: userId } });
        await removeLikeNotification({ actor: userId, review: reviewId });
    } else {
        await Review.findByIdAndUpdate(reviewId, { $addToSet: { likes: userId } });
        if (!req.review.author.equals(userId)) {
            await createLikeNotification({
                recipient: req.review.author,
                actor: userId,
                review: reviewId,
                campground: id
            });
        }
    }

    res.redirect(`/campgrounds/${id}`);
};

module.exports.createReply = async (req, res) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    review.replies.push({
        body: req.body.reply.body,
        author: req.user._id
    });
    await review.save();

    const newReply = review.replies[review.replies.length - 1];
    if (!review.author.equals(req.user._id)) {
        await createReplyNotification({
            recipient: review.author,
            actor: req.user._id,
            review: reviewId,
            campground: id,
            replyId: newReply._id
        });
    }

    req.flash('success', 'Posted reply');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReply = async (req, res) => {
    const { id, reviewId, replyId } = req.params;
    await Notification.deleteOne({ type: 'reply', review: reviewId, reply: replyId });
    await Review.findByIdAndUpdate(reviewId, {
        $pull: { replies: { _id: replyId } }
    });
    req.flash('success', 'Deleted reply');
    res.redirect(`/campgrounds/${id}`);
};
