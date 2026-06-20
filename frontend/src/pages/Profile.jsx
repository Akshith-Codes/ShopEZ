import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Profile.css';

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, updateUser, addAddress, updateAddress, removeAddress, setDefaultAddress, logout } = useAuth();
  const { getUserOrders, getOrderById } = useOrders();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'orders');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const tabs = [
    { id: 'orders', label: 'Order History' },
    { id: 'account', label: 'Account Details' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'wishlist', label: 'Wishlist' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setOrders(getUserOrders(user.id));
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || ''
    });
  }, [user, navigate, getUserOrders]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setSelectedOrder(null);
    setEditMode(false);
  };

  const handleProfileSave = () => {
    updateUser(profileData);
    setEditMode(false);
  };

  const handleAddNewAddress = () => {
    const newAddress = {
      id: `addr-${Date.now()}`,
      type: 'other',
      street: 'New Address',
      city: 'City',
      state: 'State',
      zipCode: '00000',
      country: 'USA',
      isDefault: false
    };
    addAddress(newAddress);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'status-delivered';
      case 'shipped':
        return 'status-shipped';
      case 'processing':
        return 'status-processing';
      default:
        return '';
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-page__header">
          <div>
            <h1 className="profile-page__title">My Account</h1>
            <p className="profile-page__greeting">Hello, {user.firstName}!</p>
          </div>
          <div className="profile-page__user-info">
            <span>{user.email}</span>
            <button className="btn btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="profile-page__content">
          {/* Sidebar Tabs */}
          <aside className="profile-page__sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`profile-tab ${activeTab === tab.id ? 'profile-tab--active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="profile-page__main">
            {/* Order History */}
            {activeTab === 'orders' && (
              <section className="profile-section">
                {selectedOrder ? (
                  <div className="order-detail-view">
                    <button
                      className="btn btn-secondary back-btn"
                      onClick={() => setSelectedOrder(null)}
                    >
                      ← Back to Orders
                    </button>

                    <h2>Order {selectedOrder.id}</h2>
                    <p className="order-date">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>

                    <div className={`order-status-badge ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </div>

                    {/* Status Timeline */}
                    <div className="order-detail-timeline">
                      {selectedOrder.statusTimeline.map((step, index) => (
                        <div
                          key={step.status}
                          className={`timeline-step ${step.completed ? 'timeline-step--completed' : ''}`}
                        >
                          <div className="timeline-step__line"></div>
                          <div className="timeline-step__marker">
                            {step.completed ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <div className="timeline-step__content">
                            <span className="timeline-step__label">
                              {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                            </span>
                            {step.date && (
                              <span className="timeline-step__date">
                                {new Date(step.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Items */}
                    <div className="order-detail-items">
                      <h3>Items</h3>
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="order-detail-item">
                          <img src={item.image} alt={item.title} className="order-detail-item__image" />
                          <div className="order-detail-item__info">
                            <span className="order-detail-item__title">{item.title}</span>
                            <span className="order-detail-item__qty">Qty: {item.quantity}</span>
                          </div>
                          <span className="order-detail-item__price">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Addresses */}
                    <div className="order-detail-addresses">
                      <div className="order-detail-address">
                        <h3>Shipping Address</h3>
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="order-detail-totals">
                      <div className="order-total-row">
                        <span>Subtotal</span>
                        <span>${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="order-total-row">
                        <span>Shipping</span>
                        <span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="order-total-row order-total-row--bold">
                        <span>Total</span>
                        <span>${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2>Order History</h2>
                    {orders.length === 0 ? (
                      <div className="empty-state">
                        <p>You haven't placed any orders yet.</p>
                        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                      </div>
                    ) : (
                      <div className="orders-list">
                        {orders.map((order) => (
                          <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                            <div className="order-card__header">
                              <div>
                                <span className="order-card__id">{order.id}</span>
                                <span className="order-card__date">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <span className={`order-status-badge ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="order-card__items">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <span key={idx} className="order-card__item">
                                  {item.title}
                                </span>
                              ))}
                              {order.items.length > 3 && (
                                <span className="order-card__more">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                            <div className="order-card__footer">
                              <span className="order-card__total">${order.total.toFixed(2)}</span>
                              <button className="btn btn-secondary btn--sm">View Details</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* Account Details */}
            {activeTab === 'account' && (
              <section className="profile-section">
                <div className="profile-section__header">
                  <h2>Account Details</h2>
                  {!editMode && (
                    <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
                      Edit Profile
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="profile-form">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div className="profile-form__actions">
                      <button className="btn btn-primary" onClick={handleProfileSave}>
                        Save Changes
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="profile-info">
                    <div className="profile-info__row">
                      <span className="profile-info__label">First Name</span>
                      <span className="profile-info__value">{user.firstName}</span>
                    </div>
                    <div className="profile-info__row">
                      <span className="profile-info__label">Last Name</span>
                      <span className="profile-info__value">{user.lastName}</span>
                    </div>
                    <div className="profile-info__row">
                      <span className="profile-info__label">Email</span>
                      <span className="profile-info__value">{user.email}</span>
                    </div>
                    <div className="profile-info__row">
                      <span className="profile-info__label">Role</span>
                      <span className="profile-info__value">{user.role || 'customer'}</span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <section className="profile-section">
                <div className="profile-section__header">
                  <h2>Shipping Addresses</h2>
                  <button className="btn btn-primary" onClick={handleAddNewAddress}>
                    Add New Address
                  </button>
                </div>

                {user.addresses?.length === 0 ? (
                  <div className="empty-state">
                    <p>No addresses saved yet.</p>
                  </div>
                ) : (
                  <div className="addresses-grid">
                    {user.addresses?.map((address) => (
                      <div key={address.id} className={`address-card ${address.isDefault ? 'address-card--default' : ''}`}>
                        {address.isDefault && <span className="default-badge">Default</span>}
                        <h3 className="address-card__type">{address.type?.toUpperCase() || 'ADDRESS'}</h3>
                        <p className="address-card__street">{address.street}</p>
                        <p className="address-card__city">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="address-card__country">{address.country}</p>
                        <div className="address-card__actions">
                          {!address.isDefault && (
                            <button
                              className="btn btn-secondary btn--sm"
                              onClick={() => setDefaultAddress(address.id)}
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn--sm"
                            onClick={() => removeAddress(address.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <section className="profile-section">
                <h2>My Wishlist</h2>

                {wishlistItems.length === 0 ? (
                  <div className="empty-state">
                    <p>Your wishlist is empty.</p>
                    <Link to="/products" className="btn btn-primary">Browse Products</Link>
                  </div>
                ) : (
                  <div className="wishlist-grid">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="wishlist-card">
                        <Link to={`/products/${item.id}`}>
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="wishlist-card__image"
                          />
                        </Link>
                        <div className="wishlist-card__content">
                          <Link to={`/products/${item.id}`} className="wishlist-card__title">
                            {item.title}
                          </Link>
                          <span className="wishlist-card__category">{item.category}</span>
                          <span className="wishlist-card__price">
                            ${(item.price * (1 - (item.discountPercentage || 0) / 100)).toFixed(2)}
                          </span>
                          <div className="wishlist-card__actions">
                            <button
                              className="btn btn-primary btn--sm"
                              onClick={() => handleAddToCart(item)}
                              disabled={item.stock === 0}
                            >
                              {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                              className="btn btn-secondary btn--sm"
                              onClick={() => removeFromWishlist(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
