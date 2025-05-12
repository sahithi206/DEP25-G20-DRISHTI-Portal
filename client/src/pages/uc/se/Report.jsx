import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";

const url = import.meta.env.VITE_REACT_APP_URL;

export default function Report() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${url}projects/reports/${id}`, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            accessToken: token,
          },
        });
        const fetchedReport = await res.json();
        console.log(fetchedReport);
        setReport(fetchedReport.data);
      } catch (error) {
        console.error("Error fetching report details:", error.message);
      }
    };
    fetchReportDetails();
  }, [id]);

 

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
        <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${report?.projectId._id}`} />
        <div className="p-6 space-y-6 mt-16">
          <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                                                          <img src="/3.png" alt="ResearchX Logo" className="mx-auto w-84 h-32 object-contain" />

            {report?.projectId?.currentYear && (
              <p className="text-lg font-semibold text-gray-600 mt-2">
                Yearly Report - {report?.projectId?.currentYear}
              </p>
            )}
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-10 mt-6 border-t-4 border-blue-800">
              <>
                <h1 className="text-3xl font-semibold mb-8">Project Details</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <label className="font-semibold text-gray-700">Project Title</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">{report?.projectTitle}</span>
                  
                  <label className="font-semibold text-gray-700">Principal Investigator(s)</label>
                  <div className="flex flex-col gap-1">
                    {report?.projectId?.PI && report?.projectId?.PI.length > 0 ? (
                      report?.projectId?.PI.map((pi, index) => (
                        <div className="flex items-center gap-2" key={index}>
                          <span className="text-sm text-gray-600">{index + 1}.</span>
                          <span className="px-3 py-2 bg-gray-100 rounded-md">
                            {pi || "Unnamed Investigator"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="px-3 py-2 bg-gray-50 rounded-lg text-gray-500">None specified</span>
                    )}
                  </div>
                  
                  <label className="font-semibold text-gray-700">Co-Principal Investigator(s)</label>
                  <div className="flex flex-col gap-1">
                    {report?.projectId?.CoPI && report?.projectId?.CoPI.length > 0 ? (
                     report?.projectId?.CoPI.map((pi, index) => (
                        <div className="flex items-center gap-2" key={index}>
                          <span className="text-sm text-gray-600">{index + 1}.</span>
                          <span className="px-3 py-2 bg-gray-100 rounded-md">
                            {pi || "Unnamed Investigator"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="px-3 py-2 bg-gray-50 rounded-lg text-gray-500">None specified</span>
                    )}
                  </div>
                  <label className="font-semibold text-gray-700">Type</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">{report?.type}</span>
                  <label className="font-semibold text-gray-700">Research Area</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">{report?.researchArea || "Not specified"}</span>
                  
                  <label className="font-semibold text-gray-700">Approved Objectives</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.approvedObjectives || "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700">Date of Start</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">{formatDate(report?.dateOfStart) || "Not specified"}</span>
                  
                  <label className="font-semibold text-gray-700">Total Project Cost</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">
                    {report?.totalProjectCost ? `₹${report?.totalProjectCost}` : "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700">Date of Completion</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">{formatDate(report?.dateOfCompletion) || "Not specified"}</span>
                  
                  <label className="font-semibold text-gray-700">Expenditure As On</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">
                    {report?.expenditureAsOn ? `₹${report?.expenditureAsOn}` : "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700">Methodology</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.methodology || "Not specified"}
                  </span>
                </div>
              </>

              <>
                <h1 className="text-3xl font-semibold mb-8">Research Achievements</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <label className="font-semibold text-gray-700">Summary of Progress</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.researchAchievements?.summaryOfProgress || "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700">New Observations</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.researchAchievements?.newObservations || "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700">Innovations</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.researchAchievements?.innovations || "Not specified"}
                  </span>
                  
                  <div className="col-span-2">
                    <h3 className="font-semibold text-gray-700 mb-2">Application Potential</h3>
                  </div>
                  
                  <label className="font-semibold text-gray-700 pl-4">- Long Term</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.researchAchievements?.applicationPotential?.longTerm || "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700 pl-4">- Immediate</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.researchAchievements?.applicationPotential?.immediate || "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700">Other Achievements</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.researchAchievements?.otherAchievements || "Not specified"}
                  </span>
                  
                  <label className="font-semibold text-gray-700">Remaining Work</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg whitespace-pre-line">
                    {report?.remainingWork || "Not specified"}
                  </span>
                </div>
              </>
    
              <>
                <h1 className="text-3xl font-semibold mb-8">Research Output</h1>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className="font-semibold text-gray-700">PhD Produced</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">
                    {report?.phdProduced || 0}
                  </span>
                  
                  <label className="font-semibold text-gray-700">Technical Personnel Trained</label>
                  <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">
                    {report?.technicalPersonnelTrained || 0}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Research Publications</h3>
                {Object.entries(report?.researchPublications || {}).map(([section, items]) => (
                  <div key={section} className="mb-6">
                    <h4 className="text-lg font-medium capitalize mb-2">
                      {section.replace(/([A-Z])/g, " $1")}
                    </h4>
                    
                    {items && items.length > 0 ? (
                      items.map((item, index) => (
                        <div key={index} className="flex mb-2 items-center">
                          <span className="px-3 py-2 w-full bg-gray-50 rounded-lg">
                            {item || "Not specified"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="px-3 py-2 bg-gray-50 rounded-lg text-gray-500 block">No entries</span>
                    )}
                  </div>
                ))}
              </>
            
              <>
                <h1 className="text-3xl font-semibold mb-8">Equipment Details</h1>
                
                {report?.majorEquipment && report?.majorEquipment.length > 0 ? (
                  <table className="min-w-full border border-gray-300 mb-6">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2">S No</th>
                        <th className="border border-gray-300 px-4 py-2">Equipment (Model and Make)</th>
                        <th className="border border-gray-300 px-4 py-2">Cost (₹ in lakhs)</th>
                        <th className="border border-gray-300 px-4 py-2">Working (Yes/No)</th>
                        <th className="border border-gray-300 px-4 py-2">Utilisation Rate (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report?.majorEquipment.map((equipment, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-4 py-2">{equipment?.equipment || "Not specified"}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {equipment?.cost ? equipment?.cost : "Not specified"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {equipment?.working || "Not specified"}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {equipment?.rate || "Not specified"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-4 py-6 bg-gray-50 rounded-lg text-center text-gray-500">
                    No equipment details available
                  </div>
                )}
              </>
                
          </div>
        </div>
      </div>
    </div>
  );
}