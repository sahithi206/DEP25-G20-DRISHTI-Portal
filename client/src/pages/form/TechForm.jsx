<<<<<<< HEAD
import React, { useState } from "react";

const TechForm = () => {
    const [formData, setFormData] = useState({
        proposalTitle: "",
        projectDuration: "",
        projectSummary: "",
        objectives: "",
        expectedOutput: "",
        otherDetails: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted Data:", formData);
    };

    return (
        <div className="p-4 bg-white shadow rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block font-semibold">Proposal Title:</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded" 
                            name="proposalTitle" 
                            value={formData.proposalTitle} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Project Duration (Months):</label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded" 
                            name="projectDuration" 
                            value={formData.projectDuration} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Project Summary:</label>
                        <textarea 
                            className="w-full p-2 border rounded" 
                            rows="3" 
                            name="projectSummary" 
                            value={formData.projectSummary} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Objectives:</label>
                        <textarea 
                            className="w-full p-2 border rounded" 
                            rows="3" 
                            name="objectives" 
                            value={formData.objectives} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Expected Output:</label>
                        <textarea 
                            className="w-full p-2 border rounded" 
                            rows="3" 
                            name="expectedOutput" 
                            value={formData.expectedOutput} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Other Details:</label>
                        <textarea 
                            className="w-full p-2 border rounded" 
                            rows="3" 
                            name="otherDetails" 
                            value={formData.otherDetails} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
=======
import React, { useState, useEffect } from "react";

const TechForm = ({ formData, updateForm }) => {
    const section = "technicalDetails";
    const [data, setData] = useState(formData);

    // Character limits for each field
    const charLimits = {
        proposalTitle: 100,
        projectSummary: 500,
        objectives: 500,
        expectedOutput: 500,
        otherDetails: 500,
    };

    useEffect(() => {
        updateForm(section, data);
    }, [data]);

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
                    Import JSON
                </label>
            </div>

            <form className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-2 gap-4">
                    {/* Proposal Title */}
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

                    {/* Project Duration */}
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

                    {/* Textareas with character limits */}
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
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
            </form>
        </div>
    );
};

export default TechForm;
