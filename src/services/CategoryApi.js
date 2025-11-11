import Axios from '../utils/Axios';
export const createCategory = async (formData) => {
  const res = await Axios.post('/categories/createCategory', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Get All Categories (with pagination and sorting)
export const getAllCategories = async ({ page, limit, search, sortField, sortOrder }) => {
  try {
    const res = await Axios.get('/categories/getAllCategories', {
      params: { page, limit, search, sortField, sortOrder },
    });

    return {
      success: res.data.success,
      categories: res.data.categories,
      pagination: res.data.pagination || {},
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Error fetching categories');
  }
};

// Get Main Categories
export const getMainCategories = async () => {
  const res = await Axios.get('/categories/getMainCategories');
  return res.data.categories;
};

// Get Single Category by ID
export const getCategory = async (id) => {
  const res = await Axios.get(`/categories/getCategory/${id}`);
  return res.data.category;
};

// Get Category Details (with subcategories, products, etc.)
export const getCategoryDetails = async (id) => {
  const res = await Axios.get(`/categories/getCategoryDetails/${id}`);
  return res.data;
};

// Update Category (with optional image)
export const updateCategory = async (id, formData) => {
  const res = await Axios.put(`/categories/updateCategory/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Delete Category (soft delete)
export const deleteCategory = async (id) => {
  const res = await Axios.delete(`/categories/deleteCategory/${id}`);
  return res.data;
};

// Restore Category (restore soft-deleted category)
export const restoreCategory = async (id) => {
  const res = await Axios.put(`/categories/restoreCategory/${id}`);
  return res.data;
};
