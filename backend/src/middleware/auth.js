import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized - no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized - invalid token' });
  }
};

export const requireAdmin = async (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden - admin access required' });
  }
  next();
};
