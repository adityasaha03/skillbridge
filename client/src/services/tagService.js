import { apiRequest } from './apiClient';

export const fetchTags = async (category = '', search = '') => {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const data = await apiRequest(`/api/v1/tags${queryStr}`);
  return data.tags || [];
};

export const createCustomTag = async (name, category = 'General') => {
  const data = await apiRequest('/api/v1/tags', {
    method: 'POST',
    body: JSON.stringify({ name, category }),
  });
  return data.tag;
};
