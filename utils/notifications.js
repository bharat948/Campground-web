const Notification = require('../models/notification');

async function createLikeNotification({ recipient, actor, review, campground }) {
    await Notification.create({
        recipient,
        actor,
        type: 'like',
        review,
        campground,
        read: false
    });
}

async function createReplyNotification({ recipient, actor, review, campground, replyId }) {
    await Notification.create({
        recipient,
        actor,
        type: 'reply',
        review,
        campground,
        reply: replyId,
        read: false
    });
}

async function removeLikeNotification({ actor, review }) {
    await Notification.deleteOne({ type: 'like', actor, review });
}

module.exports = {
    createLikeNotification,
    createReplyNotification,
    removeLikeNotification
};
