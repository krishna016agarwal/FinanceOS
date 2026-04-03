import api from './axios';

export const getRecords = (params) => api.get('/records', { params });
export const getRecord = (id) => api.get(`/records/${id}`);
export const createRecord = (body) => api.post('/records', body);
export const updateRecord = (id, body) => api.patch(`/records/${id}`, body);
export const deleteRecord = (id) => api.delete(`/records/${id}`);