import { createContext, useContext, useState, useEffect } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => getFromStorage('shopez_cart', []));

  useEffect(() => {
    setToStorage('shopez_cart', items);
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.thumbnail,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
        discountPercentage: product.discountPercentage
      }];
    });
  };

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity, stock) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const discountedPrice = item.price * (1 - (item.discountPercentage || 0) / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const hasStockIssues = (products) => {
    return items.some(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return true;
      return item.quantity > product.stock;
    });
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getItemCount,
    hasStockIssues
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
