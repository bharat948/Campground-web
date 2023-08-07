const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review')
const reviews=require('../controllers/reviews');
const { reviewSchema } = require('../schemas.js');
const { validateReview, isloggedIn,isReviewAuthor } = require('../middleware')
// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     }
//     else {
//         next();
//     }
// }

router.post('/', isloggedIn, validateReview, catchAsync(reviews.createReview))
router.delete('/:reviewId', isloggedIn, isReviewAuthor,catchAsync(reviews.deleteReview))


module.exports = router;