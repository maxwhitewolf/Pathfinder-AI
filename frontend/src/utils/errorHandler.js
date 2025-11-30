// Utility function to extract error message from FastAPI error response
export const extractErrorMessage = (error) => {
  if (!error) return 'An error occurred';
  
  // If error is a string, return it
  if (typeof error === 'string') return error;
  
  // If error is an object with a detail property
  if (error.detail) {
    // If detail is an array (FastAPI validation errors)
    if (Array.isArray(error.detail)) {
      // Extract messages from validation errors
      return error.detail
        .map(err => {
          const field = err.loc ? err.loc.slice(1).join('.') : 'field';
          return `${field}: ${err.msg}`;
        })
        .join(', ');
    }
    // If detail is a string
    if (typeof error.detail === 'string') {
      return error.detail;
    }
  }
  
  // If error has a message property
  if (error.message) return error.message;
  
  // Default fallback
  return 'An error occurred';
};

// Helper to extract error from axios error response
export const getErrorFromResponse = (error, defaultMessage = 'An error occurred') => {
  if (error?.response?.data) {
    return extractErrorMessage(error.response.data);
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

