import api from './api';

const annonceService = {
  getPage: (page = 0, size = 10) =>
    api
      .get('/annonces', { params: { page, size } })
      .then((res) => res.data),

  getById: (id) => api.get(`/annonces/${id}`).then((res) => res.data),

  getAllAdmin: (page = 0, size = 50) =>
    api.get('/annonces/all', { params: { page, size } }).then((res) => res.data),

  create: (data) => api.post('/annonces', data).then((res) => res.data),

  update: (id, data) =>
    api.put(`/annonces/${id}`, data).then((res) => res.data),
};

export default annonceService;
