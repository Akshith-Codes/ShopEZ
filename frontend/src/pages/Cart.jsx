import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchProductById } from '../utils/api';
import './Cart.css';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getSubtotal, getItemCount } = useCart();
  const navigate = useNavigate();

  const [productStock, setProductStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [stockIssues, setStockIssues] = useState([]);

  useEffect(() => {
    const checkStock = async () => {
      setLoading(true);
      const stockData = {};
      const issues = [];

      for (const item of items) {
        try {
          const product = await fetchProductById(item.productId);
          stockData[item.productId] = product.stock;
          if (item.quantity > product.stock) {
            issues.push(item.productId);
          }
        } catch (err) {
          console.error(`Failed to fetch product ${item.productId}:`, err);
        }
      }

      setProductStock(stockData);
      setStockIssues(issues);
      setLoading(false);
    };

    if (items.length > 0) {
      checkStock();
    } else {
      setLoading(false);
    }
  }, [items]);

  const handleQuantityChange = (productId, delta, stock) => {
    const item = items.find(i => i.productId === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= stock) {
      updateQuantity(productId, newQuantity, stock);
    }
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  const canProceed = stockIssues.length === 0;

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <h2>Your cart is empty</h2>
            <p>Start shopping to add items to your cart.</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-page__title">Shopping Cart ({getItemCount()} items)</h1>

        {stockIssues.length > 0 && (
          <div className="cart-page__warning">
            Some items in your cart have insufficient stock. Please adjust quantities before checking out.
          </div>
        )}

        <div className="cart-page__layout">
          <div className="cart-page__items">
            {items.map((item) => {
              const stock = productStock[item.productId] || item.stock;
              const hasStockIssue = stockIssues.includes(item.productId);
              const discountedPrice = item.price * (1 - (item.discountPercentage || 0) / 100);

              return (
                <div key={item.productId} className={`cart-item ${hasStockIssue ? 'cart-item--warning' : ''}`}>
                  <div className="cart-item__image-wrapper">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="cart-item__image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="cart-item__details">
                    <Link to={`/products/${item.productId}`} className="cart-item__title">
                      {item.title}
                    </Link>

                    <div className="cart-item__price-row">
                      <span className="cart-item__price">${discountedPrice.toFixed(2)}</span>
                      {item.discountPercentage > 0 && (
                        <span className="cart-item__original-price">${item.price.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="cart-item__stock">
                      {stock < 10 && stock > 0 && (
                        <span className="cart-item__stock-low">Only {stock} left</span>
                      )}
                      {stock === 0 && (
                        <span className="cart-item__stock-out">Out of stock</span>
                      )}
                      {hasStockIssue && stock > 0 && (
                        <span className="cart-item__stock-issue">
                          You have {item.quantity} but only {stock} available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="cart-item__quantity">
                    <div className="quantity-stepper">
                      <button
                        className="quantity-stepper__btn"
                        onClick={() => handleQuantityChange(item.productId, -1, stock)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="quantity-stepper__value">{item.quantity}</span>
                      <button
                        className="quantity-stepper__btn"
                        onClick={() => handleQuantityChange(item.productId, 1, stock)}
                        disabled={item.quantity >= stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__subtotal">
                    ${(discountedPrice * item.quantity).toFixed(2)}
                  </div>

                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(item.productId)}
                    aria-label="Remove item"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-page__summary">
            <h2 className="cart-summary__title">Order Summary</h2>

            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="cart-summary__row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>

            {shipping > 0 && subtotal < 100 && (
              <p className="cart-summary__shipping-note">
                Add ${(100 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}

            <div className="cart-summary__divider"></div>

            <div className="cart-summary__row cart-summary__total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary cart-summary__checkout"
              onClick={() => navigate('/checkout')}
              disabled={!canProceed}
            >
              {canProceed ? 'Proceed to Checkout' : 'Fix Stock Issues'}
            </button>

            <Link to="/products" className="cart-summary__continue">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
