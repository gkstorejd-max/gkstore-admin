// src/pages/admin/AdminProducts.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getAdminProduct, deleteProduct } from "../../services/ProductApi";

const ProductRow = ({ p, onDelete }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-4 py-3">
      <img src={p.pimages?.[0] || "/placeholder.png"} alt={p.name}
        className="w-16 h-16 object-cover rounded-full shadow" />
    </td>
    <td className="px-4 py-3">{p.name}</td>
    <td className="px-4 py-3">{p.category?.name || "—"}</td>
    <td className="px-4 py-3">₹{p.price}</td>
    <td className="px-4 py-3">
      {p.variants?.slice(0, 2).map((v, i) => (
        <div key={i}>{v.size}/{v.color} – ₹{v.price}</div>
      ))}
      {p.variants?.length > 2 && <div className="text-xs">…{p.variants.length - 2} more</div>}
    </td>
    <td className="px-4 py-3 space-x-1">
      {p.isFeatured && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Featured</span>}
      {p.isHotProduct && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Hot</span>}
      {p.isBestSeller && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Best</span>}
      {p.status === "Active" && <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Active</span>}
    </td>
    <td className="px-4 py-3 flex gap-2 justify-center">
      <NavLink to={`/admin/editProduct/${p._id}`} className="text-blue-600 hover:text-blue-800">Edit</NavLink>
      <NavLink to={`/admin/product-details/${p._id}`} className="text-gray-600 hover:text-gray-800">View</NavLink>
      <button onClick={() => onDelete(p._id)} className="text-red-600 hover:text-red-800">Delete</button>
    </td>
  </tr>
);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => { fetchProducts(); }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProduct({ page, limit, search });
      if (res.success) {
        setProducts(res.products || []);
        setPagination(res.pagination || {});
      } else toast.error("Failed to load");
    } catch { toast.error("Network error"); }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this product?")) return;
    const res = await deleteProduct(id);
    if (res.success) {
      toast.success("Deleted");
      fetchProducts();
    } else toast.error(res.message);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="flex gap-2">
          <input placeholder="Search…" value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
            className="border rounded px-3 py-1" />
          <NavLink to="/admin/addProduct"
            className="bg-orange-500 text-white px-4 py-1 rounded">+ Add Product</NavLink>
        </div>
      </div>

      {loading ? <p className="text-center">Loading…</p> : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Image</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Variants</th>
                  <th className="px-4 py-2">Tags</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => <ProductRow key={p._id} p={p} onDelete={handleDelete} />)}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50">Prev</button>
            <span>Page {page} / {pagination.totalPages || 1}</span>
            <button onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
              className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50">Next</button>
          </div>
        </>
      )}
    </div>
  );
}