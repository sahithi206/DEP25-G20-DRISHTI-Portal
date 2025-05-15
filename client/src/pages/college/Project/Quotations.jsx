// This file is for managing and displaying quotations, including filtering, sorting, and resolving comments.

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/InstituteSidebar";
import HomeNavbar from "../../../components/Navbar";
import { toast } from "react-toastify";

const UploadDocuments = () => {
    const [activeSection, setActiveSection] = useState("projects");
    const { id } = useParams();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [comments, setComments] = useState([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [schemeFilter, setSchemeFilter] = useState("");
  const [instituteFilter, setInstituteFilter] = useState("");

  const URL = import.meta.env.VITE_REACT_APP_URL;

  const filteredQuotations = quotations.filter((q) => {
    const schemeMatch = schemeFilter ? q.scheme === schemeFilter : true;
    const instituteMatch = instituteFilter ? q.Title?.toLowerCase().includes(instituteFilter.toLowerCase()) : true;
    return schemeMatch && instituteMatch;
  });
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const uniqueSchemes = [...new Set(quotations.map(q => q.scheme))];
        setSchemes(uniqueSchemes);
      } catch (err) {
        console.error("Failed to extract schemes:", err);
      }
    };
    fetchSchemes();
  }, [quotations]);
  const [sortOrder, setSortOrder] = useState("desc");
  const handleSort = () => {
    const sortedQuotations = [...quotations].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setQuotations(sortedQuotations);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  useEffect(() => {
    const fetchQuotations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${URL}quotations/institute/get-quotations/${id}`, {
          method: "GET",
          headers: { accessToken: token },
        });
        const data = await response.json();
        setQuotations(data.quotations || []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchQuotations();
  }, []);

  const fetchComments = async (quotationId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view comments.");
      return;
    }

    try {
      const res = await fetch(`${URL}quotations/comments/${quotationId}`, {
        method: "GET",
        headers: { accessToken: token },
      });

      const data = await res.json();
      setComments(data.comment);
      console.log(data.comment);
    } catch (err) {
      setError("Failed to fetch comments");
      console.error(err);
    }
  };

  const handleResolveComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${URL}quotations/update-comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "accessToken": token,
        },
        body: JSON.stringify({ status: "Resolved" }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Comment marked as resolved!");
      } else {
        toast.error(data.msg || "Failed to update comment");
      }
    } catch (err) {
      toast.error("An error occurred while updating the comment");
    }
  };



  return (
    <div className="flex flex-col min-h-screen">
    <HomeNavbar yes={1} />
    <div className="flex flex-grow">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="p-6 space-y-6 mt-5 mr-9 ml-9 flex-grow">
      <div className="bg-white shadow-md rounded-xl p-6 border-l-8 border-teal-600">
            <h1 className="text-3xl font-black text-center text-gray-900 mb-2">View Quotations</h1>
          </div>
         
            <div className="flex justify-end gap-8 p-1">

              <select
                value={schemeFilter}
                onChange={(e) => setSchemeFilter(e.target.value)}
                className="px-4  py-2  border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Schemes</option>
                {(schemes || []).map((scheme, idx) => (
                  <option key={idx} value={scheme}>{scheme}</option>
                ))}
              </select>

              <button
                onClick={handleSort}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Sort by Date
              </button>

            </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
           
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left border border-gray-200" >File. No</th>
                    <th className="p-3 text-left border border-gray-200">Scheme</th>
                    <th className="p-3 text-left border border-gray-200">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-200 text-blue-600 underline" onClick={() => {
                        setSelectedQuotation(q);
                        navigate(`/institute/Quotation/${q._id}`);
                      }}>{q._id}</td>
                      <td className="p-3 border border-gray-200" onClick={() => {
                        setSelectedQuotation(q);
                        navigate(`/institute/Quotation/${q._id}`);
                      }}>{q.scheme || "N/A"}</td>
                      <td className="p-3 border border-gray-200" onClick={() => {
                        setSelectedQuotation(q);
                        navigate(`/institute/Quotation/${q._id}`);
                      }}>{q?.Title || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;