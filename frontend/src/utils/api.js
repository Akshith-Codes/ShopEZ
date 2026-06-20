// API utilities for DummyJSON and Pexels

const DUMMYJSON_BASE = 'https://dummyjson.com/products';
const PEXELS_BASE = 'https://api.pexels.com/v1/search';

// Fetch all products
export const fetchProducts = async (limit = 30, skip = 0) => {
  const response = await fetch(`${DUMMYJSON_BASE}?limit=${limit}&skip=${skip}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

// Fetch single product by ID
export const fetchProductById = async (id) => {
  const response = await fetch(`${DUMMYJSON_BASE}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
};

// Search products
export const searchProducts = async (query) => {
  const response = await fetch(`${DUMMYJSON_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  return response.json();
};

// Fetch products by category
export const fetchProductsByCategory = async (category) => {
  const response = await fetch(`${DUMMYJSON_BASE}/category/${category}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products by category');
  }
  return response.json();
};

// Fetch all categories
export const fetchCategories = async () => {
  const response = await fetch(`${DUMMYJSON_BASE}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

// Pexels image search - requires API key from environment
export const fetchPexelsImage = async (query, perPage = 1) => {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
  if (!apiKey) {
    console.error('VITE_PEXELS_API_KEY is not set');
    return null;
  }

  try {
    const response = await fetch(
      `${PEXELS_BASE}?query=${encodeURIComponent(query)}&per_page=${perPage}&page=1`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Pexels');
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      // Prefer medium size for product cards, large for hero
      return data.photos[0].src.medium || data.photos[0].src.large;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Pexels image:', error);
    return null;
  }
};

// Fetch multiple Pexels images
export const fetchPexelsImages = async (query, count = 10) => {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
  if (!apiKey) {
    console.error('VITE_PEXELS_API_KEY is not set');
    return [];
  }

  try {
    const response = await fetch(
      `${PEXELS_BASE}?query=${encodeURIComponent(query)}&per_page=${count}&page=1`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Pexels');
    }

    const data = await response.json();
    return data.photos?.map(photo => ({
      id: photo.id,
      src: photo.src.medium,
      large: photo.src.large,
      alt: photo.alt
    })) || [];
  } catch (error) {
    console.error('Error fetching Pexels images:', error);
    return [];
  }
};

// Fetch hero banner image
export const fetchHeroImage = async () => {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
  if (!apiKey) {
    console.error('VITE_PEXELS_API_KEY is not set');
    return null;
  }

  try {
    const response = await fetch(
      `${PEXELS_BASE}?query=luxury%20shopping&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hero image');
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large2x || data.photos[0].src.large;
    }
    return null;
  } catch (error) {
    console.error('Error fetching hero image:', error);
    return null;
  }
};
