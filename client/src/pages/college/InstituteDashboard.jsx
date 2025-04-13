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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Institute Dashboard</h1>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4">Accepted Projects</h2>
                {projects.length > 0 ? (
                  <table className="w-full border text-center">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">Project ID</th>
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project._id} className="border">
                          <td className="border p-2">{project._id}</td>
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
              </section>
              <section>
                <h2 className="text-xl font-bold mb-4">Institute Users</h2>
                {users.length > 0 ? (
                  <table className="w-full border text-center">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2">User Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border">
                          <td className="border p-2">{user.Name}</td>
                          <td className="border p-2">{user.email}</td>
                          <td className="border p-2">{user.Dept}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center">No users found in your institute.</p>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstituteDashboard;