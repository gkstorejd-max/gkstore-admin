import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createProduct } from "../../services/ProductApi";
import { getAllCategories, getSubCategories } from "../../services/CategoryApi";


export default function AddProductForm() {
  const navigate = useNavigate();

  /* ------------------ STATE ------------------ */
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    category: "",
    subCategory: "",
    discount: 0,
    tags: "",
    isFeatured: false,
    isHotProduct: false,
    isBestSeller: false,
    status: "Active",
    additionalInfo: {
      skinType: "",
      shelfLife: 12,
      usageInstructions: "",
    },
    variants: [],
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [variant, setVariant] = useState({
    size: "",
    color: "",
    price: "",
    stockQty: "",
    packaging: "",
  });

  /* ------------------ FETCH CATEGORIES ------------------ */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getAllCategories({
          page: 1,
          limit: 200,
          search: "",
          sortField: "name",
          sortOrder: 1,
        });
        if (res.success && Array.isArray(res.categories)) {
          setCategories(res.categories);
        } else {
          throw new Error("Failed to fetch categories.");
        }
      } catch (err) {
        toast.error("Failed to load categories.", {
          style: { background: "#f97316", color: "#fff" },
        });
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchSubCategories() {
      if (formData.category) {
        try {
          const subs = await getSubCategories(formData.category);
          setSubCategories(subs);
        }
        catch (err) {
          toast.error("Failed to load sub-categories.", {
            style: { background: "#f97316", color: "#fff" },
          });
        }
      } else {
        setSubCategories([]);
      }
    }
    fetchSubCategories();
  }, [formData.category]);



  /* ------------------ HANDLERS ------------------ */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        subCategory: "", // Reset subCategory
      }));
    } else if (name.startsWith("additionalInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        additionalInfo: { ...prev.additionalInfo, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleVariantChange = (field, val) => {
    setVariant((prev) => ({ ...prev, [field]: val }));
  };

  const addVariant = () => {
    const { size, color, price, stockQty, packaging } = variant;

    if (!size || !color || !price || isNaN(parseFloat(price))) {
      toast.error("Size, Color, and Price are required.", {
        style: { background: "#f97316", color: "#fff" },
      });
      return;
    }

    const alreadyExists = formData.variants.some(
      (v) => v.size === size && v.color === color
    );
    if (alreadyExists) {
      toast.error("Variant with this size & color already exists.", {
        style: { background: "#f97316", color: "#fff" },
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          size,
          color,
          price: parseFloat(price),
          stockQty: parseInt(stockQty) || 0,
          packaging,
        },
      ],
    }));

    setVariant({ size: "", color: "", price: "", stockQty: "", packaging: "Bottle" });
    toast.success("Variant added!", {
      style: { background: "#f97316", color: "#fff" },
    });
  };

  const removeVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    toast.success("Variant removed!", {
      style: { background: "#f97316", color: "#fff" },
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded!`, {
      style: { background: "#f97316", color: "#fff" },
    });
  };

  const removeImages = () => {
    setImages([]);
    setPreviews([]);
    toast.success("All images removed!", {
      style: { background: "#f97316", color: "#fff" },
    });
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("At least one image is required.");
      return;
    }

    if (formData.variants.length === 0) {
      toast.error("At least one variant is required.");
      return;
    }

    setLoading(true);

    const fd = new FormData();

    // Append all fields except variants and additionalInfo
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== "variants" && key !== "additionalInfo") {
        fd.append(key, val);
      }
    });

    // Append tags (backend will split by comma)
    fd.append("tags", formData.tags);

    // Append additionalInfo as JSON string
    fd.append("additionalInfo", JSON.stringify(formData.additionalInfo));

    // Append variants with indexed keys (exact match to backend)
    formData.variants.forEach((variant, index) => {
      fd.append(`variants[${index}][size]`, variant.size);
      fd.append(`variants[${index}][color]`, variant.color);
      fd.append(`variants[${index}][price]`, variant.price);
      fd.append(`variants[${index}][stockQty]`, variant.stockQty);
      fd.append(`variants[${index}][packaging]`, variant.packaging);
    });

    // Append images
    images.forEach((file) => fd.append("pimages", file));

    try {
      const data = await createProduct(fd);
      if (data.success) {
        toast.success("Product created successfully!", {
          style: { background: "#f97316", color: "#fff" },
        });
        resetForm();
        navigate("/admin/adminProducts");
      } else {
        toast.error(data.message || "Failed to create product.", {
          style: { background: "#f97316", color: "#fff" },
        });
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.response?.data?.message || "Server error occurred.", {
        style: { background: "#f97316", color: "#fff" },
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      description: "",
      category: "",
      subCategory: "",
      discount: 0,
      tags: "",
      isFeatured: false,
      isHotProduct: false,
      isBestSeller: false,
      status: "Active",
      additionalInfo: { skinType: "", shelfLife: 12, usageInstructions: "" },
      variants: [],
    });
    removeImages();
  };

  /* ------------------ RENDER ------------------ */
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Add New Product
        </h1>

        {/* Image Upload Section */}
        <div className="mb-8">
          <div className="bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl p-6 text-center">
            {previews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {previews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No images uploaded</p>
            )}
            {previews.length > 0 && (
              <button
                type="button"
                onClick={removeImages}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Remove All Images
              </button>
            )}
            {previews.length < 5 && (
              <div className="mt-4">
                <input
                  type="file"
                  id="product-image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="product-image-upload"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-orange-600 transition"
                >
                  Upload Images (max 5)
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name, Brand, Description */}
          <InputField
            label="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
          <InputField
            label="Brand *"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. L'Oréal, Himalaya"
          />
          <TextAreaField
            label="Description *"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the product (min 10 characters)"
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select Category</option>
              {categories
                .filter((cat) => cat.type === "Main")
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Sub-Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-Category
            </label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              disabled={!formData.category}
              className={`w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 ${!formData.category ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
            >
              <option value="">
                {formData.category ? "None (Optional)" : "Select Main Category First"}
              </option>
              {subCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <InputField
            label="Tags (comma separated)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. organic, vegan, premium"
          />

          {/* Discount */}
          <InputField
            label="Discount (%)"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            placeholder="e.g. 10"
          />

          {/* Additional Info */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Additional Information
            </h2>
            <InputField
              label="Skin Type"
              name="additionalInfo.skinType"
              value={formData.additionalInfo.skinType}
              onChange={handleChange}
              placeholder="e.g. All, Dry, Oily"
            />
            <InputField
              label="Shelf Life (months)"
              name="additionalInfo.shelfLife"
              type="number"
              value={formData.additionalInfo.shelfLife}
              onChange={handleChange}
              placeholder="e.g. 12"
            />
            <TextAreaField
              label="Usage Instructions"
              name="additionalInfo.usageInstructions"
              value={formData.additionalInfo.usageInstructions}
              onChange={handleChange}
              placeholder="How to use the product..."
            />
          </div>

          {/* Variants Section */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Add Variant
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
              <input
                type="text"
                placeholder="Size/ Measurement"
                value={variant.size}
                onChange={(e) => handleVariantChange("size", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Color"
                value={variant.color}
                onChange={(e) => handleVariantChange("color", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => handleVariantChange("price", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="number"
                placeholder="Stock Qty"
                value={variant.stockQty}
                onChange={(e) => handleVariantChange("stockQty", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              />

              <button
                type="button"
                onClick={addVariant}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                + Add
              </button>
            </div>

            {/* Added Variants */}
            {formData.variants.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg"
                  >
                    <span>
                      {v.size} | {v.color} - ₹{v.price} (Stock: {v.stockQty})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ["isFeatured", "Featured"],
              ["isHotProduct", "Hot Product"],
              ["isBestSeller", "Best Seller"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleChange}
                  className="h-5 w-5 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
              } transition`}
          >
            {loading ? "Saving..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* Helper Components */
const InputField = ({ label, name, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={4}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
);