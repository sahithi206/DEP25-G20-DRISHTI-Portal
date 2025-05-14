import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { AuthContext } from "../Context/Authcontext";
import InstituteSidebar from "../../components/InstituteSidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const SanctionedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("sanctioned-projects");
  const { fetchSanctionedProjects } = useContext(AuthContext);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Check for mobile viewport
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const projectsData = await fetchSanctionedProjects();
        if (projectsData) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Error fetching sanctioned projects:", error);
        toast.error("Failed to fetch sanctioned projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [fetchSanctionedProjects]);

  useEffect(() => {
    const filterProjects = () => {
      let filtered = [...projects];

      if (searchTitle) {
        const searchTerm = searchTitle.toLowerCase();
        filtered = filtered.filter((project) => {
          if (project.Title?.toLowerCase().includes(searchTerm)) return true;
          if (project.PI?.some((name) => name.toLowerCase().includes(searchTerm)))
            return true;
          if (project.Scheme?.name?.toLowerCase().includes(searchTerm)) return true;
          return false;
        });
      }

      if (statusFilter) {
        filtered = filtered.filter((project) => project.status === statusFilter);
      }

      if (sortOrder === "newest") {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortOrder === "oldest") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      }

      setFilteredProjects(filtered);
    };

    filterProjects();
  }, [searchTitle, statusFilter, sortOrder, projects]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      // You can add logic here if needed
    });

    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current);
    }

    return () => {
      if (sidebarRef.current) {
        resizeObserver.unobserve(sidebarRef.current);
      }
    };
  }, []);

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const timeLeft = end - today;

    if (timeLeft > 0) {
      return Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    }
    return "Expired";
  };

  const handleRowClick = (projectId) => {
    navigate(`/institute/project-dashboard/${projectId}`);
  };

  // Card view for mobile devices and small screens
  const renderProjectCard = (project) => (
    <div
      key={project._id}
      onClick={() => handleRowClick(project._id)}
      className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 truncate max-w-xs">{project.Title}</h3>
        <span
          className={`px-2 py-1 text-sm rounded-full ${calculateDaysLeft(project.endDate) === "Expired"
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
            }`}
        >
          {calculateDaysLeft(project.endDate)}
        </span>
      </div>

      <div className="text-sm mb-2">
        <span className="font-semibold text-gray-700">Scheme:</span>{" "}
        <span className="text-gray-600">{project.Scheme?.name || "N/A"}</span>
      </div>

      <div className="text-sm">
        <span className="font-semibold text-gray-700">PI(s):</span>{" "}
        {project.PI?.length > 0 ? (
          <span className="text-gray-600">{project.PI.join(", ")}</span>
        ) : (
          "N/A"
        )}
      </div>

      <div className="mt-2 text-xs text-blue-600">
        ID: {project._id}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar yes={1} />
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 text-center">
              Ongoing Projects in Your Institute
            </h1>

            {/* Responsive filter controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    role="img"
                    aria-label="Search icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2 md:gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Approved">Approved</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                </div>
              ) : filteredProjects.length > 0 ? (
                <>
                  {/* Card view for small screens */}
                  {isMobile && (
                    <div className="p-2">
                      {filteredProjects.map(project => renderProjectCard(project))}
                    </div>
                  )}

                  {/* Table view for larger screens */}
                  {!isMobile && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 transition-all duration-300">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                              Project ID
                            </th>
                            <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                              Scheme
                            </th>
                            <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                              Principal Investigator(s)
                            </th>
                            <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                              Days Left
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProjects.map((project) => (
                            <tr
                              key={project._id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleRowClick(project._id)}
                            >
                              <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm text-blue-600 hover:underline">
                                <div className="max-w-[80px] md:max-w-full truncate">
                                  {project._id}
                                </div>
                              </td>
                              <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700">
                                <div className="max-w-[80px] md:max-w-full truncate">
                                  {project.Scheme?.name || "N/A"}
                                </div>
                              </td>
                              <td className="px-2 md:px-6 py-2 md:py-4 text-xs md:text-sm text-gray-700">
                                {project.PI?.length > 0 ? (
                                  <ul className="list-disc pl-5">
                                    {project.PI.map((name, idx) => (
                                      <li key={idx}>{name}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="px-2 md:px-6 py-2 md:py-4 text-xs md:text-sm text-gray-900 font-medium">
                                <div className="truncate max-w-[100px] md:max-w-md">
                                  {project.Title}
                                </div>
                              </td>
                              <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm font-semibold">
                                <span
                                  className={`px-2 py-1 rounded-full ${calculateDaysLeft(project.endDate) === "Expired"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                  {calculateDaysLeft(project.endDate)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No projects found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTitle || statusFilter
                      ? "Try adjusting your search or filter criteria"
                      : "There are currently no ongoing projects in your institute"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SanctionedProjects;