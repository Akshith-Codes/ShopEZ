import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, default: 'home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'US' },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [addressSchema]
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
