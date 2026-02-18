import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Calendar, User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

const Blogs = () => {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("http://localhost:3000/blogs");
      setBlogs(response.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isDoctorOrAdmin = user?.role === "doctor" || user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] py-12 px-4 relative overflow-hidden animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent mb-2">
              Medical Blogs
            </h1>
            <p className="text-[#304d5d] font-medium">
              Latest updates and insights from our doctors
            </p>
          </div>

          {/* Create Blog Button (doctors only) */}
          {isDoctorOrAdmin && (
            <button
              onClick={() => navigate("/create-blog")}
              className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/30 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 hover:-translate-y-1"
            >
              <Plus size={20} />
              Create Blog
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No blogs yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#67cffe]/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-[#67cffe]/30 animate-scaleIn"
                onClick={() => navigate(`/blogs/${blog._id}`)}
              >
                {/* Blog Image */}
                {blog.image ? (
                  <img
                    src={`http://localhost:3000${blog.image}`}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-[#304d5d] to-[#67cffe] flex items-center justify-center">
                    <span className="text-white text-6xl font-bold">
                      {blog.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Blog Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#304d5d] mb-3 line-clamp-2 hover:text-[#67cffe] transition-colors duration-300">
                    {blog.title}
                  </h2>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.content}
                  </p>

                  {/* Author & Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{blog.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
