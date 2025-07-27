const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
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

router.get('/', getAllPosts);         
router.get('/slug/:slug', getPostBySlug);
router.get('/:id', getPostById);        

router.post('/upload-image', auth, upload.single('image'), uploadImage);
router.post('/', auth, createPost);
router.get('/user/my-posts', auth, getUserPosts);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

module.exports = router;
