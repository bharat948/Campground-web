if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}
// console.log(proces.s.env.SECRET);
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas')
const { reviewSchema } = require('./schemas')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review')
// const { captureRejectionSymbol } = require('events');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds')

const reviewRoutes = require('./routes/reviews');


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});



const app = express();







app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
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
app.use((req, res, next) => {
    // console.log(req.session.returnTo);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
// /register - form
// post/register -create a user

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'batidar619@gmail.com', username: 'bharat948' });
//     const newUser = await User.register(user, '1236');
//     res.send(newUser);
// })
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.get('/', (req, res) => {
    res.render('home');
});
// app.get('/campgrounds', catchAsync(async (req, res) => {
//     const campgrounds = await Campground.find({});
//     res.render('campgrounds/index', { campgrounds });
// }));
// app.get('/campgrounds/new', (req, res) => {
//     res.render('campgrounds/new');
// });

// app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
//     // if (!req, body.campground) throw new ExpressError('invalid campground data', 400);

//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`)
// }));
// app.get('/campgrounds/:id', catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id).populate('reviews');
//     res.render('campgrounds/show', { campground })
// }));
// app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id)
//     res.render('campgrounds/edit', { campground })
// }));
// app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
//     res.redirect(`/campgrounds/${campground._id}`);
// }));
// app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect('/campgrounds');
// }));
// app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }))
// app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${id}`)
// }))
app.all('*', (req, res, next) => {

    next(new ExpressError('page not found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'something went wrong ' } = err;
    if (!err.message) err.message = 'oh no ,something went wrong'
    res.status(statusCode).render('error', { err });
})
app.listen(3000, () => {
    console.log('Serving on port 3000!!!');
})
//post /campground/;id/reviews.