import api from './apiClient';

export async function login(email, password) {
  return api.post('/auth/login/', {
    email,
    username: email,
    password,
  });
}

export async function register(email, password) {
  return api.post('/auth/register/', {
    email,
    username: email,
    password,
  });
}

export function logout() {
  return api.post('/auth/logout/');
}

export function switchAccount({ email }) {
  return api.post('/auth/switch-account/', {
    username: email,
  });
}

export const searchUsers = (query) => api.get(`/auth/users/search/?q=${query}`);
