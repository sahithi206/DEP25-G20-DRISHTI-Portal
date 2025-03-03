import React, { useState } from "react";

const PrincipalInvestigatorForm = () => {
  const [formData, setFormData] = useState({
    member: "",
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    designation: "",
    department: "",
    institute: "",
    dob: "",
    gender: "",
    country: "",
    state: "",
    district: "",
    city: "",
    address: "",
    pinCode: "",
    mobile: "",
    phone: "",
    fax: "0",
    email: "",
    ongoingDBT: "0",
    ongoingOther: "0",
    completedDBT: "0",
    completedOther: "0",
    totalOngoing: "0",
    totalCompleted: "0",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Principal Investigator Form</h2>
      <div className="grid grid-cols-2 gap-4">
        <label>Member *</label>
        <select name="member" className="border p-2" onChange={handleChange}>
          <option>Select</option>
        </select>

        <label>Title *</label>
        <select name="title" className="border p-2" onChange={handleChange}>
          <option>Select</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <label>First Name *</label>
        <input name="firstName" type="text" className="border p-2" onChange={handleChange} />

        <label>Middle Name</label>
        <input name="middleName" type="text" className="border p-2" onChange={handleChange} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <label>Last Name *</label>
        <input name="lastName" type="text" className="border p-2" onChange={handleChange} />

        <label>Designation *</label>
        <input name="designation" type="text" className="border p-2" onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <label>Department *</label>
        <input name="department" type="text" className="border p-2" onChange={handleChange} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <label>Institute/University *</label>
        <select name="institute" className="border p-2" onChange={handleChange}>
          <option>Select an option</option>
        </select>
      </div>
      
      <div className="text-center mt-6">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700">
          Submit
        </button>
      </div>
    </div>
  );
};

export default PrincipalInvestigatorForm;
