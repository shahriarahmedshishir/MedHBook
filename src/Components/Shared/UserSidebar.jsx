import React, { useContext, useState } from "react";
import { User, LogOut, Settings, Heart, FileText, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const UserSidebar = () => {
  const { user, signOutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await signOutUser();
    navigate("/signin");
  };

  const userLinks = [
    { label: "Profile", icon: User, href: "/patient/edit-profile" },
    {
      label: "Appointments",
      icon: FileText,
      href: "/patient/appointments",
    },
    { label: "Settings", icon: Settings, href: "/patient/edit-profile" },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-40 md:hidden bg-[#304d5d] text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-[#304d5d] to-[#1a3a47] text-white shadow-2xl transform transition-all duration-500 ease-out z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-all"
        >
          <X size={24} />
        </button>

        {/* User Profile Section */}
        <div className="p-6 border-b border-white/10 mt-8 md:mt-0">
          <div className="flex items-center gap-3 mb-4">
            {user?.img ? (
              <img
                src={
                  user.img.startsWith("http")
                    ? user.img
                    : `${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}${user.img}`
                }
                alt={user?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#67cffe]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#67cffe] flex items-center justify-center">
                <User size={20} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-[#b2ebf2] truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {userLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all duration-300 group"
            >
              <link.icon
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-medium text-sm">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm transition-all duration-300 group"
          >
            <LogOut
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Spacer */}
      <div className="hidden md:block w-64" />
    </>
  );
};

export default UserSidebar;
