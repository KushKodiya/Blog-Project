import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import LikeButton from './LikeButton';

function PopularPosts({ user }) {
  const [popularPosts, setPopularPosts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPopularPosts();
  }, [selectedPeriod]);

  const fetchPopularPosts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await axios.get(
        `${API_BASE_URL}/api/posts/popular?period=${selectedPeriod}&limit=9`,
        { headers }
      );
      setPopularPosts(response.data);
    } catch (error) {
      console.error('Failed to load popular posts:', error);
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

  return (
    <div className="popular-posts-section">
      <div className="popular-posts-header">
        <h3>🔥 Popular Posts</h3>
        <div className="period-selector">
          <button
            className={`period-btn ${selectedPeriod === 'day' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('day')}
          >
            Day
          </button>
          <button
            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button
            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="popular-posts-grid">
        {isLoading ? (
          <div className="loading-popular">Loading popular posts...</div>
        ) : popularPosts.length === 0 ? (
          <div className="no-popular-posts">
            <p>No popular posts found for this period.</p>
          </div>
        ) : (
          popularPosts.map((post, index) => (
            <div key={post._id} className="popular-post-card">
              <div className="popular-post-rank">
                <span className="rank-number">#{index + 1}</span>
              </div>
              
              <Link to={`/post/${post.slug || post._id}`} className="popular-post-card-link">
                <div className="popular-post-header">
                  <h4>{post.title}</h4>
                  <div className="popular-post-meta">
                    <span>By {post.user.firstName} {post.user.lastName}</span>
                    <span>{formatDate(post.createdAt)}</span>
                    {post.category && (
                      <span className="popular-post-category">{post.category.title}</span>
                    )}
                  </div>
                </div>
                
                {post.img && (
                  <div className="popular-post-image">
                    <img 
                      src={`${API_BASE_URL}${post.img}`} 
                      alt={post.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="popular-post-body">
                  <p>{post.body.length > 100 ? post.body.substring(0, 100) + '...' : post.body}</p>
                  {post.body.length > 100 && (
                    <span className="read-more">
                      Read More
                    </span>
                  )}
                </div>
              </Link>
              
              <div className="popular-post-actions">
                <LikeButton 
                  postId={post._id}
                  initialLikesCount={post.likesCount}
                  initialIsLiked={post.isLiked}
                  user={user}
                />
                <div className="popular-comment-count">
                  💬 {post.commentsCount || 0} {(post.commentsCount || 0) === 1 ? 'comment' : 'comments'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PopularPosts;
