import api from './api';

const localService = {
  getDisponibles: () =>
    api.get('/locaux/disponibles').then((res) => res.data),

  getAll: () => api.get('/locaux').then((res) => res.data),

  search: (params) => api.get('/locaux/search', { params }).then((res) => res.data),

  getById: (id) => api.get(`/locaux/${id}`).then((res) => res.data),

  checkDisponibilite: (id, debut, fin) =>
    api
      .get(`/locaux/${id}/disponibilite`, { params: { debut, fin } })
      .then((res) => res.data),

  getCalendrier: (id, debut, fin) =>
    api
      .get(`/locaux/${id}/calendrier`, { params: { debut, fin } })
      .then((res) => res.data),

  create: (data) => api.post('/locaux', data).then((res) => res.data),

  update: (id, data) => api.put(`/locaux/${id}`, data).then((res) => res.data),

  delete: (id) => api.delete(`/locaux/${id}`),
};

export default localService;
