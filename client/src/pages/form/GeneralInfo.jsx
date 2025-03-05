import { useState, useEffect } from "react";

const GeneralInfo = ({ formData, updateForm }) => {
    const [data, setData] = useState(formData);

    // Sync with parent state whenever local state changes
    useEffect(() => {
        updateForm("generalInfo", data);
    }, [data]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonData = JSON.parse(event.target.result);
                    setData(jsonData);
                } catch (error) {
                    console.error("Invalid JSON file", error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">General Information</h1>
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
                    <div className="col-span-2">
                        <label className="block font-semibold">Applicant Details:</label>
                        <textarea
                            name="applicantDetails"
                            className="w-full p-2 border rounded"
                            rows="2"
                            value={data.applicantDetails || ""}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block font-semibold">Area of Specialization:</label>
                        <input
                            type="text"
                            name="areaOfSpecialization"
                            className="w-full p-2 border rounded"
                            value={data.areaOfSpecialization || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">Scheme:</label>
                        <input
                            type="text"
                            name="scheme"
                            className="w-full p-2 border rounded"
                            value={data.scheme || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">Name:</label>
                        <input
                            type="text"
                            name="name"
                            className="w-full p-2 border rounded"
                            value={data.name || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">Department:</label>
                        <input
                            type="text"
                            name="department"
                            className="w-full p-2 border rounded"
                            value={data.department || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">Institute:</label>
                        <input
                            type="text"
                            name="institute"
                            className="w-full p-2 border rounded"
                            value={data.institute || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block font-semibold">Address:</label>
                        <textarea
                            name="address"
                            className="w-full p-2 border rounded"
                            rows="2"
                            value={data.address || ""}
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block font-semibold">Mobile:</label>
                        <input
                            type="text"
                            name="mobile"
                            className="w-full p-2 border rounded"
                            value={data.mobile || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">Email:</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full p-2 border rounded"
                            value={data.email || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of DBT Projects (Ongoing):</label>
                        <input
                            type="number"
                            name="dbtProjectsOngoing"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={data.dbtProjectsOngoing || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of DBT Projects (Completed):</label>
                        <input
                            type="number"
                            name="dbtProjectsCompleted"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={data.dbtProjectsCompleted || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of Projects (Ongoing):</label>
                        <input
                            type="number"
                            name="projectsOngoing"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={data.projectsOngoing || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of Projects (Completed):</label>
                        <input
                            type="number"
                            name="projectsCompleted"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={data.projectsCompleted || ""}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GeneralInfo;
