import { useState } from 'react';
import axios from 'axios';

function PostCard({ post, loggedInUserId }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(loggedInUserId));

  const handleLike = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/posts/like/${post._id}`, {}, { withCredentials: true });
      setLiked(!liked);
      setLikes(res.data.likes);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <div className="card shadow-sm mb-4" style={{ width: '350px' }}>
      {post.imageUrl && (
        <img
          src={`http://localhost:5000/${post.imageUrl.replace(/\\/g, '/')}`}
          alt="Post"
          className="card-img-top"
          style={{ objectFit: 'fill', height: '300px' }}
        />
      )}
      <div className="card-body">
        <h5>{post.user.firstname}</h5>
        <p>{post.caption}</p>
        <button
          onClick={handleLike}
          className={`btn btn-${liked ? 'danger' : 'outline-danger'}`}
        >
          <i className="bi bi-heart-fill"></i> {likes}
        </button>
      </div>
    </div>
  );
}

export default PostCard;
