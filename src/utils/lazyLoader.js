// src/utils/lazyLoader.js
import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Loading component to show while lazily loading components
const LoadingComponent = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
);

// Helper function to lazy load components with Suspense
export const lazyLoad = (importFunc, loadingProps = {}) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={<LoadingComponent {...loadingProps} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default lazyLoad;