const axios = require('axios');

async function createAdmin() {
  try {
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      phone: '1234567890',
      email: 'admin@blog.com',
      password: 'admin123!',
      role: 'admin'
    };

    console.log('Creating admin user...');
    const response = await axios.post('http://localhost:8000/api/users/register', adminData);
    
    console.log('Admin user created successfully!');
    console.log('Username:', adminData.username);
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Role:', adminData.role);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Full error:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      console.error('Error creating admin:', error.response.data?.message || 'Unknown error');
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error creating admin:', error.message);
    }
  }
}

createAdmin();
