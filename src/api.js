import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }).then((r) => r.data),
  register: (data) => api.post('/auth/register/', data).then((r) => r.data),
  me: () => api.get('/auth/me/').then((r) => r.data),
};

export const documents = {
  list: (search = '') => api.get('/documents/', { params: { search } }).then((r) => r.data),
  get: (id) => api.get(`/documents/${id}/`).then((r) => r.data),
  create: (formData) => api.post('/documents/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  delete: (id) => api.delete(`/documents/${id}/`),
  editorConfig: (id) => api.get(`/documents/${id}/editor_config/`).then((r) => r.data),
  viewConfig: (id) => api.get(`/documents/${id}/view_config/`).then((r) => r.data),
  download: async (id) => {
    const r = await api.get(`/documents/${id}/download/`, { responseType: 'blob' });
    return r.data;
  },
  export: async (id) => {
    const r = await api.get(`/documents/${id}/export/`, { responseType: 'blob' });
    return r.data;
  },
};
