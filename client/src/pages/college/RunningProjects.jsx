import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { AuthContext } from "../Context/Authcontext";
import InstituteSidebar from "../../components/InstituteSidebar";

const RunningProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("projects");
  const { fetchInstituteProjects } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const projectsData = await fetchInstituteProjects();
        if (projectsData) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        alert("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [fetchInstituteProjects]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Accepted Projects in Your Institute</h1>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : projects.length > 0 ? (
            <table className="w-full border text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">User Name</th>
                  <th className="border p-2">Project ID</th>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Description</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} className="border">
                    <td className="border p-2">{project.userId.Name}</td>
                    <td className="border p-2">
                      <Link to={`/project-dashboard/${project._id}`} className="text-blue-500 underline">
                        {project._id} (View)
                      </Link>
                    </td>
                    <td className="border p-2">{project.title}</td>
                    <td className="border p-2">{project.description}</td>
                    <td className="border p-2">{project.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No accepted projects found in your institute.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default RunningProjects;