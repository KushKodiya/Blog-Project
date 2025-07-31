const express = require('express');
const cors = require('cors');
const {connectToMongoDb} = require('./connect');

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');

const app = express();
const port = process.env.PORT || 8000;;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
})); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); 

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Blog API is running!' });
});

app.listen(port, () => {});
const mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://kush:AdminPass123%21@blog-project.jbmtrys.mongodb.net/Blog-Project?retryWrites=true&w=majority&appName=Blog-Project';
connectToMongoDb(mongoUrl)



