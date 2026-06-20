import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const foundOrder = getOrderById(orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [orderId, getOrderById]);

  if (!order) {
    return (
      <div className="order-confirmation">
        <div className="container">
          <div className="order-confirmation__not-found">
            <h1>Order Not Found</h1>
            <p>We couldn't find the order you're looking for.</p>
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation">
      <div className="container">
        <div className="order-confirmation__content">
          <div className="order-confirmation__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1 className="order-confirmation__title">Order Confirmed!</h1>
          <p className="order-confirmation__subtitle">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          <p className="order-confirmation__order-id">
            Order ID: <strong>{order.id}</strong>
          </p>

          <div className="order-confirmation__details">
            <div className="order-confirmation__section">
              <h2>Order Summary</h2>
              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <div className="order-item-info">
                      <span className="order-item-name">{item.title}</span>
                      <span className="order-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="order-item-price">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="order-total-row">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="order-total-row">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="order-total-row order-total-row--bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="order-confirmation__section">
              <h2>Shipping Address</h2>
              <div className="shipping-address">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <div className="order-confirmation__section">
              <h2>Order Status</h2>
              <div className="status-timeline">
                {order.statusTimeline.map((step, index) => (
                  <div
                    key={step.status}
                    className={`status-step ${step.completed ? 'status-step--completed' : ''}`}
                  >
                    <div className="status-step__marker">
                      {step.completed ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="status-step__content">
                      <span className="status-step__label">
                        {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                      </span>
                      {step.date && (
                        <span className="status-step__date">
                          {new Date(step.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-confirmation__actions">
            <Link to="/profile?tab=orders" className="btn btn-primary">
              View All Orders
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
