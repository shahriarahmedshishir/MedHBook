import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  // Handle outside click + ESC key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
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

  return (
    <header className=" w-full bg-[#d1f6ff] shadow-md z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14 md:h-16">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <Logo />
        </Link>

        {/* Desktop / Tablet Profile Section */}
        <div
          className="hidden md:flex items-center space-x-3 relative"
          ref={dropdownRef}
        >
          <p className="text-sm font-medium text-gray-800 select-none">
            Hi, I am Rahim.
          </p>

          {/* Profile Button */}
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="focus:outline-none"
          >
            <img
              src="https://i.pravatar.cc/40?img=3"
              alt="Profile"
              className="w-10 h-10 rounded-full border border-gray-300 object-cover hover:ring-2 hover:ring-[#7edff5] transition"
            />
          </button>

          {/* Dropdown Menu */}
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
              onClick={() => {
                setDropdownOpen(false);
                console.log("Sign out clicked");
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#d1f6ff]/60 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#d1f6ff]/95 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 text-gray-800 text-center transition-all duration-200 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <button
          type="button"
          className="absolute top-5 right-5 text-gray-700"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>

        <img
          src="https://i.pravatar.cc/100?img=3"
          alt="Profile"
          className="w-24 h-24 rounded-full border border-gray-300 object-cover shadow-md"
        />
        <p className="text-lg font-semibold">Hi, I am Rahim.</p>

        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            console.log("Sign out clicked");
          }}
          className="px-6 py-2 bg-white text-gray-800 border border-gray-300 rounded-full text-sm font-medium hover:bg-[#b9f2ff] transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
