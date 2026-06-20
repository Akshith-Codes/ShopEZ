import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { updateProfile, addAddress, updateAddress, removeAddress, setDefaultAddress } from '../controllers/userController.js';

const router = express.Router();
router.use(requireAuth);

router.put('/me', [
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim()
], updateProfile);

router.post('/me/addresses', [
  body('street').notEmpty().trim().withMessage('Street is required'),
  body('city').notEmpty().trim().withMessage('City is required'),
  body('state').notEmpty().trim().withMessage('State is required'),
  body('zipCode').notEmpty().trim().withMessage('Zip code is required')
], addAddress);

router.put('/me/addresses/:addressId', [
  body('street').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().trim()
], updateAddress);

router.delete('/me/addresses/:addressId', removeAddress);

router.put('/me/addresses/:addressId/default', setDefaultAddress);

export default router;
