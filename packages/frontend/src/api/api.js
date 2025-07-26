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

export const createCategory = async (category) => {
  const response = await api.post('/categories', category);
  return response.data;
};

export const updateCategory = async (id, category) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
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

export const createTool = async (tool) => {
  const response = await api.post('/tools', tool);
  return response.data;
};

export const updateTool = async (id, tool) => {
  const response = await api.put(`/tools/${id}`, tool);
  return response.data;
};

export const deleteTool = async (id) => {
  const response = await api.delete(`/tools/${id}`);
  return response.data;
};
