import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

function PostDetail({ user }) {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        let response;
        try {
          response = await axios.get(`${API_BASE_URL}/api/posts/slug/${slug}`, { headers });
        } catch (slugError) {
          response = await axios.get(`${API_BASE_URL}/api/posts/${slug}`, { headers });
        }
        setPost(response.data);
      } catch (error) {
        setError('Post not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (isLoading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!post) {
    return <div className="error">Post not found</div>;
  }

  return (
    <div className="post-detail">
      {post.img && (
        <img 
          src={`${API_BASE_URL}${post.img}`} 
          alt={post.title} 
          className="post-detail-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="post-detail-content">
        <h1 className="post-detail-title">{post.title}</h1>
        <div className="post-detail-meta">
          <span>By {post.user?.firstName} {post.user?.lastName}</span>
          <span> • </span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          {post.category && (
            <>
              <span> • </span>
              <span className="post-category">{post.category.title}</span>
            </>
          )}
        </div>
        <div className="post-detail-body">
          {post.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        <div className="post-actions">
          <LikeButton 
            postId={post._id}
            initialLikesCount={post.likesCount}
            initialIsLiked={post.isLiked}
            user={user}
          />
        </div>

        <CommentSection postId={post._id} user={user} />
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/" className="btn btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
