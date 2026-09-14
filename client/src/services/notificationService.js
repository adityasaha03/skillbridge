import { apiRequest } from './apiClient';

export const fetchNotifications = async () => {
  const data = await apiRequest('/api/v1/notifications');
  return {
    notifications: data.notifications || [],
    unreadCount: data.unreadCount || 0,
  };
};

export const markNotificationAsRead = async (id) => {
  const data = await apiRequest(`/api/v1/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return data.notification;
};

export const markAllNotificationsAsRead = async () => {
  const data = await apiRequest('/api/v1/notifications/read-all', {
    method: 'PATCH',
  });
  return data;
};
