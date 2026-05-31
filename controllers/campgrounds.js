const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapboxToken })
module.exports.index = async (req, res) => {
    const { page = 1, search = '' } = req.query;
    const perPage = 8;

    const query = search
        ? {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ]
        }
        : {};

    const options = {
        page: parseInt(page),
        limit: perPage,
    };

    const result = await Campground.paginate(query, options);

    const mapCampgrounds = await Campground.find(query).select('title location geometry');
    const campgroundsGeoJSON = {
        type: 'FeatureCollection',
        features: mapCampgrounds
            .filter(camp => camp.geometry && camp.geometry.coordinates)
            .map(camp => ({
                type: 'Feature',
                geometry: camp.geometry,
                properties: {
                    title: camp.title,
                    location: camp.location,
                    popupMarkup: `<strong><a href="/campgrounds/${camp._id}">${camp.title}</a></strong><p>${camp.location || ''}</p>`
                }
            }))
    };

    res.render('campgrounds/index', {
        campgrounds: result.docs,
        campgroundsGeoJSON,
        currentPage: result.page,
        totalPages: result.totalPages,
        search
    });
}
module.exports.renderNewForm = (req, res) => {
    // if(!req.isAuthenticated()){
    //     req.flash('error','you must be signed-in!');
    //    return  res.redirect('/login');
    // }
    res.render('campgrounds/new');
}
module.exports.createCampground = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        req.flash('error', 'Please upload at least one image');
        return res.redirect('/campgrounds/new');
    }
    const geoResponse = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    if (!geoResponse.body.features.length) {
        req.flash('error', 'Location not found. Please enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    const campground = new Campground(req.body.campground);
    campground.geometry = geoResponse.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))

    campground.author = req.user._id;
    await campground.save();
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
    const geoResponse = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    if (!geoResponse.body.features.length) {
        req.flash('error', 'Location not found. Please enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    const updateData = { ...req.body.campground, geometry: geoResponse.body.features[0].geometry };
    const campground = await Campground.findByIdAndUpdate(id, updateData, { new: true });
    const imgs = (req.files || []).map(f => ({ url: f.path, filename: f.filename }));
    if (imgs.length) campground.images.push(...imgs);
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