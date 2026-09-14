export const getCsrfTokenFromCookie = () => {
  const match = document.cookie.match(new RegExp('(^| )_csrf=([^;]+)'));
  return match ? match[2] : null;
};

const safeJsonParse = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

export const fetchCsrfToken = async () => {
  try {
    const res = await fetch('/api/v1/auth/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await safeJsonParse(res);
    return data.csrfToken || null;
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
    return null;
  }
};

export const registerUser = async ({ fullName, email, studentId, department, password }) => {
  const csrfToken = getCsrfTokenFromCookie() || (await fetchCsrfToken());

  const res = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'x-csrf-token': csrfToken }),
    },
    credentials: 'include',
    body: JSON.stringify({ fullName, email, studentId, department, password }),
  });

  const data = await safeJsonParse(res);
  if (!res.ok) {
    throw new Error(
      data.message ||
      (data.errors && data.errors.join(', ')) ||
      `Server error (${res.status}). Ensure backend and MongoDB are running.`
    );
  }

  return data;
};

export const loginUser = async ({ email, password }) => {
  const csrfToken = getCsrfTokenFromCookie() || (await fetchCsrfToken());

  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'x-csrf-token': csrfToken }),
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await safeJsonParse(res);
  if (!res.ok) {
    throw new Error(
      data.message ||
      `Server error (${res.status}). Ensure backend and MongoDB are running.`
    );
  }

  return data;
};

let refreshPromise = null;

export const refreshSession = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await safeJsonParse(res);
      if (!res.ok) {
        throw new Error(data.message || 'Session refresh failed');
      }

      return data;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const logoutUser = async () => {
  const csrfToken = getCsrfTokenFromCookie() || (await fetchCsrfToken());

  const res = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'x-csrf-token': csrfToken }),
    },
    credentials: 'include',
  });

  const data = await safeJsonParse(res);
  return data;
};

export const getCurrentUser = async () => {
  const res = await fetch('/api/v1/auth/me', {
    method: 'GET',
    credentials: 'include',
  });

  if (res.status === 401) {
    try {
      await refreshSession();
      const retryRes = await fetch('/api/v1/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      if (retryRes.ok) {
        return (await safeJsonParse(retryRes)).user;
      }
    } catch {
      return null;
    }
  }

  if (!res.ok) return null;
  const data = await safeJsonParse(res);
  return data.user;
};
