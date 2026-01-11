import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ArrowLeft, MessageCircle, Search, BookOpen } from "lucide-react";
import AuthContext from "../Context/AuthContext";

const Header = () => {
  const { user, loading, signOutUser, isAdmin } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      // Replace current history entry and navigate to signin
      navigate("/signin", { replace: true });
      // Clear browser history stack
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = () => {
        navigate("/signin", { replace: true });
      };
    } catch (err) {
      console.error(err);
    }
  };

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

  // Main pages where back button should not show
  const mainPages = ["/", "/patient", "/doctor", "/signin", "/signup"];
  const isMainPage = mainPages.includes(location.pathname);

  return (
    <header className="w-full bg-[#d1f6ff] shadow-md z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14 md:h-16">
        <div className="flex items-center space-x-4">
          {!isMainPage && (
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
            <img
              src="/logo-banner.png"
              alt="MedHBook Logo"
              className="h-auto w-55 object-contain"
            />
          </Link>
        </div>

        {/* Desktop */}
        {user ? (
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation Links */}
            <Link
              to="/blogs"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              <BookOpen size={18} />
              Blogs
            </Link>
            <Link
              to="/search-doctor"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              <Search size={18} />
              Find Doctor
            </Link>
            <Link
              to="/chat"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              <MessageCircle size={18} />
              Chat
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
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
                  <p className="text-sm font-medium text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 break-all">
                    UID: {user.uid}
                  </p>
                </div>

                {(user.role === "doctor" ||
                  user.role === "admin" ||
                  isAdmin) && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/edit-doctor-profile");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition border-b border-gray-100"
                  >
                    Edit Profile
                  </button>
                )}

                {user.role === "user" && !isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/edit-user-profile");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition border-b border-gray-100"
                  >
                    Edit Profile
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition"
                >
                  Sign Out
                </button>
              </div>
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

              {(user.role === "doctor" || user.role === "admin" || isAdmin) && (
                <button
                  type="button"
                  onClick={() => {
                    navigate("/edit-doctor-profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition rounded"
                >
                  Edit Profile
                </button>
              )}

              {user.role === "user" && !isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    navigate("/edit-user-profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition rounded"
                >
                  Edit Profile
                </button>
              )}

              {/* Mobile Navigation Links */}
              <Link
                to="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2 hover:bg-[#d1f6ff]/60 transition rounded"
              >
                <BookOpen size={16} />
                Blogs
              </Link>
              <Link
                to="/search-doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2 hover:bg-[#d1f6ff]/60 transition rounded"
              >
                <Search size={16} />
                Find Doctor
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-700 px-4 py-2 hover:bg-[#d1f6ff]/60 transition rounded"
              >
                <MessageCircle size={16} />
                Chat
              </Link>

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
