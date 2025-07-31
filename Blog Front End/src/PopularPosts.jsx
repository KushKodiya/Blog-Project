import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';

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
        `${API_BASE_URL}/api/posts/popular?period=${selectedPeriod}&limit=5`,
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
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

      <div className="popular-posts-list">
        {isLoading ? (
          <div className="loading-popular">Loading popular posts...</div>
        ) : popularPosts.length === 0 ? (
          <div className="no-popular-posts">
            <p>No popular posts found for this period.</p>
          </div>
        ) : (
          popularPosts.map((post, index) => (
            <div key={post._id} className="popular-post-item">
              <div className="popular-post-rank">
                <span className="rank-number">{index + 1}</span>
              </div>
              
              <Link to={`/post/${post.slug || post._id}`} className="popular-post-content">
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
                
                <div className="popular-post-info">
                  <h4 className="popular-post-title">
                    {truncateText(post.title, 50)}
                  </h4>
                  
                  <div className="popular-post-meta">
                    <div className="popular-post-stats">
                      <span className="likes-count">❤️ {post.likesCount}</span>
                      <span className="comments-count">💬 {post.commentsCount}</span>
                    </div>
                    <div className="popular-post-date">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                  
                  <div className="popular-post-author">
                    By {post.user.firstName} {post.user.lastName}
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PopularPosts;
