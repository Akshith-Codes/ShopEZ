import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchProductsByCategory, searchProducts, fetchCategories } from '../utils/api';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const productsPerPage = 12;

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let data;
        if (searchQuery) {
          data = await searchProducts(searchQuery);
        } else if (selectedCategory) {
          data = await fetchProductsByCategory(selectedCategory);
        } else {
          data = await fetchProducts(100, 0);
        }

        setProducts(data.products || []);
        setTotalCount((data.products || []).length);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, searchQuery]);

  // Update search params when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    result = result.filter(product => {
      const discountedPrice = product.price * (1 - product.discountPercentage / 100);
      return discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1];
    });

    // Sort
    if (sortOrder !== 'default') {
      result.sort((a, b) => {
        const priceA = a.price * (1 - a.discountPercentage / 100);
        const priceB = b.price * (1 - b.discountPercentage / 100);

        switch (sortOrder) {
          case 'price-low':
            return priceA - priceB;
          case 'price-high':
            return priceB - priceA;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [products, priceRange, sortOrder]);

  // Pagination
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="products-page__header">
          <div>
            <h1 className="products-page__title">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : selectedCategory
                  ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                  : 'All Products'}
            </h1>
            <p className="products-page__count">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          <button
            className="products-page__filter-toggle btn btn-secondary"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            Filters
          </button>
        </div>

        <div className="products-page__layout">
          {/* Sidebar Filters */}
          <aside className={`products-page__sidebar ${mobileFiltersOpen ? 'products-page__sidebar--open' : ''}`}>
            <div className="filters">
              {/* Category Filter */}
              <div className="filter-group">
                <h3 className="filter-group__title">Category</h3>
                <div className="filter-group__options">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={!selectedCategory}
                      onChange={() => handleCategoryChange('')}
                    />
                    <span className="filter-option__label">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.slug} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.slug}
                        onChange={() => handleCategoryChange(category.slug)}
                      />
                      <span className="filter-option__label">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="filter-group">
                <h3 className="filter-group__title">Price Range</h3>
                <div className="price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      min="0"
                      max={priceRange[1]}
                      className="form-input price-input"
                    />
                    <span>—</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                      min={priceRange[0]}
                      className="form-input price-input"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="filter-group">
                <h3 className="filter-group__title">Sort By</h3>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="form-input"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Best Rating</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                className="btn btn-secondary filters__clear"
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange([0, 5000]);
                  setSortOrder('default');
                  setSearchParams({});
                }}
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="products-page__content">
            {paginatedProducts.length === 0 ? (
              <div className="products-page__empty">
                <p>No products match your filters.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCategory('');
                    setPriceRange([0, 5000]);
                    setSearchParams({});
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination__btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Previous
                    </button>

                    <div className="pagination__pages">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      className="pagination__btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
