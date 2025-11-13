// src/components/admin/AddProductForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createProduct } from "../../services/ProductApi";
import { getAllCategories } from "../../services/CategoryApi";

export default function AddProductForm() {
  const navigate = useNavigate();

  /* ------------------ STATE ------------------ */
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    category: "",
    subCategory: "",
    productCode: "",
    price: "",
    discount: 0,
    tags: "",
    isFeatured: false,
    isHotProduct: false,
    isBestSeller: false,
    status: "Active",
    additionalInfo: { skinType: "", shelfLife: 12, usageInstructions: "" },
    variants: [] // { size, color, price, stockQty, packaging }
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // temporary variant fields
  const [variant, setVariant] = useState({
    size: "",
    color: "",
    price: "",
    stockQty: "",
    packaging: "Bottle"
  });

  /* ------------------ FETCH CATEGORIES ------------------ */
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllCategories({ page: 1, limit: 200 });
        if (res.success) setCategories(res.categories);
      } catch {
        toast.error("Failed to load categories.");
      }
    })();
  }, []);

  /* ------------------ HANDLERS ------------------ */
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("additionalInfo.")) {
      const field = name.split(".")[1];
      setFormData(p => ({
        ...p,
        additionalInfo: { ...p.additionalInfo, [field]: value }
      }));
    } else {
      setFormData(p => ({
        ...p,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleVariantField = (field, val) =>
    setVariant(p => ({ ...p, [field]: val }));

  const addVariant = () => {
    const { size, color, price, stockQty, packaging } = variant;
    if (!size || !color || !price || isNaN(parseFloat(price))) {
      toast.error("Size, Color & Price are required.", {
        style: { background: "#f97316", color: "#fff" }
      });
      return;
    }
    const exists = formData.variants.some(
      v => v.size === size && v.color === color
    );
    if (exists) {
      toast.error("Variant with same size & color already exists.", {
        style: { background: "#f97316", color: "#fff" }
      });
      return;
    }

    setFormData(p => ({
      ...p,
      variants: [
        ...p.variants,
        {
          size,
          color,
          price: parseFloat(price),
          stockQty: parseInt(stockQty) || 0,
          packaging
        }
      ]
    }));
    setVariant({ size: "", color: "", price: "", stockQty: "", packaging: "Bottle" });
    toast.success("Variant added!", {
      style: { background: "#f97316", color: "#fff" }
    });
  };

  const removeVariant = idx => {
    setFormData(p => ({
      ...p,
      variants: p.variants.filter((_, i) => i !== idx)
    }));
    toast.success("Variant removed!", {
      style: { background: "#f97316", color: "#fff" }
    });
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImages(p => [...p, ...files]);
    setPreviews(p => [...p, ...newPreviews]);
    toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded!`, {
      style: { background: "#f97316", color: "#fff" }
    });
  };

  const removeImages = () => {
    setImages([]);
    setPreviews([]);
    toast.success("All images removed!", {
      style: { background: "#f97316", color: "#fff" }
    });
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async e => {
    e.preventDefault();
    if (images.length < 1) {
      toast.error("At least one image is required.");
      return;
    }
    setLoading(true);

    const fd = new FormData();

    // ---- primitive fields (except variants & additionalInfo) ----
    const { variants, additionalInfo, ...rest } = formData;
    Object.entries(rest).forEach(([k, v]) => fd.append(k, v));

    // ---- tags as comma string (backend will split) ----
    fd.append("tags", formData.tags);

    // ---- additionalInfo as JSON string ----
    fd.append("additionalInfo", JSON.stringify(additionalInfo));

    // ---- VARIANT INDEXED FIELDS (exactly what backend expects) ----
    formData.variants.forEach((v, i) => {
      fd.append(`variants[${i}][size]`, v.size);
      fd.append(`variants[${i}][color]`, v.color);
      fd.append(`variants[${i}][price]`, v.price);
      fd.append(`variants[${i}][stockQty]`, v.stockQty);
      fd.append(`variants[${i}][packaging]`, v.packaging);
    });

    // ---- images (field name must match controller: pimages) ----
    images.forEach(f => fd.append("pimages", f));

    try {
      const data = await createProduct(fd);
      if (data.success) {
        toast.success("Product created successfully!", {
          style: { background: "#f97316", color: "#fff" }
        });
        resetForm();
        navigate("/admin/products");
      } else {
        toast.error(data.message || "Failed to create product.", {
          style: { background: "#f97316", color: "#fff" }
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Server error occurred.", {
        style: { background: "#f97316", color: "#fff" }
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
      productCode: "",
      price: "",
      discount: 0,
      tags: "",
      isFeatured: false,
      isHotProduct: false,
      isBestSeller: false,
      status: "Active",
      additionalInfo: { skinType: "", shelfLife: 12, usageInstructions: "" },
      variants: []
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

        {/* ---------- IMAGE UPLOAD ---------- */}
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

        {/* ---------- FORM ---------- */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ---- BASIC INFO ---- */}
          <InputField label="Name *" name="name" value={formData.name} onChange={handleChange} placeholder="Enter product name" />
          <InputField label="Brand *" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. L'Oréal" />
          <TextAreaField label="Description *" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the product (min 10 characters)" />
          <InputField label="Product Code" name="productCode" value={formData.productCode} onChange={handleChange} placeholder="e.g. SKU123" />
          <InputField label="Base Price *" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 299" />
          <InputField label="Discount (%)" name="discount" type="number" value={formData.discount} onChange={handleChange} placeholder="e.g. 10" />

          {/* ---- CATEGORY ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* ---- SUB-CATEGORY (optional) ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">None</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* ---- TAGS ---- */}
          <InputField label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. organic, vegan, premium" />

          {/* ---- ADDITIONAL INFO ---- */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Info</h2>
            <InputField label="Skin Type *" name="additionalInfo.skinType" value={formData.additionalInfo.skinType} onChange={handleChange} placeholder="e.g. All, Dry, Oily" />
            <InputField label="Shelf Life (months)" name="additionalInfo.shelfLife" type="number" value={formData.additionalInfo.shelfLife} onChange={handleChange} placeholder="e.g. 12" />
            <TextAreaField label="Usage Instructions *" name="additionalInfo.usageInstructions" value={formData.additionalInfo.usageInstructions} onChange={handleChange} placeholder="How to use the product..." />
          </div>

          {/* ---- VARIANTS ---- */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Variant</h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
              {/* SIZE */}
              <select
                value={variant.size}
                onChange={e => handleVariantField("size", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Size</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>

              {/* COLOR */}
              <input
                type="text"
                placeholder="Color"
                value={variant.color}
                onChange={e => handleVariantField("color", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              />

              {/* PRICE */}
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={e => handleVariantField("price", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              />

              {/* STOCK */}
              <input
                type="number"
                placeholder="Stock Qty"
                value={variant.stockQty}
                onChange={e => handleVariantField("stockQty", e.target.value)}
                className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
              />

              {/* ADD BUTTON */}
              <button
                type="button"
                onClick={addVariant}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                + Add Variant
              </button>
            </div>

            {/* LIST ADDED VARIANTS */}
            {formData.variants.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg"
                  >
                    <span>
                      {v.size} / {v.color} - ₹{v.price} (Stock: {v.stockQty})
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

          {/* ---- CHECKBOXES ---- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              ["isFeatured", "Featured"],
              ["isHotProduct", "Hot Product"],
              ["isBestSeller", "Best Seller"]
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

          {/* ---- STATUS ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

          {/* ---- SUBMIT ---- */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
            } transition`}
          >
            {loading ? "Saving..." : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- REUSABLE INPUT COMPONENTS ---------- */
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