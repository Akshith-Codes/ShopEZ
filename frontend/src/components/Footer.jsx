import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              ShopEZ
            </Link>
            <p className="footer__tagline">
              Premium shopping experience with curated selection and exceptional service.
            </p>
          </div>

          <div className="footer__section">
            <h4 className="footer__title">Shop</h4>
            <nav className="footer__links">
              <Link to="/products" className="footer__link">All Products</Link>
              <Link to="/products?category=smartphones" className="footer__link">Smartphones</Link>
              <Link to="/products?category=laptops" className="footer__link">Laptops</Link>
              <Link to="/products?category=fragrances" className="footer__link">Fragrances</Link>
            </nav>
          </div>

          <div className="footer__section">
            <h4 className="footer__title">Account</h4>
            <nav className="footer__links">
              <Link to="/login" className="footer__link">Login</Link>
              <Link to="/register" className="footer__link">Register</Link>
              <Link to="/profile?tab=orders" className="footer__link">Order History</Link>
              <Link to="/profile?tab=wishlist" className="footer__link">Wishlist</Link>
            </nav>
          </div>

          <div className="footer__section">
            <h4 className="footer__title">Support</h4>
            <nav className="footer__links">
              <span className="footer__link">Contact Us</span>
              <span className="footer__link">FAQs</span>
              <span className="footer__link">Returns</span>
              <span className="footer__link">Shipping Info</span>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2024 ShopEZ. All rights reserved.
          </p>
          <div className="footer__legal">
            <span className="footer__legal-link">Privacy Policy</span>
            <span className="footer__legal-link">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
