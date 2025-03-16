// src/hooks/useNetworkStatus.js
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook to detect and monitor network status
 * @returns {Object} An object containing the network status
 */
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState(null);
  const [effectiveConnectionType, setEffectiveConnectionType] = useState(null);
  
  // Use refs to store event handlers to prevent recreating them on each render
  const handleOnlineStatusChangeRef = useRef();
  const handleConnectionChangeRef = useRef();

  useEffect(() => {
    // Handler for online status changes - defined only once
    handleOnlineStatusChangeRef.current = () => {
      setIsOnline(navigator.onLine);
    };

    // Add event listeners for online/offline events
    window.addEventListener('online', handleOnlineStatusChangeRef.current);
    window.addEventListener('offline', handleOnlineStatusChangeRef.current);

    // Only check for Network Information API if it exists
    const connection = navigator?.connection;
    if (connection) {
      // Set initial connection information (only once)
      setConnectionType(connection.type);
      setEffectiveConnectionType(connection.effectiveType);
      
      // Handler for connection changes - defined only once
      handleConnectionChangeRef.current = () => {
        setConnectionType(connection.type);
        setEffectiveConnectionType(connection.effectiveType);
      };
      
      // Add event listener for connection changes
      connection.addEventListener('change', handleConnectionChangeRef.current);
    }
    
    // Cleanup listener
    return () => {
      window.removeEventListener('online', handleOnlineStatusChangeRef.current);
      window.removeEventListener('offline', handleOnlineStatusChangeRef.current);
      
      if (navigator?.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChangeRef.current);
      }
    };
  }, []); // Empty dependency array - run only once

  return {
    isOnline,
    connectionType,
    effectiveConnectionType,
    isFastConnection: effectiveConnectionType === '4g' || 
                      !effectiveConnectionType // If we can't detect, assume it's fast
  };
};

export default useNetworkStatus;