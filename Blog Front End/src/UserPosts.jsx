import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function UserPosts({ user }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/posts/user/my-posts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load your posts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeletePost = async (postId) => {
    const confirmed = await new Promise((resolve) => {
      toast.warn(
        <div>
          <p>Are you sure you want to delete this post?</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={() => {
                toast.dismiss();
                resolve(true);
              }}
              style={{ 
                background: '#dc3545', 
                color: 'white', 
                border: 'none', 
                padding: '5px 15px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
            <button 
              onClick={() => {
                toast.dismiss();
                resolve(false);
              }}
              style={{ 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '5px 15px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          position: 'top-center',
          autoClose: false,
          closeOnClick: false,
          draggable: false,
        }
      );
    });

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="user-posts-container">
        <p>Please log in to view your posts.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading">Loading your posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-posts-container">
      <div className="user-posts-header">
        <h1>Your Posts</h1>
        <p>You have {posts.length} post{posts.length !== 1 ? 's' : ''}</p>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>You haven't created any posts yet.</p>
          <Link to="/create-post" className="btn btn-primary">Create Your First Post</Link>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post._id} className="user-post-card">
              <div className="post-card-content">
                <div className="post-header">
                  <Link to={`/post/${post.slug || post._id}`}>
                    <h3>{post.title}</h3>
                  </Link>
                  <div className="post-meta">
                    <span>{formatDate(post.createdAt)}</span>
                    {post.category && (
                      <span className="post-category">{post.category.title}</span>
                    )}
                  </div>
                </div>
                
                {post.img && (
                  <div className="post-image">
                    <img 
                      src={`http://localhost:8000${post.img}`} 
                      alt={post.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="post-body">
                  <p>{post.body.length > 150 ? post.body.substring(0, 150) + '...' : post.body}</p>
                </div>

                <div className="post-actions">
                  <Link to={`/post/${post.slug || post._id}`} className="btn btn-secondary">View</Link>
                  <button 
                    onClick={() => handleDeletePost(post._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPosts;
