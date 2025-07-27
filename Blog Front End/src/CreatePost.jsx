import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function CreatePost({ user, onPostCreated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    img: '',
    category: ''
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
      const response = await axios.get('http://localhost:8000/api/categories/active');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return '';
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/posts/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
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
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
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
      
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      
      const token = localStorage.getItem('token');
      const postData = {
        title: formData.title,
        body: formData.body,
        img: imageUrl,
        category: formData.category
      };
      
      const response = await axios.post('http://localhost:8000/api/posts', postData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Post created successfully!');
      
      setFormData({ title: '', body: '', img: '', category: '' });
      setImageFile(null);
      setImagePreview('');
      
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      
      navigate('/');
      
    } catch (error) {
      console.error('Error creating post:', error);
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
            disabled={isSubmitting}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image">Image (optional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting || isUploading}
          />
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