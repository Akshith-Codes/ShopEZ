import express from 'express';
import { body } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', requireAuth, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('shippingAddress').isObject().withMessage('Shipping address is required')
], createOrder);

router.get('/me', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrder);
router.get('/', requireAuth, requireAdmin, getAllOrders);
router.put('/:id/status', requireAuth, requireAdmin, [
  body('status').isIn(['processing', 'shipped', 'delivered']).withMessage('Invalid status')
], updateOrderStatus);

export default router;
