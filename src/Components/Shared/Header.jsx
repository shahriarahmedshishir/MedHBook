// Header.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import AuthContext from "../Context/AuthContext";

const Header = () => {
  const { user: currentUser, loading, signOutUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${serverURL}/user`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Match current user
  const matchedUser = users.find((u) => u.email === currentUser?.email);
  const userUid = matchedUser?.uid;

  // Display name & image
  const displayName =
    matchedUser?.name || currentUser?.email?.split("@")[0] || "Guest";
  const userImage = matchedUser?.img
    ? `${serverURL}${matchedUser.img}`
    : "https://i.pravatar.cc/40?img=3";

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  // Prevent scroll
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  // Close dropdown on outside click / ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  if (loading) return null; // optional: show nothing while auth loading

  return (
    <header className="w-full bg-[#d1f6ff] shadow-md z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14 md:h-16">
        <Link to="/" className="flex-shrink-0">
          <Logo />
        </Link>

        <div
          className="hidden md:flex items-center space-x-3 relative"
          ref={dropdownRef}
        >
          <p className="text-sm font-medium text-gray-800 select-none">
            Hi, I am {displayName}.
          </p>

          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <img
              src={userImage}
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

        <button
          type="button"
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
