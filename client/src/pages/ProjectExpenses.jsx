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
            equipment: "bg-blue-100 text-blue-800 border border-blue-300",
            travel: "bg-green-100 text-green-800 border border-green-300",
            salary: "bg-purple-100 text-purple-800 border border-purple-300",
            consumables: "bg-yellow-100 text-yellow-800 border border-yellow-300",
            services: "bg-pink-100 text-pink-800 border border-pink-300",
            contingency: "bg-gray-100 text-gray-800 border border-gray-300",
        };
        return types[type.toLowerCase()] || "bg-gray-100 text-gray-800 border border-gray-300";
    };

    const calculateTotal = (expenses) => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2);
    };

    return (
        <div className="flex bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen text-slate-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={"/sanctionedproposals"} />

                <div className="p-6 md:p-8 pt-16 md:pt-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-blue-100">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-0">Project Expenses</h1>
                        <div className="mt-4 md:mt-0 bg-white shadow-lg rounded-xl p-1 flex flex-wrap gap-1">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "all" ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveTab("equipment")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "equipment" ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                Equipment
                            </button>
                            <button
                                onClick={() => setActiveTab("travel")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "travel" ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                Travel
                            </button>
                            <button
                                onClick={() => setActiveTab("salary")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "salary" ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                Salary
                            </button>
                            <button
                                onClick={() => setActiveTab("consumables")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "consumables" ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                Consumables
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p className="mt-4 text-slate-600 text-lg">No {activeTab !== "all" ? activeTab : ""} expenses found for this project.</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border-l-4 border-blue-600">
                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-slate-800">Expense Summary</h2>
                                        <p className="text-xl font-bold text-blue-700">
                                            Total: <span className="text-2xl">${calculateTotal(filteredExpenses)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Committed Date
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {filteredExpenses.map((expense) => (
                                                <tr key={expense._id} className="hover:bg-blue-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-slate-900">{expense.description}</div>
                                                        <div className="text-xs text-slate-500 mt-1">Created: {formatDate(expense.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getExpenseTypeColor(expense.type)}`}>
                                                            {expense.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {formatDate(expense.date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                        {formatDate(expense.committedDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-slate-900">${expense.amount.toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                                            onClick={() => handleViewComments(expense._id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                            </svg>
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
                                <div key={`view-comments-${expense._id}`} id={`view-comments-${expense._id}`} className="mt-6 bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-600 hidden">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-blue-700 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            Comments for: {expense.description}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                document.getElementById(`view-comments-${expense._id}`).classList.add("hidden");
                                            }}
                                            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    {commentsLoading[expense._id] ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
                                        </div>
                                    ) : commentsError[expense._id] ? (
                                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm">{commentsError[expense._id]}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : expenseComments[expense._id]?.length > 0 ? (
                                        <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                            {expenseComments[expense._id].map((comment) => (
                                                <li key={comment._id} className="p-4 border rounded-xl bg-blue-50 border-blue-100 shadow-sm">
                                                    <p className="text-slate-700">{comment.comment}</p>
                                                    <div className="flex items-center mt-3 text-xs text-slate-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span className="font-medium text-blue-600">{comment.userId?.Name || "Unknown"}</span>
                                                        <span className="mx-2">•</span>
                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{comment.role || "User"}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{new Date(comment.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <p className="text-slate-500 mt-4">No comments yet.</p>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <h4 className="text-md font-semibold text-blue-700 flex items-center mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Add New Comment
                                        </h4>
                                        <textarea
                                            rows="3"
                                            placeholder="Add your comment here..."
                                            value={comments[expense._id] || ""}
                                            onChange={(e) => handleCommentChange(expense._id, e.target.value)}
                                            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-blue-50 shadow-inner"
                                        ></textarea>
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleAddComment(expense._id)}
                                                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        Add Comment
                                                    </>
                                                )}
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