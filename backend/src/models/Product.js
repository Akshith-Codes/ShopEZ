import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  brand: { type: String, default: '' },
  sku: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  thumbnail: { type: String, default: '' },
  images: { type: [String], default: [] },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  tags: { type: [String], default: [] },
  isCustom: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Product', productSchema);
