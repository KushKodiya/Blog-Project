# Vercel Deployment Checklist

## ✅ Pre-Deployment Setup Complete

### Backend Configuration:
- [x] Created `vercel.json` for backend
- [x] Updated `package.json` scripts
- [x] Added environment variable support
- [x] Updated CORS configuration
- [x] Created `.env.example` template
- [x] Added `.gitignore`

### Frontend Configuration:
- [x] Created `vercel.json` for SPA routing
- [x] Added environment variable support
- [x] Created config file for API URLs
- [x] Updated all API calls to use config
- [x] Set up production environment file

## 🚀 Next Steps (Manual)

### 1. Set Up MongoDB Atlas
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster
- [ ] Create database user
- [ ] Get connection string
- [ ] Whitelist Vercel IP addresses (or use 0.0.0.0/0 for all)

### 2. Deploy Backend
- [ ] Push backend code to GitHub repository
- [ ] Create new Vercel project from GitHub
- [ ] Set environment variables in Vercel:
  - `NODE_ENV=production`
  - `MONGODB_URI=mongodb+srv://...`
  - `JWT_SECRET=your-secret-key`
  - `FRONTEND_URL=https://your-frontend.vercel.app`
- [ ] Deploy and note the backend URL

### 3. Deploy Frontend
- [ ] Update `.env.production` with backend URL
- [ ] Push frontend code to GitHub repository
- [ ] Create new Vercel project from GitHub
- [ ] Set environment variables in Vercel:
  - `VITE_API_URL=https://your-backend.vercel.app`
- [ ] Deploy and note the frontend URL

### 4. Final Configuration
- [ ] Update backend `FRONTEND_URL` with actual frontend URL
- [ ] Redeploy backend
- [ ] Test all functionality

## 🔧 Environment Variables

### Backend (.env):
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-app
JWT_SECRET=your-super-secret-jwt-key-minimum-256-bits
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend-domain.vercel.app
```

## 🧪 Testing Checklist

After deployment, test:
- [ ] User registration
- [ ] User login
- [ ] Create post with image
- [ ] View posts
- [ ] Admin category management
- [ ] Post deletion
- [ ] Image display
- [ ] Toast notifications
- [ ] Responsive design

## 📝 Notes

- File uploads are stored locally on Vercel (serverless functions). For production, consider using cloud storage like Cloudinary or AWS S3.
- Make sure to use a strong JWT_SECRET (at least 256 bits)
- The frontend will automatically use the correct API URL based on the environment
