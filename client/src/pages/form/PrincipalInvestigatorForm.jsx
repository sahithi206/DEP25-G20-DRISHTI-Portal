// import React, { useState } from "react";

// const PrincipalInvestigatorForm = () => {
//   const [formData, setFormData] = useState({
//     member: "",
//     firstName: "",
//     middleName: "",
//     lastName: "",
//     department: "",
//     institute: "",
//     mobile: "",
//     email: "",
//     dbtProjectsOngoing: "",
//     dbtProjectsCompleted: "",
//     projectsOngoing: "",
//     projectsCompleted: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Form submitted:", formData);
//   };

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const jsonData = JSON.parse(e.target.result);
//           setFormData(jsonData);
//         } catch (error) {
//           console.error("Invalid JSON file");
//         }
//       };
//       reader.readAsText(file);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold mb-4">Principal Investigator Form</h1>
//         <input
//           type="file"
//           accept=".json"
//           className="hidden"
//           id="fileInput"
//           onChange={handleFileUpload}
//         />
//         <label
//           htmlFor="fileInput"
//           className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
//         >
//           Import JSON
//         </label>
//       </div>
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
//         <div className="grid grid-cols-2 gap-4 items-center">
//           <label className="block font-semibold">Member *</label>
//           <div className="flex space-x-4">
//             <label className="flex items-center space-x-2">
//               <input type="radio" name="member" value="Co-PI" checked={formData.member === "Co-PI"} className="border p-2" onChange={handleChange} />
//               <span>Co-PI</span>
//             </label>
//             <label className="flex items-center space-x-2">
//               <input type="radio" name="member" value="PI" checked={formData.member === "PI"} className="border p-2" onChange={handleChange} />
//               <span>PI</span>
//             </label>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">First Name *</label>
//           <input name="firstName" type="text" className="border p-2" value={formData.firstName} onChange={handleChange} />
//           <label className="block font-semibold">Middle Name</label>
//           <input name="middleName" type="text" className="border p-2" value={formData.middleName} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">Last Name *</label>
//           <input name="lastName" type="text" className="border p-2" value={formData.lastName} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">Department *</label>
//           <input name="department" type="text" className="border p-2" value={formData.department} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">Institute/University *</label>
//           <select name="institute" className="border p-2" value={formData.institute} onChange={handleChange}>
//             <option>Select an option</option>
//           </select>
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">Mobile:</label>
//           <input type="text" name="mobile" className="border p-2" value={formData.mobile} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">Email:</label>
//           <input type="email" name="email" className="border p-2" value={formData.email} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">No. of DBT Projects (Ongoing):</label>
//           <input type="number" name="dbtProjectsOngoing" className="border p-2" min="0" value={formData.dbtProjectsOngoing} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">No. of DBT Projects (Completed):</label>
//           <input type="number" name="dbtProjectsCompleted" className="border p-2" min="0" value={formData.dbtProjectsCompleted} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">No. of Projects (Ongoing):</label>
//           <input type="number" name="projectsOngoing" className="border p-2" min="0" value={formData.projectsOngoing} onChange={handleChange} />
//         </div>
//         <div className="grid grid-cols-2 gap-4 mt-4">
//           <label className="block font-semibold">No. of Projects (Completed):</label>
//           <input type="number" name="projectsCompleted" className="border p-2" min="0" value={formData.projectsCompleted} onChange={handleChange} />
//         </div>
//         {/* <div className="text-center mt-6">
//           <button className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700">
//             Submit
//           </button>
//         </div> */}
//         <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//           Save
//         </button>
//       </form>

//     </div >
//   );
// };

// export default PrincipalInvestigatorForm;

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