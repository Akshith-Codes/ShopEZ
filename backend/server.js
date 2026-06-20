import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import productRoutes from './src/routes/products.js';
import cartRoutes from './src/routes/cart.js';
import wishlistRoutes from './src/routes/wishlist.js';
import orderRoutes from './src/routes/orders.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
