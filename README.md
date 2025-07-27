# Blog Application - Complete Setup

## 🎉 **Your Blog Application is Ready!**

### **Frontend URL**: http://localhost:5173/
### **Backend URL**: http://localhost:8000/

## 📱 **Features Implemented**

### **Authentication System**
- ✅ User Registration (signup)
- ✅ User Login
- ✅ JWT-based authentication
- ✅ Protected routes (only logged-in users can create posts)
- ✅ Automatic login persistence (localStorage)

### **User Interface**
- ✅ **Home Page**: Displays all blog posts
- ✅ **Login Page**: Email and password login
- ✅ **Signup Page**: Full user registration form
- ✅ **Create Post Page**: Form with title, image upload, and content
- ✅ **Navigation Bar**: Dynamic nav (shows logout when logged in, signup when not)

### **Blog Post System**
- ✅ Create posts with title, content, and images
- ✅ Image upload and storage
- ✅ Display all posts on homepage
- ✅ Post metadata (author name, creation date)
- ✅ Only authenticated users can create posts

## 🏗️ **Architecture (MVC Backend)**

### **Models** (`/models`)
- `user.js` - User schema (firstName, lastName, phone, email, password)
- `post.js` - Post schema (title, body, img, user reference)

### **Controllers** (`/controllers`)
- `userController.js` - Registration, login, user profile
- `postController.js` - Create, read, update, delete posts + image upload

### **Routes** (`/routes`)
- `userRoutes.js` - Auth endpoints (/register, /login, /me)
- `postRoutes.js` - Post endpoints (CRUD operations)

### **Middleware** (`/middleware`)
- `auth.js` - JWT authentication middleware
- `upload.js` - Multer file upload middleware

## 🔐 **API Endpoints**

### **User Authentication**
- `POST /api/users/register` - Create account
- `POST /api/users/login` - Login
- `GET /api/users/me` - Get current user (protected)

### **Blog Posts**
- `GET /api/posts` - Get all posts (public)
- `POST /api/posts` - Create post (protected)
- `POST /api/posts/upload-image` - Upload image (protected)
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (author only)
- `DELETE /api/posts/:id` - Delete post (author only)

## 💾 **Database**
- **MongoDB** database: `blog-app`
- **Collections**: `users`, `posts`
- **User data**: firstName, lastName, phone, email, hashed password
- **Post data**: title, content, image URL, user reference, timestamps

## 🚀 **How to Use**

1. **Visit**: http://localhost:5173/
2. **Sign up**: Create a new account with your details
3. **Login**: Use your email and password
4. **Create posts**: Click "Create Post" in the navigation
5. **Upload images**: Select an image file when creating a post
6. **View posts**: All posts appear on the home page

## 🔧 **Technical Details**

### **Frontend (React)**
- React Router for navigation
- Axios for API calls
- JWT token stored in localStorage
- Responsive design with modern CSS
- Image preview for uploads
- Form validation and error handling

### **Backend (Node.js + Express)**
- MVC architecture pattern
- JWT authentication
- BCrypt password hashing
- Multer file upload handling
- CORS enabled for frontend
- MongoDB with Mongoose ODM

### **Security Features**
- Password hashing with bcrypt
- JWT tokens for authentication
- Protected routes requiring authentication
- User can only edit/delete their own posts
- File upload validation (images only)
- Input validation and error handling

## 🎨 **UI Features**
- Modern, responsive design
- Dynamic navigation based on auth state
- Post cards with hover effects
- Image previews
- Loading states and error messages
- Mobile-friendly layout

Your blog application is now fully functional with complete user authentication, post creation with image uploads, and a beautiful modern interface!
