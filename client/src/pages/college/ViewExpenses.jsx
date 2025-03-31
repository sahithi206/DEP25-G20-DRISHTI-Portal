import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import InstituteSidebar from "../../components/InstituteSidebar";
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
        maxAmount: ""
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

    const handleViewComments = (expenseId) => {
        // Fetch comments for this expense if not already loaded
        if (!expenseComments[expenseId]) {
            fetchCommentsForExpense(expenseId);
        }

        // Toggle the visibility of the comments section
        document.getElementById(`view-comments-${expenseId}`).classList.toggle("hidden");
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    const applyFilters = () => {
        setLoading(true);

        const queryParams = new URLSearchParams();
        if (filter.type) queryParams.append("type", filter.type);
        if (filter.startDate) queryParams.append("startDate", filter.startDate);
        if (filter.endDate) queryParams.append("endDate", filter.endDate);
        if (filter.startCommittedDate) queryParams.append("startCommittedDate", filter.startCommittedDate);
        if (filter.endCommittedDate) queryParams.append("endCommittedDate", filter.endCommittedDate);
        if (filter.minAmount) queryParams.append("minAmount", Number(filter.minAmount));
        if (filter.maxAmount) queryParams.append("maxAmount", Number(filter.maxAmount));

        console.log("Applying Filters:", queryParams.toString()); // Debugging step

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


    const resetFilters = () => {
        setFilter({
            type: "",
            startDate: "",
            endDate: "",
            startCommittedDate: "",
            endCommittedDate: "",
            minAmount: "",
            maxAmount: ""
        });

        // Re-fetch all expenses
        fetch(`${url}institute/expenses/${projectId}`)
            .then(response => response.json())
            .then(data => {
                setExpenses(data || []);
                calculateSummary(data || []);
            })
            .catch(error => {
                console.error("Error resetting filters:", error);
                alert("Failed to reset expenses");
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

    // Update state on input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditExpenseData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle expense update
    const handleEditExpense = async () => {
        if (!editExpenseData.id) {
            alert("No expense selected for editing.");
            return;
        }

        const updatedExpense = {
            description: editExpenseData.description,
            amount: editExpenseData.amount,
            type: editExpenseData.type,
            // date: editExpenseData.date,
            // committedDate: editExpenseData.committedDate
        };

        try {
            console.log("Before Updated Expense:", updatedExpense);
            const response = await editExpense(editExpenseData.id, updatedExpense);

            // Update the state with the new data
            setExpenses((prevExpenses) =>
                prevExpenses.map((expense) =>
                    expense._id === editExpenseData.id ? { ...expense, ...updatedExpense } : expense
                )
            );

            setIsEditModalOpen(false); // Close modal
            alert("Expense updated successfully!");
        } catch (error) {
            console.error("Error updating expense:", error);
            alert("Failed to update expense");
        }
    };

    const filteredExpenses = activeTab === "all"
        ? expenses
        : expenses.filter(expense => expense.type.toLowerCase() === activeTab);


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

                            {/* Filters */}
                            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Filter Expenses</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <input
                                            type="text"
                                            name="type"
                                            value={filter.type}
                                            onChange={handleFilterChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Enter type"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                                        <input
                                            type="number"
                                            name="minAmount"
                                            value={filter.minAmount}
                                            onChange={handleFilterChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                                        <input
                                            type="number"
                                            name="maxAmount"
                                            value={filter.maxAmount}
                                            onChange={handleFilterChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range (Expense Date)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500">From</label>
                                                <input
                                                    type="date"
                                                    name="startDate"
                                                    value={filter.startDate}
                                                    onChange={handleFilterChange}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500">To</label>
                                                <input
                                                    type="date"
                                                    name="endDate"
                                                    value={filter.endDate}
                                                    onChange={handleFilterChange}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range (Committed Date)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500">From</label>
                                                <input
                                                    type="date"
                                                    name="startCommittedDate"
                                                    value={filter.startCommittedDate}
                                                    onChange={handleFilterChange}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500">To</label>
                                                <input
                                                    type="date"
                                                    name="endCommittedDate"
                                                    value={filter.endCommittedDate}
                                                    onChange={handleFilterChange}
                                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-4 justify-end">
                                    <button
                                        onClick={resetFilters}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200 text-gray-700"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                            {/* Expense List */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                                <h3 className="text-xl font-semibold p-5 border-b bg-gray-50">Expense List</h3>
                                {expenses.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">No expenses found for this project.</p>
                                        <Link
                                            to={`/add-expenses/${projectDetails?._id}`}
                                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                                        >
                                            Add Your First Expense
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 text-left">
                                                <tr>
                                                    <th className="p-4 border-b font-medium text-gray-700">Date</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Committed Date</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Description</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Type</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Amount</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Created At</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((expense) => (
                                                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                        <td className="p-4 border-b text-gray-600">{formatDate(expense.date)}</td>
                                                        <td className="p-4 border-b text-gray-600">{formatDate(expense.committedDate)}</td>
                                                        <td className="p-4 border-b text-gray-800">{expense.description}</td>
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
                                                                    className="text-blue-600 hover:text-blue-800 transition duration-200 flex items-center"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteExpense(expense._id)}
                                                                    className="text-red-600 hover:text-red-800 transition duration-200 flex items-center"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="text-green-600 hover:text-green-900"
                                                                    onClick={() => handleViewComments(expense._id)}
                                                                >
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
                                                        By:{" "}
                                                        {comment.role === "PI"
                                                            ? comment.userId?.Name || "Unknown"
                                                            : comment.userId?.college || "Unknown"}{" "}
                                                        ({comment.role || "User"}) |{" "}
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
                        <form onSubmit={handleEditExpense}>
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
                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formatDate(editExpenseData.date)}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Committed Date</label>
                                    <input
                                        type="date"
                                        name="committedDate"
                                        value={formatDate(editExpenseData.committedDate)}
                                        onChange={handleChange}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        required
                                    />
                                </div>
                            </div> */}
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

        </div>
    );
}
export default ProjectExpenses;