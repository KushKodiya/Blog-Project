const Post = require('../models/post');

// Middleware to check if category has posts before deletion
const checkCategoryHasPosts = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Count posts that reference this category
        const postCount = await Post.countDocuments({ category: id });
        
        if (postCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete category. It is currently being used by ${postCount} post${postCount > 1 ? 's' : ''}.`,
                postCount: postCount
            });
        }
        
        next();
    } catch (error) {
        console.error('Error checking category posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware to check if category has posts before deactivation
const checkCategoryHasPostsForDeactivation = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Count posts that reference this category
        const postCount = await Post.countDocuments({ category: id });
        
        if (postCount > 0) {
            return res.status(400).json({ 
                error: `Cannot deactivate category. It is currently being used by ${postCount} post${postCount > 1 ? 's' : ''}.`,
                postCount: postCount
            });
        }
        
        next();
    } catch (error) {
        console.error('Error checking category posts for deactivation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Middleware to check if category has posts before status toggle (more flexible)
const checkCategoryHasPostsForStatusToggle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const Category = require('../models/category');
        
        // Get current category status
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        // Only check if we're trying to deactivate an active category
        if (category.isActive) {
            const postCount = await Post.countDocuments({ category: id });
            
            if (postCount > 0) {
                return res.status(400).json({ 
                    error: `Cannot deactivate category. It is currently being used by ${postCount} post${postCount > 1 ? 's' : ''}.`,
                    postCount: postCount,
                    action: 'deactivate'
                });
            }
        }
        
        next();
    } catch (error) {
        console.error('Error checking category posts for status toggle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    checkCategoryHasPosts,
    checkCategoryHasPostsForDeactivation,
    checkCategoryHasPostsForStatusToggle
};
