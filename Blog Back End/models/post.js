const mongoose = require('mongoose');
const User = require('./user');
const Category = require('./category');

// Function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
};

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    body: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    }
}, {timestamps: true });

// Pre-save middleware to generate slug
postSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('title')) {
        let baseSlug = generateSlug(this.title);
        let slug = baseSlug;
        let counter = 1;
        
        // Check if slug already exists and append number if needed
        while (await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;