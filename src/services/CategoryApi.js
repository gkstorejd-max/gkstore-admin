// src/services/CategoryApi.js
import Axios from '../utils/Axios';

export const createCategory = async (formData) => {
  const res = await Axios.post('/category/createCategory', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getAllCategories = async ({ page, limit, search, sortField, sortOrder }) => {
  const res = await Axios.get('/category/getAllCategories', {
    params: { page, limit, search, sortField, sortOrder },
  });
  return res.data;
};

export const getCategory = async (id) => {
  const res = await Axios.get(`/category/getCategory/${id}`);
  return res.data.category;
};

export const updateCategory = async (id, formData) => {
  const res = await Axios.put(`/category/updateCategory/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await Axios.delete(`/category/deleteCategory/${id}`);
  return res.data;
};


export const getMainCategories = async () => {
  const res = await Axios.get('/category/getMainCategories');
  return res.data.categories;   // array of { _id, name, ... }
};