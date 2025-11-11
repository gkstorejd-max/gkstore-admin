import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-orange-50 border-t border-orange-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       y
          {/* Left: Copyright */}
          <div className="text-sm text-orange-700">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold">JD InfoTech</span>. All rights reserved.
          </div>

          {/* Center: Footer Links */}
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-orange-600 hover:text-orange-800 transition-colors">Privacy Policy</a>
            <a href="#" className="text-orange-600 hover:text-orange-800 transition-colors">Terms of Service</a>
            <a href="#" className="text-orange-600 hover:text-orange-800 transition-colors">Contact</a>
          </div>

          {/* Right: Social Icons */}
          <div className="flex gap-4 text-orange-500">
            <a href="#" className="hover:text-orange-600 transition">
              <FaFacebookF size={16} />
            </a>
            <a href="#" className="hover:text-orange-600 transition">
              <FaTwitter size={16} />
            </a>
            <a href="#" className="hover:text-orange-600 transition">
              <FaLinkedinIn size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
