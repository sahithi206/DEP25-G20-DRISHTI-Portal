import { useState } from "react";
import Footer from "../../components/Footer";

const GeneralInfo = () => {
    const [formData, setFormData] = useState({
        projectTitle: "",
        projectSummary: "",
        projectDurationYear: "",
        projectDurationMonth: "",
        multiInstitute: "",
        numOfInstitutes: 1,
        projectKeyword: "",
        requiresEthicalClearance: "",
        industryCollaboration: "",
        additionalDetails: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    return (
        <div className="p-4 bg-white shadow rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">General Information</h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold">Coordinator:</label>
                        <span className="block">Ms. Shalini Palla</span>
                    </div>
                    <div>
                        <label className="block font-semibold">Institute:</label>
                        <span className="block">IIT Ropar</span>
                    </div>
                    <div>
                        <label className="block font-semibold">Head of Institute:</label>
                        <span className="block">Prof. Sarit K. Das</span>
                    </div>
                    <div>
                        <label className="block font-semibold">Category of Institute/Organization:</label>
                        <select name="category" className="w-full p-2 border rounded" onChange={handleChange}>
                            <option>Others</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold">Area:</label>
                        <input type="text" value="Cell & Gene Therapy" disabled className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block font-semibold">Project Title:</label>
                        <input
                            type="text"
                            name="projectTitle"
                            className="w-full p-2 border rounded"
                            value={formData.projectTitle}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Project Summary:</label>
                        <textarea
                            name="projectSummary"
                            className="w-full p-2 border rounded"
                            rows="3"
                            value={formData.projectSummary}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block font-semibold">Project Duration (Year):</label>
                        <select
                            name="projectDurationYear"
                            className="w-full p-2 border rounded"
                            value={formData.projectDurationYear}
                            onChange={handleChange}
                        >
                            <option>--Select--</option>
                            <option value="1">1 Year</option>
                            <option value="2">2 Years</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold">Project Duration (Month):</label>
                        <select
                            name="projectDurationMonth"
                            className="w-full p-2 border rounded"
                            value={formData.projectDurationMonth}
                            onChange={handleChange}
                        >
                            <option>--Select--</option>
                            <option value="6">6 Months</option>
                            <option value="12">12 Months</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold">Multi Institute:</label>
                        <select
                            name="multiInstitute"
                            className="w-full p-2 border rounded"
                            value={formData.multiInstitute}
                            onChange={handleChange}
                        >
                            <option>--Select--</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold">No. of Institutes:</label>
                        <input
                            type="number"
                            name="numOfInstitutes"
                            className="w-full p-2 border rounded"
                            min="1"
                            value={formData.numOfInstitutes}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Project Keyword:</label>
                        <textarea
                            name="projectKeyword"
                            className="w-full p-2 border rounded"
                            rows="2"
                            value={formData.projectKeyword}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block font-semibold">Requires Ethical Clearance:</label>
                        <select
                            name="requiresEthicalClearance"
                            className="w-full p-2 border rounded"
                            value={formData.requiresEthicalClearance}
                            onChange={handleChange}
                        >
                            <option>--Select--</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold">Industry Collaboration:</label>
                        <select
                            name="industryCollaboration"
                            className="w-full p-2 border rounded"
                            value={formData.industryCollaboration}
                            onChange={handleChange}
                        >
                            <option>--Select--</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Additional Details:</label>
                        <textarea
                            name="additionalDetails"
                            className="w-full p-2 border rounded"
                            rows="2"
                            value={formData.additionalDetails}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                </button>
            </form>
        </div>
    );
    
};

export default GeneralInfo;
