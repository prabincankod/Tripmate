import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/apiUtiles";
import BlogCard from "../../pages/explorepage/blog/BlogCard";
import Loader from "../../components/common/Loader"
import toast from "react-hot-toast";

const TravelBlogsSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ for navigation

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs");
        const blogData = res.data?.data || [];
        // Sort newest first and take 4
        const sorted = blogData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);
        setBlogs(sorted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load travel blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleReadMore = (id) => {
    navigate(`/blogs/${id}`); // ✅ navigate to blog details page
  };

  if (loading) return <Loader />;

  if (!blogs || blogs.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>No travel blogs found. Be the first to share your journey!</p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-green-900 mb-8 text-center">
        Travel Blogs
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {blogs.map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            onReadMore={handleReadMore} // ✅ pass the callback
          />
        ))}
      </div>

      {blogs.length > 0 && (
        <div className="mt-8 flex justify-center">
        
        </div>
      )}
    </section>
  );
};

export default TravelBlogsSection;

