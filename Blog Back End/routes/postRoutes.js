const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const {
    uploadImage,
    uploadMultipleImages,
    createPost,
    getAllPosts,
    getUserPosts,
    getPostById,
    getPostBySlug,
    updatePost,
    deletePost,
    getPopularPosts
} = require('../controllers/postController');

router.get('/', optionalAuth, getAllPosts);         
router.get('/popular', optionalAuth, getPopularPosts);
router.get('/slug/:slug', optionalAuth, getPostBySlug);
router.get('/:id', optionalAuth, getPostById);        

router.post('/upload-image', auth, uploadSingle, uploadImage);
router.post('/upload-images', auth, uploadMultiple, uploadMultipleImages);
router.post('/', auth, createPost);
router.get('/user/my-posts', auth, getUserPosts);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
