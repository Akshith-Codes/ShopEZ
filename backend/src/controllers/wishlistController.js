import WishlistItem from '../models/WishlistItem.js';
import Product from '../models/Product.js';

export const getWishlist = async (req, res, next) => {
  try {
    const items = await WishlistItem.find({ userId: req.user._id });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingItem = await WishlistItem.findOne({ userId: req.user._id, productId });
    if (existingItem) {
      return res.status(200).json({ success: true, data: existingItem });
    }

    const newItem = await WishlistItem.create({
      userId: req.user._id,
      productId,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      discountPercentage: product.discountPercentage,
      category: product.category,
      rating: product.rating,
      stock: product.stock
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

export const removeWishlistItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const item = await WishlistItem.findOneAndDelete({ userId: req.user._id, productId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    await WishlistItem.deleteMany({ userId: req.user._id });
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
