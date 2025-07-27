const axios = require('axios');

async function testSlugFunctionality() {
  try {
    console.log('Testing slug functionality...\n');

    // First, get all posts to see available slugs
    console.log('1. Fetching all posts to see available slugs...');
    const allPostsResponse = await axios.get('http://localhost:8000/api/posts');
    const posts = allPostsResponse.data;
    
    console.log('Available posts with slugs:');
    posts.forEach(post => {
      console.log(`  - Title: "${post.title}" | Slug: "${post.slug}"`);
    });

    if (posts.length > 0) {
      const testPost = posts[0];
      console.log(`\n2. Testing slug-based access for post: "${testPost.title}" (slug: "${testPost.slug}")`);
      
      // Test accessing post by slug
      try {
        const slugResponse = await axios.get(`http://localhost:8000/api/posts/slug/${testPost.slug}`);
        console.log('✅ Successfully accessed post by slug');
        console.log(`   Retrieved post: "${slugResponse.data.title}"`);
      } catch (error) {
        console.log('❌ Failed to access post by slug:', error.response?.data || error.message);
      }

      // Test accessing post by ID (should still work)
      console.log(`\n3. Testing backward compatibility - accessing same post by ID...`);
      try {
        const idResponse = await axios.get(`http://localhost:8000/api/posts/${testPost._id}`);
        console.log('✅ Successfully accessed post by ID (backward compatibility works)');
        console.log(`   Retrieved post: "${idResponse.data.title}"`);
      } catch (error) {
        console.log('❌ Failed to access post by ID:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Slug functionality test completed!');
    console.log('\nNow you can:');
    console.log('1. Visit the frontend at http://localhost:5173');
    console.log('2. Click on any post to see the new slug-based URL');
    console.log('3. URLs will now look like: /post/my-awesome-post-title instead of /post/507f1f77bcf86cd799439011');

  } catch (error) {
    console.error('Error testing slug functionality:', error.response?.data || error.message);
  }
}

testSlugFunctionality();
