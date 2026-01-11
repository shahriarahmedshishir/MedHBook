import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ArrowLeft, Calendar, User, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

const BlogDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/blogs/${id}`);
      setBlog(response.data);
    } catch (err) {
      console.error("Error fetching blog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`http://localhost:3000/blogs/${id}`);
      navigate("/blogs");
    } catch (err) {
      console.error("Error deleting blog:", err);
      alert("Failed to delete blog");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canDelete = user?.email === blog?.authorEmail || user?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading blog...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Blog not found</p>
          <button
            onClick={() => navigate("/blogs")}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/blogs")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Blogs
          </button>
        </div>

        {/* Blog Content */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {blog.image && (
            <img
              src={`http://localhost:3000${blog.image}`}
              alt={blog.title}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-8">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span className="font-semibold">{blog.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </div>

              {/* Delete Button (author or admin only) */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
