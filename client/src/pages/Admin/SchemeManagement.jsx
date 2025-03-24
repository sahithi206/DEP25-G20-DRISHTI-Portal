import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Bell, Settings, LogOut } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_URL;


const SchemeManagement = ({ userRole }) => {
    console.log("userrole", userRole)
    // if (userRole !== "head_coordinator") {
    //     return <div className="text-red-500 text-center text-lg mt-10">Access Denied</div>;
    // }

    const [activeSection, setActiveSection] = useState("scheme-management");
    const [schemeName, setSchemeName] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [category, setCategory] = useState("");
    const [eligibility, setEligibility] = useState("");
    const [status, setStatus] = useState("Active");
    const [selectedCoordinator, setSelectedCoordinator] = useState("");
    const [schemes, setSchemes] = useState([]);
    const [users, setUsers] = useState([]); 

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const response = await fetch("http://localhost:8000/schemes/get-schemes");
                if (!response.ok) {
                    throw new Error("Failed to fetch schemes");
                }
                const data = await response.json();
                setSchemes(data);
            } catch (error) {
                console.error("Error fetching schemes:", error);
            }
        };
        fetchSchemes();
    }, []);

    // Fetch users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:8000/form/users");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);
    const handleCreateScheme = async () => {
        if (!schemeName || !description || !budget || !startDate || !endDate || !selectedCoordinator) {
            alert("Please fill all required fields");
            return;
        }

        const newScheme = {
            name: schemeName,
            description,
            category,
            eligibility,
            budget,
            startDate,
            endDate,
            coordinator: selectedCoordinator,
            status
        };


        try {
            const response = await fetch("http://localhost:8000/schemes/new-scheme", {
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
            setSchemeName("");
            setDescription("");
            setBudget("");
            setStartDate("");
            setEndDate("");
            setSelectedCoordinator("");
            setCategory("");
            setEligibility("");
            setStatus("");
            alert("Scheme created successfully!");
        } catch (error) {
            console.error("Error saving scheme:", error);
            alert("Failed to save scheme.");
        }
    };


    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
                    <h1 className="text-2xl font-semibold">Scheme Management</h1>
                    <div className="flex space-x-4">
                        <button className="p-2 bg-blue-500 text-white rounded-md"><Bell className="w-5 h-5" /></button>
                        <button className="p-2 bg-gray-500 text-white rounded-md"><Settings className="w-5 h-5" /></button>
                        <button className="p-2 bg-red-500 text-white rounded-md"><LogOut className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Scheme Creation Form */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Create Scheme</h2>
                    <input
                        className="w-full border rounded-lg p-2 mb-2"
                        placeholder="Scheme Name"
                        value={schemeName}
                        onChange={(e) => setSchemeName(e.target.value)}
                    />
                    <textarea
                        className="w-full border rounded-lg p-2 mb-2"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type="number"
                        className="w-full border rounded-lg p-2 mb-2"
                        placeholder="Budget (in USD)"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    />
                    <input
                        type="date"
                        className="w-full border rounded-lg p-2 mb-2"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        className="w-full border rounded-lg p-2 mb-2"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <input className="w-full border rounded-lg p-2 mb-2" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                    <input className="w-full border rounded-lg p-2 mb-2" placeholder="Eligibility Criteria" value={eligibility} onChange={(e) => setEligibility(e.target.value)} />

                    {/* Dropdown to select users */}
                    <select
                        className="w-full border rounded-lg p-2 mb-2"
                        value={selectedCoordinator}
                        onChange={(e) => setSelectedCoordinator(e.target.value)}
                    >
                        <option value="" disabled>Select Coordinator</option>
                        {users.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.name}
                            </option>
                        ))}
                    </select>

                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handleCreateScheme}>
                        Create Scheme
                    </button>
                </div>

                {/* Existing Schemes Table */}
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Existing Schemes</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">ID</th>
                                <th className="border p-2">Scheme Name</th>
                                <th className="border p-2">Description</th>
                                <th className="border p-2">Budget</th>
                                <th className="border p-2">Start Date</th>
                                <th className="border p-2">End Date</th>
                                <th className="border p-2">Coordinator</th>
                                <th className="border p-2">Category</th>
                                <th className="border p-2">Eligibility</th>
                                <th className="border p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schemes.map((scheme) => (
                                <tr key={scheme.id} className="border-t">
                                    <td className="border p-2">{scheme._id}</td>
                                    <td className="border p-2">{scheme.name}</td>
                                    <td className="border p-2">{scheme.description}</td>
                                    <td className="border p-2">${scheme.budget}</td>
                                    <td className="border p-2">{scheme.startDate}</td>
                                    <td className="border p-2">{scheme.endDate}</td>
                                    <td className="border p-2">{users.find(u => u._id === scheme.coordinator)?.name || "Unknown"}</td>
                                    <td className="border p-2">{scheme.category}</td>
                                    <td className="border p-2">{scheme.eligibility}</td>
                                    <td className="border p-2">{scheme.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SchemeManagement;
