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

        // Add isLiked field for the current user (always false for new comments)
        const commentObj = comment.toObject();
        commentObj.isLiked = false;

        res.status(201).json({
            message: 'Comment created successfully',
            comment: commentObj
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
        const userId = req.user?._id; // Get current user ID if logged in

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comments = await Comment.find({ 
            post: postId, 
            parentComment: null 
        })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // Manually fetch replies for each comment to ensure likes field is included
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('user', 'firstName lastName email')
                    .sort({ createdAt: 1 });
                
                const commentObj = comment.toObject();
                commentObj.replies = replies;
                return commentObj;
            })
        );

        // Add like information for current user
        const commentsWithLikes = commentsWithReplies.map(comment => {
            // Add like info for main comment
            if (userId) {
                comment.isLiked = comment.likes.some(likeId => likeId.toString() === userId.toString());
            }
            
            // Add like info for replies
            if (comment.replies && comment.replies.length > 0) {
                comment.replies = comment.replies.map(reply => {
                    const replyObj = reply.toObject ? reply.toObject() : reply;
                    if (userId) {
                        replyObj.isLiked = reply.likes && reply.likes.some(likeId => likeId.toString() === userId.toString());
                    }
                    return replyObj;
                });
            }
            
            return comment;
        });

        const totalComments = await Comment.countDocuments({ post: postId });

        res.json({
            comments: commentsWithLikes,
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

        // Add isLiked field for the current user
        const commentObj = comment.toObject();
        commentObj.isLiked = comment.likes.some(likeId => likeId.toString() === userId.toString());

        res.json({
            message: 'Comment updated successfully',
            comment: commentObj
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

        const userLikedIndex = comment.likes.findIndex(likeId => likeId.toString() === userId.toString());
        
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
