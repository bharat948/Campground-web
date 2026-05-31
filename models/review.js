const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema({
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    campground: {
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [replySchema]
});

reviewSchema.index({ campground: 1 });
reviewSchema.index({ author: 1 });

module.exports = mongoose.model('Review', reviewSchema);