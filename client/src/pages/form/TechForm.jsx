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
            </form>
        </div>
    );
};

export default TechForm;
