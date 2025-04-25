import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../Context/Authcontext";
import Navbar from "../../components/Navbar";
const URL = import.meta.env.VITE_REACT_APP_URL;

const RegisterInstitute = () => {
  const { createInstitute, sendOtp } = useContext(AuthContext);
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    role: "Head of Institute",
    instituteName: "",
    otp: "",
  });
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Ref for detecting clicks outside the dropdown
  const dropdownRef = useRef(null);

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

    // Add event listener to handle clicks outside the dropdown
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));

    if (name === "instituteName") {
      const filtered = colleges.filter((college) =>
        college.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredColleges(filtered);
      setIsDropdownVisible(value.length > 0); // Only show dropdown if there's text
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
      const response = await sendOtp(data.email);

      // Check if sendOtp returned an error
      if (response && !response.success) {
        setError(response.msg || "Failed to send OTP.");
        return;
      }
      setShowOtpField(true);
      setError("");
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
      const response = await createInstitute({
        name: data.name,
        role: data.role,
        email: data.email,
        password: data.password,
        college: data.instituteName,
        otp: String(data.otp)
      });
      if (response.success) {
        setRegistrationComplete(true);
      } else {
        setError(response.msg || "OTP verification failed.");
      }
    } catch (error) {
      setError("Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    // Show dropdown only if there are filtered colleges and text input
    if (data.instituteName.length > 0) {
      setIsDropdownVisible(true);
    }
  };

  if (registrationComplete) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar yes={1} />
        <div className="flex-grow flex justify-center items-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl border border-gray-100">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-100 p-6 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-6 text-center">Your institute account has been created successfully.<br />You can now log in to access the institute dashboard.</p>
              <button
                onClick={() => window.location.href = "/institute-login"}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
              >
                Proceed to Institute Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar yes={1} /> */}
      <div className="flex-grow flex justify-center items-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Register Institute</h2>
            <p className="text-gray-500 mt-1">Create an account for your educational institution</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={showOtpField ? handleSubmit : handleSendOtp} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  placeholder="Create a strong password"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Use at least 8 characters with numbers and symbols</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={data.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm appearance-none"
              >
                <option value="Head of Institute">Head of Institute</option>
                <option value="CFO">CFO</option>
                <option value="Accounts Officer">Accounts Officer</option>
              </select>
            </div>

            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name</label>
              <input
                type="text"
                name="instituteName"
                value={data.instituteName}
                onChange={handleChange}
                onFocus={handleInputFocus}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="Enter institute name"
              />
              {isDropdownVisible && filteredColleges.length > 0 && (
                <ul className="absolute w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto z-10 shadow-md">
                  {filteredColleges.map((college) => (
                    <li
                      key={college.value}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-700"
                      onClick={() => handleSelectCollege(college.value)}
                    >
                      {college.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {showOtpField ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <div className="flex">
                  <input
                    type="text"
                    name="otp"
                    value={data.otp}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    placeholder="Enter OTP sent to your email"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Please check your email for the verification code</p>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">We'll send a verification code to your email address</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition flex items-center font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  showOtpField ? "Complete Registration" : "Send Verification Code"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-5 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Already have an institute account? <a href="/institute-login" className="text-blue-600 hover:underline">Sign in</a> instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterInstitute;