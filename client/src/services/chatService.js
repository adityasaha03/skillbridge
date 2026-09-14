import { apiRequest } from './apiClient';

export const fetchConversations = async () => {
  const data = await apiRequest('/api/v1/messages/conversations');
  return data.conversations || [];
};

export const fetchMessages = async (matchId) => {
  const data = await apiRequest(`/api/v1/messages/${matchId}`);
  return data.messages || [];
};

export const sendChatMessage = async (matchId, text) => {
  const data = await apiRequest(`/api/v1/messages/${matchId}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return data.message;
};
