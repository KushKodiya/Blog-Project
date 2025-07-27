const mongoose = require('mongoose');
const { connectToMongoDb } = require('./connect');

// Function to generate slug from title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
};

async function migratePosts() {
    try {
        console.log('Connecting to MongoDB...');
        await connectToMongoDb('mongodb://127.0.0.1:27017/blog-app');
        
        const Post = require('./models/post');
        
        console.log('Finding posts without slugs...');
        const posts = await Post.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
        
        console.log(`Found ${posts.length} posts that need slug generation.`);
        
        for (let post of posts) {
            let baseSlug = generateSlug(post.title);
            let slug = baseSlug;
            let counter = 1;
            
            // Check if slug already exists and append number if needed
            while (await Post.findOne({ slug: slug, _id: { $ne: post._id } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            
            await Post.findByIdAndUpdate(post._id, { slug: slug });
            console.log(`Updated post "${post.title}" with slug: "${slug}"`);
        }
        
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migratePosts();
