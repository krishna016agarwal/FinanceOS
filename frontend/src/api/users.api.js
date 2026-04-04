import api from './axios';

export const getUsers      = (params) => api.get('/users', { params });
export const getUserById   = (id)     => api.get(`/users/${id}`);
// export const createUser    = (body)   => api.post('/users', body);
export const updateUserRole   = (id, role)   => api.patch(`/users/${id}/role`,   { role });
export const updateUserStatus = (id, status) => api.patch(`/users/${id}/status`, { status });
export const deleteUser    = (id)     => api.delete(`/users/${id}`);