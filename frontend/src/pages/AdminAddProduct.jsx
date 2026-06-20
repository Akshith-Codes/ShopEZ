import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, fetchCategories, fetchPexelsImage } from '../utils/api';
import { getFromStorage, setToStorage } from '../utils/storage';
import './AdminAddProduct.css';

const AdminAddProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    discountPercentage: '',
    stock: '',
    brand: '',
    sku: ''
  });

  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);

        if (isEditing) {
          // Check custom products first
          const customProducts = getFromStorage('shopez_custom_products', []);
          const customProduct = customProducts.find(p => p.id === id);

          if (customProduct) {
            setFormData({
              title: customProduct.title || '',
              description: customProduct.description || '',
              category: customProduct.category || '',
              price: customProduct.price?.toString() || '',
              discountPercentage: customProduct.discountPercentage?.toString() || '',
              stock: customProduct.stock?.toString() || '',
              brand: customProduct.brand || '',
              sku: customProduct.sku || ''
            });
            setImage(customProduct.thumbnail);
          } else {
            // Try fetching from API
            const product = await fetchProductById(id);
            setFormData({
              title: product.title || '',
              description: product.description || '',
              category: product.category || '',
              price: product.price?.toString() || '',
              discountPercentage: product.discountPercentage?.toString() || '',
              stock: product.stock?.toString() || '',
              brand: product.brand || '',
              sku: product.sku || ''
            });
            setImage(product.thumbnail);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      // Get image from Pexels based on category
      let productImage = image;
      if (!productImage) {
        productImage = await fetchPexelsImage(formData.category);
      }

      const productData = {
        id: isEditing ? id : `custom-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        stock: parseInt(formData.stock),
        brand: formData.brand,
        sku: formData.sku || `SKU-${Date.now()}`,
        thumbnail: productImage,
        images: [productImage],
        rating: 4.5,
        tags: [formData.category],
        isCustom: true
      };

      // Save to localStorage
      const customProducts = getFromStorage('shopez_custom_products', []);

      if (isEditing) {
        // Update existing product
        const index = customProducts.findIndex(p => p.id === id);
        if (index !== -1) {
          customProducts[index] = productData;
        } else {
          customProducts.unshift(productData);
        }
      } else {
        // Add new product
        customProducts.unshift(productData);
      }

      setToStorage('shopez_custom_products', customProducts);
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to save product:', err);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-add-product">
      <div className="admin-add-product__container">
        <h2 className="admin-add-product__title">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h2>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form className="admin-add-product__form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                name="title"
                className={`form-input ${errors.title ? 'form-input--error' : ''}`}
                value={formData.title}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-input admin-textarea"
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
              rows={4}
            />
          </div>

          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className={`form-input ${errors.category ? 'form-input--error' : ''}`}
                value={formData.category}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                name="brand"
                className="form-input"
                value={formData.brand}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-row form-row--3">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                className={`form-input ${errors.price ? 'form-input--error' : ''}`}
                value={formData.price}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.price && <span className="form-error">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Discount (%)</label>
              <input
                type="number"
                name="discountPercentage"
                step="0.1"
                min="0"
                max="100"
                className="form-input"
                value={formData.discountPercentage}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                name="stock"
                min="0"
                className={`form-input ${errors.stock ? 'form-input--error' : ''}`}
                value={formData.stock}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.stock && <span className="form-error">{errors.stock}</span>}
            </div>
          </div>

          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input
                type="text"
                name="sku"
                className="form-input"
                value={formData.sku}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>

          {/* Image Preview */}
          {image && (
            <div className="admin-image-preview">
              <label className="form-label">Product Image</label>
              <img src={image} alt="Product preview" className="admin-preview-image" />
              <p className="admin-image-note">
                Image fetched from Pexels based on category. Actual image may vary in production.
              </p>
            </div>
          )}

          <div className="admin-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/products')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;
