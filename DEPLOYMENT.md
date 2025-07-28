# Blog Project - Vercel Deployment Guide

This guide will help you deploy your full-stack blog application to Vercel.

## Project Structure
```
Blog Project/
├── Blog Back End/     # Node.js/Express API
└── Blog Front End/    # React/Vite frontend
```

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Set up a cloud MongoDB database at [mongodb.com/atlas](https://mongodb.com/atlas)

## Step 1: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/blog-app`)

## Step 2: Deploy Backend to Vercel

1. **Push your backend to GitHub** (Blog Back End folder)
2. **Go to Vercel Dashboard** and click "New Project"
3. **Import your GitHub repository** and select the backend folder
4. **Configure Environment Variables** in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-app
   JWT_SECRET=your-super-secret-jwt-key-here
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
5. **Deploy** - Vercel will automatically build and deploy
6. **Note the backend URL** (e.g., `https://your-backend.vercel.app`)

## Step 3: Deploy Frontend to Vercel

1. **Update Frontend Environment Variables**:
   - Edit `Blog Front End/.env.production`
   - Set `VITE_API_URL=https://your-backend.vercel.app`

2. **Push frontend to GitHub** (Blog Front End folder)
3. **Go to Vercel Dashboard** and click "New Project"
4. **Import your GitHub repository** and select the frontend folder
5. **Configure Environment Variables** in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   ```
6. **Deploy** - Vercel will automatically build and deploy

## Step 4: Update Backend CORS

After frontend deployment:
1. Go to your backend Vercel project
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. Redeploy the backend

## Step 5: Test Your Application

1. Visit your frontend URL
2. Test all functionality:
   - User registration/login
   - Creating posts
   - Managing categories (admin)
   - Image uploads
   - Toast notifications

## Important Notes

- **Database**: Use MongoDB Atlas (cloud) instead of local MongoDB
- **File Uploads**: Consider using cloud storage (Cloudinary, AWS S3) for production
- **Environment Variables**: Keep your JWT_SECRET secure and unique
- **CORS**: Make sure backend allows your frontend domain

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Check FRONTEND_URL environment variable in backend
2. **Database Connection**: Verify MongoDB Atlas connection string
3. **API Calls Failing**: Ensure VITE_API_URL is set correctly in frontend
4. **File Uploads**: Images are stored locally; consider cloud storage for production

### Debug Steps:

1. Check Vercel function logs in dashboard
2. Verify all environment variables are set
3. Test API endpoints individually
4. Check network tab in browser developer tools

## Production Considerations

1. **File Storage**: Implement cloud storage for images
2. **Email Service**: Add email verification for user registration
3. **Rate Limiting**: Add API rate limiting
4. **Monitoring**: Set up error tracking and monitoring
5. **Security**: Review and enhance security measures

Your blog application should now be live and accessible via your Vercel URLs!
