const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review')
const reviews=require('../controllers/reviews');
const { reviewSchema } = require('../schemas.js');
const {
    validateReview,
    validateReply,
    isloggedIn,
    isReviewAuthor,
    isReplyAuthor,
    reviewBelongsToCampground
} = require('../middleware');

router.post('/', isloggedIn, validateReview, catchAsync(reviews.createReview));
router.post('/:reviewId/like', isloggedIn, reviewBelongsToCampground, catchAsync(reviews.toggleLikeReview));
router.post('/:reviewId/replies', isloggedIn, reviewBelongsToCampground, validateReply, catchAsync(reviews.createReply));
router.delete('/:reviewId/replies/:replyId', isloggedIn, isReplyAuthor, catchAsync(reviews.deleteReply));
router.delete('/:reviewId', isloggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;