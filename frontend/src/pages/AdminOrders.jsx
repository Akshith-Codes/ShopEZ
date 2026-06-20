import { useState } from 'react';
import { useOrders } from '../context/OrdersContext';
import './AdminOrders.css';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const statusOptions = ['processing', 'shipped', 'delivered'];

  return (
    <div className="admin-orders">
      {/* Filters */}
      <div className="admin-orders__filters">
        <input
          type="text"
          placeholder="Search by Order ID or User ID..."
          className="form-input admin-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="admin-orders__status-filters">
          <button
            className={`status-filter ${statusFilter === 'all' ? 'status-filter--active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`status-filter ${statusFilter === 'processing' ? 'status-filter--active' : ''}`}
            onClick={() => setStatusFilter('processing')}
          >
            Processing
          </button>
          <button
            className={`status-filter ${statusFilter === 'shipped' ? 'status-filter--active' : ''}`}
            onClick={() => setStatusFilter('shipped')}
          >
            Shipped
          </button>
          <button
            className={`status-filter ${statusFilter === 'delivered' ? 'status-filter--active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-section">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="admin-table__id">{order.id}</td>
                  <td>
                    <div className="admin-customer">
                      <span className="admin-customer__id">{order.userId}</span>
                    </div>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-order-items">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="admin-order-item">
                          {item.title}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span className="admin-order-more">+{order.items.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="admin-table__price">${order.total.toFixed(2)}</td>
                  <td>
                    <span className={`admin-table__status status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-input status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="admin-empty">
            <p>No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
