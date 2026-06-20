import express from 'express';
import { body } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { listProducts, getProduct, getCategories, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/', listProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

router.post('/', requireAuth, requireAdmin, [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('category').notEmpty().trim().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock is required')
], createProduct);

router.put('/:id', requireAuth, requireAdmin, [
  body('title').optional().trim(),
  body('category').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], updateProduct);

router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router;
