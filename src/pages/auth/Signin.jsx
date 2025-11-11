import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'; // Import both toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the Toastify styles

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // ✅ Use custom hook

export default function Signin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const pwdInputRef = useRef(null);
  const navigate = useNavigate();

  const { login } = useAuth(); // ✅ Standard usage

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    setIsLoading(true);

    const credentials = {
      email: usernameOrEmail,
      userName: usernameOrEmail,
      password,
    };

    const response = await login(credentials);

    if (response.success) {
      setMessage({ type: "success", text: "Welcome! GkStore..." });
      toast.success('Login successful! ');
      // Redirect after short delay
      setTimeout(() => navigate("/admin/dashboard"), 1000); // You can make this dynamic based on role
    } else {
      setMessage({
        type: "error",
        text: response.message || "Invalid credentials.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center p-6"
      // style={{ backgroundImage: `url(/rest.png)` }} // Set the background image here
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl bg-opacity-80">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h1>

        {/* Alert messages */}
        {message && (
          <div
            className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm ${
              message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email / Username</label>
            <div className="mt-1 relative">
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="you@example.com"
              />
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <input
                ref={pwdInputRef}
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setShowPwd((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white py-2 rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <LogIn size={18} />
            )}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
