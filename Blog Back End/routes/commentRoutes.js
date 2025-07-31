const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    toggleCommentLike
} = require('../controllers/commentController');

router.get('/post/:postId', getCommentsByPost);
router.post('/', auth, createComment);
router.put('/:commentId', auth, updateComment);
router.delete('/:commentId', auth, deleteComment);
router.post('/:commentId/like', auth, toggleCommentLike);

module.exports = router;
