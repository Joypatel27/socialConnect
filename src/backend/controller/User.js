// //show in frontend as response of user action also show in postman
const UserModel = require('../model/user');
const bcrypt = require('bcrypt');
const FriendRequest = require('../model/FriendRequest');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


// User Authentication
// Register new user
exports.create = async (req, res) => {
  const { firstname, lastname, number, email, password, image } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).send({ message: "All fields are required" });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: "Email already exists" });
    }
     const hashedPassword = await bcrypt.hash(password, 10); 

    const newUser = new UserModel({ firstname, lastname, number, email, password:hashedPassword, image });
    const savedUser = await newUser.save();
    res.status(201).send({ message: "User created successfully", user: savedUser });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email' });

       const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    req.session.user = user;
    req.session.userId = user._id;
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
};

// Logged-in User Profile
// Get logged-in user profile
exports.getProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  res.json(req.session.user);
};

// Update profile of logged-in user
exports.updateProfile = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.session.user._id,
      req.body,
      { new: true }
    );
    req.session.user = updatedUser;
    res.json({ message: 'Updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error });
  }
};

// Get all users 
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const loggedInUserId = req.query.userId;

    let sort = {};
    const sortOption = req.query.sort;
    if (sortOption) {
      const [field, order] = sortOption.split('_');
      sort[field] = order === 'asc' ? 1 : -1;
    }

    const allUsers = await UserModel.find().sort(sort).skip(skip).limit(limit);
    const totalUsers = await UserModel.countDocuments();

    const filteredUsers = allUsers.filter(u => u._id.toString() !== loggedInUserId);

    const enhancedUsers = await Promise.all(
      filteredUsers.map(async (user) => {
        const request = await FriendRequest.findOne({
          $or: [
            { sender: loggedInUserId, receiver: user._id },
            { sender: user._id, receiver: loggedInUserId }
          ]
        });

        let friendStatus = 'none';
        if (request) {
          if (request.status === 'accepted') {
            friendStatus = 'friends';
          } else if (request.status === 'pending') {
            friendStatus =
              request.sender.toString() === loggedInUserId ? 'sent' : 'received';
          }
        }

        return {
          ...user.toObject(), // convert Mongoose doc to plain object
          friendStatus
        };
      })
    );

    res.status(200).json({
      users: enhancedUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};
// Get a single user by ID
exports.findOne = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
};

// Update user by ID (admin or public usage)
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found"});
    res.json({
      message: "User updated successfully",
      user: updatedUser});
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error });
  }
};

// Delete user by ID (prevent self-delete)
exports.deleteUser = async (req, res) => {
  if (req.params.id === req.session.userId) {
    return res.status(403).json({ message: "You cannot delete your own account." });
  }

  try {
    await UserModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error });
  }
};

// Search user by email
exports.searchByEmail = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send({ message: "Email is required" });

  try {
    const users = await UserModel.find({
      $or:[
      {email: { $regex: email,$options:'i' } }
      ]// partial, case-insensitive match
    });

    if (users.length === 0) return res.status(404).send({ message: "No users found" });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.session.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ message: 'If this email exists, a reset link has been generated.' });
    }

    // Generate token (JWT)
    const token = jwt.sign(
      { userId: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: '1h' }
    );

    // build the link for frontend
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // display link
    return res.json({
      message: 'Reset link generated.',
      resetLink
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    res.status(400).json({ message: 'Invalid or expired reset link.' });
  }
};
