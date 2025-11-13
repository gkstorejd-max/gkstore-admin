// src/services/ProductApi.js
import Axios from '../utils/Axios';

/* ---------- CREATE ---------- */
export const createProduct = async (formData) => {
  const res = await Axios.post('/products/createProduct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

/* ---------- UPDATE ---------- */
export const updateProduct = async (id, formData) => {
  const res = await Axios.patch(`/products/updateProduct/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

/* ---------- DELETE ---------- */
export const deleteProduct = async (id) => {
  const res = await Axios.delete(`/products/deleteProduct/${id}`);
  return res.data;
};

/* ---------- SINGLE ---------- */
export const getProduct = async (id) => {
  const res = await Axios.get(`/products/getProduct/${id}`);
  return res.data;               // { success, product }
};

/* ---------- ADMIN LIST ---------- */
export const getAdminProduct = async (params = {}) => {
  const res = await Axios.get('/products/getAdminProduct', { params });
  return res.data;               // { success, products, pagination }
};

/* ---------- USER LIST (public) ---------- */
export const getAllProduct = async (params = {}) => {
  const res = await Axios.get('/products/getAllProduct', { params });
  return res.data;
};