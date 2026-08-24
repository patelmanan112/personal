import api from './api';

export const fundsService = {
  getSummary: async () => {
    const response = await api.get('/api/funds/summary');
    return response.data;
  },

  getContributions: async (params = {}) => {
    const response = await api.get('/api/funds/contributions', { params });
    return response.data;
  },

  getExpenses: async (params = {}) => {
    const response = await api.get('/api/funds/expenses', { params });
    return response.data;
  },

  // Admin methods
  addContribution: async (formData) => {
    const response = await api.post('/api/funds/contributions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteContribution: async (id) => {
    const response = await api.delete(`/api/funds/contributions/${id}`);
    return response.data;
  },

  addExpense: async (formData) => {
    const response = await api.post('/api/funds/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/api/funds/expenses/${id}`);
    return response.data;
  }
};
