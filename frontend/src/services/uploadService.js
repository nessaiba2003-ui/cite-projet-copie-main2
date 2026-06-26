import api from './api';
import { resolveMediaUrl } from '@/utils/media';

const uploadService = {
  uploadLocal: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/local', form).then((res) => resolveMediaUrl(res.data.url));
  },

  uploadLocalVideo: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/local-video', form).then((res) => resolveMediaUrl(res.data.url));
  },

  uploadEvenement: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/evenement', form).then((res) => resolveMediaUrl(res.data.url));
  },

  uploadAnnonce: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/annonce', form).then((res) => resolveMediaUrl(res.data.url));
  },
};

export default uploadService;