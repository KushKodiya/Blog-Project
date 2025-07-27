const Post = require('../models/post');

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
        const { title, body, img, category } = req.body;
        
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        
        const newPost = new Post({
            title,
            body,
            img,
            user: req.user._id,
            category
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
        const { category } = req.query;
        let filter = {};
        
        if (category) {
            filter.category = category;
        }
        
        const posts = await Post.find(filter)
            .populate('user', 'firstName lastName email')
            .populate('category', 'title isActive')
            .sort({ createdAt: -1 });
        
        const postsWithActiveCategories = posts.map(post => {
            const postObj = post.toObject();
            if (postObj.category && !postObj.category.isActive) {
                postObj.category = null;
            }
            return postObj;
        });
        
        res.json(postsWithActiveCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .populate('user', 'firstName lastName email')
            .populate('category', 'title isActive')
            .sort({ createdAt: -1 });
        
        const postsWithActiveCategories = posts.map(post => {
            const postObj = post.toObject();
            if (postObj.category && !postObj.category.isActive) {
                postObj.category = null;
            }
            return postObj;
        });
        
        res.json(postsWithActiveCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPostById = async (req, res) => {
    try {
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
        
        res.json(postObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPostBySlug = async (req, res) => {
    try {
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

        // Update the post fields
        if (title) post.title = title;
        if (body) post.body = body;
        if (img !== undefined) post.img = img;

        // Save the post (this will trigger the pre-save hook to update slug if title changed)
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
        
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
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
    deletePost
};
