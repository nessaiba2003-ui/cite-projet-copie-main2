import api from './api';

const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((res) => res.data),

  logout: () => api.post('/auth/logout').catch(() => undefined),

  refresh: (token) =>
    api.post('/auth/refresh', null, { params: { token } }).then((res) => res.data),
};

export default authService;
