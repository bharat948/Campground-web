const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'reply'], required: true },
    review: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
    campground: { type: Schema.Types.ObjectId, ref: 'Campground', required: true },
    reply: { type: Schema.Types.ObjectId },
    read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
