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
                console.log(json.projects);
                setProjects(json.projects);
                console.log(acceptedProjects);
                if (acceptedProjects) {
                    if (acceptedProjects && Array.isArray(acceptedProjects)) {
                        const schemesArray = acceptedProjects.map(project => project.Scheme?.name || "");
                        setSchemes(schemesArray);
                    }
                }
                setFilteredProjects(json.projects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        fetchProjects();
    }, [url]);
    const [schemes, setSchemes] = useState([]);


    const [schemeFilter, setFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchTitle, setSearchTitle] = useState("");
    useEffect(() => {
        const filteredProjects = async () => {
            let filtered = acceptedProjects;

            if (searchTitle) {
                const searchTerm = searchTitle.toLowerCase();
                filtered = filtered.filter((project) => {
                    if (project?.Title.toLowerCase().includes(searchTerm)) return true;

                    return false;
                });
            }

            if (schemeFilter) {
                filtered = filtered.filter(project => project.project.Scheme.name === schemeFilter);
            }

            if (sortOrder) {
                filtered = filtered.sort((a, b) => {
                    const dateA = new Date(a.project.date);
                    const dateB = new Date(b.project.date);
                    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                });
            }

            setFilteredProjects(filtered);
        };

        filteredProjects();
    }, [searchTitle, sortOrder, acceptedProjects, schemeFilter]);

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen text-gray-800">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="p-6 space-y-6">
                        <div className="bg-white shadow-lg rounded-lg p-6 text-center border-l-8 border-blue-600">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">ResearchX</h1>
                            <h3 className="text-lg font-medium text-gray-600">Empowering Research Through Technology</h3>
                            <p className="mt-3 text-2xl font-semibold text-blue-700">Ongoing Projects</p>
                        </div>
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="flex flex-col sm:flex-row gap-4 items-start p-4 sm:items-center">
                                <div className="flex items-center rounded-lg px-3 py-2 bg-white hover: transition-colors duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500">
                                    <div className="flex space-x-2">
                                        <div className="relative flex-grow">
                                            <input
                                                type="text"
                                                placeholder="Search projects by PI name ..."
                                                value={searchTitle}
                                                onChange={(e) => setSearchTitle(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                <FaSearch className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="oldest">Oldest</option>
                                        </select>
                                        <select
                                            value={schemeFilter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All</option>
                                            {schemes && schemes.length > 0 && schemes.map((val, index) => (
                                                <option value={val} key={index}>{val}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Projects Table */}
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-blue-600 text-white">
                                            <tr>
                                                <th className="p-4 text-center font-semibold text-xs border-b border-blue-500">File No.</th>
                                                <th className="p-4 text-center font-semibold text-xs border-b border-blue-500">Project Title</th>
                                                <th className="p-4 text-center font-semibold text-xs border-b border-blue-500">Scheme</th>
                                                <th className="p-4 text-center font-semibold text-xs border-b border-blue-500">Days Left</th>
                                                <th className="p-4 text-center font-semibold text-xs border-b border-blue-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProjects && filteredProjects.length > 0 ? (
                                                filteredProjects.map((project) => (
                                                    <tr key={project.id} className="group hover:bg-blue-50 transition-colors border-b last:border-b-0">
                                                        <td className="p-4 text-center font-medium text-xs">{project._id}</td>
                                                        <td className="p-4 text-center font-medium text-xs">{project.Title}</td>
                                                        <td className="p-4 text-center font-medium text-xs">{project.Scheme.name}</td>
                                                        <td className="p-4 text-center font-medium text-xs">
                                                            {(() => {
                                                                const endDate = new Date(project.endDate);
                                                                const timeLeft = endDate - new Date();
                                                                if (timeLeft > 0) {
                                                                    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                                                                    return `${daysLeft} days`;
                                                                } else {
                                                                    return "Time expired";
                                                                }
                                                            })()}
                                                        </td>
                                                        <td className="p-4 text-center font-medium text-xs">
                                                            <button
                                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                                                onClick={() => navigate(`/project-dashboard/${project._id}`)}
                                                            >
                                                                View Dashboard
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="bg-gray-100">
                                                    <td className="p-4 text-center font-medium text-xs border-b border-blue-200" colSpan={5}>
                                                        {searchTitle ? "No projects match your search" : "No Sanctioned Projects"}
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
        </div>
    );
};

export default SanctionedProposals;