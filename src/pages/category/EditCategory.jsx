import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategory, updateCategory, getMainCategories } from '../../services/CategoryApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [type, setType] = useState('Main');
  const [parentCategory, setParentCategory] = useState('');
  const [images, setImages] = useState([]);           // new files
  const [imagePreviews, setImagePreviews] = useState([]); // preview URLs
  const [existingImages, setExistingImages] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const fileInputRef = useRef(null);

  // Load category + main categories
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const [cat, parents] = await Promise.all([
          getCategory(categoryId),
          getMainCategories()
        ]);
        setName(cat.name);
        setDescription(cat.description || '');
        setDisplayOrder(cat.displayOrder || 0);
        setType(cat.type);
        setParentCategory(cat.parentCategory?._id || '');
        setExistingImages(cat.image || []);
        setMainCategories(parents);
      } catch (err) {
        toast.error('Failed to load category');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [categoryId]);

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 2) {
      toast.error('Maximum 2 images allowed');
      return;
    }
    setImages(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove new image
  const removeNewImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Submit update
  const handleUpdate = async () => {
    if (!name) return toast.error('Name is required');
    if (images.length > 0 && images.length !== 2) return toast.error('Replace with exactly 2 images');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder || 0);
    formData.append('type', type);
    if (type === 'Sub' && parentCategory) formData.append('parentCategory', parentCategory);
    images.forEach(f => formData.append('images', f));

    try {
      setLoading(true);
      const res = await updateCategory(categoryId, formData);
      setLoading(false);
      if (res.success) {
        toast.success('Category updated!');
        navigate(`/admin/viewCategory/${categoryId}`);
      } else {
        toast.error(res.message || 'Update failed');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error');
    }
  };

  if (fetching) return <div className="text-center py-10">Loading...</div>;

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-semibold mb-6">Edit Category</h1>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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

          {/* Parent Dropdown */}
          {type === 'Sub' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Main Category --</option>
                {mainCategories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Existing Images */}
          {existingImages.length > 0 && images.length === 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Images</label>
              <div className="flex gap-3 mt-2">
                {existingImages.map((url, i) => (
                  <img key={i} src={url} alt="current" className="w-24 h-24 object-cover rounded border shadow" />
                ))}
              </div>
            </div>
          )}

          {/* Replace Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Replace Images (optional – exactly 2)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="new" className="w-full h-32 object-cover rounded-lg border shadow" />
                    <button
                      onClick={() => removeNewImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="mt-6">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default EditCategoryPage;