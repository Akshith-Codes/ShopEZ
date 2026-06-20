import { useState, useEffect } from 'react';
import { useOrders } from '../context/OrdersContext';
import { fetchProducts } from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { orders } = useOrders();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await fetchProducts(100, 0);
        setProducts(productsData.products || []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'processing').length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      color: 'gold'
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
        </svg>
      ),
      color: 'blue'
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      color: 'orange'
    },
    {
      label: 'Low Stock Items',
      value: lowStockProducts,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      color: 'red'
    }
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="admin-dashboard">
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`admin-stat-card admin-stat-card--${stat.color}`}>
            <div className="admin-stat-card__icon">{stat.icon}</div>
            <div className="admin-stat-card__content">
              <span className="admin-stat-card__value">{stat.value}</span>
              <span className="admin-stat-card__label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <h2 className="admin-section__title">Recent Orders</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="admin-table__id">{order.id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.items.length} items</td>
                  <td className="admin-table__price">${order.total.toFixed(2)}</td>
                  <td>
                    <span className={`admin-table__status status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Products */}
      <div className="admin-section">
        <h2 className="admin-section__title">Low Stock Alert</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.filter(p => p.stock < 10).slice(0, 5).map((product) => (
                <tr key={product.id}>
                  <td className="admin-table__product">
                    <img src={product.thumbnail} alt={product.title} className="admin-table__thumb" />
                    <span>{product.title}</span>
                  </td>
                  <td className="admin-table__category">{product.category}</td>
                  <td>
                    <span className={`admin-table__stock ${product.stock === 0 ? 'admin-table__stock--out' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="admin-table__price">${product.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
