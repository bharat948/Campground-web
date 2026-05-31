const Notification = require('../models/notification');

module.exports.markRead = async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification || !notification.recipient.equals(req.user._id)) {
        req.flash('error', 'Notification not found');
        return res.redirect('/campgrounds');
    }
    notification.read = true;
    await notification.save();
    res.redirect(`/campgrounds/${notification.campground}`);
};

module.exports.markAllRead = async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, read: false },
        { read: true }
    );
    const redirectUrl = req.get('Referrer') || '/campgrounds';
    res.redirect(redirectUrl);
};
