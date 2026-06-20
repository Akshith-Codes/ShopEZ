import { useState, useEffect } from 'react';
import { fetchPexelsImage, fetchHeroImage } from '../utils/api';
import './PexelsImage.css';

const PexelsImage = ({
  query,
  alt = 'Product image',
  className = '',
  fallbackText = 'Image',
  variant = 'product', // 'product', 'hero', 'thumbnail'
  onLoad,
  onError
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);

      try {
        let url;
        if (variant === 'hero') {
          url = await fetchHeroImage();
        } else {
          url = await fetchPexelsImage(query);
        }

        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
          onError?.('No image found');
        }
      } catch (err) {
        console.error(`Failed to load Pexels image for "${query}":`, err);
        setError(true);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      loadImage();
    }
  }, [query, variant]);

  if (loading) {
    return (
      <div className={`pexels-image pexels-image--loading pexels-image--${variant} ${className}`}>
        <div className="spinner spinner--small"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`pexels-image pexels-image--placeholder pexels-image--${variant} ${className} image-placeholder`}>
        <span>{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`pexels-image pexels-image--${variant} ${className}`}
      onLoad={() => onLoad?.()}
      onError={() => {
        setError(true);
        onError?.('Failed to load image');
      }}
    />
  );
};

export default PexelsImage;
