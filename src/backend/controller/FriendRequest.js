const FriendRequest = require('../model/FriendRequest')
const User = require('../model/user');

//friend logic for sending 

exports.sendRequest = async (req, res) => {
  const senderId = req.session.userId;
  const receiverId = req.params.id;

  try {
    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({  //check kare jo request exits  che ke ni
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const newRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//

exports.acceptRequest = async (req, res) => {
  const receiverId = req.session.userId;  //recive user req
  const senderId = req.params.id;   //request sent

  try {
    const request = await FriendRequest.findOne({   //
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    request.status = 'accepted';    
    await request.save();

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender.friends.includes(receiverId)) sender.friends.push(receiverId);
    if (!receiver.friends.includes(senderId)) receiver.friends.push(senderId);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.rejectRequest = async (req, res) => {
  const receiverId = req.session.userId;
  const senderId = req.params.id;

  try {
    const request = await FriendRequest.findOneAndDelete({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });

    if (!request) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getMyRequests = async (req, res) => {
  const userId = req.session.userId;

  try {
    const received = await FriendRequest.find({ receiver: userId, status: 'pending' }).populate('sender', 'firstname email');
    const sent = await FriendRequest.find({ sender: userId, status: 'pending' }).populate('receiver', 'firstname email');

    res.status(200).json({ received, sent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRequestStatus = async (req, res) => {
  const userId = req.session.userId;
  const otherUserId = req.params.id;

  try {
    const request = await FriendRequest.findOne({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });

    if (!request) return res.status(200).json({ status: "none" });

    if (request.status === 'accepted') return res.status(200).json({ status: "friends" });
    if (request.sender.toString() === userId) return res.status(200).json({ status: "sent" });
    return res.status(200).json({ status: "received" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getReceivedRequests = async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const received = await FriendRequest.find({
      receiver: userId,
      status: 'pending',
    }).populate('sender', 'firstname email');

    res.status(200).json(received);
  } catch (err) {
    console.error("Error in getReceivedRequests:", err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Unfriend logic
exports.unfriend = async (req, res) => {
  const userId = req.session.userId;
  const friendId = req.params.id;

  try {
    // Find and delete the accepted friend request (regardless of direction)
    const result = await FriendRequest.findOneAndDelete({
      status: 'accepted',
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    });

    if (!result) {
      return res.status(404).json({ message: 'Friend connection not found' });
    }

    res.json({ message: 'Unfriended successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error unfriending user' });
  }
};


exports.getMyFriends = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const acceptedRequests = await FriendRequest.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { receiver: userId, status: 'accepted' }
      ]
    }).populate('sender receiver');
  
    // Extract friend users (the other person)
    const friends = acceptedRequests.map(req => {
      return req.sender._id.equals(userId) ? req.receiver : req.sender;
    });
    console.log("Accepted Requests:", acceptedRequests);
    console.log("Extracted Friends:", friends);
    acceptedRequests.forEach(req => {
    console.log("LOGGED IN AS:", userId);
    console.log("Sender ID:", req.sender._id);
    console.log("Receiver ID:", req.receiver._id);
    });


    res.json(friends);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching friends list' });
  }
};