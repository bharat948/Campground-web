const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isloggedIn } = require('../middleware');
const notifications = require('../controllers/notifications');

router.post('/read-all', isloggedIn, catchAsync(notifications.markAllRead));
router.post('/:id/read', isloggedIn, catchAsync(notifications.markRead));

module.exports = router;
