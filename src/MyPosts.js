import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const [openCommentBoxId, setOpenCommentBoxId] = useState(null); // Track which post's comment box is open
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/my", { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading my posts", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/delete/${postId}`, { withCredentials: true });
      fetchMyPosts(); // Refresh list after deletion
    } catch (err) {
      console.error("Error deleting post", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/like/${postId}`, {}, { withCredentials: true });

      // Update likes locally without full re-fetch
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likes.includes(loggedInUserId);
          return {
            ...post,
            likes: hasLiked
              ? post.likes.filter(id => id !== loggedInUserId)  // Unlike
              : [...post.likes, loggedInUserId]                 // Like
          };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };
  
  
//   const handleCommentSubmit = async (postId) => {
//   if (!commentText.trim()) return;

//   try {
//     const res = await axios.post(
//       `http://localhost:5000/api/posts/comment/${postId}`,
//       { text: commentText },
//       { withCredentials: true }
//     );

//     const updatedComments = res.data;

//     const updatedPosts = posts.map(post =>
//       post._id === postId
//         ? { ...post, comments: updatedComments }
//         : post
//     );

//     setPosts(updatedPosts);
//     setCommentText('');
//   } catch (err) {
//     console.error("Error submitting comment", err);
//   }
// };
const handleCommentSubmit = async (postId, parentId = null) => {
  const text = parentId ? replyTexts[parentId] : commentText;
  if (!text.trim()) return;

  try {
    const res = await axios.post(
      `http://localhost:5000/api/posts/comment/${postId}`,
      { text, parentId },
      { withCredentials: true }
    );

    const updatedComments = res.data;

    const updatedPosts = posts.map(post =>
      post._id === postId
        ? { ...post, comments: updatedComments }
        : post
    );

    setPosts(updatedPosts);

    // Reset input
    if (parentId) {
       setReplyTexts((prev) => {
    const newReplies = { ...prev };
    delete newReplies[parentId];
    return newReplies;
  });
    } else {
      setCommentText('');
    }
  } catch (err) {
    console.error("Error submitting comment", err);
  }
};

const renderComments = (comments, postId, depth = 0) => {
  return comments.map((c) => (
    <div
      key={c._id}
      style={{
        marginLeft: depth * 20 + 'px',
        borderLeft: depth > 0 ? '2px solid #ccc' : 'none',
        paddingLeft: depth > 0 ? '10px' : '0',
        marginTop: '10px'
      }}
    >
      <div style={{ fontSize: depth > 0 ? '0.9rem' : '1rem', color: depth > 0 ? '#555' : '#000' }}>
        <strong>{c.user?.firstname || 'User'}:</strong> {c.text}
      </div>

      <button
        className="btn btn-sm btn-link text-decoration-none text-dark p-0"
        onClick={() =>
  setReplyTexts((prev) => ({
    ...prev,
    [c._id]: `@${c.user.firstname}` || ''
  }))
}
      >
        Reply
      </button>

     {replyTexts[c._id] !== undefined && (
  <div className="mt-2">
    <textarea
      rows="2"
      className="form-control"
      placeholder="Write a reply..."
      value={replyTexts[c._id] || ''}
      onChange={(e) =>
        setReplyTexts({ ...replyTexts, [c._id]: e.target.value })
      }
    />
    <button
      className="btn btn-secondary btn-sm mt-1"
      onClick={() => handleCommentSubmit(postId, c._id)}
    >
      Reply
    </button>
  </div>
)}


      {/* Recursive rendering for nested replies */}
      {c.replies && c.replies.length > 0 && renderComments(c.replies, postId, depth + 1)}
    </div>
  ));
};

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">My Posts</h2>
      <div className="row justify-content-center">
        {posts.map(post => {
          const hasLiked = post.likes?.includes(loggedInUserId);
          return (
            <div key={post._id} className="col-md-6 mb-4">
              <div className="card shadow-sm" style={{ height: "auto", width: "350px" }}>
                {post.imageUrl && (
                  <img
                    src={`http://localhost:5000/${post.imageUrl.replace(/\\/g, '/')}`}
                    alt="Post"
                    className="card-img-top"
                    style={{ objectFit: 'fill', height: '300px' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-text">{post.user.firstname}</h5>
                  <p className="card-text">{post.caption}</p>
                  <div className='d-flex gap-1'>
                    <i  onClick={() => handleLike(post._id)} className={`${hasLiked ? ' bi bi-heart-fill text-danger ' : 'bi bi-heart'}`}  style={{ fontSize: '1.4rem' ,cursor:'pointer'}} ></i>
                    <span className='mt-1'> {post.likes?.length || 0 } </span>
                   {/* <i class="bi bi-chat me-2 ms-2"style={{ fontSize: '1.4rem',cursor:'pointer' }}></i> */}
                   <i class="bi bi-chat me-2 ms-2"style={{ fontSize: '1.4rem',cursor:'pointer' }}  onClick={() => setOpenCommentBoxId(openCommentBoxId === post._id ? null : post._id)}></i>
                    {/* <span className='mt-1'> {post.comments?.length || 0 } </span> */}
                    <i class="bi bi-trash" onClick={() => handleDelete(post._id)}style={{ fontSize: '1.4rem',cursor:'pointer' }}></i>
                  {openCommentBoxId === post._id && (
  <div className="mt-3">
    {/* Comment Input */}
    <textarea
      rows="2"
      className="form-control"
      placeholder="Write a comment..."
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
    />
    <button
      className="btn btn-primary btn-sm mt-2"
      onClick={() => handleCommentSubmit(post._id)}
    >
      Submit
    </button>

    {/* Comments List */}
   {/* Comments List */}
<div className="mt-3">
  <h6>Comments:</h6>
  {post.comments?.length > 0 ? (
    renderComments(post.comments, post._id)
  ) : (
    <p className="text-muted">No comments yet</p>
  )}
</div>

  </div>
)}
                   
                   </div>
                  
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyPosts;
