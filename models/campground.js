const mongoose = require('mongoose');
const Review = require('./review')
const User = require('../models/user');
const Schema = mongoose.Schema;
const ImageSchema=new Schema(  {
    url: String,
    filename: String
})
//https://res.cloudinary.com/douqbebwk/image/upload/w-300/v1600113904/YelpCamp/gxgle;iuhui4hf.png

ImageSchema.virtual('thumbnail').get(function(){
     return this.url.replace('/upload','/upload/w_200')
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema);