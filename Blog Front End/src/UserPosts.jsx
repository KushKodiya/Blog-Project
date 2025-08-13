import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config';
import LikeButton from './LikeButton';

function UserPosts({ user }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 6
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  const isAdmin = React.useMemo(() => {
    if (!user) return false;
    const role = user.role?.toLowerCase();
    return role === 'admin';
  }, [user]);

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        fetchAllPosts();
      } else {
        fetchUserPosts();
      }
    }
  }, [user, isAdmin, currentPage]);

  const fetchUserPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/posts/user/my-posts?page=${currentPage}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPosts(response.data.posts || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to load your posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/posts/admin/all?page=${currentPage}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setPosts(response.data.posts || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching admin posts:', error);
      setError('Failed to load posts');
      setPosts([]);
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
      await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Post deleted successfully!');
      
      if (isAdmin) {
        fetchAllPosts();
      } else {
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (error) {
      toast.error('Failed to delete post. Please try again.');
    }
  };

  const handleTogglePostStatus = async (postId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/posts/${postId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newStatus = currentStatus ? 'deactivated' : 'activated';
      toast.success(`Post ${newStatus} successfully`);
      
      if (isAdmin) {
        fetchAllPosts();
      }
    } catch (error) {
      console.error('Error toggling post status:', error);
      toast.error(error.response?.data?.error || 'Failed to update post status');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-number ${i === pagination.currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <div className="pagination-info">
          <div className="page-numbers">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="page-number"
            >
              Previous
            </button>
            {pages}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="page-number"
            >
              Next
            </button>
          </div>
          <div className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalPosts} total posts)
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="user-posts-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading">{isAdmin ? 'Loading all posts...' : 'Loading your posts...'}</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-posts-container">
      <div className="user-posts-header">
        <h1>{isAdmin ? 'All Posts' : 'Your Posts'}</h1>
        <p>
          {pagination.totalPosts > 0 
            ? `Showing ${posts.length} of ${pagination.totalPosts} post${pagination.totalPosts !== 1 ? 's' : ''}` 
            : 'No posts found'
          }
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>{isAdmin ? 'No posts found.' : 'You haven\'t created any posts yet.'}</p>
          {!isAdmin && (
            <Link to="/create-post" className="btn btn-primary">Create Your First Post</Link>
          )}
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
                    {isAdmin && (
                      <>
                        <span className={`post-status ${post.isActive ? 'active' : 'inactive'}`}>
                          {post.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {post.user && (
                          <span className="post-author">
                            by {post.user.firstName} {post.user.lastName}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {post.img && (
                  <div className="post-image">
                    <img 
                      src={`${API_BASE_URL}${post.img}`} 
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

                <div className="post-stats">
                  <div className="stats-inline-container">
                    <LikeButton 
                      postId={post._id}
                      initialLikesCount={post.likesCount}
                      initialIsLiked={post.isLiked}
                      user={user}
                    />
                    <Link to={`/post/${post.slug || post._id}`} className="comment-link">
                      <div className="comment-count modern-stat-item comments">
                        <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z"/>
                        </svg>
                        <span className="stat-count">{post.commentsCount || 0}</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="post-actions">
                  <Link to={`/post/${post.slug || post._id}`} className="btn btn-secondary">View</Link>
                  <Link 
                    to={`/edit-post/${post._id}`} 
                    className="btn btn-primary"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeletePost(post._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => handleTogglePostStatus(post._id, post.isActive)}
                      className={`btn ${post.isActive ? 'btn-warning' : 'btn-success'}`}
                    >
                      {post.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {renderPagination()}
    </div>
  );
}

export default UserPosts;
