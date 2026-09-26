import { fetchCsrfToken, refreshSession } from './authService';
import { resolveApiUrl, getCsrfTokenFromCookie, setCachedCsrfToken } from './apiConfig';

export const apiRequest = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    let csrfToken = getCsrfTokenFromCookie();
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken();
      if (csrfToken) setCachedCsrfToken(csrfToken);
    }
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  const config = {
    ...options,
    method,
    headers,
    credentials: 'include',
  };

  const url = resolveApiUrl(endpoint);
  let res = await fetch(url, config);

  // If unauthorized, attempt to refresh session and retry once
  if (res.status === 401 && endpoint !== '/api/v1/auth/refresh' && endpoint !== '/api/v1/auth/login') {
    try {
      await refreshSession();
      // Update CSRF token for retry if applicable
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        let newCsrf = getCsrfTokenFromCookie();
        if (!newCsrf) {
          newCsrf = await fetchCsrfToken();
          if (newCsrf) setCachedCsrfToken(newCsrf);
        }
        if (newCsrf) headers['x-csrf-token'] = newCsrf;
      }
      res = await fetch(url, { ...config, headers });
    } catch {
      // Refresh failed, return original 401
    }
  }

  if (res.status === 401 && endpoint !== '/api/v1/auth/login') {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.message ||
      (Array.isArray(data.errors) ? data.errors.join(', ') : null) ||
      `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};
