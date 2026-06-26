import api from './api';

const userService = {
  getAll: () => api.get('/users').then((res) => res.data),

  setActif: (id, actif) =>
    api
      .patch(`/users/${id}/actif`, null, { params: { actif } })
      .then((res) => res.data),
};

export default userService;
