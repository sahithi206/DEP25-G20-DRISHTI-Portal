import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { AuthContext } from "../Context/Authcontext";
import InstituteSidebar from "../../components/InstituteSidebar";

const SanctionedDashboard = () => {
  const { projectId } = useParams(); 
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("sanctioned-projects");
  const { fetchInstituteGetProject } = useContext(AuthContext);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchInstituteGetProject(projectId);
        console.log("Project Response:", response); // Debugging line to check fetched data

        if (response && response.data) {
          setProjectDetails(response.data); 
        } else {
          console.error("Invalid response structure:", response);
          alert("Project data is not in the expected format.");
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        alert("Failed to fetch project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, fetchInstituteGetProject]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-grow">
          <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <main className="flex-grow container mx-auto p-6">
            <p className="text-center">Loading project details...</p>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  // If no project details are found
  if (!projectDetails) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-grow">
          <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          <main className="flex-grow container mx-auto p-6">
            <p className="text-center">Project details not found.</p>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  // Render project details
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Project Details</h1>

          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">Project Information</h2>
            <div className="mt-4">
              <p><strong>Project ID:</strong> {projectDetails._id}</p>
              <p><strong>Scheme:</strong> {projectDetails.Scheme}</p>
              <p><strong>Title:</strong> {projectDetails.Title}</p>
              <p><strong>Current Year:</strong> {projectDetails.currentYear}</p>
            </div>

            <h2 className="text-xl font-semibold mt-6">Budget Information</h2>
            <div className="mt-4">
              <p><strong>Sanctioned Budget:</strong> {projectDetails.budget}</p>
              <p><strong>Used Budget:</strong> {projectDetails.budgetUsed}</p>
              <p><strong>Unspent Budget:</strong> {projectDetails.budgetUnspent}</p>
            </div>

            <h2 className="text-xl font-semibold mt-6">Additional Information</h2>
            <div className="mt-4">
              <p><strong>General Info:</strong> {projectDetails.generalInfo}</p>
              <p><strong>Research Details:</strong> {projectDetails.researchDetails}</p>
              <p><strong>PI Details:</strong> {projectDetails.PIDetails}</p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SanctionedDashboard;
