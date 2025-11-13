import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { getCategory } from '../../services/CategoryApi';

const ViewCategory = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCategory(categoryId);
        setCategory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [categoryId]);

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>;
  if (!category) return <div className="text-center py-10 text-red-600">Category not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Category Details</h1>
        <div className="flex gap-3">
          <NavLink
            to={`/admin/editCategory/${category._id}`}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
          >
            Edit
          </NavLink>
          <NavLink
            to="/admin/categories"
            className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition"
          >
            Back
          </NavLink>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images + Name */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {category.image?.[0] ? (
              <img src={category.image[0]} alt="Img 1" className="w-full h-48 object-cover rounded-lg shadow border" />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-lg h-48 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            {category.image?.[1] ? (
              <img src={category.image[1]} alt="Img 2" className="w-full h-48 object-cover rounded-lg shadow border" />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-lg h-48 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 text-center lg:text-left">{category.name}</h3>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-700">Description</h4>
            <p className="text-gray-600 mt-1">{category.description || '—'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-gray-600">{category.type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Parent:</span>
              <span className="ml-2 text-gray-600">{category.parentCategory?.name || '—'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Display Order:</span>
              <span className="ml-2 text-gray-600">{category.displayOrder || '—'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Created: {new Date(category.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCategory;