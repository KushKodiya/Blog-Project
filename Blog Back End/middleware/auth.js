const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        console.log('Auth middleware - Token received:', token ? 'Yes' : 'No');
        
        if (!token) {
            console.log('Auth middleware - No token provided');
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Auth middleware - Token decoded successfully for user:', decoded.userId);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            console.log('Auth middleware - User not found for token');
            return res.status(401).json({ error: 'Token is not valid' });
        }

        console.log('Auth middleware - User authenticated:', user.email, 'Role:', user.role);
        req.user = user;
        next();
    } catch (error) {
        console.log('Auth middleware - Token verification failed:', error.message);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = { auth, JWT_SECRET };
