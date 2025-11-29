// src/apiClient.js
const apiBase = process.env.REACT_APP_API_BASE_URL || '';
export function apiUrl(path) {
  if (!path.startsWith('/')) path = '/' + path;
  return `${apiBase}${path}`;
}

export default apiUrl;

