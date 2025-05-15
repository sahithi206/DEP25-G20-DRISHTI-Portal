// This file is for displaying and managing saved proposals (PI saves proposals for later review).

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import { AuthContext } from "./Context/Authcontext";
import HomeNavbar from "../utils/HomeNavbar";
import { toast } from "react-toastify";

const SavedProposals = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { approvedProjects } = useContext(AuthContext);
  const [acceptedProjects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setModal] = useState(0);


  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const projects = await approvedProjects();

        if (!isMounted) return;
        setSchemes([]);
        const formattedProjects = projects.map((project) => {
          const schemeName = project?.proposal?.Scheme?.name || "Unknown";

          if (schemeName && !schemes.some(s => s.name === schemeName)) {
            setSchemes(prev => [...prev, { name: schemeName }]);
          }

          return {
            id: project.proposalId,
            title: project.researchDetails?.Title || 'Untitled Project',
            duration: String(project.researchDetails?.Duration || ''),
            status: project.status || 'Unknown',
            Scheme: schemeName,
            date: project.proposal.date,
            ...(project.researchDetails?.Institute && {
              institute: project.researchDetails.Institute
            }),
            ...(project.researchDetails?.Specialization && {
              specialization: project.researchDetails.Specialization
            }),
          };
        });

        setProjects(formattedProjects);

      } catch (error) {
        console.error('Failed to fetch projects:', error);
        if (isMounted) {
          toast.error('Failed to load projects');
        }
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, [approvedProjects]);
  const [schemeFilter, setSchemeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTitle, setSearchTitle] = useState("");
  const [schemes, setSchemes] = useState([]);

  const [filteredProjects, setFilteredUc] = useState([]);
  useEffect(() => {
    const filterProjects = async () => {
      let filtered = acceptedProjects;

      if (searchTitle) {
        const searchTerm = searchTitle.toLowerCase();
        filtered = filtered.filter((project) => {
          if (project?.title.toLowerCase().includes(searchTerm)) return true;
          if (project?.duration.toLowerCase().includes(searchTerm)) return true;
          return false;
        });
      }

      if (schemeFilter) {
        filtered = filtered.filter(project => project.Scheme === schemeFilter);
      }

      if (sortOrder) {
        filtered = filtered.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
      }

      setFilteredUc(filtered);
    };

    filterProjects();
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
            <p className="mt-3 text-2xl ml-5 font-bold text-blue-800">Accepted Proposals</p>
          </div>
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 p-4 items-start sm:items-center justify-between">
              <div className="w-full sm:flex-1 min-w-[200px]">
                <div className="relative flex items-center rounded-lg px-3 py-2 bg-white-50 hover:bg-gray-100 transition-colors duration-200 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-200">
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
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by Title or Duration"
                    className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500 text-sm pr-8"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                  {searchTitle && (
                    <button
                      onClick={() => setSearchTitle('')}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
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
                    onChange={(e) => setSchemeFilter(e.target.value)}
                    className="w-full bg-white rounded-md pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                  >
                    <option value="">All Schemes</option>
                    {schemes?.map((val) => (
                      <option value={val.name} key={val._id}>{val.name}</option>
                    ))}
                  </select>

                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">File No.</th>
                    <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Project Title</th>
                    <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Scheme</th>
                    <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Project Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects && filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="bg-white-100 shadow-sm">
                        <td className="p-4 text-center font-semibold text-xs">{project.id}</td>
                        <td className="p-4 text-center font-semibold text-xs">{project.title}</td>
                        <td className="p-4 text-center font-semibold text-xs">{project?.Scheme}</td>
                        <td className="p-4 text-center font-semibold text-xs">{project.duration}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-gray-100">
                      <td className="p-4 text-center font-semibold text-xs border-b border-blue-200" colSpan="4">
                        No Accepted Projects
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
  );
};

export default SavedProposals;
