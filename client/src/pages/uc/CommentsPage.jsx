// This file is for managing and displaying comments related to Utilization Certificates (UCs), including adding and viewing comments.

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../utils/Sidebar";
import HomeNavbar from "../../utils/HomeNavbar";

const CommentsPage = () => {
  const { projectId, ucType } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  const url = import.meta.env.VITE_REACT_APP_URL;

  useEffect(() => {
    const fetchComments = async () => {
      console.log("comments display");
      try {
        const response = await fetch(`${url}uc-comments/${projectId}/${ucType}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // accessToken: localStorage.getItem("token"),
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
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div
        className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"
          }`}
      >
        <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${projectId}`} />
        <div className="p-6 space-y-6 mt-16">
          <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                                                          <img src="/3.png" alt="DRISHTI: OneRND India Logo" className="mx-auto w-84 h-32 object-contain" />
            <p className="mt-3 text-2xl font-bold text-blue-800">
              Comments for Utilization Certificate
            </p>
            <p className="text-gray-600 mt-2">
              Project ID: <span className="font-semibold">{projectId}</span> | UC Type:{" "}
              <span className="font-semibold capitalize">{ucType}</span>
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-800">
            <h2 className="text-lg font-semibold text-blue-700 mb-4">Add Comment</h2>
            <form onSubmit={handleAddComment}>
              <textarea
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Add your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              ></textarea>
              {error && <p className="text-red-500 mt-2">{error}</p>}
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className={`px-6 py-2 rounded-lg text-white font-medium ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Add Comment"}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-800">
            <h2 className="text-lg font-semibold text-blue-700 mb-4">All Comments</h2>
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
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate(`/uc/${projectId}`)}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg"
            >
              Back to UC Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPage;