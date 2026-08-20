// frontend/src/services/api.js
// Centralized Axios API service

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for HTTP-only cookies (admin auth)
  timeout: 30000,
});

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If admin page, redirect to login
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Public Registration ──────────────────────────────────────────────────────

/**
 * Registers a new member. Sends FormData (with photo file).
 */
export async function registerMember(formData) {
  const response = await api.post('/api/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// ─── Public ID Verification ───────────────────────────────────────────────────

/**
 * Fetches public member info by uniqueId.
 */
export async function verifyMemberId(uniqueId) {
  const response = await api.get(`/api/id/${uniqueId}`);
  return response.data;
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

export async function adminLogin(username, password) {
  const response = await api.post('/api/admin/login', { username, password });
  return response.data;
}

export async function adminLogout() {
  const response = await api.post('/api/admin/logout');
  return response.data;
}

export async function getAdminMe() {
  const response = await api.get('/api/admin/me');
  return response.data;
}

// ─── Admin Data ───────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const response = await api.get('/api/admin/stats');
  return response.data;
}

export async function getRegistrations(params = {}) {
  const response = await api.get('/api/admin/registrations', { params });
  return response.data;
}

export async function getRegistrationByUniqueId(uniqueId) {
  const response = await api.get(`/api/admin/registrations/${uniqueId}`);
  return response.data;
}

export async function deleteRegistration(uniqueId) {
  const response = await api.delete(`/api/admin/registrations/${uniqueId}`);
  return response.data;
}

// ─── Gallery API ──────────────────────────────────────────────────────────────

export async function getGalleryImages(params = {}) {
  const response = await api.get('/api/gallery', { params });
  return response.data;
}

export async function uploadGalleryImage(formData) {
  const response = await api.post('/api/admin/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteGalleryImage(id) {
  const response = await api.delete(`/api/admin/gallery/${id}`);
  return response.data;
}

export default api;
