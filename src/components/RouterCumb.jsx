import React, { useEffect } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

// Friendly label map with "Product" replacing "Food"
const labelMap = {
  admin: "Admin",
  dashboard: "Dashboard",
  home: "Dashboard", // 👈 Treat /admin/home as Dashboard
  "product-details": "Product Details",
  "edit-product": "Edit Product",
  adminProducts: "All Products",
  "order-manager": "Orders",
  reviews: "Reviews",
  create: "Create",
  new: "New",
  users: "Users",
  addProduct: "Add Product", // Changed from addFood to addProduct
  adminProduct: "Manage Product", // Changed from adminFood to adminProduct
  editProduct: "Edit Product", // Changed from editFood to editProduct
  "product-view": "Product View", // Changed from food-details to product-view
  categories: "Categories",
  addCategory: "Add Category",
  editCategory: "Edit Category",
  viewCategory: "View Category",
  offers: "Offers",
  "sales-report": "Sales Report",
  orders: "Orders",
};

// Detect if a segment is a dynamic ID (e.g., Mongo ID)
const isDynamicSegment = (str) =>
  str.length > 15 || /^[0-9a-f]{20,}$/i.test(str);

const RouterCumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paths = location.pathname.split("/").filter(Boolean);

  // Check if any path segment is valid
  const isValidRoute = paths.some((segment) => labelMap[segment]);

  useEffect(() => {
    if (!isValidRoute) {
      const lastValidPath =
        sessionStorage.getItem("lastValidPath") || "/admin/dashboard";
      navigate(lastValidPath, { replace: true });
    } else {
      sessionStorage.setItem("lastValidPath", location.pathname);
    }
  }, [location.pathname, isValidRoute, navigate]);

  // If the route is not valid, redirect
  if (!isValidRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (paths.length === 0) return null;

  return (
    <div className="bg-white p-4 pb-2 flex flex-wrap items-center gap-2 shadow-md rounded-md border border-gray-200">
      <Link
        to="/admin/dashboard"
        className="hover:underline duration-300 hover:text-blue-600 text-xl font-semibold text-gray-700"
      >
        Home
      </Link>

      {paths.map((segment, index) => {
        const fullPath = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;

        const label = isDynamicSegment(segment)
          ? "View"
          : labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <div
            className="flex items-center gap-2 text-xl font-semibold"
            key={index}
          >
            <FaChevronRight className="text-gray-400" />
            <Link
              to={fullPath}
              className={`transition-colors duration-300 ${
                isLast
                  ? "text-[#BD3B4A] font-bold"
                  : "text-gray-700 hover:text-blue-600 hover:underline"
              }`}
            >
              {label}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default RouterCumb;
