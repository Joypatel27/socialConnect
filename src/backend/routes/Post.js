// routes/Post.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createPost } = require('../controller/Postcontroller');
const Postcontroller =require('../controller/Postcontroller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // local folder to store images
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// call controller directly here
router.post('/create', upload.single('image'), createPost);

// routes/Post.js
router.get('/all', Postcontroller.getAllPosts);
router.get('/my', Postcontroller.getMyPosts);
router.delete('/delete/:id', Postcontroller.deletePost);
router.post('/like/:id', Postcontroller.toggleLike);

router.post('/comment/:postId', Postcontroller.addComment);
module.exports = router;
