import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
import axios from "axios";
import { format } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_URL;

const ProjectExpenses = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { projectId } = useParams();
    const [expenses, setExpenses] = useState([]);
    const [comments, setComments] = useState({});
    const [expenseComments, setExpenseComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentsLoading, setCommentsLoading] = useState({});
    const [commentsError, setCommentsError] = useState({});
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}institute/expenses/${projectId}`);
                setExpenses(response.data);
                console.log("Expenses:", response.data);
            } catch (err) {
                console.error("Error fetching expenses:", err);
                setError("Failed to load expenses. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [projectId]);

    const handleCommentChange = (expenseId, value) => {
        setComments((prev) => ({ ...prev, [expenseId]: value }));
    };

    const handleAddComment = async (expenseId) => {
        setLoading(true);
        setError("");
        const commentText = comments[expenseId]?.trim();
        if (!commentText) return alert("Please enter a comment!");

        try {
            const response = await fetch(`${API_BASE_URL}expense-comments/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: localStorage.getItem("token"),
                },
                body: JSON.stringify({ expenseId, comment: commentText }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                setError(result.message || "Failed to add comment");
                return;
            }

            alert("Comment added successfully!");
            setComments((prev) => ({ ...prev, [expenseId]: "" }));

            // Refresh comments for this expense
            fetchCommentsForExpense(expenseId);
        } catch (err) {
            console.error("Error adding comment:", err);
            alert("Failed to add comment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCommentsForExpense = async (expenseId) => {
        setCommentsLoading(prev => ({ ...prev, [expenseId]: true }));
        setCommentsError(prev => ({ ...prev, [expenseId]: "" }));

        try {
            const response = await fetch(`${API_BASE_URL}expense-comments/${expenseId}`, {
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

            console.log("Data:::", result);
            if (!result.success) {
                setCommentsError(prev => ({
                    ...prev,
                    [expenseId]: result.message || "Failed to fetch comments"
                }));
                return;
            }

            setExpenseComments(prev => ({
                ...prev,
                [expenseId]: result.data || []
            }));
        } catch (err) {
            console.error("Error fetching comments:", err);
            setCommentsError(prev => ({
                ...prev,
                [expenseId]: "Failed to fetch comments. Please try again."
            }));
        } finally {
            setCommentsLoading(prev => ({ ...prev, [expenseId]: false }));
        }
    };

    const handleViewComments = (expenseId) => {
        // Fetch comments for this expense if not already loaded
        if (!expenseComments[expenseId]) {
            fetchCommentsForExpense(expenseId);
        }

        // Toggle the visibility of the comments section
        document.getElementById(`view-comments-${expenseId}`).classList.toggle("hidden");
    };

    const filteredExpenses = activeTab === "all"
        ? expenses
        : expenses.filter(expense => expense.type.toLowerCase() === activeTab);

    const formatDate = (dateStr) => {
        try {
            return format(new Date(dateStr), "MMM dd, yyyy");
        } catch (error) {
            return "Invalid date";
        }
    };

    const getExpenseTypeColor = (type) => {
        const types = {
            equipment: "bg-blue-100 text-blue-800",
            travel: "bg-green-100 text-green-800",
            salary: "bg-purple-100 text-purple-800",
            consumables: "bg-yellow-100 text-yellow-800",
            services: "bg-pink-100 text-pink-800",
            contingency: "bg-gray-100 text-gray-800",
        };
        return types[type.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    const calculateTotal = (expenses) => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2);
    };

    return (
        <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen text-slate-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={"/sanctionedproposals"} />

                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-800">Project Expenses</h1>
                        <div className="mt-4 md:mt-0 bg-white shadow rounded-lg p-2 flex">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "all" ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveTab("equipment")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "equipment" ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                Equipment
                            </button>
                            <button
                                onClick={() => setActiveTab("travel")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "travel" ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                Travel
                            </button>
                            <button
                                onClick={() => setActiveTab("salary")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "salary" ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                Salary
                            </button>
                            <button
                                onClick={() => setActiveTab("consumables")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === "consumables" ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                Consumables
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
                            <p>{error}</p>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                            <p className="text-slate-600">No {activeTab !== "all" ? activeTab : ""} expenses found for this project.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                                <div className="p-4 bg-slate-50 border-b border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-slate-700">Expense Summary</h2>
                                        <p className="text-lg font-bold text-slate-800">
                                            Total: ${calculateTotal(filteredExpenses)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Committed Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {filteredExpenses.map((expense) => (
                                                <tr key={expense._id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-slate-900">{expense.description}</div>
                                                        <div className="text-sm text-slate-500">Created: {formatDate(expense.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getExpenseTypeColor(expense.type)}`}>
                                                            {expense.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {formatDate(expense.date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {formatDate(expense.committedDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                        ${expense.amount.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                                                        <button
                                                            type="button"
                                                            className="text-green-600 hover:text-green-900"
                                                            onClick={() => handleViewComments(expense._id)}
                                                        >
                                                            View/Add Comments
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* View Comments sections */}
                            {filteredExpenses.map((expense) => (
                                <div key={`view-comments-${expense._id}`} id={`view-comments-${expense._id}`} className="mt-2 bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-700 hidden">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-blue-700">Comments for: {expense.description}</h3>
                                        <button
                                            onClick={() => {
                                                document.getElementById(`view-comments-${expense._id}`).classList.add("hidden");
                                            }}
                                            className="p-1 rounded-full hover:bg-slate-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    {commentsLoading[expense._id] ? (
                                        <div className="flex justify-center items-center h-24">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                                        </div>
                                    ) : commentsError[expense._id] ? (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                            <p>{commentsError[expense._id]}</p>
                                        </div>
                                    ) : expenseComments[expense._id]?.length > 0 ? (
                                        <ul className="space-y-4 max-h-96 overflow-y-auto">
                                            {expenseComments[expense._id].map((comment) => (
                                                <li key={comment._id} className="p-4 border rounded-lg bg-gray-50">
                                                    <p className="text-gray-700">{comment.comment}</p>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        By: {comment.userId?.Name || "Unknown"} ({comment.role || "User"}) |{" "}
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-center py-6">No comments yet.</p>
                                    )}

                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <h4 className="text-md font-semibold text-blue-700 mb-3">Add New Comment</h4>
                                        <textarea
                                            rows="3"
                                            placeholder="Add your comment here..."
                                            value={comments[expense._id] || ""}
                                            onChange={(e) => handleCommentChange(expense._id, e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                                        ></textarea>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleAddComment(expense._id)}
                                                className="px-6 py-2 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                disabled={loading}
                                            >
                                                {loading ? "Submitting..." : "Add Comment"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectExpenses;