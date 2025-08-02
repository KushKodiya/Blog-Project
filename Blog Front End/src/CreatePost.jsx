import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config';

function CreatePost({ user, onPostCreated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    img: '',
    category: '',
    isPinned: false
  });
  
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories/active`);
      setCategories(response.data);
    } catch (error) {
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePinnedChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      isPinned: checked,
      // Clear category selection when pinning since it will be auto-assigned
      category: checked ? '' : prev.category
    }));
    
    // Clear category and image errors if post is pinned
    if (checked && (errors.category || errors.image)) {
      setErrors(prev => ({
        ...prev,
        category: '',
        image: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clear image error when file is selected
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return '';
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/posts/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.imageUrl;
    } catch (error) {
      throw new Error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Content is required';
    }
    
    // Category is only required if post is not pinned
    if (!formData.isPinned && !formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Image is only required if post is not pinned
    if (!formData.isPinned && !imageFile) {
      newErrors.image = 'Image is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload image only if one is provided
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const token = localStorage.getItem('token');
      const postData = {
        title: formData.title,
        body: formData.body,
        img: imageUrl,
        category: formData.category,
        isPinned: formData.isPinned
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/posts`, postData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Post created successfully!');
      
      setFormData({ title: '', body: '', img: '', category: '', isPinned: false });
      setImageFile(null);
      setImagePreview('');
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      
      navigate('/');
      
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.error || 'Failed to create post. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="create-post-container">
        <p>Please log in to create a post.</p>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit} className="create-post-form">
        <h2>Create New Post</h2>
        
        {errors.general && <div className="error-message general-error">{errors.general}</div>}
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter post title"
            className={errors.title ? 'error' : ''}
            disabled={isSubmitting}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'error' : ''}
            disabled={isSubmitting || formData.isPinned}
            required
          >
            <option value="">
              {formData.isPinned ? 'Auto-assigned to Important' : 'Select a category'}
            </option>
            {!formData.isPinned && categories
              .filter(category => category.title !== 'Important')
              .map(category => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">
            Image {formData.isPinned ? '(Optional)' : '(Required)'}
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting || isUploading}
            className={errors.image ? 'error' : ''}
            required={!formData.isPinned}
          />
          {errors.image && <span className="error-message">{errors.image}</span>}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="body">Content</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Write your post content here..."
            rows="10"
            className={errors.body ? 'error' : ''}
            disabled={isSubmitting}
          />
          {errors.body && <span className="error-message">{errors.body}</span>}
        </div>

        {(user.role === 'admin' || user.role === 'Admin') && (
          <div className="toggle-switch-container">
            <label>Pin Post to Top:</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="isPinned"
                className="toggle-switch-input"
                checked={formData.isPinned}
                onChange={(e) => handlePinnedChange(e.target.checked)}
                disabled={isSubmitting}
              />
              <span className="toggle-switch-text">
                {formData.isPinned ? 'Pinned' : 'Not Pinned'}
              </span>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? 'Creating Post...' : isUploading ? 'Uploading Image...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;