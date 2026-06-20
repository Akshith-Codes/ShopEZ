import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchPexelsImage } from '../utils/api';
import './ProductCard.css';

const ProductCard = ({ product, showAddToCart = true }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [image, setImage] = useState(product.thumbnail);
  const [imageLoading, setImageLoading] = useState(true);
  const inWishlist = isInWishlist(product.id);

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);
  const hasDiscount = product.discountPercentage > 0;
  const isLowStock = product.stock < 10 && product.stock > 0;
  const isOutOfStock = product.stock === 0;

  useEffect(() => {
    const loadImage = async () => {
      setImageLoading(true);
      const searchTerm = product.category || product.title.split(' ')[0];
      try {
        const imageUrl = await fetchPexelsImage(searchTerm);
        if (imageUrl) {
          setImage(imageUrl);
        } else {
          // Fallback to DummyJSON thumbnail
          setImage(product.thumbnail);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setImage(product.thumbnail);
      }
      setImageLoading(false);
    };
    loadImage();
  }, [product]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    toggleWishlist(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__image-wrapper">
        {imageLoading ? (
          <div className="product-card__image product-card__image--loading">
            <div className="spinner spinner--small"></div>
          </div>
        ) : (
          <img
            src={image}
            alt={product.title}
            className="product-card__image"
            onError={(e) => {
              e.target.src = product.thumbnail;
            }}
          />
        )}

        {hasDiscount && (
          <span className="product-card__badge product-card__badge--discount">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}

        {isLowStock && (
          <span className="product-card__badge product-card__badge--stock">
            Only {product.stock} left
          </span>
        )}

        {isOutOfStock && (
          <div className="product-card__out-of-stock">
            <span>Out of Stock</span>
          </div>
        )}

        <button
          className={`product-card__wishlist-btn ${inWishlist ? 'product-card__wishlist-btn--active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      <div className="product-card__content">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__title">{product.title}</h3>

        <div className="product-card__price-row">
          <span className="product-card__price">
            ${discountedPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="product-card__original-price">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {showAddToCart && (
          <button
            className={`product-card__cart-btn btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Out of Stock' : 'Shop Now'}
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
