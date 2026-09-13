export const getCsrfTokenFromCookie = () => {
  const match = document.cookie.match(new RegExp('(^| )_csrf=([^;]+)'));
  return match ? match[2] : null;
};

export const fetchCsrfToken = async () => {
  try {
    const res = await fetch('/api/v1/auth/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    return data.csrfToken;
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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || (data.errors && data.errors.join(', ')) || 'Registration failed');
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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

export const refreshSession = async () => {
  const res = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Session refresh failed');
  }

  return data;
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

  const data = await res.json();
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
        return (await retryRes.json()).user;
      }
    } catch {
      return null;
    }
  }

  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
};
