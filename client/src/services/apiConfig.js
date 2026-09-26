/**
 * SkillBridge - Central API Configuration & Network Resolution
 * 
 * Provides:
 * - Dynamic URL resolution (prepending VITE_API_URL when provided, falling back to relative paths for local proxy)
 * - Cross-origin resilient CSRF token caching (fallback for browsers blocking cross-domain document.cookie access)
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Resolves an API endpoint to an absolute or proxy URL based on environment.
 * @param {string} endpoint - The relative endpoint e.g. '/api/v1/auth/login'
 * @returns {string} The fully-qualified or proxy URL
 */
export const resolveApiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

let inMemoryCsrfToken = null;

/**
 * Stores the CSRF token in memory for cross-origin deployments.
 * @param {string} token 
 */
export const setCachedCsrfToken = (token) => {
  if (token) inMemoryCsrfToken = token;
};

/**
 * Retrieves the cached CSRF token.
 * @returns {string|null}
 */
export const getCachedCsrfToken = () => inMemoryCsrfToken;

/**
 * Reads the CSRF token from document.cookie, or falls back to in-memory cache.
 * @returns {string|null}
 */
export const getCsrfTokenFromCookie = () => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )_csrf=([^;]+)'));
    if (match) return match[2];
  }
  return inMemoryCsrfToken;
};
