import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header__container container">
        <Link to="/" className="header__logo">
          <span className="header__logo-text">ShopEZ</span>
        </Link>

        <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
          <Link to="/" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>
            Shop
          </Link>
          {isAuthenticated && (
            <Link to="/profile" className="header__nav-link" onClick={() => setMobileMenuOpen(false)}>
              Profile
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="header__nav-link header__nav-link--admin" onClick={() => setMobileMenuOpen(false)}>
              Admin
            </Link>
          )}
        </nav>

        <form className="header__search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header__search-input"
          />
          <button type="submit" className="header__search-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </form>

        <div className="header__actions">
          <Link to="/cart" className="header__action-btn header__action-btn--cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {getItemCount() > 0 && (
              <span className="header__action-badge">{getItemCount()}</span>
            )}
          </Link>

          <Link to="/profile?tab=wishlist" className="header__action-btn header__action-btn--wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="header__action-badge">{wishlistCount}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="header__user-menu">
              <button className="header__action-btn header__action-btn--user">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              <div className="header__user-dropdown">
                <Link to="/profile" className="header__dropdown-link">Account</Link>
                <Link to="/profile?tab=orders" className="header__dropdown-link">Orders</Link>
                <Link to="/profile?tab=addresses" className="header__dropdown-link">Addresses</Link>
                <button onClick={handleLogout} className="header__dropdown-link header__dropdown-link--logout">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="header__login-btn btn btn-primary">
              Login
            </Link>
          )}

          <button
            className="header__mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
