import React, { useEffect, useState } from 'react';
import axios from 'axios';


const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?._id;

const [openCommentBoxId, setOpenCommentBoxId] = useState(null); // Track which post's comment box is open
const [commentText, setCommentText] = useState('');
const [replyTexts, setReplyTexts] = useState({}); // reply mate

const [mentionSuggestions, setMentionSuggestions] = useState([]);
const [mentionQuery, setMentionQuery] = useState('');
const [showSuggestions, setShowSuggestions] = useState(false);




  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/all", { withCredentials: true });
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading posts", err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/api/posts/like/${postId}`, {}, { withCredentials: true });

      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likes.includes(loggedInUserId);   //Check kare  user already liked the post
          return {
            ...post,
            likes: hasLiked
              ? post.likes.filter(id => id !== loggedInUserId) // unlike
              : [...post.likes, loggedInUserId]                // like
          };
        }
        return post;
      });

      setPosts(updatedPosts);
    } catch (err) {
      console.error("Error toggling like", err);
    }
  };
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

//mention
const fetchUserSuggestions = async (query) => {
  try {
    const res = await axios.get(`http://localhost:5000/User/search?q=${query}`);
    setMentionSuggestions(res.data);
  } catch (err) {
    console.error("Failed to fetch user suggestions", err);
  }
};

//mentionwork

const handleMentionSelect = (username) => {
  const atIndex = commentText.lastIndexOf('@');
  const newText = commentText.slice(0, atIndex) + '@' + username + ' ';
  setCommentText(newText);
  setMentionSuggestions([]);
  setShowSuggestions(false);
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
      <h2 className="text-center mb-4">All Posts</h2>
      <div className="row justify-content-center">
        {posts.map(post => {
          const hasLiked = post.likes?.includes(loggedInUserId);
          return (
            <div key={post._id} className="col-md-4 mb-4">
              <div className="card" style={{ height: 'auto', width: '350px' }}>
                {post.imageUrl && (
                  <img
                    src={`http://localhost:5000/${post.imageUrl.replace(/\\/g, '/')}`}
                    alt="Post"
                    className="card-img-top"
                    style={{ objectFit: 'fill', height: '300px' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{post.user.firstname}</h5>
                  <p className="card-text">{post.caption}</p>

                   <div className='d-flex gap-1'>
                    <i  onClick={() => handleLike(post._id)} className={`${hasLiked ? ' bi bi-heart-fill text-danger ' : 'bi bi-heart'}`}  style={{ fontSize: '1.4rem' ,cursor:'pointer'}} ></i>
                    <span className='mt-1'> {post.likes?.length || 0 } </span>
                   <i class="bi bi-chat me-2 ms-2"style={{ fontSize: '1.4rem',cursor:'pointer' }}  onClick={() => setOpenCommentBoxId(openCommentBoxId === post._id ? null : post._id)}></i>
                  
                   </div>
                   {/* Show comment box and comments only if open */}
                  
                  {openCommentBoxId === post._id && (
                  <div className="mt-3 position-relative">
                  {/* Comment Input */}
                  <textarea rows="2" className="form-control" placeholder="Write a comment..." value={commentText}
                  onChange={(e) => {
                                      const value = e.target.value;
                                      setCommentText(value);

                                      const atIndex = value.lastIndexOf('@');
                                      if (atIndex !== -1) {
                                        const word = value.slice(atIndex + 1);
                                        setMentionQuery(word);
                                        
                                          fetchUserSuggestions(word);
                                          setShowSuggestions(true);
                                       
                                      } else {
                                        setShowSuggestions(false);
                                      }
                                    }} />
                    {showSuggestions && mentionSuggestions.length > 0 && (
                        <ul className="list-group position-absolute z-3" style={{ maxHeight: '150px', overflowY: 'auto', width: '100%' }}>
                          {mentionSuggestions.map(user => (
                            <li
                              key={user._id} className="list-group-item list-group-item-action" onClick={() => handleMentionSelect(user.firstname)} style={{ cursor: 'pointer' }}
                            >
                              @{user.firstname}
                            </li>
                          ))}
                        </ul>
                      )}
                      <button className="btn btn-primary btn-sm mt-2" onClick={() => handleCommentSubmit(post._id)}>Submit </button>
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
          );
        })}
      </div>
    </div>
  );
};

export default AllPosts;
