// This file is for managing and submitting technical details for proposals, including CSV parsing for data input.

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/Authcontext";
import { toast } from "react-toastify";
const TechForm = ({ researchDetails }) => {
    const section = "technicalDetails";
    const [data, setData] = useState({});
    const { submitResearchDetails } = useContext(AuthContext);
    useEffect(() => {
        const nochange = async () => {
            if (researchDetails) {
                setData({
                    proposalTitle: researchDetails.Title,
                    projectDuration: researchDetails.Duration,
                    projectSummary: researchDetails.Summary,
                    objectives: researchDetails.objectives.join("\n"),
                    expectedOutput: researchDetails.Output,
                    otherDetails: researchDetails.other
                })
            }
        }
        nochange();
    }, [researchDetails]);
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const csvData = e.target.result;
            const lines = csvData.trim().split(/\r?\n/);

            // Parse header
            const headers = parseCSVRow(lines[0]);

            // Only process the first data row
            const values = parseCSVRow(lines[1] || "");

            const jsonData = headers.reduce((acc, header, index) => {
                acc[header.trim()] = values[index]?.trim() || "";
                return acc;
            }, {});

            setData(jsonData);
        } catch (err) {
            console.error("Error reading CSV:", err);
        }
    };

    reader.readAsText(file);
};

// Basic CSV row parser to handle quoted fields
function parseCSVRow(row) {
    const result = [];
    let current = "", insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"' && row[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
const csvTemplate = `proposalTitle,projectDuration,projectSummary,objectives,expectedOutput,otherDetails
"Sample Title",12,"Summary with, comma","Objective 1","Output","Other details"`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await submitResearchDetails({
                Title: data.proposalTitle,
                Duration: data.projectDuration,
                Summary: data.projectSummary,
                objectives: data.objectives
                    .split("\n")
                    .map((obj) => obj.trim())
                    .filter((obj) => obj !== ""),
                Output: data.expectedOutput,
                other: data.otherDetails
            });
            if (response.success) {
                toast.success(response.msg);
            }
        } catch (error) {
            console.error("Error submitting research details:", error.message);
            toast.error("Failed to submit research details");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between">
                  <div className="flex justify-between items-center ">
                <h1 className="text-2xl font-bold mb-9">Technical Details</h1>
            </div>
            <div>
                 <div className="flex justify-end items-center mb-2">
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileUpload}
                />
                <label
                    htmlFor="fileInput"
                    className="px-5 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                >
                    Import CSV
                </label>
            </div>
            <div className="flex justify-end items-center mb-2">
                  <a
                    href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvTemplate)}`}
                    download="template.csv"
                    className="text-blue-600 text-sm underline"
                >
                    Download Template
                </a>
            </div>
            </div>
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
        </div >
    );
};

export default TechForm;
