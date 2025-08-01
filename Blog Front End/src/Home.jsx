import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
import LikeButton from './LikeButton';
import PopularPosts from './PopularPosts';

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCategories, setShowCategories] = useState(window.innerWidth > 768);
  const [showPopularPosts, setShowPopularPosts] = useState(window.innerWidth > 768);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories/active`);
      setCategories(response.data);
    } catch (error) {
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      let url = `${API_BASE_URL}/api/posts`;
      if (selectedCategory) {
        url += `?category=${selectedCategory}`;
      }
      const response = await axios.get(url, { headers });
      setPosts(response.data);
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

  if (isLoading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home-layout">
      {/* Desktop Sidebar (Categories) */}
      <div className="sidebar">
        <div className="categories-section">
          <div className="section-toggle" onClick={() => setShowCategories(!showCategories)}>
            <h3>Categories</h3>
            <svg className={`toggle-icon ${showCategories ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
          <div className={`section-content ${showCategories ? 'expanded' : 'collapsed'}`}>
            <div className="category-search">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="category-list">
              <button
                className={`category-item ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </button>
              {categories
                .filter(cat => cat.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(category => (
                  <button
                    key={category._id}
                    className={`category-item ${selectedCategory === category._id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category._id)}
                  >
                    {category.title}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Popular Posts in Sidebar (Mobile) */}
        <div className="popular-posts-section">
          <div className="section-toggle" onClick={() => setShowPopularPosts(!showPopularPosts)}>
            <h3>Popular Posts</h3>
            <svg className={`toggle-icon ${showPopularPosts ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </div>
          <div className={`section-content ${showPopularPosts ? 'expanded' : 'collapsed'}`}>
            <PopularPosts user={user} />
          </div>
        </div>
      </div>
      
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
                <div key={post._id} className="post-card">
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
        </div>
      </div>

      {/* Desktop Popular Posts Sidebar */}
      <div className="sidebar right-sidebar">
        <PopularPosts user={user} />
      </div>
    </div>
  );
}

export default Home;