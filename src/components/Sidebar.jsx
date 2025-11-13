import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaPlusSquare,
  FaClipboardList,
  FaUsers,
  FaTags,
  FaChartBar,
} from "react-icons/fa";
import { MdDashboard, MdCategory } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { useAuth } from "../context/AuthContext.jsx";

function Sidebar({ className, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside
  className={`${className} backdrop-blur-md text-gray-800 p-4 h-[calc(100vh-10vh)] top-[10vh] overflow-y-auto transition-transform duration-300 ease-in-out`}
>

      {/* Close on mobile */}
      <div className="relative lg:hidden">
        <button
          onClick={toggleSidebar}
          className="text-red-500 hover:bg-red-500 hover:text-white rounded-md p-1"
        >
          ✕
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex items-center mb-8 space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <FaUsers className="text-white text-2xl" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.userName || "User"}</p>
          <p className="text-sm text-gray-500">{user?.email || "user@domain.com"}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-2">
        <NavSection title="Main">
          <NavItem to="/admin/dashboard" label="Dashboard" icon={<MdDashboard size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Foods Management">
          <NavItem to="/admin/adminProducts" label="All Products" icon={<FaBoxOpen size={20} />} onClick={toggleSidebar} />
          <NavItem to="/admin/addProduct" label="Add Food" icon={<FaPlusSquare size={20} />} onClick={toggleSidebar} />
          <NavItem to="/admin/categories" label="Categories" icon={<MdCategory size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Orders">
          <NavItem to="orders" label="All Orders" icon={<FaClipboardList size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Customers">
          <NavItem to="users" label="User List" icon={<FaUsers size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Promotions">
          <NavItem to="offers" label="Offers & Deals" icon={<FaTags size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Reports">
          <NavItem to="sales-report" label="Sales Report" icon={<FaChartBar size={20} />} onClick={toggleSidebar} />
          <NavItem to="PaymentDetails" label="Payment Detail" icon={<FaChartBar size={20} />} onClick={toggleSidebar} />
        </NavSection>

        {/* Logout */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:bg-red-100 rounded-md p-2 w-full text-left"
          >
            <IoMdLogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// Helper Components
const NavSection = ({ title, children }) => (
  <div className="mb-4">
    <h2 className="uppercase text-xs text-gray-400 px-2 mb-2">{title}</h2>
    <div className="flex flex-col">{children}</div>
  </div>
);

const NavItem = ({ to, label, icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `mb-2 px-4 py-2 rounded-md flex items-center gap-3 text-sm ${
        isActive
          ? "bg-orange-100 text-orange-600"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default Sidebar;
