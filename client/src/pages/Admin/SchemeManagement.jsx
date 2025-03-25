import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { PlusCircle, AlertCircle, Check, Calendar, DollarSign, Users, Tag, FileText, Clock } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
const URL = import.meta.env.VITE_REACT_APP_URL;

const SchemeManagement = ({ userRole }) => {
    const [activeSection, setActiveSection] = useState("scheme-management");
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [schemes, setSchemes] = useState([]);
    const [users, setUsers] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    // Form state
    const [formData, setFormData] = useState({
        schemeName: "",
        description: "",
        budget: "",
        startDate: "",
        endDate: "",
        category: "",
        eligibility: "",
        status: "Active",
        selectedCoordinator: ""
    });

    // Fetch schemes and users data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [schemesResponse, usersResponse] = await Promise.all([
                    fetch(`${URL}schemes/get-schemes`),
                    fetch(`${URL}form/users`)
                ]);

                if (!schemesResponse.ok) throw new Error("Failed to fetch schemes");
                if (!usersResponse.ok) throw new Error("Failed to fetch users");

                const schemesData = await schemesResponse.json();
                const usersData = await usersResponse.json();

                setSchemes(schemesData);
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching data:", error);
                showNotification("Failed to load data. Please try again.", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Show notification helper
    const showNotification = (message, type = "success") => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 5000);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when field is edited
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            { field: 'schemeName', label: 'Scheme name' },
            { field: 'description', label: 'Description' },
            { field: 'budget', label: 'Budget' },
            { field: 'startDate', label: 'Start date' },
            { field: 'endDate', label: 'End date' },
            { field: 'selectedCoordinator', label: 'Coordinator' }
        ];

        requiredFields.forEach(({ field, label }) => {
            if (!formData[field]) {
                errors[field] = `${label} is required`;
            }
        });

        // Validate dates
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                errors.endDate = "End date cannot be before start date";
            }
        }

        // Validate budget is a number
        if (formData.budget && isNaN(Number(formData.budget))) {
            errors.budget = "Budget must be a number";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Create scheme
    const handleCreateScheme = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        const newScheme = {
            name: formData.schemeName,
            description: formData.description,
            category: formData.category,
            eligibility: formData.eligibility,
            budget: formData.budget,
            startDate: formData.startDate,
            endDate: formData.endDate,
            coordinator: formData.selectedCoordinator,
            status: formData.status
        };

        try {
            const response = await fetch(`${URL}schemes/new-scheme`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newScheme),
            });

            if (!response.ok) {
                throw new Error("Failed to save scheme");
            }

            const savedScheme = await response.json();
            setSchemes([...schemes, savedScheme]);

            // Reset form
            setFormData({
                schemeName: "",
                description: "",
                budget: "",
                startDate: "",
                endDate: "",
                category: "",
                eligibility: "",
                selectedCoordinator: ""
            });

            showNotification("Scheme created successfully!", "success");
        } catch (error) {
            console.error("Error saving scheme:", error);
            showNotification("Failed to create scheme. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Find coordinator name
    const getCoordinatorName = (id) => {
        return users.find(u => u._id === id)?.name || "Unknown";
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar activeSection={activeSection} />

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Notification */}
                    {notification.show && (
                        <div className={`mb-4 p-3 rounded-lg flex items-center ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-green-50 text-green-700 border border-green-200'
                            }`}>
                            {notification.type === 'error' ?
                                <AlertCircle className="h-5 w-5 mr-2" /> :
                                <Check className="h-5 w-5 mr-2" />
                            }
                            {notification.message}
                        </div>
                    )}

                    {/* Page Title */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Scheme Management</h1>
                        <p className="text-gray-600">Create and manage funding schemes</p>
                    </div>

                    {/* Create Scheme Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <PlusCircle className="h-5 w-5 mr-2 text-blue-600" />
                                Create New Scheme
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Scheme Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scheme Name*
                                    </label>
                                    <input
                                        name="schemeName"
                                        className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.schemeName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter scheme name"
                                        value={formData.schemeName}
                                        onChange={handleInputChange}
                                    />
                                    {formErrors.schemeName && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.schemeName}</p>
                                    )}
                                </div>

                                {/* Budget */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Budget (₹)*
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaRupeeSign className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            name="budget"
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.budget ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter budget amount"
                                            value={formData.budget}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {formErrors.budget && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.budget}</p>
                                    )}
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date*
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            type="date"
                                            name="startDate"
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {formErrors.startDate && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>
                                    )}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date*
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            type="date"
                                            name="endDate"
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {formErrors.endDate && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            name="category"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Eligibility */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Eligibility Criteria
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Users className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            name="eligibility"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter eligibility criteria"
                                            value={formData.eligibility}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Coordinator */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Coordinator*
                                    </label>
                                    <select
                                        name="selectedCoordinator"
                                        className={`w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.selectedCoordinator ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        value={formData.selectedCoordinator}
                                        onChange={handleInputChange}
                                    >
                                        <option value="" disabled>Select a coordinator</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.selectedCoordinator && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.selectedCoordinator}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description*
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <textarea
                                        name="description"
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 ${formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter scheme description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                    />
                                </div>
                                {formErrors.description && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                                <button
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleCreateScheme}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                    ) : (
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Create Scheme
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Existing Schemes Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">Existing Schemes</h2>
                            <p className="text-gray-600 text-sm">Manage and monitor all created schemes</p>
                        </div>

                        <div className="overflow-x-auto">
                            {isLoading && !schemes.length ? (
                                <div className="p-8 text-center text-gray-500">Loading schemes...</div>
                            ) : schemes.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No schemes found. Create your first scheme above.</div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheme Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinator</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {schemes.map((scheme) => (
                                            <tr key={scheme._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{scheme.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">{scheme.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">${Number(scheme.budget).toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{formatDate(scheme.startDate)} - {formatDate(scheme.endDate)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{getCoordinatorName(scheme.coordinator)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{scheme.category || "-"}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${scheme.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                        scheme.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            scheme.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {scheme.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchemeManagement;