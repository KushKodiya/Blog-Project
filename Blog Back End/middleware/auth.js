const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'Token is not valid' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = { auth, JWT_SECRET };
