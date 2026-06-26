import api from './api';

const poleService = {
  getAll: () => api.get('/poles').then((res) => res.data),
};

export default poleService;
