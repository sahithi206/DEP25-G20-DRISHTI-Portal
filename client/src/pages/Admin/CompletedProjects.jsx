import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const CompletedProjects = () => {
    let navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("completed");
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterByInstitute, setFilterByInstitute] = useState("");
    const [filterByPI, setFilterByPI] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [showFilterBox, setShowFilterBox] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const URL = import.meta.env.VITE_REACT_APP_URL;

    useEffect(() => {
        const fetchCompletedProjects = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Please log in to view projects.");
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`${URL}admin/completed-projects`, {
                    method: "GET",
                    headers: { "accessToken": token },
                });
                const data = await response.json();
                console.log("Data:", data);
                setProjects(data.data || []);
                setFilteredProjects(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCompletedProjects();
    }, []);

    // Dynamic filtering and sorting
    useEffect(() => {
        const filtered = projects
            .filter((project) => {
                // Filter by search query (title)
                const matchesSearch = project.Title?.toLowerCase().includes(searchQuery.toLowerCase());

                // Filter by institute
                const matchesInstitute = filterByInstitute
                    ? project.generalInfoId?.instituteName?.toLowerCase().includes(filterByInstitute.toLowerCase())
                    : true;

                // Filter by PI
                const matchesPI = filterByPI
                    ? project.PI?.some((pi) => pi.toLowerCase().includes(filterByPI.toLowerCase()))
                    : true;

                return matchesSearch && matchesInstitute && matchesPI;
            })
            .sort((a, b) => {
                // Sort by completion date
                const dateA = new Date(a.endDate);
                const dateB = new Date(b.endDate);
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            });

        setFilteredProjects(filtered);
    }, [searchQuery, filterByInstitute, filterByPI, sortOrder, projects]);

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                        {error}
                    </div>
                )}

                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6 mt-6">
                    <h3 className="text-lg font-bold">Completed Projects</h3>
                    <button
                        onClick={() => setShowFilterBox(!showFilterBox)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        {showFilterBox ? "Close Filters" : "Sort & Filter"}
                    </button>
                </div>

                {showFilterBox && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search by Title</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Enter title..."
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Institute</label>
                                <input
                                    type="text"
                                    value={filterByInstitute}
                                    onChange={(e) => setFilterByInstitute(e.target.value)}
                                    placeholder="Enter institute name..."
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by PI</label>
                                <input
                                    type="text"
                                    value={filterByPI}
                                    onChange={(e) => setFilterByPI(e.target.value)}
                                    placeholder="Enter PI name..."
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by Date</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {loading ? (
                        <p>Loading Projects...</p>
                    ) : filteredProjects.length === 0 ? (
                        <p>No Completed Projects</p>
                    ) : (
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-200">
                                <th className="p-2 text-left">Title</th>
                                    <th className="p-2 text-left">Project ID</th>
                                    <th className="p-2 text-left">Institute</th>
                                    <th className="p-2 text-left">Completion Date</th>
                                    <th className="p-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map((project) => (
                                    <tr key={project._id} className="border-b">
                                                                                <td className="p-2">{project.Title || "N/A"}</td>

                                        <td className="p-2">{project._id || "N/A"}</td>
                                        <td className="p-2">{project.generalInfoId?.instituteName || "N/A"}</td>
                                        <td className="p-2">
                                            {project.endDate
                                                ? new Date(project.endDate).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => navigate(`/admin/project/${project._id}`)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompletedProjects;