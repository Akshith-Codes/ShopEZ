// localStorage utility functions for persisting state

export const getFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

// Mock user for initial seeding
export const MOCK_USER = {
  id: 'user-001',
  email: 'demo@shopez.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'customer',
  addresses: [
    {
      id: 'addr-1',
      type: 'home',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true
    }
  ]
};

// Admin user for testing admin dashboard
export const ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@shopez.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  addresses: [
    {
      id: 'addr-admin',
      type: 'work',
      street: '456 Admin Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      isDefault: true
    }
  ]
};

// Mock orders for initial seeding
export const MOCK_ORDERS = [
  {
    id: 'order-001',
    userId: 'user-001',
    items: [
      { productId: 1, title: 'iPhone 5s', quantity: 1, price: 899, image: '' },
      { productId: 2, title: 'iPhone 6', quantity: 2, price: 999, image: '' }
    ],
    subtotal: 2897,
    shipping: 15,
    total: 2912,
    status: 'delivered',
    statusTimeline: [
      { status: 'processing', date: '2024-01-15', completed: true },
      { status: 'shipped', date: '2024-01-17', completed: true },
      { status: 'delivered', date: '2024-01-20', completed: true }
    ],
    shippingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'order-002',
    userId: 'user-001',
    items: [
      { productId: 3, title: 'Samsung Universe 9', quantity: 1, price: 1249, image: '' }
    ],
    subtotal: 1249,
    shipping: 0,
    total: 1249,
    status: 'shipped',
    statusTimeline: [
      { status: 'processing', date: '2024-02-01', completed: true },
      { status: 'shipped', date: '2024-02-03', completed: true },
      { status: 'delivered', date: null, completed: false }
    ],
    shippingAddress: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    createdAt: '2024-02-01T14:15:00Z'
  },
  {
    id: 'order-003',
    userId: 'user-001',
    items: [
      { productId: 5, title: 'Huawei P30', quantity: 1, price: 799, image: '' }
    ],
    subtotal: 799,
    shipping: 10,
    total: 809,
    status: 'processing',
    statusTimeline: [
      { status: 'processing', date: '2024-02-10', completed: true },
      { status: 'shipped', date: null, completed: false },
      { status: 'delivered', date: null, completed: false }
    ],
    shippingAddress: {
      street: '456 Oak Avenue',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'USA'
    },
    createdAt: '2024-02-10T09:45:00Z'
  }
];
