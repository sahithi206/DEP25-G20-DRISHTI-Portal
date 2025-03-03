import React, { useState } from "react";

const TechForm = () => {
    const [formData, setFormData] = useState({
        introduction: "",
        origin: "",
        status: "",
        relevance: "",
        applications: "",
        workDone: "",
        gapTechnology: "",
        outcome: "",
        references: "",
        methodology: "",
        features: "",
        referees: [],
        file: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const handleAddReferee = () => {
        setFormData({ ...formData, referees: [...formData.referees, ""] });
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
                    {["Introduction of Proposal", "Origin of Proposal (Unmet Needs) (500 Words)",
                      "Current Status (International & National)", "Relevance in Indian Context",
                      "Potential Applications in India", "Preliminary Work Done",
                      "Gap in Technology & Proposed Strategies", "Expected Outcome (Current & Expected TRL)",
                      "Details of References", "Details of Methodology", "Details of Salient/Novelty Features"
                    ].map((label, index) => (
                        <div key={index} className="col-span-2">
                            <label className="block font-semibold">{label}:</label>
                            <textarea 
                                className="w-full p-2 border rounded" 
                                rows="3" 
                                name={label.replace(/\s+/g, '').toLowerCase()}
                                value={formData[label.replace(/\s+/g, '').toLowerCase()]}
                                onChange={handleChange}
                            />
                        </div>
                    ))}
                    <div className="col-span-2">
                        <label className="block font-semibold">Institute Wise Objectives/Work Plan/Time Line:</label>
                        <button type="button" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Work Plan</button>
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Suggested Referees (Min 5):</label>
                        {formData.referees.map((_, i) => (
                            <input 
                                key={i} 
                                type="text" 
                                className="w-full p-2 border rounded mt-2" 
                                placeholder={`Referee ${i + 1}`}
                                onChange={(e) => {
                                    const newReferees = [...formData.referees];
                                    newReferees[i] = e.target.value;
                                    setFormData({ ...formData, referees: newReferees });
                                }}
                            />
                        ))}
                        <button type="button" onClick={handleAddReferee} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add More</button>
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Upload Figures/Flowcharts/Photographs:</label>
                        <input type="file" className="w-full p-2 border rounded" onChange={handleFileChange} />
                    </div>
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </form>
        </div>
    );
};

export default TechForm;