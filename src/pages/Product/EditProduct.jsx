// src/pages/admin/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, updateProduct } from "../../services/ProductApi";
import { getAllCategories } from "../../services/CategoryApi";
import { toast } from "react-hot-toast";

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Images
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Variant temp
  const [variant, setVariant] = useState({ size: "", color: "", price: "", stockQty: "", packaging: "Bottle" });

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          getProduct(productId),
          getAllCategories({ page: 1, limit: 200 })
        ]);
        if (pRes.success) setProduct(pRes.product);
        if (cRes.success) setCategories(cRes.categories);
      } catch { toast.error("Load error"); }
    })();
  }, [productId]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("additionalInfo.")) {
      const field = name.split(".")[1];
      setProduct(p => ({ ...p, additionalInfo: { ...p.additionalInfo, [field]: value } }));
    } else {
      setProduct(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const addVariant = () => {
    const { size, color, price, stockQty, packaging } = variant;
    if (!size || !color || !price) return toast.error("Size/Color/Price required");
    setProduct(p => ({
      ...p,
      variants: [...p.variants, { size, color, price: +price, stockQty: +stockQty || 0, packaging }]
    }));
    setVariant({ size: "", color: "", price: "", stockQty: "", packaging: "Bottle" });
  };

  const removeVariant = i => setProduct(p => ({
    ...p,
    variants: p.variants.filter((_, idx) => idx !== i)
  }));

  const handleFile = e => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + (product?.pimages?.length || 0) - removedImages.length > 5)
      return toast.error("Max 5 images total");
    const prevs = files.map(f => URL.createObjectURL(f));
    setNewImages(p => [...p, ...files]);
    setNewPreviews(p => [...p, ...prevs]);
  };

  const removeExisting = url => {
    setRemovedImages(p => [...p, url]);
    setProduct(p => ({ ...p, pimages: p.pimages.filter(u => u !== url) }));
  };

  const removeNew = i => {
    setNewImages(p => p.filter((_, idx) => idx !== i));
    setNewPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();

    // primitives
    const { variants, additionalInfo, pimages, ...rest } = product;
    Object.entries(rest).forEach(([k, v]) => fd.append(k, v));

    fd.append("variants", JSON.stringify(variants));
    fd.append("additionalInfo", JSON.stringify(additionalInfo));
    if (removedImages.length) fd.append("removedImages", JSON.stringify(removedImages));
    newImages.forEach(f => fd.append("pimages", f));

    try {
      const res = await updateProduct(productId, fd);
      if (res.success) {
        toast.success("Updated!");
        navigate(`/admin/product-details/${productId}`);
      } else toast.error(res.message);
    } catch { toast.error("Server error"); }
    setLoading(false);
  };

  if (!product) return <p className="text-center py-10">Loading…</p>;

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Edit Product</h1>

        {/* IMAGE SECTION */}
        <div className="mb-8">
          <div className="bg-orange-100 border-2 border-dashed border-orange-400 rounded-xl p-6 text-center">
            {/* Existing */}
            {product.pimages?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {product.pimages.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="existing" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                    <button type="button" onClick={() => removeExisting(url)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
            {/* New */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="new" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                    <button type="button" onClick={() => removeNew(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" id="new-img" multiple accept="image/*" onChange={handleFile}
              className="hidden" />
            <label htmlFor="new-img"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-orange-600">
              Add Images (max 5 total)
            </label>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="space-y-6">
          {/* SAME INPUTS AS ADD FORM – omitted for brevity – copy from AddProductForm */}
          {/* ... name, brand, description, price, discount, category, subCategory, tags, additionalInfo, variants, flags ... */}

          <button type="submit" disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}>
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}