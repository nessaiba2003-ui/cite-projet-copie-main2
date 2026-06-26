import api from './api';

const evenementService = {
  getPage: (page = 0, size = 10) =>
    api.get('/evenements', { params: { page, size } }).then((res) => res.data),

  getById: (id) => api.get(`/evenements/${id}`).then((res) => res.data),

  inscrire: (id, data) =>
    api.post(`/evenements/${id}/inscrire`, data).then((res) => res.data),

  inscriptionPublique: (data) =>
    api.post('/public/inscription-evenement', data).then((res) => res.data),

  getAllAdmin: (page = 0, size = 50) =>
    api.get('/evenements/all', { params: { page, size } }).then((res) => res.data),

  create: (data) => api.post('/evenements', data).then((res) => res.data),

  update: (id, data) =>
    api.put(`/evenements/${id}`, data).then((res) => res.data),

  publier: (id) =>
    api.put(`/evenements/${id}/publier`).then((res) => res.data),

  archiver: (id) =>
    api.put(`/evenements/${id}/archiver`).then((res) => res.data),

  // ✅ AJOUTE celui-ci
  restaurer: (id) => api.put(`/evenements/${id}/restaurer`).then((res) => res.data),

  // ✅ Garde celui-ci (mais ça archive en réalité)
  supprimer: (id) =>
    api.delete(`/evenements/${id}`).then((res) => res.data),

  getInscrits: (id) =>
    api.get(`/evenements/${id}/inscrits`).then((res) => res.data),
};

export default evenementService;