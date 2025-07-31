const Comment = require('../models/comment');
const Post = require('../models/post');

const createComment = async (req, res) => {
    try {
        const { content, postId, parentCommentId } = req.body;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }
            if (parentComment.post.toString() !== postId) {
                return res.status(400).json({ error: 'Parent comment does not belong to this post' });
            }
        }

        const comment = new Comment({
            content,
            user: userId,
            post: postId,
            parentComment: parentCommentId || null
        });

        await comment.save();
        await comment.populate('user', 'firstName lastName email');

        res.status(201).json({
            message: 'Comment created successfully',
            comment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comments = await Comment.find({ 
            post: postId, 
            parentComment: null 
        })
        .populate('user', 'firstName lastName email')
        .populate({
            path: 'replies',
            populate: {
                path: 'user',
                select: 'firstName lastName email'
            }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalComments = await Comment.countDocuments({ post: postId });

        res.json({
            comments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit),
                totalComments,
                hasMore: page * limit < totalComments
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You can only edit your own comments' });
        }

        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        await comment.save();

        await comment.populate('user', 'firstName lastName email');

        res.json({
            message: 'Comment updated successfully',
            comment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        await Comment.findByIdAndDelete(commentId);
        await Comment.deleteMany({ parentComment: commentId });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userLikedIndex = comment.likes.indexOf(userId);
        
        if (userLikedIndex > -1) {
            comment.likes.splice(userLikedIndex, 1);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();

        res.json({
            message: userLikedIndex > -1 ? 'Comment unliked' : 'Comment liked',
            likesCount: comment.likes.length,
            isLiked: userLikedIndex === -1
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    toggleCommentLike
};
