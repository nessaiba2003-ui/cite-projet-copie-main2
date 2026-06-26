import { API_URL } from '@/utils/constants';

// API_URL est souvent du style: http://localhost:8080/api
const API_ORIGIN = API_URL?.replace(/\/api\/?$/, '') || '';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;

  if (url.startsWith('panoramas/')) return `${API_ORIGIN}/uploads/${url}`;
  if (url.startsWith('/panoramas/')) return `${API_ORIGIN}/uploads${url}`;

  // assure un slash
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
}
