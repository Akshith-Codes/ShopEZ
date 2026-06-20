import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { fetchProductById, fetchPexelsImage } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../utils/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [image, setImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const inWishlist = product ? isInWishlist(product.id) : false;
  const discountedPrice = product ? product.price * (1 - product.discountPercentage / 100) : 0;
  const isLowStock = product && product.stock < 10 && product.stock > 0;
  const isOutOfStock = product && product.stock === 0;

  // Mock reviews for initial display
  const mockReviews = [
    { id: 1, name: 'Sarah M.', rating: 5, comment: 'Excellent product! Exactly what I was looking for. Great quality and fast shipping.', date: '2024-01-15' },
    { id: 2, name: 'James K.', rating: 4, comment: 'Very good overall. Minor issues with packaging but the product itself is perfect.', date: '2024-01-10' }
  ];

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productData = await fetchProductById(id);
        setProduct(productData);

        // Load Pexels image
        const searchTerm = productData.category || productData.title.split(' ')[0];
        const imageUrl = await fetchPexelsImage(searchTerm);
        if (imageUrl) {
          setImage(imageUrl);
          productData.images = [imageUrl];
        }

        // Set mock reviews
        setReviews(mockReviews);

        // Load related products
        const allProductsData = await fetchProducts(30, 0);
        const related = allProductsData.products
          .filter(p => p.id !== parseInt(id) && p.category === productData.category)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    setQuantity(1);
  }, [id]);

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= (product?.stock || 10)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    alert('Added to cart!');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleWishlist(product);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const review = {
      id: Date.now(),
      name: 'You',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      isUserReview: true
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 5, comment: '' });
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        className={`star ${i < rating ? 'star--filled' : ''}`}
        onClick={interactive ? () => setNewReview(prev => ({ ...prev, rating: i + 1 })) : undefined}
        disabled={!interactive}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={i < rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="error-message">{error || 'Product not found'}</div>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span className="breadcrumb__current">{product.title}</span>
        </nav>

        {/* Product Main Section */}
        <div className="product-detail__main">
          {/* Image Gallery */}
          <div className="product-detail__gallery">
            <div className="product-detail__main-image">
              {product.images && product.images[activeImage] ? (
                <img
                  src={product.images[activeImage]}
                  alt={product.title}
                  onError={(e) => {
                    e.target.src = product.thumbnail;
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  <span>No Image</span>
                </div>
              )}

              {product.discountPercentage > 0 && (
                <span className="product-detail__badge">-{Math.round(product.discountPercentage)}%</span>
              )}

              {isOutOfStock && (
                <div className="product-detail__out-of-stock">
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="product-detail__thumbnails">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    className={`product-detail__thumbnail ${activeImage === index ? 'product-detail__thumbnail--active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`${product.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail__info">
            <span className="product-detail__category">{product.category}</span>
            <h1 className="product-detail__title">{product.title}</h1>

            <div className="product-detail__rating">
              <div className="product-detail__stars">
                {renderStars(Math.round(product.rating || 0))}
              </div>
              <span className="product-detail__rating-text">
                {product.rating?.toFixed(1) || 'N/A'} ({reviews.length} reviews)
              </span>
            </div>

            <div className="product-detail__price-row">
              <span className="product-detail__price">${discountedPrice.toFixed(2)}</span>
              {product.discountPercentage > 0 && (
                <span className="product-detail__original-price">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="product-detail__description">{product.description}</p>

            {/* Quantity Selector */}
            <div className="product-detail__quantity">
              <span className="product-detail__label">Quantity:</span>
              <div className="quantity-stepper">
                <button
                  className="quantity-stepper__btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-stepper__value">{quantity}</span>
                <button
                  className="quantity-stepper__btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              {isLowStock && (
                <span className="product-detail__stock-warning">
                  Only {product.stock} left in stock
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="product-detail__actions">
              <button
                className="btn btn-primary product-detail__buy-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>
              <button
                className="btn btn-secondary product-detail__cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                Add to Cart
              </button>
              <button
                className={`product-detail__wishlist-btn ${inWishlist ? 'product-detail__wishlist-btn--active' : ''}`}
                onClick={handleWishlistClick}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            {/* Product Meta */}
            <div className="product-detail__meta">
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-label">Brand</span>
                <span className="product-detail__meta-value">{product.brand || 'N/A'}</span>
              </div>
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-label">SKU</span>
                <span className="product-detail__meta-value">{product.sku || id}</span>
              </div>
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-label">Stock</span>
                <span className="product-detail__meta-value">{product.stock} units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="product-detail__reviews">
          <h2 className="product-detail__section-title">Customer Reviews</h2>

          {/* Review Form */}
          {isAuthenticated ? (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <h3 className="review-form__title">Write a Review</h3>

              <div className="review-form__field">
                <label className="review-form__label">Rating</label>
                <div className="review-form__stars">{renderStars(newReview.rating, true)}</div>
              </div>

              <div className="review-form__field">
                <label className="review-form__label" htmlFor="review-comment">Your Review</label>
                <textarea
                  id="review-comment"
                  className="form-input review-form__textarea"
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          ) : (
            <div className="review-login-prompt">
              <Link to="/login" className="btn btn-secondary">
                Sign in to write a review
              </Link>
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="reviews-list__empty">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-item__header">
                    <span className="review-item__author">{review.name}</span>
                    <span className="review-item__date">{review.date}</span>
                  </div>
                  <div className="review-item__rating">
                    {renderStars(review.rating)}
                  </div>
                  <p className="review-item__comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="product-detail__related">
            <h2 className="product-detail__section-title">You May Also Like</h2>
            <div className="related-products__grid">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} showAddToCart={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
