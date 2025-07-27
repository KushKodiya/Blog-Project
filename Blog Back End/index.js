const express = require('express');
const cors = require('cors');
const {connectToMongoDb} = require('./connect');

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const port = 8000;

app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Blog API is running!' });
});

app.listen(port, () => console.log(`Server started on port ${port}`));

connectToMongoDb('mongodb://127.0.0.1:27017/blog-app');
