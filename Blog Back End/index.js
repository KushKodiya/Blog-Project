const express = require('express');
const cors = require('cors');
const {connectToMongoDb} = require('./connect');

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL /*|| 'http://localhost:5173',*/,
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

app.get('/', (req, res) => {
    res.json({ message: 'Blog API is running!' });
});

app.listen(port, () => {});

const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog-app';
connectToMongoDb(mongoUrl);
