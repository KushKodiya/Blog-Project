const mongoose = require('mongoose');
const { connectToMongoDb } = require('./connect');

const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
};

async function migratePosts() {
    try {
        await connectToMongoDb('mongodb://127.0.0.1:27017/blog-app');
        
        const Post = require('./models/post');
        
        const posts = await Post.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
        
        for (let post of posts) {
            let baseSlug = generateSlug(post.title);
            let slug = baseSlug;
            let counter = 1;
            
            while (await Post.findOne({ slug: slug, _id: { $ne: post._id } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            
            await Post.findByIdAndUpdate(post._id, { slug: slug });
        }
        
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

migratePosts();
