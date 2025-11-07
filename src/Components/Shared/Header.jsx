// Header.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Logo from "./Logo";
import AuthContext from "../Context/AuthContext";

const Header = () => {
  const { user, loading, signOutUser } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;

  return (
    <header className="w-full bg-[#d1f6ff] shadow-md z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14 md:h-16">
        <Link to="/" className="flex-shrink-0">
          <Logo />
        </Link>

        {user ? (
          <div
            className="hidden md:flex items-center space-x-3 relative"
            ref={dropdownRef}
          >
            <p className="text-sm font-medium text-gray-800 select-none">
              Hi, I am {user.name} (UID: {user.uid})
            </p>

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
              className={`absolute right-0 top-full mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg transform origin-top-right transition-all duration-200 ease-out ${
                dropdownOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition"
              >
                Settings
              </Link>
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
            className="text-sm font-medium text-gray-700 hover:text-teal-600"
          >
            Sign In
          </Link>
        )}

        <button
          type="button"
          className="md:hidden text-gray-700"
          onClick={() => navigate("/menu")}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
