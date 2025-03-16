// src/hooks/usePerformanceOptimization.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for throttling expensive operations
 * @param {Function} callback - The function to throttle
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The throttled function
 */
export const useThrottle = (callback, delay = 200) => {
  const lastCall = useRef(0);
  const timeout = useRef(null);
  
  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall.current;
    
    if (timeSinceLastCall >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  }, [callback, delay]);
};

/**
 * Custom hook for debouncing rapid events
 * @param {Function} callback - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const useDebounce = (callback, delay = 300) => {
  const timeout = useRef(null);
  
  return useCallback((...args) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Custom hook for debouncing a value (not a function)
 * @param {*} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {*} - The debounced value
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * Custom hook for pagination with optimizations for mobile
 * @param {Array} items - The array of items to paginate
 * @param {number} initialPage - The initial page number (0-based)
 * @param {number} initialItemsPerPage - The initial number of items per page
 * @returns {Object} - Pagination state and handlers
 */
export const usePagination = (items = [], initialPage = 0, initialItemsPerPage = 10) => {
  const [page, setPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  
  // Detect if we're on a mobile device and adjust items per page accordingly
  useEffect(() => {
    const isMobile = window.innerWidth < 600;
    if (isMobile && itemsPerPage > 5) {
      setItemsPerPage(5);
    }
  }, []);
  
  // Calculate total number of pages
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  // Reset page if items change or if current page is out of bounds
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [items, itemsPerPage, page, totalPages]);
  
  // Get current page items
  const paginatedItems = items.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );
  
  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    // On mobile, scroll to top when changing pages
    if (window.innerWidth < 600) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);
  
  // Handle items per page change
  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setPage(0); // Reset to first page when changing items per page
  }, []);
  
  return {
    page,
    setPage: handlePageChange,
    itemsPerPage,
    setItemsPerPage: handleItemsPerPageChange,
    totalPages,
    paginatedItems,
    totalItems: items.length,
  };
};

/**
 * Custom hook for lazy loading images in a list
 * @param {Array} items - The array of items containing image URLs
 * @param {string} imageKey - The key in each item that contains the image URL
 * @param {number} threshold - The intersection observer threshold
 * @returns {Function} - A function to determine if an item's image should be loaded
 */
export const useLazyImages = (items = [], imageKey = 'image', threshold = 0.1) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const observerRef = useRef(null);
  const elementsRef = useRef(new Map());
  
  // Set up the intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.dataset.id;
        if (entry.isIntersecting) {
          setVisibleItems((prev) => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
          });
        }
      });
    }, { threshold });
    
    // Clean up observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold]);
  
  // Returns a ref callback for each item
  const getRefForItem = useCallback((id) => (element) => {
    if (element && !elementsRef.current.has(id)) {
      elementsRef.current.set(id, element);
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    } else if (!element && elementsRef.current.has(id)) {
      if (observerRef.current) {
        observerRef.current.unobserve(elementsRef.current.get(id));
      }
      elementsRef.current.delete(id);
    }
  }, []);
  
  // Function to check if an item's image should be loaded
  const shouldLoadImage = useCallback((id) => {
    return visibleItems.has(id.toString());
  }, [visibleItems]);
  
  return { getRefForItem, shouldLoadImage };
};

export default {
  useThrottle,
  useDebounce,
  useDebouncedValue,
  usePagination,
  useLazyImages
};