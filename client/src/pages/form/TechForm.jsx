import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/Authcontext";

const TechForm = ({ researchDetails }) => {
    const section = "technicalDetails";
    const [data, setData] = useState({});
    const { submitResearchDetails} = useContext(AuthContext);
    useEffect(()=>{
        const nochange =async ()=>{
            if(researchDetails){
                    setData({  
                        proposalTitle:researchDetails.Title,
                        projectDuration:researchDetails.Duration,
                        projectSummary:researchDetails.Summary,
                        objectives: researchDetails.objectives.join("\n"),
                        expectedOutput:researchDetails.Output,
                        otherDetails:researchDetails.other
                    })
            }
        }
        nochange();
    },[researchDetails]);
    const charLimits = {
        proposalTitle: 100,
        projectSummary: 500,
        objectives: 500,
        expectedOutput: 500,
        otherDetails: 500,
    };

    

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (!charLimits[name] || value.length <= charLimits[name]) {
            setData({ ...data, [name]: value });
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setData(jsonData);
                } catch (error) {
                    console.error("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await submitResearchDetails({
                Title: data.proposalTitle,
                Duration: data.projectDuration,
                Summary: data.projectSummary,
                objectives: data.objectives.split("\n"),
                Output: data.expectedOutput,
                other: data.otherDetails
            });
            if (response.success) {
                alert(response.msg);
            }
        } catch (error) {
            console.error("Error submitting research details:", error.message);
            alert("Failed to submit research details");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-4">Technical Details</h1>
                <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileUpload}
                />
                <label
                    htmlFor="fileInput"
                    className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                >
                    Import CSV
                </label>
            </div>

            <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block font-semibold">Proposal Title:</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            name="proposalTitle"
                            value={data.proposalTitle || ""}
                            onChange={handleChange}
                        />
                        <p className="text-right text-sm text-gray-500">
                            {charLimits.proposalTitle - (data.proposalTitle?.length || 0)} characters left
                        </p>
                    </div>

                    <div className="col-span-2">
                        <label className="block font-semibold">Project Duration (Months):</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            name="projectDuration"
                            value={data.projectDuration || ""}
                            onChange={handleChange}
                        />
                    </div>

                    {["projectSummary", "objectives", "expectedOutput", "otherDetails"].map((field) => (
                        <div className="col-span-2" key={field}>
                            <label className="block font-semibold">
                                {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                            </label>
                            <textarea
                                className="w-full p-2 border rounded"
                                rows="3"
                                name={field}
                                value={data[field] || ""}
                                onChange={handleChange}
                            />
                            <p className="text-right text-sm text-gray-500">
                                {charLimits[field] - (data[field]?.length || 0)} characters left
                            </p>
                        </div>
                    ))}
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                </button>
            </form>
        </div>
    );
};

export default TechForm;
