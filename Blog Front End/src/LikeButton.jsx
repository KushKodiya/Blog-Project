import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config';

function LikeButton({ postId, initialLikesCount, initialIsLiked, user }) {
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.warning('Please log in to like posts');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/likes/post/${postId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to toggle like. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="like-button-container">
      <button 
        className={`like-button ${isLiked ? 'liked' : ''}`}
        onClick={handleLike}
        disabled={isLoading}
      >
        <span className="like-icon">
          {isLiked ? '❤️' : '🤍'}
        </span>
        <span className="like-count">{likesCount}</span>
      </button>
    </div>
  );
}

export default LikeButton;
