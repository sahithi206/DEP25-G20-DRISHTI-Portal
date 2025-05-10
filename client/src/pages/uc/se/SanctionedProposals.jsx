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
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-xl transition-shadow">
                        <img src="/3.png" alt="ResearchX Logo" className="mx-auto w-84 h-32 object-contain" />
                        {/*  <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <h3 className="text-medium font-semibold text-gray-700">Empowering Research Through Technology</h3>*/}
                        <p className="mt-3 text-2xl ml-5 font-bold text-blue-800">Ongoing Projects</p>
                    </div>
                    <div className="bg-white shadow-md rounded-xl overflow-hidden">
                        <div className="flex flex-col sm:flex-row gap-4">                            <div className="w-full sm:flex-1 min-w-[200px]">
                            <div className="relative flex items-center flex-grow p-3">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>                                    <input
                                    type="text"
                                    placeholder="Search Projects by Title, duration ..."
                                    value={searchTitle}
                                    onChange={(e) => setSearchTitle(e.target.value)}
                                    className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm pr-8"
                                />

                                <div className="flex gap-3">
                                    <div className="relative w-full sm:w-40">
                                        <select
                                            className="w-full bg-white rounded-md pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                        >
                                            <option value="desc">Newest First</option>
                                            <option value="asc">Oldest First</option>
                                        </select>

                                    </div>

                                    <div className="relative w-full sm:w-40">
                                        <select
                                            value={schemeFilter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="w-full bg-white rounded-md pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                                        >
                                            <option value="">All Schemes</option>
                                            {schemes?.map((val) => (
                                                <option value={val} key={val._id}>{val}</option>
                                            ))}
                                        </select>

                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-blue-700 text-white">
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