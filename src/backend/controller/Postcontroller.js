// controller/Post.js
const Post = require('../model/Post');
const fs = require('fs');
const path = require('path');
exports.createPost = async (req, res) => {
  try {
    // const userId = req.session.userId;
      const userId = req.session.userId || req.body.user;
    const caption = req.body.caption;
    const imageUrl = req.file.path.replace(/\\/g, '/');

    const newPost = new Post({
      user: userId,
      caption,
      imageUrl
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//feed
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'firstname') // post creator
      .populate({
        path: 'comments.user',       // comment author
        select: 'firstname'
      })
      .populate({
        path: 'comments.replies.user',  // reply author
        select: 'firstname'
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// controller/Post.js own
exports.getMyPosts = async (req, res) => {
  const userId = req.session.userId;
  try {
    // const posts = await Post.find({ user: userId })
    // .sort({ createdAt: -1 })
    const posts = await Post.find({ user: req.session.userId })
  .populate('user', 'firstname')
  .populate('comments.user', 'firstname');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

  
    if (post.imageUrl) {
      
      const imagePath = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); 
      }
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Error deleting post', error });
  }
};

exports.toggleLike = async (req, res) => {
  const userId = req.session.userId;
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const hasLiked = post.likes.includes(userId); // Check if the user already liked this post

    if (hasLiked) {
  // Unlike   already liked, remove their ID from the likes array
    post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
// Like  If not liked anddd add their ID to the likes array 
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ message: hasLiked ? 'Unliked' : 'Liked', likes: post.likes.length }); // total no like return
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error });
  }
};


exports.addComment = async (req, res) => {
  const userId = req.session.userId;
  const postId = req.params.postId;
  const { text, parentId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = { user: userId, text };

    // Top-level comment
    if (!parentId) {
      post.comments.push(newComment);
    } else {
      // Reply to another comment
      const findAndAddReply = (comments) => {
        for (let comment of comments) {
          if (comment._id.toString() === parentId) {
            comment.replies.push(newComment);
            return true;
          }
          if (comment.replies && findAndAddReply(comment.replies)) {
            return true;
          }
        }
        return false;
      };

      const added = findAndAddReply(post.comments);
      if (!added) return res.status(404).json({ message: 'Parent comment not found' });
    }

    await post.save();
    const updatedPost = await Post.findById(postId)
      .populate('user', 'firstname')
      .populate('comments.user', 'firstname')
      .populate('comments.replies.user', 'firstname');

    res.status(200).json(updatedPost.comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

