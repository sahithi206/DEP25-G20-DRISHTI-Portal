import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CommentsPage = () => {
  const { projectId, ucType } = useParams();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  const url = import.meta.env.VITE_REACT_APP_URL;

  useEffect(() => {
    const fetchComments = async () => {
        console.log(" comments display")
      try {
        const response = await fetch(`${url}uc-comments/${projectId}/${ucType}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: localStorage.getItem("token"),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          setFetchError(result.message || "Failed to fetch comments");
          return;
        }

        setComments(result.data);
      } catch (err) {
        console.error("Error fetching comments:", err.message);
        setFetchError("Failed to fetch comments");
      }
    };

    fetchComments();
  }, [projectId, ucType, url]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${url}uc-comments/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token"),
        },
        body: JSON.stringify({ projectId, ucType, comment: newComment }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        setError(result.message || "Failed to add comment");
        return;
      }

      setComments((prevComments) => [...prevComments, result.data]);
    //   setComments(result.data);
console.log("Fetched Comments:", result.data); 
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err.message);
      setError("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Comments for UC</h1>
        <p className="text-gray-600 mb-6">
          Project ID: <span className="font-semibold">{projectId}</span> | UC Type:{" "}
          <span className="font-semibold capitalize">{ucType}</span>
        </p>

        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Add your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          ></textarea>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            type="submit"
            className={`mt-4 px-6 py-2 rounded-lg text-white font-medium ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Add Comment"}
          </button>
        </form>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">All Comments</h2>
        {fetchError ? (
          <p className="text-red-500">{fetchError}</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment._id} className="p-4 border rounded-lg bg-gray-50">
                <p className="text-gray-700">{comment.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  By: {comment.userId?.Name || "Unknown"} ({comment.role}) |{" "}
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
    <button
      onClick={() => navigate(-1)} 
      className="mt-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg"
    >
      Back
    </button>
      </div>
    </div>
  );
};

export default CommentsPage;