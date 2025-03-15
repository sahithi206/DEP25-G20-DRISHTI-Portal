//  code for when we authenticate user role as institute 

// import React, { useEffect, useState, useContext } from "react";
// import { AuthContext } from "../Context/Authcontext";

// const RunningProjects = () => {
//   const [projects, setProjects] = useState([]);
//   const { fetchInstituteProjects } = useContext(AuthContext);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       const projectsData = await fetchInstituteProjects();
//       if (projectsData) {
//         setProjects(projectsData);
//       }
//     };

//     fetchProjects();
//   }, [fetchInstituteProjects]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Accepted Projects in Your Institute</h1>
//       {projects.length > 0 ? (
//         <table className="w-full border">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="border p-2">Project ID</th>
//               <th className="border p-2">Title</th>
//               <th className="border p-2">Description</th>
//               <th className="border p-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {projects.map((project) => (
//               <tr key={project._id} className="border">
//                 <td className="border p-2">{project._id}</td>
//                 <td className="border p-2">{project.title}</td>
//                 <td className="border p-2">{project.description}</td>
//                 <td className="border p-2">{project.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No accepted projects found in your institute.</p>
//       )}
//     </div>
//   );
// };

// export default RunningProjects;


// code without authentication


import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"; 
import Footer from "../../components/Footer"; 

const RunningProjects = () => {
  const [projects, setProjects] = useState([]);
  const [institute, setInstitute] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/institute/institute-projects?institute=${institute}`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Accepted Projects in Your Institute</h1>
        <input
          type="text"
          placeholder="Enter Institute Name"
          value={institute}
          onChange={(e) => setInstitute(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <button
          onClick={fetchProjects}
          className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Enter"}
        </button>
        {projects.length > 0 ? (
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
      <Footer />
    </div>
  );
};

export default RunningProjects;