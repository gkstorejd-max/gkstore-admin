import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Signin from "./pages/auth/Signin";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./secureRoute/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AddFoodForm from "./pages/Product/AddProductForm";
import AdminFood from "./pages/Product/AdminProducts";
import CategoryList from "./pages/category/CatgoryList";
import AddCategoryForm from "./pages/category/AddCategoryForm";
import EditCategory from "./pages/category/EditCategory";
import ViewCategory from "./pages/category/ViewCatgory";
import EditFood from "./pages/Product/EditProduct";
import FoodView from "./pages/Product/FoodView";
import OffersList from "./pages/offers/OffersList";
import TotalUserOnWeb from "./pages/users/TotalUserOnWeb";
import NotFoundPage from './pages/PNF/NotFoundPage';
import SalesReport from "./pages/report/SaleDash";
import AdminOrderManager from "./pages/orders/AdminOrderManager"
import PaymentList from "./pages/payments/PaymentList";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" replace />, // redirect base
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/admin",
    
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout /> {/* 👈 Layout wraps all children */}
      </ProtectedRoute>
    ),
    children: [
      {
      index: true,
      element: <Navigate to="dashboard" replace />,
     },
      {
        path: "dashboard", // ⛔ DO NOT use /admin/dashboard here
        element: <Dashboard />,
      },
      {
         path: "users",
         element : < TotalUserOnWeb />,
      },
      {
        path:"addProduct",
        element: <AddFoodForm/>
      },
      {
          path:"adminProducts",
          element: < AdminFood />
      },
      {
          path:"editProduct/:productId",
          element: <EditFood />
      },
      {
           path:"product-view/:productId",
           element: <FoodView />
      },
      {
        path: "home",
        element: <HomePage/>
      },
      {
        path: "categories",
        element : <CategoryList />
      },
      {
        path : "addCategory",
        element : <AddCategoryForm />
      },
      {
        path : "editCategory/:categoryId",
        element : <EditCategory />
      },
      {
        path : "viewCategory/:categoryId",
        element : <ViewCategory />
      },
      {
        path: "offers",
        element: < OffersList />,
      },
      {
        path: "sales-report",
        element: <SalesReport />, // redirect /admin to /admin/dashboard
      },
      { path: "orders", element: <AdminOrderManager /> },
      { path: "PaymentDetails", element: <PaymentList />, },
    ],
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
