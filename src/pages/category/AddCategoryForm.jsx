import React, { useState, useEffect, useRef } from 'react';
import { createCategory, getMainCategories } from '../../services/CategoryApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddCategoryForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [type, setType] = useState('Main');
  const [parentCategory, setParentCategory] = useState('');
  const [images, setImages] = useState([]);           // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingParents, setFetchingParents] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load main categories
  useEffect(() => {
    const load = async () => {
      setFetchingParents(true);
      try {
        const cats = await getMainCategories();
        setMainCategories(cats);
      } catch (err) {
        toast.error('Failed to load parent categories');
      } finally {
        setFetchingParents(false);
      }
    };
    load();
  }, []);

  // Add new images (append, not replace)
  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    const total = images.length + newFiles.length;
    if (total > 2) {
      toast.error(`Max 2 images allowed. You already have ${images.length}`);
      return;
    }

    setImages((prev) => [...prev, ...newFiles]);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove image
  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Submit
  const handleSubmit = async () => {
    if (!name) return toast.error('Category Name is required');
    if (images.length !== 2) return toast.error('Exactly 2 images are required');
    if (type === 'Sub' && !parentCategory) return toast.error('Select a parent category');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('displayOrder', displayOrder || 0);
    formData.append('type', type);
    if (type === 'Sub') formData.append('parentCategory', parentCategory);
    images.forEach((img) => formData.append('images', img));

    try {
      setLoading(true);
      const res = await createCategory(formData);
      setLoading(false);
      if (res.success) {
        toast.success('Category created!');
        navigate('/admin/categories');
      } else {
        toast.error(res.message || 'Failed');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error');
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Category</h2>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">Display Order</label>
            <input
              type="number"
              id="displayOrder"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input type="radio" name="type" value="Main" checked={type === 'Main'} onChange={(e) => setType(e.target.value)} className="mr-2" />
                Main
              </label>
              <label className="flex items-center">
                <input type="radio" name="type" value="Sub" checked={type === 'Sub'} onChange={(e) => setType(e.target.value)} className="mr-2" />
                Sub
              </label>
            </div>
          </div>

          {/* Parent Dropdown */}
          {type === 'Sub' && (
            <div>
              <label htmlFor="parent" className="block text-sm font-medium text-gray-700">Parent Category</label>
              {fetchingParents ? (
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              ) : (
                <select
                  id="parent"
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  className="w-full mt-2 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Main Category --</option>
                  {mainCategories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (exactly 2)
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <span className="text-xs text-gray-500">{images.length}/2</span>
            </div>

            {/* Preview Grid */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`Img ${i + 1}`} className="w-full h-40 object-cover rounded-lg border shadow" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    X
                  </button>
                </div>
              ))}
              {images.length < 2 && Array.from({ length: 2 - images.length }).map((_, i) => (
                <div key={i} className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center text-gray-400">
                  + Image {images.length + i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || images.length !== 2}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 4V1m0 0L9 4m3-3l3 3M4 12H1m0 0l3-3m-3 3l3 3m8 4v3m0 0l3-3m-3 3l-3-3" />
                  </svg>
                  Adding...
                </div>
              ) : (
                'Add Category'
              )}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default AddCategoryForm;