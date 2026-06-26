import api from './api';

const notificationService = {
  getMyNotifications: () => api.get('/notifications/me').then((res) => res.data),
  getUnreadCount: () => api.get('/notifications/me/unread-count').then((res) => res.data.count),
  markAsRead: (id) => api.put(`/notifications/${id}/lire`).then((res) => res.data),
  markAllAsRead: () => api.put('/notifications/me/lire-tout').then((res) => res.data),
};

export default notificationService;