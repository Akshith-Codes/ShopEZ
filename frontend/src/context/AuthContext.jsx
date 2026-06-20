import { createContext, useContext, useState, useEffect } from 'react';
import { getFromStorage, setToStorage, MOCK_USER, ADMIN_USER } from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getFromStorage('shopez_user', null));

  useEffect(() => {
    if (user) {
      setToStorage('shopez_user', user);
    } else {
      localStorage.removeItem('shopez_user');
    }
  }, [user]);

  const login = async (email) => {
    // TODO: connect to backend - POST /api/auth/login
    // For now, mock login - admin email gives admin role
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAdminLogin = email.toLowerCase().includes('admin');
        const baseUser = isAdminLogin ? ADMIN_USER : MOCK_USER;
        const loggedInUser = {
          ...baseUser,
          email: email || baseUser.email
        };
        setUser(loggedInUser);
        resolve({ success: true, user: loggedInUser });
      }, 500);
    });
  };

  const register = async (userData) => {
    // TODO: connect to backend - POST /api/auth/register
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: `user-${Date.now()}`,
          ...userData,
          role: 'customer',
          addresses: []
        };
        setUser(newUser);
        resolve({ success: true, user: newUser });
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const addAddress = (address) => {
    const newAddress = {
      id: `addr-${Date.now()}`,
      ...address,
      isDefault: user.addresses.length === 0
    };
    setUser(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress]
    }));
  };

  const updateAddress = (addressId, updates) => {
    setUser(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr =>
        addr.id === addressId ? { ...addr, ...updates } : addr
      )
    }));
  };

  const removeAddress = (addressId) => {
    setUser(prev => ({
      ...prev,
      addresses: prev.addresses.filter(addr => addr.id !== addressId)
    }));
  };

  const setDefaultAddress = (addressId) => {
    setUser(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    }));
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading: false,
    login,
    register,
    logout,
    updateUser,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    isAdmin,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
