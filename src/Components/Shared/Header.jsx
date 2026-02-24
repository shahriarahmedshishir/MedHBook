import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  ArrowLeft,
  MessageCircle,
  Search,
  BookOpen,
  Info,
  User,
  LogOut,
  ChevronDown,
  Home,
  CalendarCheck,
} from "lucide-react";
import AuthContext from "../Context/AuthContext";

// Helper to get full image URL
const getFullImageURL = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http")) return imgPath; // already full URL
  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  return `${serverURL}${imgPath}`;
};

const Header = () => {
  const { user, loading, signOutUser, isAdmin, refreshUser } =
    useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);
  const hasRefreshed = useRef(false); // Track if we've done initial refresh
  const navigate = useNavigate();
  const location = useLocation();

  // Construct user image URL same as edit profile pages
  const userImageURL = user?.img
    ? user.img.startsWith("http")
      ? user.img
      : `${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}${user.img}`
    : null;

  // Force refresh user data when user email is available (only once)
  useEffect(() => {
    if (user?.email && refreshUser && !hasRefreshed.current) {
      console.log("Header - Initial refresh triggered for:", user.email);
      refreshUser();
      hasRefreshed.current = true;
    }
  }, [user?.email, refreshUser]); // Trigger when user email becomes available

  // Debug: Log user image info
  useEffect(() => {
    console.log("Header - user object:", user);
    console.log("Header - user.img:", user?.img);
    console.log("Header - constructed URL:", userImageURL);
    // Reset image error state when user changes
    setImageError(false);
  }, [user, userImageURL]);

  const handleImageError = (e) => {
    console.error("Failed to load image:", userImageURL);
    console.error("Image error event:", e);
    // Show fallback instead
    setImageError(true);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  if (loading) return null;

  // Main pages where back button should not show
  const mainPages = ["/", "/patient", "/doctor", "/signin", "/signup"];
  const isMainPage = mainPages.includes(location.pathname);

  return (
    <header className="w-full bg-gradient-to-r from-[#d1f6ff] via-white to-[#d1f6ff] shadow-lg z-50 border-b-2 border-[#67cffe]/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14 md:h-16">
        <div className="flex items-center space-x-4">
          {!isMainPage && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white hover:bg-[#67cffe]/10 hover:shadow-md transition-all duration-300 hover:-translate-x-1 group"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-[#304d5d] group-hover:text-[#67cffe]" />
            </button>
          )}

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 transform hover:scale-105 transition-transform duration-300"
          >
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
              to="/"
              className="flex items-center gap-2 text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 hover:-translate-y-0.5 relative group"
            >
              <Home
                size={18}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#67cffe] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/blogs"
              className="flex items-center gap-2 text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 hover:-translate-y-0.5 relative group"
            >
              <BookOpen
                size={18}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              Blogs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#67cffe] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/search-doctor"
              className="flex items-center gap-2 text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 hover:-translate-y-0.5 relative group"
            >
              <Search
                size={18}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              Find Doctor
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#67cffe] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center gap-2 text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 hover:-translate-y-0.5 relative group"
            >
              <MessageCircle
                size={18}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              Chat
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#67cffe] group-hover:w-full transition-all duration-300"></span>
            </Link>
            {/* Patient Appointments - Only visible to users */}
            {user?.role === "user" && (
              <Link
                to="/patient/appointments"
                className="flex items-center gap-2 text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 hover:-translate-y-0.5 relative group"
              >
                <CalendarCheck
                  size={18}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                My Appointments
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#67cffe] group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {/* Doctor Appointments - Only visible to doctors */}
            {(user?.role === "doctor" || isAdmin) && (
              <Link
                to="/doctor/appointments"
                className="flex items-center gap-2 text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 hover:-translate-y-0.5 relative group"
              >
                <CalendarCheck
                  size={18}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                Appointments
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#67cffe] group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {/* About Us - Only visible to doctors and admins */}
            {(user?.role === "doctor" || user?.role === "admin" || isAdmin) && (
              <Link
                to="/about-us"
                className="flex items-center gap-2 text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 hover:-translate-y-0.5 relative group"
              >
                <Info
                  size={18}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                About Us
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#67cffe] group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={toggleDropdown}
                className="flex items-center gap-2 group hover:bg-[#67cffe]/10 rounded-full pr-3 transition-all duration-300"
              >
                {userImageURL && !imageError ? (
                  <img
                    src={userImageURL}
                    alt="Profile"
                    onError={handleImageError}
                    className="w-10 h-10 rounded-full border-2 border-[#67cffe] object-cover ring-2 ring-transparent group-hover:ring-[#67cffe]/30 transition-all duration-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-[#67cffe] bg-gradient-to-br from-[#67cffe] to-[#304d5d] flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#67cffe]/30 transition-all duration-300">
                    <span className="text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-[#304d5d] transition-transform duration-300 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border-2 border-[#67cffe]/30 bg-white shadow-2xl overflow-hidden animate-slideDown z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-4 bg-gradient-to-br from-[#67cffe]/20 via-[#67cffe]/10 to-transparent border-b-2 border-[#67cffe]/20">
                    <div className="flex items-center gap-3">
                      {userImageURL && !imageError ? (
                        <img
                          src={userImageURL}
                          alt="Profile"
                          onError={handleImageError}
                          className="w-12 h-12 rounded-full border-2 border-[#67cffe] object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-[#67cffe] bg-gradient-to-br from-[#67cffe] to-[#304d5d] flex items-center justify-center shadow-md">
                          <span className="text-white text-lg font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#304d5d] truncate">
                          {user.name}
                        </p>
                        {user.email && (
                          <p className="text-xs text-gray-600 truncate">
                            {user.email}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 truncate">
                          UID: {user.uid}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {(user.role === "doctor" ||
                      user.role === "admin" ||
                      isAdmin) && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/edit-doctor-profile");
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#304d5d] hover:bg-gradient-to-r hover:from-[#67cffe]/20 hover:to-[#67cffe]/5 transition-all duration-200 group"
                      >
                        <User className="w-4 h-4 text-[#67cffe] group-hover:scale-110 transition-transform duration-200" />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          Edit Profile
                        </span>
                      </button>
                    )}

                    {user.role === "user" && !isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/edit-user-profile");
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#304d5d] hover:bg-gradient-to-r hover:from-[#67cffe]/20 hover:to-[#67cffe]/5 transition-all duration-200 group"
                      >
                        <User className="w-4 h-4 text-[#67cffe] group-hover:scale-110 transition-transform duration-200" />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          Edit Profile
                        </span>
                      </button>
                    )}

                    <div className="h-px bg-gradient-to-r from-transparent via-[#67cffe]/30 to-transparent my-2"></div>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        Sign Out
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link
            to="/signin"
            className="hidden md:block text-sm font-semibold text-[#304d5d] hover:text-[#67cffe] transition-all duration-300 px-4 py-2 rounded-lg hover:bg-[#67cffe]/10"
          >
            Sign In
          </Link>
        )}

        {/* Mobile */}
        <div className="md:hidden relative" ref={mobileRef}>
          <button
            type="button"
            className="text-[#304d5d] hover:text-[#67cffe] p-2 rounded-lg hover:bg-[#67cffe]/10 transition-all duration-300"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {mobileMenuOpen && user && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-sm border-2 border-[#67cffe]/20 rounded-xl shadow-2xl p-4 space-y-2 z-50 animate-scaleIn">
              <div className="flex items-center space-x-3 border-b-2 border-gray-200 pb-3 bg-gradient-to-r from-[#67cffe]/10 to-transparent p-2 rounded-lg">
                {userImageURL && !imageError ? (
                  <img
                    src={userImageURL}
                    alt="Profile"
                    onError={handleImageError}
                    className="w-10 h-10 rounded-full border-2 border-[#67cffe] object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-[#67cffe] bg-gradient-to-br from-[#67cffe] to-[#304d5d] flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#304d5d]">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-600">UID: {user.uid}</p>
                </div>
              </div>

              {(user.role === "doctor" || user.role === "admin" || isAdmin) && (
                <button
                  type="button"
                  onClick={() => {
                    navigate("/edit-doctor-profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#304d5d] hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg"
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
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#304d5d] hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg"
                >
                  Edit Profile
                </button>
              )}

              {/* Mobile Navigation Links */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg group"
              >
                <Home
                  size={16}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                Home
              </Link>
              {/* Patient Appointments - Only visible to users (mobile) */}
              {user.role === "user" && (
                <Link
                  to="/patient/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg group"
                >
                  <CalendarCheck
                    size={16}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  My Appointments
                </Link>
              )}
              {/* Doctor Appointments - Only visible to doctors (mobile) */}
              {(user.role === "doctor" || isAdmin) && (
                <Link
                  to="/doctor/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg group"
                >
                  <CalendarCheck
                    size={16}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  Appointments
                </Link>
              )}
              <Link
                to="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg group"
              >
                <BookOpen
                  size={16}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                Blogs
              </Link>
              <Link
                to="/search-doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg group"
              >
                <Search
                  size={16}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                Find Doctor
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg group"
              >
                <MessageCircle
                  size={16}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                Chat
              </Link>
              {/* About Us - Only visible to doctors and admins */}
              {(user.role === "doctor" || user.role === "admin" || isAdmin) && (
                <Link
                  to="/about-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg group"
                >
                  <Info
                    size={16}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  About Us
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 border-t-2 border-gray-200 hover:bg-red-50 transition-all duration-300 rounded-lg mt-2"
              >
                Sign Out
              </button>
            </div>
          )}

          {!user && mobileMenuOpen && (
            <div className="absolute right-0 top-full mt-3 w-40 bg-white/95 backdrop-blur-sm border-2 border-[#67cffe]/20 rounded-xl shadow-2xl p-2 animate-scaleIn">
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#304d5d] px-4 py-2.5 hover:bg-[#67cffe]/10 transition-all duration-300 rounded-lg"
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
