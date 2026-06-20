import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../utils/api';
import { getFromStorage, setToStorage } from '../utils/storage';
import './AdminProducts.css';

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load custom products from localStorage
        const customProducts = getFromStorage('shopez_custom_products', []);
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(100, 0),
          fetchCategories()
        ]);

        // Merge with custom products
        const allProducts = [...customProducts, ...(productsData.products || [])];
        setProducts(allProducts);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = (productId) => {
    // If it's a custom product, remove from localStorage
    const customProducts = getFromStorage('shopez_custom_products', []);
    const updatedCustom = customProducts.filter(p => p.id !== productId);
    setToStorage('shopez_custom_products', updatedCustom);

    // Remove from current view
    setProducts(prev => prev.filter(p => p.id !== productId));
    setDeleteConfirm(null);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      {/* Header */}
      <div className="admin-products__header">
        <div className="admin-products__filters">
          <input
            type="text"
            placeholder="Search products..."
            className="form-input admin-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="form-input admin-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <Link to="/admin/add-product" className="btn btn-primary">
          + Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="admin-section">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="admin-table__product">
                    <img
                      src={product.thumbnail || product.images?.[0] || '/placeholder.png'}
                      alt={product.title}
                      className="admin-table__thumb"
                      onError={(e) => {
                        e.target.style.backgroundColor = '#E0E0E0';
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"/>';
                      }}
                    />
                    <div className="admin-table__product-info">
                      <span className="admin-table__product-title">{product.title}</span>
                      <span className="admin-table__product-id">ID: {product.id}</span>
                    </div>
                  </td>
                  <td className="admin-table__category">{product.category}</td>
                  <td className="admin-table__price">
                    ${product.price.toFixed(2)}
                    {product.discountPercentage > 0 && (
                      <span className="admin-table__discount">
                        -{Math.round(product.discountPercentage)}%
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-table__stock ${product.stock < 10 ? 'admin-table__stock--low' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="admin-rating">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="var(--color-gold)" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span>{product.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="admin-table__actions">
                    <button
                      className="btn btn-secondary btn--sm"
                      onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                    >
                      Edit
                    </button>
                    {deleteConfirm === product.id ? (
                      <div className="delete-confirm">
                        <button
                          className="btn btn-primary btn--sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-secondary btn--sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary btn--sm btn--danger"
                        onClick={() => setDeleteConfirm(product.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="admin-empty">
            <p>No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
