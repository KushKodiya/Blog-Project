import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import LikeButton from './LikeButton';

function MainContent({ user, selectedCategory, searchTerm }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!isLoading && posts.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [posts, isLoading]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      let url = `${API_BASE_URL}/api/posts?page=${currentPage}&limit=5`;
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      const response = await axios.get(url, { headers });
      
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Failed to load posts');
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.category && post.category.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="main-content">
        <div className="home-container">
          <div className="loading">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="home-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="home-container">
        {user && <h1>Hello, {user.firstName}!</h1>}
        
        <div className="posts-container">
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <p>No posts found. {selectedCategory ? 'Try selecting a different category.' : 'Be the first to create one!'}</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post._id} className={`post-card ${post.isPinned ? 'pinned-post' : ''}`}>
                {post.isPinned && (
                  <div className="pinned-badge">
                    <svg className="pin-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,4V6H12V4H8V6L12,10L16,6V4H14M12,2H16A2,2 0 0,1 18,4V8L12,14L6,8V4A2,2 0 0,1 8,2H12Z"/>
                    </svg>
                    Pinned
                  </div>
                )}
                <Link to={`/post/${post.slug || post._id}`} className="post-card-link">
                  <div className="post-header">
                    <h2>{post.title}</h2>
                    <div className="post-meta">
                      <span>By {post.user.firstName} {post.user.lastName}</span>
                      <span>{formatDate(post.createdAt)}</span>
                      {post.category && (
                        <span className="post-category">{post.category.title}</span>
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
                    <p>{post.body.length > 200 ? post.body.substring(0, 200) + '...' : post.body}</p>
                    {post.body.length > 30 && (
                      <span className="read-more">
                        Read More
                      </span>
                    )}
                  </div>
                </Link>
                
                <div className="post-actions">
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
            ))
          )}
        </div>
        
        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              <span className="page-numbers">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </span>
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages} 
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainContent;
