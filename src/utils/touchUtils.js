// src/utils/touchUtils.js

/**
 * Utilities for optimizing touch interactions
 */

// Default threshold for swipe (in pixels)
const SWIPE_THRESHOLD = 50;

// Default minimum velocity for swipe (in pixels per millisecond)
const SWIPE_VELOCITY = 0.3;

/**
 * Detect swipe direction
 * @param {Object} touchStartEvent - TouchStart event
 * @param {Object} touchEndEvent - TouchEnd event
 * @param {Object} options - Options for swipe detection
 * @returns {string|null} - Direction of swipe or null if not a swipe
 */
export const detectSwipe = (touchStartEvent, touchEndEvent, options = {}) => {
  const { threshold = SWIPE_THRESHOLD, minVelocity = SWIPE_VELOCITY } = options;
  
  // Get touch coordinates
  const startX = touchStartEvent.touches[0].clientX;
  const startY = touchStartEvent.touches[0].clientY;
  const endX = touchEndEvent.changedTouches[0].clientX;
  const endY = touchEndEvent.changedTouches[0].clientY;
  
  // Get time difference
  const deltaTime = touchEndEvent.timeStamp - touchStartEvent.timeStamp;
  
  // Calculate distance and velocity
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const velocityX = Math.abs(deltaX) / deltaTime;
  const velocityY = Math.abs(deltaY) / deltaTime;
  
  // Check if it's a valid swipe
  if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
    return null;
  }
  
  if (velocityX < minVelocity && velocityY < minVelocity) {
    return null;
  }
  
  // Determine direction
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
};

/**
 * Add swipe event listener to an element
 * @param {HTMLElement} element - Element to add listener to
 * @param {Object} handlers - Event handlers for different swipe directions
 * @param {Object} options - Options for swipe detection
 * @returns {function} - Function to remove the event listeners
 */
export const addSwipeEventListener = (element, handlers, options = {}) => {
  if (!element || !handlers) return () => {};
  
  let touchStartEvent = null;
  
  const touchStartHandler = (event) => {
    touchStartEvent = event;
  };
  
  const touchEndHandler = (event) => {
    if (!touchStartEvent) return;
    
    const direction = detectSwipe(touchStartEvent, event, options);
    
    if (direction && handlers[direction]) {
      handlers[direction](event);
    }
    
    touchStartEvent = null;
  };
  
  // Only add event listeners if element exists
  element.addEventListener('touchstart', touchStartHandler, { passive: true });
  element.addEventListener('touchend', touchEndHandler, { passive: true });
  
  // Return cleanup function
  return () => {
    if (element) {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchend', touchEndHandler);
    }
  };
};

// Flag to ensure we only run this once
let tapDelayRemoved = false;

/**
 * Make sure tap events fire faster on mobile devices
 * This removes the 300ms delay on mobile browsers
 */
export const removeTapDelay = () => {
  // Only run this once
  if (tapDelayRemoved) return;
  
  if ('createTouch' in document) {
    // Add viewport meta tag
    let viewport = document.querySelector('meta[name=viewport]');
    
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    
    // Add touch-action CSS rule
    const style = document.createElement('style');
    style.textContent = '* { touch-action: manipulation; }';
    document.head.appendChild(style);
    
    // Set flag to prevent running multiple times
    tapDelayRemoved = true;
  }
};

export default {
  detectSwipe,
  addSwipeEventListener,
  removeTapDelay
};