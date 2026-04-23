import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Calendar, User, Plus, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

const Blogs = () => {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [pendingBlogs, setPendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPending, setShowPending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get("http://localhost:3000/blogs");
      // Filter approved blogs for public view
      const approvedBlogs = response.data.filter(
        (blog) => blog.approved === true || blog.approvalStatus === "approved",
      );
      setBlogs(approvedBlogs);

      // If admin, also get pending blogs
      if (user?.role === "admin") {
        const pendingBlogsList = response.data.filter(
          (blog) =>
            blog.approved !== true && blog.approvalStatus !== "approved",
        );
        setPendingBlogs(pendingBlogsList);
      }
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
  const isAdmin = user?.role === "admin";

  const handleApproveBlog = async (blogId) => {
    try {
      await axios.patch(`http://localhost:3000/blogs/${blogId}`, {
        approved: true,
        approvalStatus: "approved",
      });
      fetchBlogs();
    } catch (err) {
      console.error("Error approving blog:", err);
    }
  };

  const handleRejectBlog = async (blogId) => {
    try {
      await axios.patch(`http://localhost:3000/blogs/${blogId}`, {
        approved: false,
        approvalStatus: "rejected",
      });
      fetchBlogs();
    } catch (err) {
      console.error("Error rejecting blog:", err);
    }
  };

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

        {/* Admin Pending Blogs Tab */}
        {isAdmin && pendingBlogs.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowPending(!showPending)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                showPending
                  ? "bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white shadow-lg"
                  : "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
              }`}
            >
              <Clock size={18} />
              Pending Approval ({pendingBlogs.length})
            </button>
          </div>
        )}

        {/* Pending Blogs Section (Admin Only) */}
        {isAdmin && showPending && pendingBlogs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#304d5d] mb-6">
              Blogs Awaiting Approval
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pendingBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-yellow-200 hover:shadow-2xl hover:shadow-[#67cffe]/20 transition-all duration-300 transform hover:-translate-y-2 animate-scaleIn relative"
                >
                  {/* Pending Badge */}
                  <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Pending
                  </div>

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
                    <h2 className="text-xl font-bold text-[#304d5d] mb-3 line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {blog.content}
                    </p>

                    {/* Author & Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 border-t pt-4">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{blog.authorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveBlog(blog._id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectBlog(blog._id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Blogs Section */}
        <div>
          <h2 className="text-2xl font-bold text-[#304d5d] mb-6">
            {showPending ? "Approved Blogs" : "All Blogs"}
          </h2>

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
                    {/* Approved Badge */}
                    <div className="flex items-center gap-2 mb-3 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-xs font-bold">Approved</span>
                    </div>

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
    </div>
  );
};

export default Blogs;
