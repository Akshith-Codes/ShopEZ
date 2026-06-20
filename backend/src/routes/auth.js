import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim()
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/me', requireAuth, getMe);

export default router;
