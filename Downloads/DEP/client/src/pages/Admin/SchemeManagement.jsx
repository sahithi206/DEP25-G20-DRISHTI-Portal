import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Bell, Settings, LogOut } from "lucide-react";

const SchemeManagement = () => {
    const [activeSection, setActiveSection] = useState("scheme-management");
    const [schemeName, setSchemeName] = useState("");
    const [selectedCoordinator, setSelectedCoordinator] = useState("");
    const [schemes, setSchemes] = useState([]);

    const coordinators = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown"];

    const handleCreateScheme = () => {
        if (!schemeName || !selectedCoordinator) {
            alert("Please fill all fields");
            return;
        }
        const newScheme = { id: schemes.length + 1, name: schemeName, coordinator: selectedCoordinator };
        setSchemes([...schemes, newScheme]);
        setSchemeName("");
        setSelectedCoordinator("");
        alert("Scheme created successfully");
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
                    <select
                        className="w-full border rounded-lg p-2 mb-2"
                        value={selectedCoordinator}
                        onChange={(e) => setSelectedCoordinator(e.target.value)}
                    >
                        <option value="" disabled>Select Coordinator</option>
                        {coordinators.map((coordinator, index) => (
                            <option key={index} value={coordinator}>{coordinator}</option>
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
                                <th className="border p-2">Coordinator</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schemes.map((scheme) => (
                                <tr key={scheme.id} className="border-t">
                                    <td className="border p-2">{scheme.id}</td>
                                    <td className="border p-2">{scheme.name}</td>
                                    <td className="border p-2">{scheme.coordinator}</td>
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
