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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editExpenseData, setEditExpenseData] = useState({
        id: "",
        description: "",
        amount: "",
        category: "",
    });

    const [filter, setFilter] = useState({
        category: "",
        startDate: "",
        endDate: "",
        minAmount: "",
        maxAmount: ""
    });
    const [summary, setSummary] = useState({
        total: 0,
        byCategory: {}
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

    const calculateSummary = (expenseData) => {
        const byCategory = {};
        let total = 0;

        expenseData.forEach(expense => {
            // Add to total
            const amount = parseFloat(expense.amount);
            total += amount;

            // Group by category
            if (!byCategory[expense.category]) {
                byCategory[expense.category] = 0;
            }
            byCategory[expense.category] += amount;
        });

        setSummary({ total, byCategory });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({
            ...filter,
            [name]: value
        });
    };

    const applyFilters = () => {
        // Fetch expenses with filters
        setLoading(true);

        const queryParams = new URLSearchParams();
        if (filter.category) queryParams.append("category", filter.category);
        if (filter.startDate) queryParams.append("startDate", filter.startDate);
        if (filter.endDate) queryParams.append("endDate", filter.endDate);
        if (filter.minAmount) queryParams.append("minAmount", filter.minAmount);
        if (filter.maxAmount) queryParams.append("maxAmount", filter.maxAmount);

        fetch(`${url}institute/expenses/${projectId}?${queryParams.toString()}`)
            .then(response => response.json())
            .then(data => {
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
            category: "",
            startDate: "",
            endDate: "",
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

    // Function to get category color for visual distinction
    const getCategoryColor = (category) => {
        const colors = {
            materials: "bg-blue-100 text-blue-800",
            equipment: "bg-green-100 text-green-800",
            labor: "bg-purple-100 text-purple-800",
            travel: "bg-yellow-100 text-yellow-800",
            other: "bg-gray-100 text-gray-800"
        };

        return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
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
            category: expense.category
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
            category: editExpenseData.category
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
                                    <h3 className="text-lg font-semibold mb-3 text-gray-700">Expenses by Category</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(summary.byCategory).map(([category, amount]) => (
                                            <div key={category} className={`px-4 py-2 rounded-full ${getCategoryColor(category)} shadow-sm`}>
                                                <span className="font-medium">{category}:</span> {formatCurrency(amount)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Filter Expenses</h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={filter.category}
                                            onChange={handleFilterChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="Enter category"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={filter.startDate}
                                            onChange={handleFilterChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={filter.endDate}
                                            onChange={handleFilterChange}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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
                                                    <th className="p-4 border-b font-medium text-gray-700">Description</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Category</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Amount</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Created At</th>
                                                    <th className="p-4 border-b font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((expense) => (
                                                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                        <td className="p-4 border-b text-gray-600">{formatDate(expense.date)}</td>
                                                        <td className="p-4 border-b text-gray-800">{expense.description}</td>
                                                        <td className="p-4 border-b">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                                                                {expense.category}
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
            <Footer />

            {/* Edit Expense Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Edit Expense</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={editExpenseData.description}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Enter description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={editExpenseData.amount}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Enter amount"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={editExpenseData.category}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="materials">Materials</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="labor">Labor</option>
                                    <option value="travel">Travel</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200 text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleEditExpense}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectExpenses;