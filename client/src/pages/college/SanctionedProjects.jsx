// import React, { useState, useEffect, useContext } from "react";
// import { Link } from "react-router-dom";
// import Navbar from "../../components/Navbar";
// import Footer from "../../components/Footer";
// import { AuthContext } from "../Context/Authcontext";
// import InstituteSidebar from "../../components/InstituteSidebar";

// const SanctionedProjects = () => {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeSection, setActiveSection] = useState("sanctioned-projects");
//   const { fetchSanctionedProjects } = useContext(AuthContext);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       setLoading(true);
//       try {
//         const projectsData = await fetchSanctionedProjects();
//         if (projectsData) {
//           setProjects(projectsData);
//         }
//       } catch (error) {
//         console.error("Error fetching sanctioned projects:", error);
//         alert("Failed to fetch sanctioned projects");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProjects();
//   }, [fetchSanctionedProjects]);

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <div className="flex flex-grow">
//         <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
//         <main className="flex-grow container mx-auto p-6">
//           <h1 className="text-2xl font-bold mb-4 text-center">Sanctioned Projects in Your Institute</h1>
//           {loading ? (
//             <p className="text-center">Loading...</p>
//           ) : projects.length > 0 ? (
//             <table className="w-full border text-center">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border p-2">Project ID</th>
//                   <th className="border p-2">Scheme</th>
//                   <th className="border p-2">Title</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {projects.map((project) => (
//                   <tr key={project._id} className="border">
//                     {/* <td className="border p-2">
//                       <Link to={`/project-dashboard/${project._id}`} className="text-blue-500 underline">
//                         {project._id} (View)
//                       </Link>
//                     </td> */}
//                     <td className="border p-2">{project._id}</td>
//                     <td className="border p-2">{project.Scheme}</td>
//                     <td className="border p-2">{project.Title}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p className="text-center">No sanctioned projects found in your institute.</p>
//           )}
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default SanctionedProjects;


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
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : projects.length > 0 ? (
            <table className="w-full border text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Project ID</th>
                  <th className="border p-2">Scheme</th>
                  <th className="border p-2">Title</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} className="border">
                    <td className="border p-2">{project._id}</td>
                    <td className="border p-2">{project.Scheme}</td>
                    <td className="border p-2">{project.Title}</td>
                    <td className="border p-2">
                      <Link
                        // to={`/add-expenses/${project._id}`}
                        to={`/view-expenses/${project._id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Add Expenses
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center">No sanctioned projects found in your institute.</p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SanctionedProjects;

