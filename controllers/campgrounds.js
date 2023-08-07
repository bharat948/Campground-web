const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapboxToken })
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });

}
module.exports.renderNewForm = (req, res) => {
    // if(!req.isAuthenticated()){
    //     req.flash('error','you must be signed-in!');
    //    return  res.redirect('/login');
    // }
    res.render('campgrounds/new');
}
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1

    }).send()
    // res.send("ok!");
    // if (!req, body.campground) throw new ExpressError('invalid campground data', 400);
    const campground = new Campground(req.body.campground);
    campground.geometry=geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))

    campground.author = req.user._id;
    await campground.save();
    // console.log(campground);
    req.flash('success', 'successfully created a campground')

    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'cannot find that campground');
        return res.redirect('/campgrounds')
    }
    // if (!campground.author.equals(req.user._id)) {
    //     req.flash('success', 'you do no have permission to do that!')

    //     return res.redirect(`/campgrounds/${id}`);
    // }
    res.render('campgrounds/edit', { campground })
}
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // const campground = await Campground.findById(id);
    // if (!campground.author.equals(req.user._id)) {
    //     req.flash('success', 'you do no have permission to do that! ')

    //     return res.redirect(`/campgrounds/${campground._id}`);
    // }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs)
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
       await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})

    }
    req.flash('success', 'successfully updated  campground')

    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'deleted campground')

    res.redirect('/campgrounds');
}