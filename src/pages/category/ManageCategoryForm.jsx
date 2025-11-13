import React, { useState, useEffect } from 'react';
import { updateCategory, deleteCategory, getCategory } from '../../services/CategoryApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';

const ManageCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [type, setType] = useState('Main');
  const [parentCategory, setParentCategory] = useState('');
  const [images, setImages] = useState([]); // new files (optional)
  const [existingImages, setExistingImages] = useState([]); // URLs from DB
  const [loading, setLoading] = useState(false);

  // Load current category
  useEffect(() => {
    const load = async () => {
      try {
        const cat = await getCategory(id);
        setName(cat.name);
        setDescription(cat.description || '');
        setDisplayOrder(cat.displayOrder || 0);
        setType(cat.type);
        setParentCategory(cat.parentCategory?._id || '');
        setExistingImages(cat.image || []);
      } catch (err) {
        toast.error('Failed to load category');
      }
    };
    load();
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 2) {
      toast.error('Maximum 2 images allowed');
      return;
    }
    setImages(files);
  };

  const handleUpdate = async () => {
    if (!name) return toast.error('Name is required');
    if (images.length > 0 && images.length !== 2) return toast.error('Exactly 2 images required when uploading new ones');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder || 0);
    formData.append('type', type);
    if (type === 'Sub' && parentCategory) formData.append('parentCategory', parentCategory);
    images.forEach((f) => formData.append('images', f));

    try {
      setLoading(true);
      const res = await updateCategory(id, formData);
      setLoading(false);
      if (res.success) {
        toast.success('Category updated');
        navigate('/admin/categories');
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this category?')) return;
    try {
      setLoading(true);
      const res = await deleteCategory(id);
      setLoading(false);
      if (res.success) {
        toast.success('Category deleted');
        navigate('/admin/categories');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Edit Category</h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          />
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="Main"
                checked={type === 'Main'}
                onChange={(e) => setType(e.target.value)}
                className="mr-2"
              />
              Main
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="Sub"
                checked={type === 'Sub'}
                onChange={(e) => setType(e.target.value)}
                className="mr-2"
              />
              Sub
            </label>
          </div>
        </div>

        {/* Parent (only for Sub) */}
        {type === 'Sub' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Category ID</label>
            <input
              type="text"
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Images</label>
            <div className="flex gap-2 mt-2">
              {existingImages.map((url, i) => (
                <img key={i} src={url} alt={`img ${i + 1}`} className="w-20 h-20 object-cover rounded border" />
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Replace Images (optional – exactly 2)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">{images.length} image(s) selected</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Category'}
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ManageCategoryForm;