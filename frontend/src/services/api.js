/*import axios from 'axios';
import { API_URL, TOKEN_KEY, AUTH_STORAGE_KEY } from '../utils/constants';
import { isPublicApiRequest, isPublicPath } from '../utils/routes';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    if (status === 401 && !url.includes('/auth/login')) {
      const method = error.config?.method ?? 'get';
      const isPublicApi = isPublicApiRequest(url, method);
      const path = window.location.pathname;
      const onPublicPage = isPublicPath(path);

      if (isPublicApi || onPublicPage) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return Promise.reject(error);
      }

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);

      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        const redirect = encodeURIComponent(path + window.location.search);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }

    return Promise.reject(error);
  },
);

export default api;*/

import axios from 'axios';
import { API_URL, TOKEN_KEY, AUTH_STORAGE_KEY } from '../utils/constants';
import { isPublicApiRequest, isPublicPath } from '../utils/routes';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ AJOUTE CECI : Si FormData, on retire le Content-Type pour laisser Axios le définir correctement
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = undefined;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    if (status === 401 && !url.includes('/auth/login')) {
      const method = error.config?.method ?? 'get';
      const isPublicApi = isPublicApiRequest(url, method);
      const path = window.location.pathname;
      const onPublicPage = isPublicPath(path);

      if (isPublicApi || onPublicPage) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return Promise.reject(error);
      }

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);

      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        const redirect = encodeURIComponent(path + window.location.search);
        window.location.href = `/login?redirect=${redirect}`;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
