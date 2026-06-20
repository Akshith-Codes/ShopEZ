import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user._id });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingItem = await CartItem.findOne({ userId: req.user._id, productId });

    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
      existingItem.quantity = newQuantity;
      existingItem.stock = product.stock;
      await existingItem.save();
      return res.status(200).json({ success: true, data: existingItem });
    }

    const newItem = await CartItem.create({
      userId: req.user._id,
      productId,
      title: product.title,
      price: product.price,
      image: product.thumbnail,
      quantity: Math.min(quantity, product.stock),
      stock: product.stock,
      discountPercentage: product.discountPercentage
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const item = await CartItem.findOne({ userId: req.user._id, productId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (quantity <= 0) {
      await CartItem.findOneAndDelete({ userId: req.user._id, productId });
      return res.status(200).json({ success: true, data: null });
    }

    const clamped = Math.min(quantity, product.stock);
    item.quantity = clamped;
    item.stock = product.stock;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const item = await CartItem.findOneAndDelete({ userId: req.user._id, productId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await CartItem.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
