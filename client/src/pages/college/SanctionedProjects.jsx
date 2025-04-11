import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { AuthContext } from "../Context/Authcontext";
import InstituteSidebar from "../../components/InstituteSidebar";

const SanctionedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("sanctioned-projects");
  const { fetchSanctionedProjects } = useContext(AuthContext);

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
        alert("Failed to fetch sanctioned projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [fetchSanctionedProjects]);

  return (
    <div className="flex flex-col min-h-screen">
  <Navbar />
  <div className="flex flex-grow">
    <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
    <main className="flex-grow container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Sanctioned Projects in Your Institute</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          </div>
        ) : projects?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Project ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Scheme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">{project._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">{project.Scheme}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 font-medium">{project.Title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-blue-600">
                    {(() => {
                      const endDate = new Date(project.endDate);
                      const timeLeft = endDate - new Date();
                      if (timeLeft > 0) {
                        const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                        return `${daysLeft}`;
                      } else {
                        return "Time expired";
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/view-expenses/${project._id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                    >
                      Add Expenses
                    </Link>
                    <Link
                      to={`/ucInsti/${project._id}`}
                      className="bg-green-500 text-white px-3 py-1 rounded ml-2 hover:bg-green-600 transition duration-200"
                    >
                      View UC
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No sanctioned projects found in your institute.</p>
          </div>
        )}
      </div>
    </main>
  </div>
  <Footer />
</div>

  );
};

export default SanctionedProjects;

