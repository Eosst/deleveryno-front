// src/utils/apiOptimizer.js

/**
 * Simple in-memory cache for API requests
 */
const cache = new Map();

/**
 * Cache configuration
 */
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a cache key for the request
 * @param {string} url - The request URL
 * @param {Object} params - The request parameters (optional)
 * @returns {string} - The cache key
 */
const createCacheKey = (url, params) => {
  if (!params) return url;
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  return `${url}:${JSON.stringify(sortedParams)}`;
};

/**
 * Checks if a cached item is still valid
 * @param {Object} item - The cached item
 * @returns {boolean} - Whether the item is still valid
 */
const isValidCacheItem = (item) => {
  const now = Date.now();
  return item && item.expiresAt > now;
};

/**
 * Gets a cached item
 * @param {string} key - The cache key
 * @returns {Object|null} - The cached data, or null if not found or expired
 */
const getCachedItem = (key) => {
  const item = cache.get(key);
  if (isValidCacheItem(item)) {
    return item.data;
  }
  // Clean up expired items
  cache.delete(key);
  return null;
};

/**
 * Sets a cached item
 * @param {string} key - The cache key
 * @param {*} data - The data to cache
 * @param {number} ttl - The time to live in milliseconds (optional)
 */
const setCachedItem = (key, data, ttl = DEFAULT_CACHE_TIME) => {
  const expiresAt = Date.now() + ttl;
  cache.set(key, { data, expiresAt });
};

/**
 * Clears the cache for a specific key or clears the entire cache if no key is provided
 * @param {string} key - The cache key (optional)
 */
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * Makes an API request with caching
 * @param {function} apiFunc - The API function to call
 * @param {Object} params - The parameters to pass to the API function
 * @param {Object} options - Caching options
 * @returns {Promise<*>} - The API response
 */
export const cachedApiRequest = async (apiFunc, params = {}, options = {}) => {
  const { 
    ttl = DEFAULT_CACHE_TIME, 
    bypassCache = false,
    cacheKey = null
  } = options;
  
  // Create a unique key for this request
  const key = cacheKey || createCacheKey(apiFunc.name, params);
  
  // Check cache unless bypassing
  if (!bypassCache) {
    const cachedData = getCachedItem(key);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // Make the API call
  const data = await apiFunc(params);
  
  // Cache the result
  setCachedItem(key, data, ttl);
  
  return data;
};

/**
 * Throttles API requests
 * @param {function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {function} - The throttled function
 */
export const throttleApiRequest = (func, limit = 1000) => {
  let inThrottle = false;
  
  return function(...args) {
    if (!inThrottle) {
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      return func.apply(this, args);
    }
  };
};

/**
 * Debounces API requests
 * @param {function} func - The function to debounce
 * @param {number} wait - The wait time in milliseconds
 * @returns {function} - The debounced function
 */
export const debounceApiRequest = (func, wait = 500) => {
  let timeout;
  
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

export default {
  cachedApiRequest,
  throttleApiRequest,
  debounceApiRequest,
  clearCache
};