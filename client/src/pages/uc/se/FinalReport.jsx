import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";

const url = import.meta.env.VITE_REACT_APP_URL;

const ProgressReportForm = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const { getuser, getProject } = useContext(AuthContext);
    const [user, setUser] = useState({});
    const [data, setData] = useState({
        projectId: "",
        projectTitle: "",
        principalInvestigator: [],
        coPrincipalInvestigator: [],
        researchArea: "",
        approvedObjectives: "",
        dateOfStart: "",
        totalProjectCost: 0,
        dateOfCompletion: "",
        expenditureAsOn: 0,
        methodology: "",
        researchAchievements: {
            summaryOfProgress: "",
            newObservations: "",
            innovations: "",
            applicationPotential: { longTerm: "", immediate: "" },
            otherAchievements: ""
        },
        remainingWork: "",
        phdProduced: 0,
        technicalPersonnelTrained: 0,
        researchPublications: {
            papersInCitedJournals: [],
            papersInConferences: [],
            patentsFiled: []
        },
        majorEquipment: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const maxLengths = {
        approvedObjectives: 500,
        methodology: 500,
        summaryOfProgress: 1000,
        newObservations: 500,
        innovations: 500,
        longTerm: 500,
        immediate: 500,
        otherAchievements: 500,
        remainingWork: 500,
        researchArea:100,
    };

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const user = await getuser();
                setUser(user);
                console.log(id);
                const json = await getProject(id);
                const info = json.data;

                setData(prevData => ({
                    ...prevData,
                    projectId: info.project?._id || "",
                    projectTitle: info.project?.Title || "",
                    principalInvestigator: info.PIDetails?.piList || [],
                    coPrincipalInvestigator: info.PIDetails?.coPiList || [],
                    approvedObjectives: info.researchDetails?.objectives || "",
                    dateOfStart: info.project?.startDate || "",
                    totalProjectCost: info.project?.TotalCost || 0,
                    dateOfCompletion: info.project?.endDate || "",
                    expenditureAsOn: info.project?.TotalUsed || 0,
                    methodology: info.project?.methodology || "",
                    researchAchievements: info.project?.researchAchievements || prevData.researchAchievements,
                    remainingWork: info.project?.remainingWork || "",
                    phdProduced: info.project?.phdProduced || 0,
                    technicalPersonnelTrained: info.project?.technicalPersonnelTrained || 0,
                    researchPublications: info.project?.researchPublications || prevData.researchPublications,
                    majorEquipment: info.project?.majorEquipment || []
                }));
                console.log(data.principalInvestigator);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setData(prevData => ({
                ...prevData,
                [parent]: {
                    ...prevData[parent],
                    [child]: value
                }
            }));
        } else if (name.includes("researchAchievements.applicationPotential.")) {
            const [, , subChild] = name.split(".");
            setData(prevData => ({
                ...prevData,
                researchAchievements: {
                    ...prevData.researchAchievements,
                    applicationPotential: {
                        ...prevData.researchAchievements.applicationPotential,
                        [subChild]: value
                    }
                }
            }));
        } else {
            setData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    const handleArrayChange = (e, field, index) => {
        const { value } = e.target;
        setData(prevData => ({
            ...prevData,
            [field]: prevData[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleAddItem = (field) => {
        setData(prevData => ({
            ...prevData,
            [field]: [...prevData[field], ""]
        }));
    };

    const handleRemoveItem = (field, index) => {
        setData(prevData => ({
            ...prevData,
            [field]: prevData[field].filter((_, i) => i !== index)
        }));
    };

    
const handleSubmit = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
      alert("Authentication required.");
      return;
  }
  try {
      const response = await fetch(`${url}projects/progress-report/${id}`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "accessToken": ` ${token}`,
          },
          body: JSON.stringify({
              data: {
                  ...data,
                  approvedObjectives: data.approvedObjectives.join("\n"),
                  majorEquipment: Array.isArray(data.majorEquipment)
                      ? data.majorEquipment
                      : [data.majorEquipment] 
              }
          })
      });
      const json = await response.json();
      console.log(json.data);
      if (json.success) {
          alert("Data submitted successfully!");
          navigate(`/project-dashboard/${id}`);
      } else {
          alert(json.msg);
      }
  } catch (error) {
      console.error("Error:", error);
      alert("Error in submitting data!");
  }
}; 

    const getCharactersLeft = (field, value) => {
        const maxLength = maxLengths[field] || Infinity;
        return maxLength - value.length;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Final Progress Report</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-10 mt-10 border-t-4 border-blue-800">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <label className="font-semibold text-gray-700">Project Title</label>
                            <span className="px-3 py-1 w-full">: {data.projectTitle}</span>
                            <label className="font-semibold text-gray-700">Principal Investigator(s)</label>
                            <div className="flex flex-col gap-1">
    {data.principalInvestigator && data.principalInvestigator.length > 0 && 
        data.principalInvestigator.map((pi, index) => (
            <div className="flex items-center gap-2" key={index}>
                <span className="text-sm text-gray-600">{index + 1}.</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                    {pi.Name || "Unnamed Investigator"}
                </span>
            </div>
        ))
    }
</div>
<label className="font-semibold text-gray-700">Co-Principal Investigator(s)</label>

<div className="flex flex-col gap-1">
    {data.coPrincipalInvestigator && data.coPrincipalInvestigator.length > 0 && 
        data.coPrincipalInvestigator.map((pi, index) => (
            <div className="flex items-center gap-2" key={index}>
                <span className="text-sm text-gray-600">{index + 1}.</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                    {pi.Name || "Unnamed Investigator"}
                </span>
            </div>
        ))
    }
</div>
                            <label className="font-semibold text-gray-700">Research Area</label>
                            <div>
                                <textarea
                                    name="researchArea"
                                    value={data.researchArea}
                                    onChange={handleChange}
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.researchArea}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("researchArea", data.researchArea)} characters left
                                </p>
                            </div>                            
                            <label className="font-semibold text-gray-700">Approved Objectives</label>
                            <div>
                                <textarea
                                    name="approvedObjectives"
                                    value={data.approvedObjectives}
                                    onChange={handleChange}
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.approvedObjectives}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("approvedObjectives", data.approvedObjectives)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">Date of Start</label>
                            <input
                                type="date"
                                name="dateOfStart"
                                value={data.dateOfStart}
                                onChange={handleChange}
                                className="px-3 py-1 w-full border rounded-lg"
                            />
                            <label className="font-semibold text-gray-700">Total Project Cost</label>
                            <input
                                type="number"
                                name="totalProjectCost"
                                value={data.totalProjectCost}
                                onChange={handleChange}
                                className="px-3 py-1 w-full border rounded-lg"
                            />
                            <label className="font-semibold text-gray-700">Date of Completion</label>
                            <input
                                type="date"
                                name="dateOfCompletion"
                                value={data.dateOfCompletion}
                                onChange={handleChange}
                                className="px-3 py-1 w-full border rounded-lg"
                            />
                            <label className="font-semibold text-gray-700">Expenditure As On</label>
                            <input
                                type="number"
                                name="expenditureAsOn"
                                value={data.expenditureAsOn}
                                onChange={handleChange}
                                className="px-3 py-1 w-full border rounded-lg"
                            />
                            <label className="font-semibold text-gray-700">Methodology</label>
                            <div>
                                <textarea
                                    name="methodology"
                                    value={data.methodology}
                                    onChange={handleChange}
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.methodology}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("methodology", data.methodology)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">Summary of Progress</label>
                            <div>
                                <textarea
                                    name="researchAchievements.summaryOfProgress"
                                    value={data.researchAchievements.summaryOfProgress}
                                    onChange={handleChange}
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.summaryOfProgress}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("summaryOfProgress", data.researchAchievements.summaryOfProgress)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">New Observations</label>
                            <div>
                                <textarea
                                    name="researchAchievements.newObservations"
                                    value={data.researchAchievements.newObservations}
                                    onChange={handleChange}
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.newObservations}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("newObservations", data.researchAchievements.newObservations)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">Innovations</label>
                            <div>
                                <textarea
                                    name="researchAchievements.innovations"
                                    value={data.researchAchievements.innovations}
                                    onChange={handleChange}
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.innovations}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("innovations", data.researchAchievements.innovations)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">Application Potential (Long Term)</label>
                            <div>
                                <textarea
                                 
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.longTerm}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("longTerm", data.researchAchievements.applicationPotential.longTerm)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">Application Potential (Immediate)</label>
                            <div>
                                <textarea
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.immediate}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("immediate", data.researchAchievements.applicationPotential.immediate)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">Other Achievements</label>
                            <div>
                                <textarea
                                    name="researchAchievements.otherAchievements"
                                    value={data.researchAchievements.otherAchievements}
                                    onChange={handleChange}
                                    className="px-3 py-1 w-full border rounded-lg"
                                    maxLength={maxLengths.otherAchievements}
                                />
                                <p className="text-sm text-gray-500">
                                    {getCharactersLeft("otherAchievements", data.researchAchievements.otherAchievements)} characters left
                                </p>
                            </div>
                            <label className="font-semibold text-gray-700">PhD Produced</label>
                            <input
                                type="number"
                                name="phdProduced"
                                value={data.phdProduced}
                                onChange={handleChange}
                                className="px-3 py-1 w-full border rounded-lg"
                            />
                            <label className="font-semibold text-gray-700">Technical Personnel Trained</label>
                            <input
                                type="number"
                                name="technicalPersonnelTrained"
                                value={data.technicalPersonnelTrained}
                                onChange={handleChange}
                                className="px-3 py-1 w-full border rounded-lg"
                            />
                            <label className="font-semibold text-gray-700">Major Equipment</label>
                            <div className="space-y-2">
                                {data.majorEquipment.map((equipment, index) => (
                                    <div key={index} className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={equipment}
                                            onChange={(e) => handleArrayChange(e, "majorEquipment", index)}
                                            className="px-3 py-1 w-full border rounded-lg"
                                        />
                                        <button
                                            onClick={() => handleRemoveItem("majorEquipment", index)}
                                            className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleAddItem("majorEquipment")}
                                    className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-700"
                                >
                                    Add Equipment
                                </button>
                            </div>
                        </div>
                        <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressReportForm;