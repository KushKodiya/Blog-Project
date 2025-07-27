import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home({ user }) {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories/active');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      let url = 'http://localhost:8000/api/posts';
      if (selectedCategory) {
        url += `?category=${selectedCategory}`;
      }
      const response = await axios.get(url);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
      <div className="sidebar">
        <div className="categories-section">
          <h3>Categories</h3>
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
                <Link to={`/post/${post.slug || post._id}`} key={post._id} className="post-card-link">
                  <div className="post-card">
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
                          src={`http://localhost:8000${post.img}`} 
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
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;