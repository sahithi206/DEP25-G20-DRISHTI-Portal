import { useState, useEffect, useMemo } from "react";
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
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortOption, setSortOption] = useState("newest");
    const [searchTerm, setSearchTerm] = useState("");

    const expenseTypes = [
        { id: "all", label: "All" },
        { id: "equipment", label: "Equipment" },
        { id: "travel", label: "Travel" },
        { id: "salary", label: "Salary" },
        { id: "consumables", label: "Consumables" },
        { id: "pending", label: "Pending" }
    ];

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}institute/expenses/${projectId}`);
                setExpenses(response.data);
            } catch (err) {
                setError("Failed to load expenses. Please try again.");
                console.error("Error fetching expenses:", err);
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

        if (!commentText) {
            alert("Please enter a comment!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}expense-comments/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: localStorage.getItem("token"),
                },
                body: JSON.stringify({ expenseId, comment: commentText }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (!result.success) {
                setCommentsError(prev => ({ ...prev, [expenseId]: result.message || "Failed to fetch comments" }));
                return;
            }

            setExpenseComments(prev => ({ ...prev, [expenseId]: result.data || [] }));
        } catch (err) {
            console.error("Error fetching comments:", err);
            setCommentsError(prev => ({ ...prev, [expenseId]: "Failed to fetch comments. Please try again." }));
        } finally {
            setCommentsLoading(prev => ({ ...prev, [expenseId]: false }));
        }
    };

    const handleViewComments = (expense) => {
        setSelectedExpense(expense);
        if (!expenseComments[expense._id]) fetchCommentsForExpense(expense._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedExpense(null);
    };

    const formatDate = (dateStr) => {
        try {
            return format(new Date(dateStr), "MMM dd, yyyy");
        } catch {
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

    const sortExpenses = (expensesToSort) => {
        return [...expensesToSort].sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return sortOption === "newest" ? dateB - dateA : dateA - dateB;
        });
    };

    const filteredExpenses = useMemo(() => {
        let filtered = expenses;

        if (activeTab === "pending") {
            filtered = filtered.filter(expense => !expense.date);
        } else if (activeTab !== "all") {
            filtered = filtered.filter(expense => expense.type.toLowerCase() === activeTab.toLowerCase());
        }

        if (searchTerm.trim()) {
            filtered = filtered.filter(expense =>
                expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.amount?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                (expense.date?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || "Pending Transaction".toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return sortExpenses(filtered);
    }, [expenses, activeTab, sortOption, searchTerm]);


    const pendingTransactions = useMemo(() =>
        expenses.filter(expense => !expense.date),
        [expenses]
    );

    const totalPendingAmount = useMemo(() =>
        pendingTransactions.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2),
        [pendingTransactions]
    );

    return (
        <div className="flex bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen text-slate-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${projectId}`} />

                <div className="p-6 md:p-8 pt-16 md:pt-20">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-blue-100">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-0">
                            Project Expenses
                        </h1>
                        <div className="mt-4 md:mt-0 bg-white shadow-lg rounded-xl p-1 flex flex-wrap gap-1">
                            {expenseTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setActiveTab(type.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === type.id
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                        : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
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
                    ) : expenses.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-slate-600 text-lg">
                                No {activeTab !== "all" ? activeTab : ""} expenses found for this project.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border-l-4 border-blue-600">
                                <div className="p-6 bg-white rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-slate-800">Expense Summary</h2>
                                        <p className="text-xl font-bold text-blue-700">
                                            Total: <span className="text-2xl">₹{calculateTotal(filteredExpenses)}</span>
                                            {activeTab !== "pending" && pendingTransactions.length > 0 && (
                                                <span className="ml-4 text-sm font-normal text-gray-500">
                                                    (Pending: ₹{totalPendingAmount})
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-6">
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search by description or Amount..."
                                        className="mb-4 p-2 border border-slate-300 rounded-md w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-1 right-2 flex items-center text-gray-700">
                                        <span aria-hidden="true" className="material-icons text-gray-700">

                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Committed Date
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {filteredExpenses.map((expense) => (
                                                <tr key={expense._id} className="hover:bg-blue-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <div className="text-sm font-medium text-slate-900">{expense.description}</div>
                                                        <div className="text-xs text-slate-500 mt-1">Created: {formatDate(expense.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getExpenseTypeColor(expense.type)}`}>
                                                            {expense.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4  text-center whitespace-nowrap text-sm text-slate-600">
                                                        {expense.date ? (
                                                            formatDate(expense.date)
                                                        ) : (
                                                            <span className="px-3 py-1 text-center inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                                                                Pending Transaction
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-slate-600">
                                                        {formatDate(expense.committedDate)}
                                                    </td>
                                                    <td className="px-6 py-4  text-center whitespace-nowrap">
                                                        <span className="text-sm font-semibold text-slate-900">₹{expense.amount.toFixed(2)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                                            onClick={() => handleViewComments(expense)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                            Comments
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {isModalOpen && selectedExpense && (
                        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
                                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-blue-700 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Comments for: {selectedExpense.description}
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {commentsLoading[selectedExpense._id] ? (
                                        <div className="flex justify-center items-center h-32">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
                                        </div>
                                    ) : commentsError[selectedExpense._id] ? (
                                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm">{commentsError[selectedExpense._id]}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : expenseComments[selectedExpense._id]?.length > 0 ? (
                                        <ul className="space-y-4">
                                            {expenseComments[selectedExpense._id].map((comment) => (
                                                <li key={comment._id} className="p-4 border rounded-xl bg-blue-50 border-blue-100 shadow-sm">
                                                    <p className="text-slate-700">{comment.comment}</p>
                                                    <div className="flex items-center mt-3 text-xs text-slate-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <span className="font-medium text-blue-600">{comment.userName || "Unknown"}</span>
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
                                </div>

                                <div className="p-6 border-t border-slate-200 bg-blue-50">
                                    <h4 className="text-md font-semibold text-blue-700 flex items-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Add New Comment
                                    </h4>
                                    <textarea
                                        rows="3"
                                        placeholder="Add your comment here..."
                                        value={comments[selectedExpense._id] || ""}
                                        onChange={(e) => handleCommentChange(selectedExpense._id, e.target.value)}
                                        className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-inner"
                                    ></textarea>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => handleAddComment(selectedExpense._id)}
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectExpenses;