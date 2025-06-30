const express = require('express');
const router = express.Router();
const FriendRequestController = require('../controller/FriendRequest');

router.post('/send/:id', FriendRequestController.sendRequest);
router.post('/accept/:id', FriendRequestController.acceptRequest);
router.post('/reject/:id', FriendRequestController.rejectRequest);
router.get('/my-requests', FriendRequestController.getMyRequests);
router.get('/status/:id', FriendRequestController.getRequestStatus);       // friend status
router.delete('/unfriend/:id', FriendRequestController.unfriend);     // unfriend


router.get('/my-friends', FriendRequestController.getMyFriends); //friend ni list mate


module.exports = router;
