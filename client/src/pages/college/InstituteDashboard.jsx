import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "../Context/Authcontext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import InstituteSidebar from "../../components/InstituteSidebar";

const InstituteDashboard = () => {
  const { fetchInstituteProjects, fetchInstituteUsers } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  // Filter states
  const [projectFilter, setProjectFilter] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectsData = await fetchInstituteProjects();
        const usersData = await fetchInstituteUsers();
        setProjects(projectsData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchInstituteProjects, fetchInstituteUsers]);

  // Extract unique departments for filter dropdown
  const departments = [...new Set(users.map(user => user.Dept))];

  // Extract unique project statuses for filter dropdown
  const projectStatuses = [...new Set(projects.map(project => project.status))];

  // Filter projects based on search terms
  const filteredProjects = projects.filter(project => {
    const titleMatch = project.Title.toLowerCase().includes(projectFilter.toLowerCase());
    const statusMatch = projectStatusFilter === "" || project.status === projectStatusFilter;
    return titleMatch && statusMatch;
  });

  // Filter users based on search terms
  const filteredUsers = users.filter(user => {
    const nameMatch = user.Name.toLowerCase().includes(userFilter.toLowerCase());
    const deptMatch = deptFilter === "" || user.Dept === deptFilter;
    return nameMatch && deptMatch;
  });

  const clearFilters = () => {
    setProjectFilter("");
    setProjectStatusFilter("");
    setUserFilter("");
    setDeptFilter("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-700 border-b pb-2">Institute Dashboard</h1>
            <p className="text-gray-600 mb-4">Manage your institute projects and users</p>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <section className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Accepted Projects</h2>
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                    >
                      Clear Filters
                    </button>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg mb-4 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                      <input
                        type="text"
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={projectStatusFilter}
                        onChange={(e) => setProjectStatusFilter(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">All Statuses</option>
                        {projectStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredProjects.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-600 text-white">
                            <th className="p-3 text-left">Project ID</th>
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProjects.map((project, index) => (
                            <tr key={project._id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                              <td className="p-3">{project._id}</td>
                              <td className="p-3 font-medium">{project.Title}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                  ${project.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'}`}>
                                  {project.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
                      <p className="text-gray-600">No projects found matching your criteria.</p>
                    </div>
                  )}
                </section>

                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Institute Users</h2>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg mb-4 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                      <input
                        type="text"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        placeholder="Search users..."
                        className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-600 text-white">
                            <th className="p-3 text-left">User Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Department</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user, index) => (
                            <tr key={user._id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                              <td className="p-3 font-medium">{user.Name}</td>
                              <td className="p-3">{user.email}</td>
                              <td className="p-3">{user.Dept}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
                      <p className="text-gray-600">No users found matching your criteria.</p>
                    </div>
                  )}
                </section>

                <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-medium text-indigo-700 mb-2">Dashboard Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded shadow">
                      <p className="text-sm text-gray-500">Total Projects</p>
                      <p className="text-2xl font-bold">{projects.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                      <p className="text-sm text-gray-500">Departments</p>
                      <p className="text-2xl font-bold">{departments.length}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default InstituteDashboard;