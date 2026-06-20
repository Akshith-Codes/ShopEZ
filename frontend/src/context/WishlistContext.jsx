import { createContext, useContext, useState, useEffect } from 'react';
import { getFromStorage, setToStorage } from '../utils/storage';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(() => getFromStorage('shopez_wishlist', []));

  useEffect(() => {
    setToStorage('shopez_wishlist', items);
  }, [items]);

  const addToWishlist = (product) => {
    setItems(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, {
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        discountPercentage: product.discountPercentage,
        category: product.category,
        rating: product.rating,
        stock: product.stock
      }];
    });
  };

  const removeFromWishlist = (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return items.some(item => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    count: items.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
