import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
import { FaSearch, FaFilter, FaChevronDown } from "react-icons/fa";

const SanctionedProposals = () => {
    const url = import.meta.env.VITE_REACT_APP_URL;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { approvedProjects } = useContext(AuthContext);
    const [acceptedProjects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("User not authenticated");

                const response = await fetch(`${url}projects/get-projects`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": `${token}`
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch projects");
                }
                const json = await response.json();
                const projects = json.projects?.map(project => ({
                    id: project._id,
                    title: project.Title,
                    endDate: project.endDate,
                    createdAt: project.createdAt
                })) || [];
                
                setProjects(projects);
                setFilteredProjects(projects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        fetchProjects();
    }, [url]);

    useEffect(() => {
        const filterAndSortProjects = () => {
            let results = [...acceptedProjects];
            
            // Apply search filter
            if (searchTerm) {
                results = results.filter(project =>
                    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.id.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            // Apply sorting
            results.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
            });
            
            setFilteredProjects(results);
        };
        
        filterAndSortProjects();
    }, [searchTerm, sortOrder, acceptedProjects]);

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="p-6 space-y-6">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                            <p className="mt-3 text-3xl font-bold text-blue-800">Ongoing Projects</p>
                        </div>
                        
                        {/* Search and Filter Controls */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                {/* Search Input */}
                                <div className="relative flex-1 w-full">
                                    <div className="flex items-center rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-200">
                                        <FaSearch className="text-gray-500 mr-2" />
                                        <input
                                            type="text"
                                            placeholder="Search by ID or Title"
                                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm pr-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                                                aria-label="Clear search"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Sort Dropdown */}
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaFilter className="mr-1" />
                                        <span>Sort:</span>
                                    </div>
                                    <div className="relative w-full sm:w-40">
                                        <select
                                            className="appearance-none w-full bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <FaChevronDown className="text-xs" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Projects Table */}
                        <div className="bg-white shadow-md rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-700 text-white">
                                        <tr>
                                            <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">File No.</th>
                                            <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Project Title</th>
                                            <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Time Left</th>
                                            <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProjects && filteredProjects.length > 0 ? (
                                            filteredProjects.map((project) => (
                                                <tr key={project.id} className="group hover:bg-blue-50 transition-colors border-b last:border-b-0">
                                                    <td className="p-4 text-center font-semibold text-xs">{project.id}</td>
                                                    <td className="p-4 text-center font-semibold text-xs">{project.title}</td>
                                                    <td className="p-4 text-center font-semibold text-xs">
                                                        {(() => {
                                                            const endDate = new Date(project.endDate);
                                                            const timeLeft = endDate - new Date();
                                                            if (timeLeft > 0) {
                                                                const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                                                                return `${daysLeft} days left`;
                                                            } else {
                                                                return "Time expired";
                                                            }
                                                        })()}
                                                    </td>
                                                    <td className="p-4 text-center font-semibold text-xs">
                                                        <button
                                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                                            onClick={() => navigate(`/project-dashboard/${project.id}`)}
                                                        >
                                                            View Dashboard
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="bg-gray-100">
                                                <td className="p-4 text-center font-semibold text-xs border-b border-blue-200" colSpan="4">
                                                    {searchTerm ? "No projects match your search" : "No Sanctioned Projects"}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SanctionedProposals;