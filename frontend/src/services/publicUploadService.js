import api from './api';

const publicUploadService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/public/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return res.data; // { url, filename }
  },
};

export default publicUploadService;