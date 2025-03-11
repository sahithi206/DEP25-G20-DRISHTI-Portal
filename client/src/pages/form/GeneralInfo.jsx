import React, { useState,useContext,useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../Context/Authcontext";
const FileUpload = ({  }) => {
  const [file, setFile] = useState(null);
  const [userId,setId]=useState(null);
  const [fileType, setFileType] = useState("pdf"); 
  const [message, setMessage] = useState("");
  const {getuser}=useContext(AuthContext);
  useEffect(() => {
          const fetchData = async () => {
              const userData = await getuser();
              setId(userData._id);
          };
          fetchData();
      }, []);
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        console.log("Selected File:", selectedFile);
        setFile(selectedFile);
      };
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    console.log(formData)
    try {
      const response = await axios.post(
        `http://localhost:8001/upload/${fileType}/${userId}`, 
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log(response);
      setMessage(`Upload Successful! File Path: ${response.data.filePath}`);
    } catch (error) {
      console.error("Upload Error:", error.message);
      setMessage("Upload failed. Ensure the file type & size are correct.");
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      
      {/* Select file type */}
      <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
        <option value="photo">Photo</option>
        <option value="pdf">PDF</option>
      </select>

      {/* File input */}
      <input type="file" onChange={handleFileChange} />

      {/* Upload button */}
      <button onClick={handleUpload}>Upload</button>

      {/* Display message */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;

/*import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../Context/Authcontext";
const UserProfile = () => {
    const [biodata, setBiodata] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [data, setData] = useState({});
    const [projects, setProjects] = useState({})
    const { getuser, submitGeneralInfo,uploadFile } = useContext(AuthContext);
    useEffect(() => {
        const user = async () => {
            try {
                const User =await getuser();
                setData(User);
            }
            catch (e) {
                console.log(e);
            }
        }
        user();
    }, [getuser])
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
                DBTproj_ong: data.dbtProjectsOngoing,
                DBTproj_completed: data.dbtProjectsCompleted,
                Proj_ong: data.projectsOngoing,
                Proj_completed: data.projectsCompleted,

            });
            if (response.success) {
                alert("General info submitted successfully!");
            }
        } catch (error) {
            console.error("Error submitting general info:", error.message);
            alert("Failed to submit general info");
        }
    };
    const handleFileUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return alert("Please select a file");
    
        const userId = data._id;
        const response = await uploadFile(file, type, userId);
        console.log(`${type} upload response:`, response);
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
                        {biodata && <p className="text-green-600">File uploaded: {biodata.name}</p>}
                    </div>

                    <div className="mt-4">
                        <label className="block font-semibold text-red-600">
                            Photo* (max size 500 KB)
                        </label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "photo")} />
                        {photo && <p className="text-green-600">File uploaded: {photo.name}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold">No. of DBT Projects (Ongoing):</label>
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
                        <label className="block font-semibold">No. of DBT Projects (Completed):</label>
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
                        <label className="block font-semibold">No. of Projects (Ongoing):</label>
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
                        <label className="block font-semibold">No. of Projects (Completed):</label>
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

export default UserProfile;
*/