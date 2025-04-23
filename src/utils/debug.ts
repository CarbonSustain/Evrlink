/**
 * Debug logging utility for Evrlink
 * Provides a consistent way to log debug information
 */

interface LogOptions {
  type?: 'info' | 'warn' | 'error';
  includeTime?: boolean;
}

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Debug logger that only shows logs in development mode
 */
export const debugLog = (
  component: string, 
  message: string, 
  data?: any, 
  options: LogOptions = {}
) => {
  if (!isDev) return;
  
  const { type = 'info', includeTime = true } = options;
  const timestamp = includeTime ? new Date().toISOString() : '';
  const prefix = `[${component}]${timestamp ? ` ${timestamp}` : ''}`;
  
  switch (type) {
    case 'error':
      console.error(prefix, message, data !== undefined ? data : '');
      break;
    case 'warn':
      console.warn(prefix, message, data !== undefined ? data : '');
      break;
    default:
      console.log(prefix, message, data !== undefined ? data : '');
  }
};

/**
 * Helper to log authentication-related events
 */
export const authLog = (message: string, data?: any, type: 'info' | 'warn' | 'error' = 'info') => {
  debugLog('Auth', message, data, { type });
};

/**
 * Helper to log API-related events
 */
export const apiLog = (message: string, data?: any, type: 'info' | 'warn' | 'error' = 'info') => {
  debugLog('API', message, data, { type });
};

/**
 * Inspect the authentication state
 */
export const inspectAuthState = () => {
  const token = localStorage.getItem('token');
  const walletAddress = localStorage.getItem('walletAddress');
  
  authLog('Current authentication state:', {
    hasToken: !!token,
    walletAddress,
    tokenPreview: token ? `${token.substring(0, 15)}...` : null
  });
  
  // If there's a token, try to decode it (JWT)
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        authLog('Decoded token payload:', payload);
        
        // Check token expiration
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          const now = new Date();
          if (expiryDate < now) {
            authLog('Token is expired!', { 
              expiry: expiryDate.toISOString(),
              now: now.toISOString()
            }, 'warn');
          } else {
            authLog('Token is valid until:', expiryDate.toISOString());
          }
        }
      } else {
        authLog('Token is not in JWT format', null, 'warn');
      }
    } catch (error) {
      authLog('Failed to decode token', error, 'error');
    }
  }
  
  return { hasToken: !!token, walletAddress };
};

export default {
  debugLog,
  authLog,
  apiLog,
  inspectAuthState
}; 