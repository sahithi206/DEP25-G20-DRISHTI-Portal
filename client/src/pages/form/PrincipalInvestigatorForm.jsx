<<<<<<< HEAD
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
      
=======
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

import { useState, useEffect } from "react";

const PrincipalInvestigatorForm = ({ formData, updateForm }) => {
  const [data, setData] = useState(formData);

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
      <form className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-4 items-center">
          <label className="block font-semibold">Member *</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input type="radio" name="member" value="Co-PI" checked={data.member === "Co-PI"} onChange={handleChange} />
              <span>Co-PI</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="member" value="PI" checked={data.member === "PI"} onChange={handleChange} />
              <span>PI</span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">First Name *</label>
          <input name="firstName" type="text" className="border p-2" value={data.firstName || ""} onChange={handleChange} />
          <label className="block font-semibold">Middle Name</label>
          <input name="middleName" type="text" className="border p-2" value={data.middleName || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Last Name *</label>
          <input name="lastName" type="text" className="border p-2" value={data.lastName || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Department *</label>
          <input name="department" type="text" className="border p-2" value={data.department || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Institute/University *</label>
          <select name="institute" className="border p-2" value={data.institute || ""} onChange={handleChange}>
            <option value="">Select an option</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Mobile:</label>
          <input type="text" name="mobile" className="border p-2" value={data.mobile || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">Email:</label>
          <input type="email" name="email" className="border p-2" value={data.email || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of DBT Projects (Ongoing):</label>
          <input type="number" name="dbtProjectsOngoing" className="border p-2" min="0" value={data.dbtProjectsOngoing || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of DBT Projects (Completed):</label>
          <input type="number" name="dbtProjectsCompleted" className="border p-2" min="0" value={data.dbtProjectsCompleted || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of Projects (Ongoing):</label>
          <input type="number" name="projectsOngoing" className="border p-2" min="0" value={data.projectsOngoing || ""} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block font-semibold">No. of Projects (Completed):</label>
          <input type="number" name="projectsCompleted" className="border p-2" min="0" value={data.projectsCompleted || ""} onChange={handleChange} />
        </div>
      </form>
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
    </div>
  );
};

<<<<<<< HEAD
export default PrincipalInvestigatorForm;
=======
export default PrincipalInvestigatorForm;
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
