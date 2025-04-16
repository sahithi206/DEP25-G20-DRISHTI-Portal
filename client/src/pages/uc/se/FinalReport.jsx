import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import { PlusCircle, MinusCircle } from "lucide-react";

import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const url = import.meta.env.VITE_REACT_APP_URL;
export default function Report() {
  const [page, setPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState({});
  const { getuser, getProject } = useContext(AuthContext);
  const [newEquipment, setNewEquipment] = useState({
    equipment: "",
    cost: "",
    working: "",
    rate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEquipment((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEquipment = () => {
    if (!newEquipment.equipment || !newEquipment.cost || !newEquipment.working || !newEquipment.rate) {
      alert("Please fill all fields");
      return;
    }
    setData((prevData) => ({
      ...prevData,
      majorEquipment: [...prevData.majorEquipment, newEquipment],
    }));
    setNewEquipment({ equipment: "", cost: "", working: "", rate: "" });
  };
  const handleRemoveItem = (index) => {
    setData((prevState) => ({
      ...prevState,
      majorEquipment: Array.isArray(prevState.majorEquipment)
        ? prevState.majorEquipment.filter((_, i) => i !== index)
        : [],
    }));
  };


  const [data, setData] = useState({
    projectId: "",
    projectTitle: "",
    currentYear: 1,
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
      papersInCitedJournals: [""],
      papersInConferences: [""],
      patentsFiled: [""]
    },
    majorEquipment: [{ equipment: "", cost: 0, working: "", rate: "" }]
  });
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
    researchArea: 100,
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
          currentYear: info.project?.currentYear || 1,
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
        console.log(error.message)
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
          type: "Final",
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
  const updateResearchPublication = (e, index, section) => {
    setData((prevState) => {
      const updatedArray = Array.isArray(prevState.researchPublications[section])
        ? [...prevState.researchPublications[section]]
        : [];

      updatedArray[index] = e.target.value; // Update the specific index

      return {
        ...prevState,
        researchPublications: {
          ...prevState.researchPublications,
          [section]: updatedArray,
        },
      };
    });
  };

  const addResearchPublication = (section) => {
    setData((prevState) => ({
      ...prevState,
      researchPublications: {
        ...prevState.researchPublications,
        [section]: [
          ...(Array.isArray(prevState.researchPublications[section])
            ? prevState.researchPublications[section]
            : []),
          "",
        ],
      },
    }));
  };

  const removeResearchPublication = (index, section) => {
    setData((prevState) => ({
      ...prevState,
      researchPublications: {
        ...prevState.researchPublications,
        [section]: prevState.researchPublications[section].filter((_, i) => i !== index),
      },
    }));
  };

  const nextPage = () => setPage((prev) => Math.min(prev + 1, 4));
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

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
          <div className="bg-white shadow-md rounded-lg p-10 mt-6 border-t-4 border-blue-800">
            {page === 1 && (
              <>
                <h1 className="text-3xl font-semibold mb-8">Project Details</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <label className="font-semibold text-gray-700">Project Title</label>
                  <span className="px-3 py-1 w-full"> {data.projectTitle}</span>
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
                </div>
              </>
            )}

            {page === 2 && (
              <>
                <h1 className="text-3xl font-semibold mb-4">Financial Details</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <label className="font-semibold text-gray-700">Summary of Progress</label>
                  <div>
                    <textarea
                      name="researchAchievements.summaryOfProgress"
                      value={data.researchAchievements.summaryOfProgress}
                      onChange={handleChange}
                      rows={6}
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
                      rows={4}

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
                  <div className="grid grid-cols-2  mb-4">
                    <label className="font-semibold text-gray-700">Application Potential</label>
                  </div>
                  <div className="grid grid-cols-1  mb-4">
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <label className="font-semibold text-gray-700">Long Term</label>
                    <div>
                      <textarea
                        className="px-3 py-1 w-full border rounded-lg"
                        maxLength={maxLengths.longTerm}
                      />
                      <p className="text-sm text-gray-500">
                        {getCharactersLeft("longTerm", data.researchAchievements.applicationPotential.longTerm)} characters left
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <label className="font-semibold text-gray-700">Immediate</label>
                    <div>
                      <textarea
                        className="px-3 py-1 w-full border rounded-lg"
                        maxLength={maxLengths.immediate}
                      />
                      <p className="text-sm text-gray-500">
                        {getCharactersLeft("immediate", data.researchAchievements.applicationPotential.immediate)} characters left
                      </p>
                    </div>
                  </div>

                  <label className="font-semibold text-gray-700">Other Achievements</label>

                  <div>
                    <textarea
                      name="researchAchievements.otherAchievements"
                      value={data.researchAchievements.otherAchievements}
                      onChange={handleChange}
                      rows={3}
                      className="px-3 py-1 w-full border rounded-lg"
                      maxLength={maxLengths.otherAchievements}
                    />
                    <p className="text-sm text-gray-500">
                      {getCharactersLeft("otherAchievements", data.researchAchievements.otherAchievements)} characters left
                    </p>
                  </div>
                </div>
              </>
            )}
            {page === 3 && (
              <>
                <h1 className="text-3xl font-semibold mb-4">Research Publications</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                </div>
                {Object.entries(data.researchPublications).map(([section, items]) => (
                  <div key={section} className="mb-4">
                    {/* Section Heading with Plus Button */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold capitalize">
                        {section.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <button
                        onClick={() => addResearchPublication(section)}
                        className="text-green-500 hover:text-green-700 pr-2"
                      >
                        <PlusCircle className="w-5 h-5" />

                      </button>
                    </div>

                    {/* Input Fields */}
                    {items.map((item, index) => (
                      <div key={index} className="flex space-x-2 mb-2 items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateResearchPublication(e, index, section)}
                          className="px-3 py-1 w-full border rounded-lg"
                        />
                        <button
                          onClick={() => removeResearchPublication(index, section)}
                          className="text-red-500 hover:text-red-700 text-xl pr-2"
                        >
                          <MinusCircle className="w-5 h-5" />

                        </button>
                      </div>
                    ))}
                  </div>
                ))}

              </>
            )}

            {page === 4 && (
              <>
                <h1 className="text-3xl font-semibold mb-4">Achievements & Future Work</h1>

                {/* Equipment Input Form */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <label className="font-semibold text-gray-700">Equipment Name & Model</label>
                  <input
                    type="text"
                    name="equipment"
                    value={newEquipment.equipment}
                    onChange={handleInputChange}
                    className="px-3 py-1 w-full border rounded-lg"
                  />

                  <label className="font-semibold text-gray-700">Cost (Rs in lakhs)</label>
                  <input
                    type="number"
                    name="cost"
                    value={newEquipment.cost}
                    onChange={handleInputChange}
                    className="px-3 py-1 w-full border rounded-lg"
                  />

                  <label className="font-semibold text-gray-700">Working (Yes/No)</label>
                  <input
                    type="text"
                    name="working"
                    value={newEquipment.working}
                    onChange={handleInputChange}
                    className="px-3 py-1 w-full border rounded-lg"
                  />

                  <label className="font-semibold text-gray-700">Utilisation Rate (%)</label>
                  <input
                    type="text"
                    name="rate"
                    value={newEquipment.rate}
                    onChange={handleInputChange}
                    className="px-3 py-1 w-full border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleAddEquipment}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
                >
                  Add Equipment
                </button>

                {/* Display Table Only if Data Exists */}
                {data.majorEquipment.length > 0 && (
                  <table className="border border-black w-full text-center mb-4">
                    <thead>
                      <tr className="border border-black">
                        <th className="border border-black px-4 py-2">S No</th>
                        <th className="border border-black px-4 py-2">Equipment (Model and Make)</th>
                        <th className="border border-black px-4 py-2">Cost (Rs in lakhs)</th>
                        <th className="border border-black px-4 py-2">Working (Yes/ No)</th>
                        <th className="border border-black px-4 py-2">Utilisation Rate (%)</th>
                        <th className="border border-black px-4 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.majorEquipment.map((row, index) => (
                        <tr key={index} className="border border-black">
                          <td className="border border-black px-4 py-2">{index + 1}</td>
                          <td className="border border-black px-4 py-2">{row.equipment}</td>
                          <td className="border border-black px-4 py-2">{row.cost}</td>
                          <td className="border border-black px-4 py-2">{row.working}</td>
                          <td className="border border-black px-4 py-2">{row.rate}</td>
                          <td className="border border-black px-4 py-2">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            <div className="flex justify-between con mt-4">
              {page === 1 && (
                <button onClick={nextPage} className="bg-blue-500 text-white py-2 px-4 rounded-md ml-auto p-8 hover:bg-blue-700">
                  Next
                </button>
              )}

              {page > 1 && (
                <button onClick={prevPage} className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600">
                  Previous
                </button>
              )}
              {page < 4 && page > 1 && (
                <button onClick={nextPage} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                  Next
                </button>
              )}
              {page === 4 && (
                <button onClick={handleSubmit} className="bg-blue-500 text-white py-2 px-4 rounded-md ml-auto p-8 hover:bg-blue-700">
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
