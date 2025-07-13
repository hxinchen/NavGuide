import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const getCategory = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const getTools = async () => {
  const response = await api.get('/tools');
  return response.data;
};

export const getTool = async (id) => {
  const response = await api.get(`/tools/${id}`);
  return response.data;
};