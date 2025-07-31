const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');
const {
    uploadImage,
    createPost,
    getAllPosts,
    getUserPosts,
    getPostById,
    getPostBySlug,
    updatePost,
    deletePost
} = require('../controllers/postController');

router.get('/', optionalAuth, getAllPosts);         
router.get('/slug/:slug', optionalAuth, getPostBySlug);
router.get('/:id', optionalAuth, getPostById);        

router.post('/upload-image', auth, upload.single('image'), uploadImage);
router.post('/', auth, createPost);
router.get('/user/my-posts', auth, getUserPosts);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
