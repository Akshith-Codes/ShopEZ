import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  stock: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 }
}, { timestamps: true });

cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model('CartItem', cartItemSchema);
