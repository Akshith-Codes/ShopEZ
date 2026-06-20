import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', getCart);
router.post('/', [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], addToCart);
router.put('/:productId', [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or more')
], updateCartItem);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;
