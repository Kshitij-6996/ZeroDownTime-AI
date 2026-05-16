import api from './api';

export const machineService = {
  getAll: () => api.get('/machines'),
  getById: (id) => api.get(`/machines/${id}`),
  getHistory: (id, limit = 50) => api.get(`/machines/${id}/history?limit=${limit}`),
  getOverview: () => api.get('/machines/overview'),
};

export const predictionService = {
  getAll: () => api.get('/predictions'),
  getByMachine: (machineId) => api.get(`/predictions/${machineId}`),
  analyze: (machineId) => api.post('/predictions/analyze', { machineId }),
  getModelInfo: () => api.get('/predictions/model-info'),
};

export const alertService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/alerts?${params}`);
  },
  getStats: () => api.get('/alerts/stats'),
  acknowledge: (id) => api.post(`/alerts/${id}/acknowledge`),
};

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getTrends: () => api.get('/analytics/trends'),
  getMachine: (machineId) => api.get(`/analytics/machine/${machineId}`),
};

export const automationService = {
  getWorkflows: () => api.get('/automation/workflows'),
  getLogs: (limit = 50) => api.get(`/automation/logs?limit=${limit}`),
  getRules: () => api.get('/automation/rules'),
  getStatus: () => api.get('/automation/status'),
};

export const simulationService = {
  getStatus: () => api.get('/simulation/status'),
  injectAnomaly: (machineId) => api.post('/simulation/inject-anomaly', { machineId }),
  reset: () => api.post('/simulation/reset'),
  resetMachine: (machineId) => api.post('/simulation/reset-machine', { machineId }),
};
