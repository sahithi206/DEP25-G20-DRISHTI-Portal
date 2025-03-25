import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../Context/Authcontext";
const API_BASE_URL = import.meta.env.VITE_REACT_APP_URL;
const GeneralInfo = ({ generalInfo }) => {
    const [userId, setId] = useState(null);
    const [data, setData] = useState({});
    const [projects, setProjects] = useState({});
    const { getuser, submitGeneralInfo } = useContext(AuthContext);
    useEffect(() => {
        const user = async () => {
            console.log("Gen", generalInfo);
            try {
                const User = await getuser();
                setData(User);
                setId(User._id);
            } catch (e) {
                console.log(e);
            }
        };
        user();
        const nochange = () => {
            if (generalInfo) {
                setProjects({
                    dbtProjectsOngoing: generalInfo.DBTproj_ong,
                    dbtProjectsCompleted: generalInfo.DBTproj_completed,
                    projectsOngoing: generalInfo.Proj_ong,
                    projectsCompleted: generalInfo.Proj_completed,
                    biodata: generalInfo.biodata,
                    photo: generalInfo.photo,
                });
            }
        }
        nochange()
    }, [getuser, generalInfo]);
    const handleChange = (e) => {
        setProjects({ ...projects, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await submitGeneralInfo({
                name: data.Name,
                address: data.address,
                mobileNo: data.Mobile,
                email: data.email,
                instituteName: data.Institute,
                areaOfSpecialization: data.Dept,
                DBTproj_ong: projects.dbtProjectsOngoing,
                DBTproj_completed: projects.dbtProjectsCompleted,
                Proj_ong: projects.projectsOngoing,
                Proj_completed: projects.projectsCompleted,
                biodata: projects.biodata,
                photo: projects.photo
            });
            if (response.success) {
                alert(response.msg);
            }
        } catch (error) {
            console.error("Error submitting general info:", error.message);
            alert("Failed to submit general info");
        }
    };
    const handleFileUpload = async (e, fileType) => {
        const file = e.target.files[0];
        if (!file) {
            alert("Please select a file.");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            const url = `${API_BASE_URL}form/upload/${fileType}/${userId}`;
            const response = await axios.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (fileType === "pdf") {
                setProjects((prevProjects) => ({
                    ...prevProjects,
                    biodata: response.data.filePath || response.data.filename
                }));
            } else {
                setProjects((prevProjects) => ({
                    ...prevProjects,
                    photo: response.data.filePath || response.data.filename
                }));
            }
            alert(`Upload Successful! File Path: ${response.data.filePath}`);
        } catch (error) {
            console.log("Upload Error:", error.message);
            alert("Upload failed. Ensure the file type & size are correct.");
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white shadow-md rounded">
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <p><strong>Email:</strong> {data.email}</p>
                <p><strong>Name:</strong> {data.Name}</p>
                <p><strong>Date of Birth:</strong> {data.DOB}</p>
                <p><strong>Mobile Number:</strong> {data.Mobile}</p>
                <p><strong>Gender:</strong> {data.Gender}</p>
                <p><strong>Institute:</strong> {data.Institute}</p>
                <p><strong>Department:</strong> {data.Dept}</p>
                <p><strong>Nationality:</strong> Indian</p>
            </div>
            <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="mt-4">
                        <label className="block font-semibold text-red-600">
                            Biodata* (Only .pdf - max size 10 MB)
                        </label>
                        <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, "pdf")} />
                    </div>
                    <div className="mt-4">
                        <label className="block font-semibold text-red-600">
                            Photo* (Only .jpg - max size 500 KB)
                        </label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "photo")} />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of ResearchX Projects (Ongoing):</label>
                        <input
                            type="number"
                            name="dbtProjectsOngoing"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={projects.dbtProjectsOngoing || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of ResearchX Projects (Completed):</label>
                        <input
                            type="number"
                            name="dbtProjectsCompleted"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={projects.dbtProjectsCompleted || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of Other Projects (Ongoing):</label>
                        <input
                            type="number"
                            name="projectsOngoing"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={projects.projectsOngoing || ""}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block font-semibold">No. of Other Projects (Completed):</label>
                        <input
                            type="number"
                            name="projectsCompleted"
                            className="w-full p-2 border rounded"
                            min="0"
                            value={projects.projectsCompleted || ""}
                            onChange={handleChange}
                        />
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
