// router.get('/',UserController.getAllUsers);    

const express = require('express');
const router = express.Router();
const UserController = require('../controller/User');
const User=require('../model/user');

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.get('/search/email', UserController.searchByEmail);


// routes/User.js //for mention
router.get('/search', async (req, res) => {
  const query = req.query.q;

  try {
    // if (!query) {
    //   return res.status(400).json({ message: "Query is required" });
    // }

      const users = await User.find( 
        query 
        ? { firstname: { $regex: query, $options: 'i' } }
        :{}
  ).select('_id firstname');

    res.json(users);
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Your existing auth middleware
const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Change Password Route
router.post('/change-password', authMiddleware, UserController.changePassword);
router.post('/forget-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);






router.get('/me', UserController.getProfile);         //login user  view their profile
router.patch('/me', UserController.updateProfile);    //login user update //not use yet

router.get('/', UserController.findAll);                  
router.get('/:id', UserController.findOne);
router.patch('/:id', UserController.updateUser);        //upadte
router.delete('/:id', UserController.deleteUser);       //delete

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
});




module.exports = router;

