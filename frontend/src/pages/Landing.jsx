import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchCategories, fetchHeroImage } from '../utils/api';
import './Landing.css';

const Landing = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroImage, setHeroImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsData, categoriesData, heroImageData] = await Promise.all([
          fetchProducts(8, 0),
          fetchCategories(),
          fetchHeroImage()
        ]);

        setFeaturedProducts(productsData.products || []);
        setCategories((categoriesData || []).slice(0, 6));
        if (heroImageData) {
          setHeroImage(heroImageData);
        }
      } catch (err) {
        console.error('Failed to load landing page data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="landing">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="landing">
      {/* Hero Section */}
      <section
        className="hero"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : {}}
      >
        <div className="hero__overlay"></div>
        <div className="hero__content container">
          <h1 className="hero__title">Curated Excellence</h1>
          <p className="hero__subtitle">
            Discover premium products across technology, lifestyle, and more.
            Quality you deserve, prices you'll love.
          </p>
          <Link to="/products" className="btn btn-primary hero__cta">
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="section categories">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Shop by Category</h2>
            <Link to="/products" className="section__link">
              View All <span>→</span>
            </Link>
          </div>
          <div className="categories__grid">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="category-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="category-card__name">{category.name}</span>
                <span className="category-card__arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section featured">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Featured Products</h2>
            <Link to="/products" className="section__link">
              View All <span>→</span>
            </Link>
          </div>
          <div className="featured__grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="section value-prop">
        <div className="container">
          <div className="value-prop__grid">
            <div className="value-prop__item">
              <div className="value-prop__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h4 className="value-prop__title">Free Shipping</h4>
              <p className="value-prop__desc">On orders over $100</p>
            </div>
            <div className="value-prop__item">
              <div className="value-prop__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              </div>
              <h4 className="value-prop__title">Easy Returns</h4>
              <p className="value-prop__desc">30-day return policy</p>
            </div>
            <div className="value-prop__item">
              <div className="value-prop__icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4 className="value-prop__title">Secure Payment</h4>
              <p className="value-prop__desc">100% secure checkout</p>
            </div>
            <div className="value-prop__item">
              <div className="value-prop__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <h4 className="value-prop__title">24/7 Support</h4>
              <p className="value-prop__desc">Dedicated assistance</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
