import React, { useState } from "react";

const PrincipalInvestigatorForm = () => {
  const [formData, setFormData] = useState({
    member: "",
    // title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    // designation: "",
    department: "",
    institute: "",
    // dob: "",
    // gender: "",
    // country: "",
    // state: "",
    // district: "",
    // city: "",
    // address: "",
    // pinCode: "",
    mobile: "",
    // phone: "",
    // fax: "0",
    email: "",
    dbtProjectsOngoing: "",
    dbtProjectsCompleted: "",
    projectsOngoing: "",
    projectsCompleted: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Principal Investigator Form</h2>
      <div className="grid grid-cols-2 gap-4 items-center">
        <label >Member *</label>
        <div className="flex space-x-4">
         <label className="flex items-center space-x-2">

        <input type = "radio" name="member" value = "Co-PI" checked={formData.member === "Co-PI"} className="border p-2" onChange={handleChange}/> <span>Co-PI</span>
        </label>
        <label className="flex items-center space-x-2">
       
        <input type = "radio" name="member" value = "PI" checked={formData.member === "PI"} className="border p-2" onChange={handleChange}/>  <span>PI</span>

        </label>
        </div>
        {/* <label>Title *</label>
        <select name="title" className="border p-2" onChange={handleChange}>
          <option>Select</option>
        </select> */}
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

        {/* <label>Designation *</label>
        <input name="designation" type="text" className="border p-2" onChange={handleChange} /> */}
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





      <div className="grid grid-cols-2 gap-4 mt-4">
                        <label >Mobile:</label>
                        <input
                            type="text"
                            name="mobile"
                            className="border p-2"
                            value={formData.mobile}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <label className="grid grid-cols-2 gap-4 mt-4">Email:</label>
                        <input
                            type="email"
                            name="email"
                            className="border p-2"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <label className="grid grid-cols-2 gap-4 mt-4">No. of DBT Projects (Ongoing):</label>
                        <input
                            type="number"
                            name="dbtProjectsOngoing"
                            className="border p-2"
                            min="0"
                            value={formData.dbtProjectsOngoing}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <label className="grid grid-cols-2 gap-4 mt-4">No. of DBT Projects (Completed):</label>
                        <input
                            type="number"
                            name="dbtProjectsCompleted"
                            className="border p-2"
                            min="0"
                            value={formData.dbtProjectsCompleted}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <label className="grid grid-cols-2 gap-4 mt-4">No. of Projects (Ongoing):</label>
                        <input
                            type="number"
                            name="projectsOngoing"
                            className="border p-2"
                            min="0"
                            value={formData.projectsOngoing}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <label className="grid grid-cols-2 gap-4 mt-4">No. of Projects (Completed):</label>
                        <input
                            type="number"
                            name="projectsCompleted"
                            className="border p-2"
                            min="0"
                            value={formData.projectsCompleted}
                            onChange={handleChange}
                        />
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
