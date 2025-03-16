import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../Context/Authcontext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const RegisterInstitute = () => {
  const { createInstitute, sendOtp } = useContext(AuthContext);
  const [data, setData] = useState({
    email: "",
    password: "",
    instituteName: "",
    otp: "",
  });
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get(
          "http://universities.hipolabs.com/search?country=India"
        );
        const collegeOptions = response.data.map((college) => ({
          label: college.name,
          value: college.name,
        }));
        setColleges(collegeOptions);
      } catch (error) {
        console.error("Error fetching college list:", error);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));

    if (name === "instituteName") {
      const filtered = colleges.filter((college) =>
        college.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredColleges(filtered);
      setIsDropdownVisible(true);
    }
  };

  const handleSelectCollege = (collegeName) => {
    setData((prev) => ({ ...prev, instituteName: collegeName }));
    setFilteredColleges([]);
    setIsDropdownVisible(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!data.email) {
      setError("Please enter an email to receive OTP.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/auth/send-otp", { email: data.email });

      // Check if the OTP is successfully sent
      if (response.data.success) {
        setShowOtpField(true);
        setError("");  // Clear any previous errors
      } else {
        setError(response.data.msg || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.otp) {
      setError("Please enter the OTP.");
      return;
    }
    try {
      setLoading(true);
      const response = await createInstitute(
        data.email,
        data.password,
        data.instituteName,
        data.otp
      );
      if (response.success) {
        alert("Registration successful! You can now log in.");
        window.location.href = "/institute-login";
      } else {
        setError(response.msg || "OTP verification failed.");
      }
    } catch (error) {
      setError("Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Register Institute</h1>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={showOtpField ? handleSubmit : handleSendOtp} className="space-y-6">
            <div>
              <label className="block font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                placeholder="Create a strong password"
              />
            </div>
            <div className="relative">
              <label className="block font-medium">Institute Name</label>
              <input
                type="text"
                name="instituteName"
                value={data.instituteName}
                onChange={handleChange}
                onFocus={() => setIsDropdownVisible(true)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                placeholder="Enter institute name"
              />
              {isDropdownVisible && filteredColleges.length > 0 && (
                <ul className="absolute w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                  {filteredColleges.map((college) => (
                    <li
                      key={college.value}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      onMouseDown={() => handleSelectCollege(college.value)}
                    >
                      {college.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {showOtpField && (
              <div>
                <label className="block font-medium">Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={data.otp}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                  placeholder="Enter OTP"
                />
                <p className="text-sm text-gray-500">Check your email for the OTP</p>
              </div>
            )}
            <button
              type="submit"
              className={`w-full text-white p-2 rounded ${loading ? "bg-gray-500" : "bg-blue-500"}`}
              disabled={loading}
            >
              {loading ? "Processing..." : showOtpField ? "Complete Registration" : "Send OTP"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterInstitute;






// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { AuthContext } from "../Context/Authcontext";
// import Navbar from "../../components/Navbar";
// import Footer from "../../components/Footer";

// const RegisterInstitute = () => {
//   const { createInstitute } = useContext(AuthContext);
//   const [data, setData] = useState({
//     email: "",
//     password: "",
//     instituteName: "",
//     otp: "",
//   });
//   const [colleges, setColleges] = useState([]);
//   const [filteredColleges, setFilteredColleges] = useState([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showOtpField, setShowOtpField] = useState(false);
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);

//   useEffect(() => {
//     const fetchColleges = async () => {
//       try {
//         const response = await axios.get(
//           "http://universities.hipolabs.com/search?country=India"
//         );
//         const collegeOptions = response.data.map((college) => ({
//           label: college.name,
//           value: college.name,
//         }));
//         setColleges(collegeOptions);
//         setFilteredColleges(collegeOptions); // Display all colleges initially
//       } catch (error) {
//         console.error("Error fetching college list:", error);
//       }
//     };
//     fetchColleges();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setData({ ...data, [name]: value });

//     if (name === "instituteName") {
//       const filtered = value
//         ? colleges.filter((college) =>
//             college.label.toLowerCase().includes(value.toLowerCase())
//           )
//         : colleges; // Display all colleges if input is empty
//       setFilteredColleges(filtered);
//       setIsDropdownVisible(true); // Show dropdown when typing
//     }
//   };

//   const handleSelectCollege = (collegeName) => {
//     setData({ ...data, instituteName: collegeName });
//     setFilteredColleges([]);
//     setIsDropdownVisible(false);
//   };

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     if (!data.email) {
//       setError("Please enter an email to receive OTP.");
//       return;
//     }
//     try {
//       setLoading(true);
//       await createInstitute(data.email, data.password, data.instituteName, data.otp);
//       setShowOtpField(true);
//       setError("");
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       setError("Failed to send OTP.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       const response = await createInstitute(data.email, data.password, data.instituteName, data.otp);
//       if (response.success) {
//         setError("");
//         alert("Registration successful! You can now log in.");
//         window.location.href = "/institute-login";
//       } else {
//         setError(response.msg || "OTP verification failed.");
//       }
//     } catch (error) {
//       setError(error.response?.data?.msg || "Registration failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-grow flex items-center justify-center p-6">
//         <div className="max-w-md w-full bg-white p-6 rounded shadow-md">
//           <h1 className="text-2xl font-bold mb-4 text-center">Register Institute</h1>
//           {error && (
//             <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
//               <div className="flex">
//                 <div className="flex-shrink-0">
//                   <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//           <form onSubmit={showOtpField ? handleSubmit : handleSendOtp} className="space-y-6">
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">Email Address</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={data.email}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm"
//                 placeholder="your.email@example.com"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">Password</label>
//               <input
//                 type="password"
//                 name="password"
//                 value={data.password}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm"
//                 placeholder="Create a strong password"
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-2">Institute Name</label>
//               <input
//                 type="text"
//                 name="instituteName"
//                 value={data.instituteName}
//                 onChange={handleChange}
//                 onFocus={() => setIsDropdownVisible(true)}
//                 onBlur={() => setTimeout(() => setIsDropdownVisible(false), 200)} // Delay to allow click event to register
//                 required
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm"
//                 placeholder="Enter your institute name"
//               />
//               {isDropdownVisible && filteredColleges.length > 0 && (
//                 <ul className="border border-gray-300 rounded-lg mt-2 max-h-40 overflow-y-auto">
//                   {filteredColleges.map((college) => (
//                     <li
//                       key={college.value}
//                       className="px-4 py-2 cursor-pointer hover:bg-gray-200"
//                       onClick={() => handleSelectCollege(college.value)}
//                     >
//                       {college.label}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             {showOtpField && (
//               <div>
//                 <label className="block text-gray-700 font-medium mb-2">Enter OTP</label>
//                 <input
//                   type="text"
//                   name="otp"
//                   value={data.otp}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 shadow-sm"
//                   placeholder="Enter OTP sent to your email"
//                 />
//                 <p className="text-sm text-gray-500 mt-1">Please check your email for the OTP</p>
//               </div>
//             )}
//             <button
//               type="submit"
//               className="w-full bg-blue-500 text-white p-2 rounded mt-4"
//               disabled={loading}
//             >
//               {loading ? "Processing..." : showOtpField ? "Complete Registration" : "Send OTP"}
//             </button>
//           </form>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default RegisterInstitute;