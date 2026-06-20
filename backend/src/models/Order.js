import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  image: { type: String, default: '' }
}, { _id: false });

const statusTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'US' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['processing', 'shipped', 'delivered'], default: 'processing' },
  statusTimeline: [statusTimelineSchema],
  shippingAddress: shippingAddressSchema
}, { timestamps: true });

orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Order', orderSchema);
