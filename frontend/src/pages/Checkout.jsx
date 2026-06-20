import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { fetchProductById } from '../utils/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items, getSubtotal, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [loading, setLoading] = useState(true);
  const [stockIssues, setStockIssues] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    paymentMethod: 'card'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const checkStock = async () => {
      const issues = [];

      for (const item of items) {
        try {
          const product = await fetchProductById(item.productId);
          if (item.quantity > product.stock) {
            issues.push({ productId: item.productId, requested: item.quantity, available: product.stock });
          }
        } catch (err) {
          console.error(`Failed to check stock for ${item.productId}:`, err);
        }
      }

      setStockIssues(issues);
      setLoading(false);
    };

    checkStock();
  }, [isAuthenticated, items, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (stockIssues.length > 0) {
      alert('Please fix stock issues in your cart before proceeding.');
      return;
    }

    if (!validate()) return;

    setSubmitting(true);

    try {
      const subtotal = getSubtotal();
      const shipping = subtotal > 100 ? 0 : 15;
      const total = subtotal + shipping;

      const order = createOrder({
        userId: user.id,
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          quantity: item.quantity,
          price: item.price * (1 - (item.discountPercentage || 0) / 100),
          image: item.image
        })),
        subtotal,
        shipping,
        total,
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      });

      clearCart();
      setCompletedOrderId(order.id);
      setOrderComplete(true);
    } catch (err) {
      console.error('Order failed:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return <Navigate to={`/order-confirmation/${completedOrderId}`} replace />;
  }

  if (stockIssues.length > 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="error-message" style={{ maxWidth: '600px', margin: 'auto' }}>
            <h3>Stock Issues Detected</h3>
            <p>The following items have insufficient stock:</p>
            <ul>
              {stockIssues.map(issue => (
                <li key={issue.productId}>
                  Product {issue.productId}: Requested {issue.requested}, available {issue.available}
                </li>
              ))}
            </ul>
            <Link to="/cart" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-page__title">Checkout</h1>

        <form className="checkout-page__form" onSubmit={handleSubmit}>
          <div className="checkout-page__layout">
            <div className="checkout-page__main">
              {/* Shipping Address */}
              <section className="checkout-section">
                <h2 className="checkout-section__title">Shipping Address</h2>

                <div className="checkout-section__grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className={`form-input ${errors.firstName ? 'form-input--error' : ''}`}
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className={`form-input ${errors.lastName ? 'form-input--error' : ''}`}
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="street">Street Address</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      className={`form-input ${errors.street ? 'form-input--error' : ''}`}
                      value={formData.street}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.street && <span className="form-error">{errors.street}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className={`form-input ${errors.city ? 'form-input--error' : ''}`}
                      value={formData.city}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className={`form-input ${errors.state ? 'form-input--error' : ''}`}
                      value={formData.state}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.state && <span className="form-error">{errors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="zipCode">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className={`form-input ${errors.zipCode ? 'form-input--error' : ''}`}
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    {errors.zipCode && <span className="form-error">{errors.zipCode}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="country">Country</label>
                    <select
                      id="country"
                      name="country"
                      className="form-input"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="USA">United States</option>
                      <option value="CAN">Canada</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="checkout-section">
                <h2 className="checkout-section__title">Payment Method</h2>

                <div className="payment-methods">
                  <label className={`payment-method ${formData.paymentMethod === 'card' ? 'payment-method--active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    <div className="payment-method__content">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <span>Credit Card</span>
                    </div>
                  </label>

                  <label className={`payment-method ${formData.paymentMethod === 'paypal' ? 'payment-method--active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    <div className="payment-method__content">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v12M6 12h12" />
                      </svg>
                      <span>PayPal (Mock)</span>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Order Summary */}
            <div className="checkout-page__summary">
              <h2 className="checkout-summary__title">Order Summary</h2>

              <div className="checkout-items">
                {items.map((item) => {
                  const discountedPrice = item.price * (1 - (item.discountPercentage || 0) / 100);
                  return (
                    <div key={item.productId} className="checkout-item">
                      <div className="checkout-item__info">
                        <span className="checkout-item__title">{item.title}</span>
                        <span className="checkout-item__qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="checkout-item__price">
                        ${(discountedPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-summary__divider"></div>

              <div className="checkout-summary__row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="checkout-summary__row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="checkout-summary__divider"></div>

              <div className="checkout-summary__row checkout-summary__total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary checkout-submit"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
              </button>

              <Link to="/cart" className="checkout-back">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import { Navigate } from 'react-router-dom';

export default Checkout;
