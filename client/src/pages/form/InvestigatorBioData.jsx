import React, { useState } from "react";

const InvestigatorBiodata = () => {
    const [investigator, setInvestigator] = useState("");
    const [scst, setScst] = useState("No");
    const [basicDetailsSaved, setBasicDetailsSaved] = useState(false);

    const handleSave = () => {
        setBasicDetailsSaved(true);
        alert("Basic details saved successfully!");
    };

    return (
        <div className="p-4 bg-white shadow rounded-lg border">
            <label className="block font-semibold mb-2">Select Investigator:</label>
            <select 
                className="w-full p-2 border rounded" 
                value={investigator} 
                onChange={(e) => setInvestigator(e.target.value)}
            >
                <option value="">-- Select Investigator --</option>
                <option value="Investigator 1">Investigator 1</option>
                <option value="Investigator 2">Investigator 2</option>
            </select>

            <div className="mt-4 border-b pb-2">
                <nav className="flex space-x-4">
                    <button className="px-4 py-2 bg-green-600 text-white rounded">Basic Details</button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled={!basicDetailsSaved}>Education Details</button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled={!basicDetailsSaved}>Employment Details</button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled={!basicDetailsSaved}>Award/Honours Details</button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled={!basicDetailsSaved}>Publication Details</button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled={!basicDetailsSaved}>Project Details</button>
                </nav>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Basic Details</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold">Name:</label>
                        <input type="text" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block font-semibold">Designation:</label>
                        <input type="text" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block font-semibold">Department:</label>
                        <input type="text" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block font-semibold">Institute/University:</label>
                        <input type="text" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block font-semibold">Date of Birth:</label>
                        <input type="date" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block font-semibold">Gender:</label>
                        <select className="w-full p-2 border rounded">
                            <option value="">-- Select --</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold">SC/ST:</label>
                        <select className="w-full p-2 border rounded" value={scst} onChange={(e) => setScst(e.target.value)}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                </div>
                <button 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleSave}
                >
                    Save Basic Details
                </button>
            </div>
            <p className="mt-2 text-red-600 font-semibold">Help: Please save Basic Details to fill further information in other tabs.</p>
        </div>
    );
};

export default InvestigatorBiodata;
