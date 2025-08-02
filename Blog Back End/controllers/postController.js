const Post = require('../models/post');
const Like = require('../models/like');
const Comment = require('../models/comment');
const Category = require('../models/category');

const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ 
            message: 'Image uploaded successfully',
            imageUrl: imageUrl 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { title, body, img, category, isPinned } = req.body;
        
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        if (!body || !body.trim()) {
            return res.status(400).json({ error: 'Content is required' });
        }
        
        // Only admin users can pin posts
        const canPin = req.user.role === 'admin' || req.user.role === 'Admin';
        const finalIsPinned = canPin ? isPinned : false;
        
        // Image is only required for non-pinned posts
        if (!finalIsPinned && (!img || !img.trim())) {
            return res.status(400).json({ error: 'Image is required' });
        }
        
        // If post is pinned, automatically assign to "Important" category
        let finalCategory = category;
        if (finalIsPinned) {
            const importantCategory = await Category.findOne({ title: 'Important' });
            if (importantCategory) {
                finalCategory = importantCategory._id;
            } else {
                // If Important category doesn't exist, create it
                const newImportantCategory = new Category({
                    title: 'Important',
                    isActive: true
                });
                const savedCategory = await newImportantCategory.save();
                finalCategory = savedCategory._id;
            }
        } else if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        
        const newPost = new Post({
            title,
            body,
            img: img || null, // Allow null for pinned posts without images
            user: req.user._id,
            category: finalCategory,
            isPinned: finalIsPinned
        });
        
        const savedPost = await newPost.save();
        await savedPost.populate([
            { path: 'user', select: 'firstName lastName email' },
            { path: 'category', select: 'title isActive' }
        ]);
        
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const { category, page = 1, limit = 5 } = req.query;
        const userId = req.user ? req.user._id : null;
        let filter = {};
        
        if (category) {
            filter.category = category;
        }
        
        // Convert page and limit to numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skipNumber = (pageNumber - 1) * limitNumber;
        
        // Get total count for pagination info
        const totalPosts = await Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limitNumber);
        
        const posts = await Post.find(filter)
            .populate('user', 'firstName lastName email')
            .populate('category', 'title isActive')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skipNumber)
            .limit(limitNumber);
        
        const postsWithLikes = await Promise.all(posts.map(async (post) => {
            const postObj = post.toObject();
            if (postObj.category && !postObj.category.isActive) {
                postObj.category = null;
            }
            
            const likesCount = await Like.countDocuments({ post: post._id });
            const commentsCount = await Comment.countDocuments({ post: post._id });
            postObj.likesCount = likesCount;
            postObj.commentsCount = commentsCount;
            
            if (userId) {
                const userLike = await Like.findOne({ user: userId, post: post._id });
                postObj.isLiked = !!userLike;
            } else {
                postObj.isLiked = false;
            }
            
            return postObj;
        }));
        
        res.json({
            posts: postsWithLikes,
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalPosts: totalPosts,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
                limit: limitNumber
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const posts = await Post.find({ user: userId })
            .populate('user', 'firstName lastName email')
            .populate('category', 'title isActive')
            .sort({ createdAt: -1 });
        
        const postsWithLikes = await Promise.all(posts.map(async (post) => {
            const postObj = post.toObject();
            if (postObj.category && !postObj.category.isActive) {
                postObj.category = null;
            }
            
            const likesCount = await Like.countDocuments({ post: post._id });
            const commentsCount = await Comment.countDocuments({ post: post._id });
            postObj.likesCount = likesCount;
            postObj.commentsCount = commentsCount;
            
            const userLike = await Like.findOne({ user: userId, post: post._id });
            postObj.isLiked = !!userLike;
            
            return postObj;
        }));
        
        res.json(postsWithLikes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const post = await Post.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('category', 'title isActive');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const postObj = post.toObject();
        if (postObj.category && !postObj.category.isActive) {
            postObj.category = null;
        }
        
        const likesCount = await Like.countDocuments({ post: post._id });
        const commentsCount = await Comment.countDocuments({ post: post._id });
        postObj.likesCount = likesCount;
        postObj.commentsCount = commentsCount;
        
        if (userId) {
            const userLike = await Like.findOne({ user: userId, post: post._id });
            postObj.isLiked = !!userLike;
        } else {
            postObj.isLiked = false;
        }
        
        res.json(postObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPostBySlug = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : null;
        const post = await Post.findOne({ slug: req.params.slug })
            .populate('user', 'firstName lastName email')
            .populate('category', 'title isActive');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const postObj = post.toObject();
        if (postObj.category && !postObj.category.isActive) {
            postObj.category = null;
        }
        
        const likesCount = await Like.countDocuments({ post: post._id });
        const commentsCount = await Comment.countDocuments({ post: post._id });
        postObj.likesCount = likesCount;
        postObj.commentsCount = commentsCount;
        
        if (userId) {
            const userLike = await Like.findOne({ user: userId, post: post._id });
            postObj.isLiked = !!userLike;
        } else {
            postObj.isLiked = false;
        }
        
        res.json(postObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const { title, body, img } = req.body;
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        if (title) post.title = title;
        if (body) post.body = body;
        if (img !== undefined) {
            if (img === '' || img === null) {
                return res.status(400).json({ error: 'Image is required and cannot be empty' });
            }
            post.img = img;
        }

        const updatedPost = await post.save();
        await updatedPost.populate('user', 'firstName lastName email');
        
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }
        
        await Comment.deleteMany({ post: req.params.id });
        await Like.deleteMany({ post: req.params.id });
        await Post.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPopularPosts = async (req, res) => {
    try {
        const { period = 'week', limit = 5 } = req.query;
        const userId = req.user?._id;
        
        // Calculate date range based on period
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Aggregate posts with like counts within the time period
        const popularPosts = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'likes'
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $addFields: {
                    likesCount: { $size: '$likes' },
                    commentsCount: { $size: '$comments' },
                    isLiked: userId ? { $in: [userId, '$likes.user'] } : false,
                    user: { $arrayElemAt: ['$user', 0] },
                    category: { $arrayElemAt: ['$category', 0] }
                }
            },
            {
                $project: {
                    title: 1,
                    body: 1,
                    img: 1,
                    slug: 1,
                    createdAt: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    isLiked: 1,
                    user: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1
                    },
                    category: {
                        _id: 1,
                        title: 1,
                        isActive: 1
                    }
                }
            },
            {
                $sort: { likesCount: -1, createdAt: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.json(popularPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadImage,
    createPost,
    getAllPosts,
    getUserPosts,
    getPostById,
    getPostBySlug,
    updatePost,
    deletePost,
    getPopularPosts
};
