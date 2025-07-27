import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function PostDetail({ user }) {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // First try to fetch by slug, if that fails try by ID
        let response;
        try {
          response = await axios.get(`http://localhost:8000/api/posts/slug/${slug}`);
        } catch (slugError) {
          // If slug fails, try treating it as an ID (for backward compatibility)
          response = await axios.get(`http://localhost:8000/api/posts/${slug}`);
        }
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
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
          src={`http://localhost:8000${post.img}`} 
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
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/" className="btn btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
