import api from './api';

const statsService = {
  getDashboard: (debut, fin) =>
    api.get('/stats/dashboard', { params: { debut, fin } }).then((res) => res.data),

  getLocalTimeSeries: (debut, fin, granularity) =>
    api
      .get('/stats/locals/timeseries', { params: { debut, fin, granularity } })
      .then((res) => res.data),

  getOrganismeTimeSeries: (debut, fin, granularity) =>
    api
      .get('/stats/organismes/timeseries', { params: { debut, fin, granularity } })
      .then((res) => res.data),

  getReservationsReport: (debut, fin) =>
    api
      .get('/stats/reservations/report', { params: { debut, fin } })
      .then((res) => res.data),

  exportExcel: (debut, fin, granularity) =>
    api.get('/stats/export/excel', {
      params: { debut, fin, granularity },
      responseType: 'blob',
    }),

  exportPdf: (debut, fin, granularity) =>
    api.get('/stats/export/pdf', {
      params: { debut, fin, granularity },
      responseType: 'blob',
    }),
};

export default statsService;