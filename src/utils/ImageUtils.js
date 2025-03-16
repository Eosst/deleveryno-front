// src/utils/imageUtils.js

/**
 * Utility for handling image optimization
 */

// Get responsive image size based on screen width
export const getResponsiveImageSize = (defaultSize) => {
    const width = window.innerWidth;
    
    // Small screens (mobile)
    if (width < 600) {
      return Math.round(defaultSize * 0.7);
    }
    
    // Medium screens (tablets)
    if (width < 960) {
      return Math.round(defaultSize * 0.85);
    }
    
    // Default for larger screens
    return defaultSize;
  };
  
  // Create a function to lazy load images
  export const lazyLoadImage = (src, alt, className, width, height) => {
    const img = new Image();
    img.src = src;
    img.alt = alt || '';
    img.className = className || '';
    
    if (width) img.width = getResponsiveImageSize(width);
    if (height) img.height = getResponsiveImageSize(height);
    
    return img;
  };
  
  // Create srcset for responsive images
  export const createSrcSet = (imagePath) => {
    // Remove extension from path
    const extension = imagePath.split('.').pop();
    const basePath = imagePath.replace(`.${extension}`, '');
    
    return `
      ${basePath}-small.${extension} 500w,
      ${basePath}-medium.${extension} 800w,
      ${basePath}.${extension} 1200w
    `;
  };