import api from './apiClient';

export const fetchWorkspaces = () => api.get('/workspaces/');

export const createWorkspace = (data) => api.post('/workspaces/', data);