import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  getAllCategories,
  deleteCategory as deleteCategoryApi,
} from '../../services/CategoryApi';
import { FaEdit, FaEye, FaTrashAlt } from 'react-icons/fa';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState(-1);

  useEffect(() => {
    fetchCategories();
  }, [page, searchTerm, sortField, sortOrder]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getAllCategories({
        page,
        limit,
        search: searchTerm,
        sortField,
        sortOrder,
      });
      if (response && response.success) {
        setCategories(response.categories || []);
        setPagination(response.pagination || {});
      } else {
        toast.error('Failed to fetch categories');
        setCategories([]);
      }
    } catch (error) {
      toast.error('Error fetching categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination.totalPages && newPage > pagination.totalPages)) return;
    setPage(newPage);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await deleteCategoryApi(categoryId);
      if (res.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(res.message || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 1 ? -1 : 1);
    } else {
      setSortField(field);
      setSortOrder(-1);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h4 className="text-2xl font-semibold text-gray-800">Category List</h4>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <NavLink
            to="/admin/addCategory"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            <svg className="mr-2" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="20" width="20">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Add Category
          </NavLink>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center text-gray-500 py-20">Loading categories...</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full bg-white">
              <thead className="bg-gradient-to-r from-orange-100 to-orange-200">
                <tr>
                  {[
                    { label: 'Images', field: null },
                    { label: 'Name', field: 'name' },
                    { label: 'Type', field: 'type' },
                    { label: 'Parent', field: null },
                    { label: 'Display Order', field: 'displayOrder' },
                    { label: 'Status', field: null },
                    { label: 'Created At', field: 'createdAt' },
                    { label: 'Action', field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide cursor-pointer select-none"
                      onClick={() => field && handleSort(field)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        {field && sortField === field && (
                          <span className="text-xs">{sortOrder === 1 ? 'Up' : 'Down'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-600">
                      No categories available.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, idx) => (
                    <tr
                      key={cat._id}
                      className={`hover:bg-orange-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      {/* Images – show both */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-1">
                          {cat.image.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`${cat.name} ${i + 1}`}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{cat.name}</td>

                      <td className="px-6 py-4 text-sm">{cat.type}</td>

                      <td className="px-6 py-4 text-sm">
                        {cat.parentCategory ? cat.parentCategory.name || cat.parentCategory : '-'}
                      </td>

                      <td className="px-6 py-4 text-sm">{cat.displayOrder}</td>

                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            cat.isActive
                              ? 'bg-green-100 text-green-600 border border-green-200'
                              : 'bg-red-100 text-red-600 border border-red-200'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(cat.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-sm flex space-x-4 justify-center">
                        <NavLink
                          to={`/admin/editCategory/${cat._id}`}
                          className="text-blue-600 hover:text-blue-800 transition transform hover:scale-110"
                        >
                          <FaEdit size={18} />
                        </NavLink>
                        <NavLink
                          to={`/admin/viewCategory/${cat._id}`}
                          className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                        >
                          <FaEye size={18} />
                        </NavLink>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden">
            {categories.length === 0 ? (
              <p className="text-center py-4 text-gray-600">No categories available.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat._id} className="p-4 mb-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="flex gap-1 mr-3">
                        {cat.image.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={cat.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ))}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{cat.name}</p>
                        <p className="text-sm text-gray-500">
                          {cat.type} {cat.parentCategory ? `→ ${cat.parentCategory.name || cat.parentCategory}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <p className="text-sm text-gray-700">{cat.isActive ? 'Active' : 'Inactive'}</p>
                      <div className="flex space-x-3 mt-2">
                        <NavLink to={`/admin/editCategory/${cat._id}`} className="text-blue-600 hover:text-blue-800">
                          <FaEdit />
                        </NavLink>
                        <NavLink to={`/admin/viewCategory/${cat._id}`} className="text-gray-600 hover:text-gray-800">
                          <FaEye />
                        </NavLink>
                        <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-600 hover:text-red-800">
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pagination.page || 1} of {pagination.totalPages || 1}
        </span>
        <button
          disabled={page >= (pagination.totalPages || 1)}
          onClick={() => handlePageChange(page + 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CategoryList;