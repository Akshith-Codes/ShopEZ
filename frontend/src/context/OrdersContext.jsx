import { createContext, useContext, useState, useEffect } from 'react';
import { getFromStorage, setToStorage, MOCK_ORDERS } from '../utils/storage';

const OrdersContext = createContext(null);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => getFromStorage('shopez_orders', MOCK_ORDERS));

  useEffect(() => {
    setToStorage('shopez_orders', orders);
  }, [orders]);

  const createOrder = (orderData) => {
    const newOrder = {
      id: `order-${Date.now()}`,
      ...orderData,
      status: 'processing',
      statusTimeline: [
        { status: 'processing', date: new Date().toISOString(), completed: true },
        { status: 'shipped', date: null, completed: false },
        { status: 'delivered', date: null, completed: false }
      ],
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const statusTimeline = order.statusTimeline.map(step => {
            if (step.status === newStatus) {
              return { ...step, date: new Date().toISOString(), completed: true };
            }
            if (step.completed) return step;
            return { ...step, completed: step.status === newStatus || step.completed };
          });
          return { ...order, status: newStatus, statusTimeline };
        }
        return order;
      })
    );
  };

  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  const getUserOrders = (userId) => {
    return orders.filter(order => order.userId === userId);
  };

  const value = {
    orders,
    createOrder,
    updateOrderStatus,
    getOrderById,
    getUserOrders
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
