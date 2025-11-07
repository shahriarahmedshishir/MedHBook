import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ArrowLeft } from "lucide-react";
import Logo from "./Logo";
import AuthContext from "../Context/AuthContext";

const Header = () => {
  const { user, loading, signOutUser } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        mobileRef.current &&
        !mobileRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;

  return (
    <header className="w-full bg-[#d1f6ff] shadow-md z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14 md:h-16">
        <div className="flex items-center space-x-4">
          {/* Back Button (only show if not on home page) */}
          {location.pathname !== "/" && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-[#b2f0ff] transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo />
          </Link>
        </div>

        {/* Desktop */}
        {user ? (
          <div
            className="hidden md:flex items-center space-x-3 relative"
            ref={dropdownRef}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <img
                src={user.img}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-gray-300 object-cover hover:ring-2 hover:ring-[#7edff5] transition"
              />
            </button>

            <div
              className={`absolute right-0 top-full mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg transform origin-top-right transition-all duration-200 ease-out ${
                dropdownOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 break-all">
                  UID: {user.uid}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/signin"
            className="hidden md:block text-sm font-medium text-gray-700 hover:text-teal-600"
          >
            Sign In
          </Link>
        )}

        {/* Mobile */}
        <div className="md:hidden relative" ref={mobileRef}>
          <button
            type="button"
            className="text-gray-700"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {mobileMenuOpen && user && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3 z-50">
              <div className="flex items-center space-x-3 border-b border-gray-200 pb-3">
                <img
                  src={user.img}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">UID: {user.uid}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 border-t border-gray-200 hover:bg-[#d1f6ff]/60 transition"
              >
                Sign Out
              </button>
            </div>
          )}

          {!user && mobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-gray-700 px-4 py-2 hover:bg-[#d1f6ff]/60 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
