import api from './api';

const reservationService = {
  // nouveau endpoint public (sans token)
  createPublic: (data) => api.post('/public/reservations', data).then((res) => res.data),

  // Legacy / admin-only (si tu gardes encore)
  create: (data) => api.post('/reservations', data).then((res) => res.data),

  getMesReservations: () =>
    api.get('/reservations/mes-reservations').then((res) => res.data),

  annuler: (id) =>
    api.put(`/reservations/${id}/annuler`).then((res) => res.data),

  getAll: (page = 0, size = 10) =>
    api.get('/reservations', { params: { page, size } }).then((res) => res.data),

  valider: (id) =>
    api.put(`/reservations/${id}/valider`).then((res) => res.data),

  rejeter: (id, motif) =>
    api.put(`/reservations/${id}/rejeter`, null, { params: { motif } }).then((res) => res.data),

  createByAdmin: (data) =>
    api.post('/reservations/admin', data).then((res) => res.data),

  annulerAdmin: (id) =>
    api.put(`/reservations/${id}/annuler-admin`).then((res) => res.data),


  update: (id, data) => api.put(`/reservations/${id}`, data).then((res) => res.data),
  archiver: (id) => api.put(`/reservations/${id}/archiver`).then((res) => res.data),
  restaurer: (id) => api.put(`/reservations/${id}/restaurer`).then((res) => res.data),
  restaurerApresAnnulation: (id) => api.put(`/reservations/${id}/restaurer-apres-annulation`).then((res) => res.data),
  supprimer: (id) => api.delete(`/reservations/${id}`).then((res) => res.data), // Garde pour compat

};

export default reservationService;