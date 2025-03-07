import React, { useState, useEffect, useContext } from "react";
import PropTypes from 'prop-types';
import { AuthContext } from "../Context/Authcontext";

const PrincipalInvestigatorForm = ({ formData, updateForm }) => {
  const [investigators, setInvestigators] = useState(formData.members || []);
  const { submitPIDetails } = useContext(AuthContext);

  useEffect(() => {
    updateForm("principalInvestigator", { members: investigators });
  }, [investigators]);

  const handleChange = (index, field, value) => {
    const updatedInvestigators = [...investigators];
    updatedInvestigators[index][field] = value;
    setInvestigators(updatedInvestigators);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                console.log("JSON Data:", jsonData);
                
                // Ensure jsonData contains members array
                if (Array.isArray(jsonData.members)) {
                    setInvestigators((prevInvestigators) => [
                        ...prevInvestigators,
                        ...jsonData.members
                    ]);
                } else {
                    console.error("Invalid JSON format: No 'members' array found");
                    alert("Invalid JSON format. Please check the file.");
                }
            } catch (error) {
                console.error("Invalid JSON file", error);
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submitPIDetails({ members: investigators });
      console.log("Submit Response:", response);
      alert("PI details submitted successfully!");
    } catch (error) {
      console.error("Error submitting PI details:", error.message);
      alert("Failed to submit PI details");
    }
  };

  const addNewMember = () => {
    setInvestigators([
      ...investigators,
      {
        role: "",
        name: "",
        email: "",
        address: "",
        mobileNo: "",
        instituteName: "",
        Dept: "",
        DBTproj_ong: "",
        DBTproj_completed: "",
        Proj_ong: "",
        Proj_completed: "",
      },
    ]);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Principal Investigator Form</h1>
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
      <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
        {investigators.map((member, index) => (
          <div key={index} className="mb-6">
            <div className="grid grid-cols-2 gap-4 items-center">
              <label className="block font-semibold">Role *</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`role-${index}`}
                    value="Co-PI"
                    checked={member.role === "Co-PI"}
                    onChange={(e) => handleChange(index, "role", e.target.value)}
                  />
                  <span>Co-PI</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`role-${index}`}
                    value="PI"
                    checked={member.role === "PI"}
                    onChange={(e) => handleChange(index, "role", e.target.value)}
                  />
                  <span>PI</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">Name *</label>
              <input
                name={`name-${index}`}
                type="text"
                className="border p-2"
                value={member.name || ""}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">Email *</label>
              <input
                name={`email-${index}`}
                type="email"
                className="border p-2"
                value={member.email || ""}
                onChange={(e) => handleChange(index, "email", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">Address *</label>
              <input
                name={`address-${index}`}
                type="text"
                className="border p-2"
                value={member.address || ""}
                onChange={(e) => handleChange(index, "address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">Mobile No *</label>
              <input
                name={`mobileNo-${index}`}
                type="text"
                className="border p-2"
                value={member.mobileNo || ""}
                onChange={(e) => handleChange(index, "mobileNo", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">Institute Name *</label>
              <input
                name={`instituteName-${index}`}
                type="text"
                className="border p-2"
                value={member.instituteName || ""}
                onChange={(e) => handleChange(index, "instituteName", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">Department *</label>
              <input
                name={`Dept-${index}`}
                type="text"
                className="border p-2"
                value={member.Dept || ""}
                onChange={(e) => handleChange(index, "Dept", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">No. of DBT Projects (Ongoing) *</label>
              <input
                name={`DBTproj_ong-${index}`}
                type="number"
                className="border p-2"
                min="0"
                value={member.DBTproj_ong || ""}
                onChange={(e) => handleChange(index, "DBTproj_ong", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">No. of DBT Projects (Completed) *</label>
              <input
                name={`DBTproj_completed-${index}`}
                type="number"
                className="border p-2"
                min="0"
                value={member.DBTproj_completed || ""}
                onChange={(e) => handleChange(index, "DBTproj_completed", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">No. of Projects (Ongoing) *</label>
              <input
                name={`Proj_ong-${index}`}
                type="number"
                className="border p-2"
                min="0"
                value={member.Proj_ong || ""}
                onChange={(e) => handleChange(index, "Proj_ong", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block font-semibold">No. of Projects (Completed) *</label>
              <input
                name={`Proj_completed-${index}`}
                type="number"
                className="border p-2"
                min="0"
                value={member.Proj_completed || ""}
                onChange={(e) => handleChange(index, "Proj_completed", e.target.value)}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={addNewMember}
        >
          Add New Member
        </button>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save
        </button>
      </form>
    </div>
  );
};

PrincipalInvestigatorForm.propTypes = {
  formData: PropTypes.object.isRequired,
  updateForm: PropTypes.func.isRequired,
};

export default PrincipalInvestigatorForm;
/*
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/Authcontext";


const PrincipalInvestigatorForm = ({ formData, updateForm }) => {
  const [data, setData] = useState(formData);
  const { submitPIDetails } = useContext(AuthContext);

  useEffect(() => {
    updateForm("principalInvestigator", data);
  }, [data]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
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
      const response = await submitPIDetails({ members: [data] });
      alert("PI details submitted successfully!");
    } catch (error) {
      console.error("Error submitting PI details:", error.message);
      alert("Failed to submit PI details");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Principal Investigator Form</h1>
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
      <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 items-center">
          <label className="block font-semibold">Role *</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input type="radio" name="role" value="Co-PI" checked={data.role === "Co-PI"} onChange={handleChange} />
              <span>Co-PI</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="role" value="PI" checked={data.role === "PI"} onChange={handleChange} />
              <span>PI</span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Name *</label>
          <input name="name" type="text" className="border p-2" value={data.name || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Email *</label>
          <input name="email" type="email" className="border p-2" value={data.email || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Address *</label>
          <input name="address" type="text" className="border p-2" value={data.address || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Mobile No *</label>
          <input name="mobileNo" type="text" className="border p-2" value={data.mobileNo || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Institute Name *</label>
          <input name="instituteName" type="text" className="border p-2" value={data.instituteName || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Department *</label>
          <input name="Dept" type="text" className="border p-2" value={data.Dept || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of DBT Projects (Ongoing) *</label>
          <input name="DBTproj_ong" type="number" className="border p-2" min="0" value={data.DBTproj_ong || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of DBT Projects (Completed) *</label>
          <input name="DBTproj_completed" type="number" className="border p-2" min="0" value={data.DBTproj_completed || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of Projects (Ongoing) *</label>
          <input name="Proj_ong" type="number" className="border p-2" min="0" value={data.Proj_ong || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of Projects (Completed) *</label>
          <input name="Proj_completed" type="number" className="border p-2" min="0" value={data.Proj_completed || ""} onChange={handleChange} />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save
        </button>
      </form>
    </div>
  );
};

export default PrincipalInvestigatorForm;
*/