const axios = require('axios');

async function testSlugFunctionality() {
  try {

    const allPostsResponse = await axios.get('http://localhost:8000/api/posts');
    const posts = allPostsResponse.data;
    
    posts.forEach(post => {
    });

    if (posts.length > 0) {
      const testPost = posts[0];
      
      try {
        const slugResponse = await axios.get(`http://localhost:8000/api/posts/slug/${testPost.slug}`);
      } catch (error) {
      }

      try {
        const idResponse = await axios.get(`http://localhost:8000/api/posts/${testPost._id}`);
      } catch (error) {
      }
    }

  } catch (error) {
  }
}

testSlugFunctionality();
