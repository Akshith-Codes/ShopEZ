import Order from '../models/Order.js';
import CartItem from '../models/CartItem.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, subtotal, shipping, total, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Validate and recalculate server-side
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${product.title}` });
      }
      const itemPrice = product.price * (1 - product.discountPercentage / 100);
      const itemTotal = itemPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        title: product.title,
        quantity: item.quantity,
        price: itemPrice,
        image: product.thumbnail
      });
    }

    const calculatedShipping = calculatedSubtotal > 100 ? 0 : 15;
    const calculatedTotal = calculatedSubtotal + calculatedShipping;

    const statusTimeline = [
      { status: 'processing', date: new Date(), completed: true },
      { status: 'shipped', date: new Date(), completed: false },
      { status: 'delivered', date: new Date(), completed: false }
    ];

    const order = await Order.create({
      userId: req.user._id,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      total: calculatedTotal,
      status: 'processing',
      statusTimeline,
      shippingAddress
    });

    // Clear user's cart
    await CartItem.deleteMany({ userId: req.user._id });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.statusTimeline.forEach(entry => {
      if (entry.status === status) {
        entry.completed = true;
        entry.date = new Date();
      }
    });

    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
