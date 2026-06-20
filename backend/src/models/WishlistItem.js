import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnail: { type: String, default: '' },
  discountPercentage: { type: Number, default: 0 },
  category: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  stock: { type: Number, default: 0 }
}, { timestamps: true });

wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model('WishlistItem', wishlistItemSchema);
