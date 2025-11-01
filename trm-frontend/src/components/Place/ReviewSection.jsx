import React, { useEffect, useState } from "react";
import { Star, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ReviewSection = ({ type, itemId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Normalize type for backend
  const normalizedType = type.toLowerCase() === "hotel" ? "Hotel" : "Place";

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/reviews?type=${normalizedType}&id=${itemId}`
      );
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (itemId) fetchReviews();
  }, [itemId]);

  // Add or update review
  const handleSubmit = async () => {
    if (!newRating) {
      alert("Please select a rating before submitting your review.");
      return;
    }

    if (!newComment.trim()) {
      alert("Please write a comment before submitting.");
      return;
    }

    setLoading(true);

    try {
      const url = editingReview
        ? `http://localhost:4000/api/reviews/${editingReview._id}`
        : "http://localhost:4000/api/reviews/";
      const method = editingReview ? "PATCH" : "POST";

      const body = editingReview
        ? { rating: newRating, comment: newComment }
        : { type: normalizedType, id: itemId, rating: newRating, comment: newComment };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        // Optimistically add or update review
        if (editingReview) {
          setReviews((prev) =>
            prev.map((r) => (r._id === data.review._id ? data.review : r))
          );
        } else {
          setReviews((prev) => [data.review, ...prev]);
        }

        setNewComment("");
        setNewRating(0);
        setEditingReview(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete review
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (rev) => {
    setEditingReview(rev);
    setNewComment(rev.comment || "");
    setNewRating(rev.rating || 0);
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold">Traveler Reviews</h2>

      {/* Add/Edit Review */}
      {user && (
        <div className="p-4 border rounded-lg shadow-sm w-full md:w-2/3">
          <h3 className="font-semibold mb-2">
            {editingReview ? "Edit Your Review" : "Add a Review"}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-6 h-6 cursor-pointer ${
                  i <= newRating ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setNewRating(i)}
              />
            ))}
          </div>
          <textarea
            placeholder="Write your review..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            rows={4}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {editingReview ? "Update Review" : "Submit Review"}
            </button>
            {editingReview && (
              <button
                onClick={() => {
                  setEditingReview(null);
                  setNewComment("");
                  setNewRating(0);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && (
        <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
      )}

      <div className="flex flex-col gap-4">
        {reviews.map((rev) => {
          const reviewUserId =
            typeof rev.user === "object" ? rev.user._id?.toString() : rev.user?.toString();
          const isOwner = user?._id === reviewUserId;

          return (
            <div key={rev._id} className="p-4 border rounded-lg shadow hover:shadow-md transition relative bg-white">
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-white">
                    {rev.user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-semibold">{rev.user?.name || "User"}</p>
                    {rev.createdAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex gap-2">
                    <Edit className="w-4 h-4 cursor-pointer text-blue-600" onClick={() => startEdit(rev)} />
                    <Trash2 className="w-4 h-4 cursor-pointer text-red-600" onClick={() => handleDelete(rev._id)} />
                  </div>
                )}
              </div>

              {/* Rating */}
              {rev.rating != null && rev.rating > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i <= rev.rating ? "text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              )}

              {/* Comment */}
              <p className="text-gray-700">{rev.comment}</p>
              {rev.relatedName && <small className="text-gray-500 block mt-1">For: {rev.relatedName}</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSection;


