import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext";
import Navbar from "../../components/Navbar";
import InstituteSidebar from "../../components/InstituteSidebar";
import toast from 'react-hot-toast';
const url = import.meta.env.VITE_REACT_APP_URL;

const ProjectExpenses = () => {
    const { projectId } = useParams();
    const { fetchInstituteGetProject, deleteExpense, editExpense } = useContext(AuthContext);
    const [activeSection, setActiveSection] = useState("expenses");
    const [projectDetails, setProjectDetails] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [comments, setComments] = useState({});
    const [expenseComments, setExpenseComments] = useState({});
    const [commentsLoading, setCommentsLoading] = useState({});
    const [commentsError, setCommentsError] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [currentExpenseId, setCurrentExpenseId] = useState(null);
    const [currentExpenseDescription, setCurrentExpenseDescription] = useState("");
    const [editExpenseData, setEditExpenseData] = useState({
        id: "",
        description: "",
        amount: "",
        type: "",
        date: "",
        committedDate: ""
    });

    const [filter, setFilter] = useState({
        type: "",
        startDate: "",
        endDate: "",
        startCommittedDate: "",
        endCommittedDate: "",
        minAmount: "",
        maxAmount: "",
        showPendingOnly: false,
    });
    const [summary, setSummary] = useState({
        total: 0,
        byType: {}
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch project details
                if (projectId) {
                    const details = await fetchInstituteGetProject(projectId);
                    setProjectDetails(details.data.project);
                }

                // Fetch expenses
                const response = await fetch(`${url}institute/expenses/${projectId}`);
                const data = await response.json();

                if (response.ok) {
                    setExpenses(data || []);
                    calculateSummary(data || []);
                } else {
                    throw new Error(data.message || "Failed to fetch expenses");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Failed to fetch data: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, fetchInstituteGetProject]);

    const handleCommentChange = (expenseId, value) => {
        setComments((prev) => ({ ...prev, [expenseId]: value }));
    };

    const handleAddComment = async (expenseId) => {
        setLoading(true);
        setError("");
        const commentText = comments[expenseId]?.trim();
        if (!commentText) return alert("Please enter a comment!");

        try {
            const response = await fetch(`${url}expense-comments/add`, {
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
            const response = await fetch(`${url}expense-comments/${expenseId}`, {
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

    const handleViewComments = (expense) => {
        setCurrentExpenseId(expense._id);
        setCurrentExpenseDescription(expense.description);

        // Fetch comments for this expense if not already loaded
        if (!expenseComments[expense._id]) {
            fetchCommentsForExpense(expense._id);
        }

        // Open the comments modal
        setIsCommentsModalOpen(true);
    };

    const calculateSummary = (expenseData) => {
        const byType = {};
        let total = 0;

        expenseData.forEach(expense => {
            // Add to total
            const amount = parseFloat(expense.amount);
            total += amount;

            // Group by type
            if (!byType[expense.type]) {
                byType[expense.type] = 0;
            }
            byType[expense.type] += amount;
        });

        setSummary({ total, byType });
    };

    const handleTypeFilterChange = (e) => {
        setFilter({
            ...filter,
            type: e.target.value
        });
    };

    const applyFilters = () => {
        setLoading(true);

        console.log("Applying filters with:", filter);

        const queryParams = new URLSearchParams();
        if (filter.type) queryParams.append("type", filter.type);
        if (filter.startDate) queryParams.append("startDate", filter.startDate);
        if (filter.endDate) queryParams.append("endDate", filter.endDate);
        if (filter.startCommittedDate) queryParams.append("startCommittedDate", filter.startCommittedDate);
        if (filter.endCommittedDate) queryParams.append("endCommittedDate", filter.endCommittedDate);
        if (filter.minAmount) queryParams.append("minAmount", Number(filter.minAmount));
        if (filter.maxAmount) queryParams.append("maxAmount", Number(filter.maxAmount));
        if (filter.showPendingOnly) queryParams.append("pendingOnly", "true");

        fetch(`${url}institute/expenses/${projectId}?${queryParams.toString()}`)
            .then(response => response.json())
            .then(data => {
                console.log("Filtered Data:", data); // Debugging step
                setExpenses(data || []);
                calculateSummary(data || []);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error applying filters:", error);
                alert("Failed to filter expenses");
                setLoading(false);
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return parseFloat(amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'INR'
        });
    };

    // Function to get type color for visual distinction
    const getTypeColor = (type) => {
        if (!type) return "bg-gray-100 text-gray-800"; // Default color for undefined types

        const colors = {
            materials: "bg-blue-100 text-blue-800",
            equipment: "bg-green-100 text-green-800",
            labor: "bg-purple-100 text-purple-800",
            travel: "bg-yellow-100 text-yellow-800",
            other: "bg-gray-100 text-gray-800"
        };

        return colors[type.toLowerCase()] || "bg-gray-100 text-gray-800";
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!confirm("Are you sure you want to delete this expense?")) {
            return;
        }

        try {
            await deleteExpense(expenseId);

            // Remove from state
            const updatedExpenses = expenses.filter(expense => expense._id !== expenseId);
            setExpenses(updatedExpenses);
            calculateSummary(updatedExpenses);
            alert("Expense deleted successfully");
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert(error.message);
        }
    };

    // Open modal and set existing data
    const openEditModal = (expense) => {
        setEditExpenseData({
            id: expense._id,
            description: expense.description,
            amount: expense.amount,
            type: expense.type,
            date: expense.date ? expense.date.substring(0, 10) : "",
            committedDate: expense.committedDate ? expense.committedDate.substring(0, 10) : ""
        });
        setIsEditModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditExpenseData((prev) => ({
            ...prev,
            [name]: (name === "date" || name === "committedDate") && value === "" ? null : value,
        }));
    };

    const handleEditExpense = async () => {
        if (!editExpenseData.id) {
            alert("No expense selected for editing.");
            return;
        }

        const updatedExpense = {
            description: editExpenseData.description,
            amount: editExpenseData.amount,
            type: editExpenseData.type,
            date: editExpenseData.date,
            committedDate: editExpenseData.committedDate
        };

        try {
            const response = await editExpense(editExpenseData.id, updatedExpense);

            if (!response || !response.success) {
                alert(response?.message || "Failed to update expense");
                return;
            }

            setIsEditModalOpen(false);

            setExpenses((prevExpenses) =>
                prevExpenses.map((expense) =>
                    expense._id === editExpenseData.id
                        ? { ...expense, ...updatedExpense }
                        : expense
                )
            );

            alert("Expense updated successfully!");
        } catch (error) {
            console.error("Error updating expense:", error);
            alert("Failed to update expense due to server error");
        }

    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex flex-grow">
                <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
                <main className="flex-grow container mx-auto p-6">
                    <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Project Expenses</h1>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading expenses...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Project Info */}
                            {projectDetails ? (
                                <div className="bg-white p-5 mb-6 rounded-lg shadow-md border-l-4 border-blue-600">
                                    <h2 className="text-2xl font-semibold mb-2 text-gray-800">Project: {projectDetails.Title}</h2>
                                    <p className="text-gray-600"><strong>ID:</strong> {projectId}</p>
                                </div>
                            ) : (
                                <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500 text-red-700 mb-6">
                                    <p className="font-medium">Project not found.</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap justify-between gap-4 mb-6">
                                <Link
                                    to={`/add-expenses/${projectDetails?._id}`}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition duration-200 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add New Expense
                                </Link>
                                <button
                                    onClick={() => window.print()}
                                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition duration-200 flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                                    </svg>
                                    Print Expenses
                                </button>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-t-4 border-blue-500">
                                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Expenses</h3>
                                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(summary.total)}</p>
                                </div>
                                <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 md:col-span-2 border-t-4 border-green-500">
                                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Expenses by Type</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(summary.byType).map(([type, amount]) => (
                                            <div key={type} className={`px-4 py-2 rounded-full ${getTypeColor(type)} shadow-sm`}>
                                                <span className="font-medium">{type}:</span> {formatCurrency(amount)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Expense List */}
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                                <h3 className="text-xl font-semibold p-5 border-b bg-gray-50 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Expense List
                                </h3>

                                <div className="flex items-center p-4 bg-gray-50 border-b">
                                    <div className="flex-1">
                                        <label className="flex items-center space-x-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filter.showPendingOnly}
                                                onChange={(e) => setFilter(prev => ({ ...prev, showPendingOnly: e.target.checked }))}
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">Show only pending expenses</span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={applyFilters}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        Apply Filters
                                    </button>
                                </div>

                                {expenses.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <div className="bg-gray-50 inline-flex rounded-full p-4 mb-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-gray-500 text-lg mb-4">No expenses found for this project.</p>
                                        <Link
                                            to={`/add-expenses/${projectDetails?._id}`}
                                            className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Your First Expense
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 text-left">
                                                <tr>
                                                    <th className="p-4 border-b font-medium text-gray-700">Transaction Date</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Committed Date</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Description</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">
                                                        <div className="flex items-center space-x-2">
                                                            <span>Type</span>
                                                            <div className="relative inline-block">
                                                                <input
                                                                    type="text"
                                                                    name="type"
                                                                    value={filter.type}
                                                                    onChange={handleTypeFilterChange}
                                                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                                                    placeholder="Filter type..."
                                                                    className="w-32 p-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                                <button
                                                                    onClick={applyFilters}
                                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Amount</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Created At</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((expense) => (
                                                    <tr
                                                        key={expense._id}
                                                        className={`hover:bg-gray-50 transition-colors duration-150 ${!expense.date
                                                            ? "bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400"
                                                            : ""
                                                            }`}
                                                    >
                                                        <td className="p-4 border-b text-gray-600">
                                                            {expense.date ? formatDate(expense.date) : (
                                                                <span className="flex items-center text-yellow-600">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Pending Transaction
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="p-4 border-b text-gray-600">{formatDate(expense.committedDate)}</td>
                                                        <td className="p-4 border-b text-gray-800 font-medium">{expense.description}</td>
                                                        <td className="p-4 border-b">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(expense.type)}`}>
                                                                {expense.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 border-b font-semibold text-gray-800">{formatCurrency(expense.amount)}</td>
                                                        <td className="p-4 border-b text-gray-600">{formatDate(expense.createdAt)}</td>
                                                        <td className="p-4 border-b">
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => openEditModal(expense)}
                                                                    className="text-blue-600 hover:text-blue-800 transition duration-200 flex items-center hover:underline"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteExpense(expense._id)}
                                                                    className="text-red-600 hover:text-red-800 transition duration-200 flex items-center hover:underline"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="text-green-600 hover:text-green-800 transition duration-200 flex items-center hover:underline"
                                                                    onClick={() => handleViewComments(expense)}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                                    </svg>
                                                                    View/Add Comments
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Edit Expense Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 relative">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-semibold mb-4">Edit Expense</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleEditExpense(); }}>
                            {/* Form fields for editing expense */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={editExpenseData.description}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={editExpenseData.amount}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <input
                                        type="text"
                                        name="type"
                                        value={editExpenseData.type}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date (Transaction Date)</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={editExpenseData.date ? editExpenseData.date.substring(0, 10) : ""}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 italic">
                                        Leave empty if the expense hasn't been spent yet.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Committed Date</label>
                                    <input
                                        type="date"
                                        name="committedDate"
                                        value={editExpenseData.committedDate ? editExpenseData.committedDate.substring(0, 10) : ""}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        required
                                    />
                                </div>

                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200 text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
                                >
                                    Update Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Comments Modal */}
            {isCommentsModalOpen && currentExpenseId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsCommentsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-xl font-semibold mb-2 text-blue-700">Comments for: {currentExpenseDescription}</h3>
                        <p className="text-sm text-gray-500 mb-6">Expense ID: {currentExpenseId}</p>

                        {/* Existing comments section */}
                        <div className="mb-6">
                            <h4 className="text-lg font-medium mb-3 text-gray-700">Existing Comments</h4>

                            {commentsLoading[currentExpenseId] ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading comments...</p>
                                </div>
                            ) : commentsError[currentExpenseId] ? (
                                <div className="text-center py-4 text-red-600">
                                    <p>{commentsError[currentExpenseId]}</p>
                                </div>
                            ) : expenseComments[currentExpenseId]?.length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    <p>No comments yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {expenseComments[currentExpenseId]?.map((comment) => (
                                        <div key={comment._id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                                            <div className="flex justify-between items-start">
                                                <div className="font-medium text-gray-800">{comment.comment}</div>
                                                <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
                                            </div>
                                            <p className="text-sm mt-2 text-gray-500">{comment.userName || "Unknown User"} ({comment.role})</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add new comment section */}
                        <div>
                            <h4 className="text-lg font-medium mb-3 text-gray-700">Add Comment</h4>
                            <div className="flex flex-col space-y-3">
                                <textarea
                                    value={comments[currentExpenseId] || ""}
                                    onChange={(e) => handleCommentChange(currentExpenseId, e.target.value)}
                                    placeholder="Write your comment here..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-32"
                                ></textarea>
                                <button
                                    onClick={() => handleAddComment(currentExpenseId)}
                                    disabled={loading}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : (
                                        "Add Comment"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
export default ProjectExpenses;