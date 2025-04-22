import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
const url = import.meta.env.VITE_REACT_APP_URL;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [summaryCards, setSummaryCards] = useState([]);
  const [schemeProjects, setSchemeProjects] = useState([]);
  const [fundTrend, setFundTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectStats, setProjectStats] = useState([]);
  const [showSchemesList, setShowSchemesList] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showSchemeDetails, setShowSchemeDetails] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeDetailsLoading, setSchemeDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError("Authentication required. Please login.");
          setLoading(false);
          return;
        }
        const config = {
          headers: {
            'accessToken': token,
          }
        };

        const res = await axios.get(`${url}admin/dashboard-stats`, config);
        console.log("Dashboard API response:", res.data);
        const data = res.data;

        setSummaryCards([
          { title: "Total Schemes", value: data.summaryCards.totalSchemes, type: "schemes" },
          { title: "Total Projects", value: data.summaryCards.totalProjects, type: "projects" },
          { title: "Active Projects", value: data.summaryCards.activeProjects, type: "active" },
          { title: "Fund Approved", value: data.summaryCards.fundApproved, type: "funds" }
        ]);

        setProjectStats(data.projectStats || []);
        setSchemeProjects(data.schemeProjects || []);
        setFundTrend(data.fundTrend || []);

        // Get user role from response or localStorage
        const role = data.userRole || localStorage.getItem('userRole');
        setUserRole(role);

        setLoading(false);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else {
          setError("Failed to load dashboard data.");
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchSchemes = async () => {
    try {
      setSchemesLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError("Authentication required. Please login.");
        setSchemesLoading(false);
        return;
      }

      const config = {
        headers: {
          'accessToken': token,
        }
      };

      // Endpoint may differ based on role
      const endpoint = userRole === "Head Coordinator"
        ? `${url}schemes/get-schemes`
        : `${url}schemes/get-allschemes`;

      const res = await axios.get(endpoint, config);
      console.log("Schemes data:", res.data);
      setSchemes(res.data || []);
      setSchemesLoading(false);
    } catch (err) {
      console.error("Failed to fetch schemes:", err);
      setSchemesLoading(false);
    }
  };

  const fetchSchemeDetails = async (schemeId) => {
    try {
      setSchemeDetailsLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError("Authentication required. Please login.");
        setSchemeDetailsLoading(false);
        return;
      }

      const config = {
        headers: {
          'accessToken': token,
        }
      };

      const res = await axios.get(`${url}schemes/get-scheme/${schemeId}`, config);
      console.log("Scheme details:", res.data);
      setSelectedScheme(res.data);
      setSchemeDetailsLoading(false);
      setShowSchemeDetails(true);
    } catch (err) {
      console.error("Failed to fetch scheme details:", err);
      setSchemeDetailsLoading(false);
    }
  };

  const handleCardClick = (cardType) => {
    if (cardType === "schemes") {
      setShowSchemesList(true);
      fetchSchemes();
    }
  };

  const closeSchemesList = () => {
    setShowSchemesList(false);
    setSearchTerm("");
    setSelectedStatus("All");
  };

  const closeSchemeDetails = () => {
    setShowSchemeDetails(false);
    setSelectedScheme(null);
  };

  const handleViewDetails = (scheme) => {
    fetchSchemeDetails(scheme._id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Filter schemes based on search term and status
  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || scheme.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for the filter dropdown
  const statusOptions = ["All", ...new Set(schemes.map(scheme => scheme.status).filter(Boolean))];

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 p-6 overflow-y-auto">
        <AdminNavbar yes={1} />

        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Admin Dashboard Overview</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {summaryCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-md text-center border border-gray-100 hover:shadow-lg hover:border-blue-200 transition duration-300 cursor-pointer"
                onClick={() => handleCardClick(card.type)}
              >
                <h3 className="text-gray-500 text-sm font-medium mb-2">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                {card.type === "schemes" && (
                  <div className="mt-2 text-blue-500 text-xs">Click to view details</div>
                )}
              </div>
            ))}
          </div>

          {/* Improved Schemes List Modal */}
          {showSchemesList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-3/4 overflow-hidden flex flex-col">
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold">
                    {userRole === "Head Coordinator" ? "All Schemes" : "Your Assigned Schemes"}
                  </h3>
                  <button
                    onClick={closeSchemesList}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        placeholder="Search schemes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="md:w-1/4 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-y-auto flex-grow px-6">
                  {schemesLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredSchemes.length > 0 ? (
                    <div className="py-4">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredSchemes.map((scheme, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{scheme.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 line-clamp-2">{scheme.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${scheme.status === "Active" ? "bg-green-100 text-green-800" :
                                  scheme.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                    scheme.status === "Completed" ? "bg-blue-100 text-blue-800" :
                                      "bg-gray-100 text-gray-800"
                                  }`}>
                                  {scheme.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                  onClick={() => handleViewDetails(scheme)}
                                >
                                  View Details
                                </button>
                                {userRole === "Head Coordinator" && (
                                  <button
                                    className="text-gray-600 hover:text-gray-900"
                                    onClick={() => {/* Edit implementation */ }}
                                  >
                                    Edit
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No schemes found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t">
                  <div className="text-sm text-gray-500">
                    {filteredSchemes.length} {filteredSchemes.length === 1 ? 'scheme' : 'schemes'} found
                  </div>
                  <button
                    onClick={closeSchemesList}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scheme Details Modal */}
          {showSchemeDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-3/4 overflow-hidden flex flex-col">
                <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Scheme Details</h3>
                  <button
                    onClick={closeSchemeDetails}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-y-auto flex-grow p-6">
                  {schemeDetailsLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : selectedScheme ? (
                    <div className="space-y-6">
                      {/* Header with status badge */}
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedScheme.name}</h2>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${selectedScheme.status === "Active" ? "bg-green-100 text-green-800" :
                          selectedScheme.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            selectedScheme.status === "Completed" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                          }`}>
                          {selectedScheme.status}
                        </span>
                      </div>

                      {/* Basic information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Description</h3>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedScheme.description}</p>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
                          <p className="text-lg font-semibold">
                            ₹{selectedScheme.budget?.toLocaleString() || "Not specified"}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                          <p className="text-lg font-semibold">{selectedScheme.department || "Not specified"}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                          <p className="text-lg font-semibold">{formatDate(selectedScheme.startDate)}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                          <p className="text-lg font-semibold">{formatDate(selectedScheme.endDate)}</p>
                        </div>
                      </div>

                      {/* Project information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Projects</h3>
                        {selectedScheme.projects && selectedScheme.projects.length > 0 ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 divide-y divide-gray-200">
                              {selectedScheme.projects.map((project, idx) => (
                                <div key={idx} className="py-3">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium">{project.name}</p>
                                      <p className="text-sm text-gray-500">{project.description}</p>
                                    </div>
                                    <span className={`px-2 py-1 h-6 text-xs flex items-center rounded-full ${project.status === "Active" ? "bg-green-100 text-green-800" :
                                      project.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                        project.status === "Completed" ? "bg-blue-100 text-blue-800" :
                                          "bg-gray-100 text-gray-800"
                                      }`}>
                                      {project.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No projects associated with this scheme</p>
                        )}
                      </div>

                      {/* Additional information if available */}
                      {selectedScheme.eligibilityCriteria && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-700 mb-2">Eligibility Criteria</h3>
                          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedScheme.eligibilityCriteria}</p>
                        </div>
                      )}

                      {selectedScheme.documents && selectedScheme.documents.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-700 mb-2">Required Documents</h3>
                          <ul className="list-disc pl-5 text-gray-600">
                            {selectedScheme.documents.map((doc, idx) => (
                              <li key={idx}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No details available</div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t">
                  {userRole === "Head Coordinator" && selectedScheme && (
                    <button
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Edit Scheme
                    </button>
                  )}
                  <button
                    onClick={closeSchemeDetails}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Project Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {projectStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Projects per Scheme</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={schemeProjects}>
                  <XAxis dataKey="scheme" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects" fill="#8884d8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-md col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Fund Approved Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fundTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="funds" fill="#00C49F" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;