import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { getWishlist, addToWishlist, removeWishlistItem, clearWishlist } from '../controllers/wishlistController.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/', [
  body('productId').notEmpty().withMessage('Product ID is required')
], addToWishlist);
router.delete('/:productId', removeWishlistItem);
router.delete('/', clearWishlist);

export default router;
