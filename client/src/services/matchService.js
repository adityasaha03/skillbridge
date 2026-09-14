import { apiRequest } from './apiClient';

export const fetchReciprocalMatches = async () => {
  const data = await apiRequest('/api/v1/matches/suggestions');
  return data.matches || [];
};

export const sendMatchRequest = async (peerId) => {
  const data = await apiRequest('/api/v1/matches/request', {
    method: 'POST',
    body: JSON.stringify({ peerId }),
  });
  return data.match;
};

export const acceptMatchRequest = async (matchId) => {
  const data = await apiRequest(`/api/v1/matches/${matchId}/accept`, {
    method: 'PATCH',
  });
  return data.match;
};

export const declineMatchRequest = async (matchId) => {
  const data = await apiRequest(`/api/v1/matches/${matchId}/decline`, {
    method: 'PATCH',
  });
  return data.match;
};

export const fetchMatchHistory = async () => {
  const data = await apiRequest('/api/v1/matches/history');
  return data;
};
