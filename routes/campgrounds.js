const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const { campgroundSchema } = require('../schemas.js')
const { isloggedIn, validateCampground, isAuthor } = require('../middleware');
const multer = require('multer');

const { storage } = require('../cloudinary')
const upload = multer({ storage })
router.get('/', catchAsync(campgrounds.index));
router.get('/new', isloggedIn, campgrounds.renderNewForm)

router.post('/', isloggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
router.get('/:id', catchAsync(campgrounds.showCampground));
router.get('/:id/edit', isloggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
router.put('/:id', isloggedIn, isAuthor,upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground));
router.delete('/:id', isloggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
module.exports = router;
















// const campground = require('../models/campground');
// const { equal } = require('joi');


// const validateCampground = (req, res, next) => {

//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     }
//     else {
//         next();
//     }
// }
// const isAuthor = async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findById(id);
//     if (!campground.author.equals(req.user._id)) {
//         req.flash('error', 'you do no have permission to do that! ')

//         return res.redirect(`/campgrounds/${id}`);
//     }
//     next();
// }