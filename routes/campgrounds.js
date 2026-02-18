const express = require('express');
const path = require('path');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const { campgroundSchema } = require('../schemas.js');
const { isloggedIn, validateCampground, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .jpeg, .jpg, .png, .webp files are allowed'));
    }
});

router.get('/', catchAsync(campgrounds.index));
router.get('/new', isloggedIn, campgrounds.renderNewForm);
router.post('/', isloggedIn, upload.array('image', 6), validateCampground, catchAsync(campgrounds.createCampground));
router.get('/:id', catchAsync(campgrounds.showCampground));
router.get('/:id/edit', isloggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
router.put('/:id', isloggedIn, isAuthor, upload.array('image', 6), validateCampground, catchAsync(campgrounds.updateCampground));
router.delete('/:id', isloggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
module.exports = router;
