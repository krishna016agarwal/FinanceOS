import api from './axios';

export const login = (body) => api.post('/auth/login', body);
export const register = (body) => api.post('/auth/register', body);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const refreshToken = (body) => api.post('/auth/refresh-token', body);