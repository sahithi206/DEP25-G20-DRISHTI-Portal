import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Select from "react-select";
import { AuthContext } from "./Context/Authcontext.jsx";

const Signup = () => {
  const { sendOtp, verifyOtp } = useContext(AuthContext);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    dob: "",
    mobile: "",
    gender: "",
    idType: "",
    idNumber: "",
    institute: "",
    address: "",
    Dept: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json"
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
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption) => {
    setData({ ...data, institute: selectedOption.value });
    setSelectedOption(selectedOption);
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
      setError(error.response?.data?.msg || error.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await verifyOtp({
        email: data.email,
        password: data.password,
        Name: data.name,
        Institute: selectedOption ? selectedOption.value : "",
        DOB: data.dob,
        Mobile: data.mobile,
        Gender: data.gender,
        idType: data.idType,
        idNumber: data.idNumber,
        role: "PI",
        otp: String(data.otp),
        address: data.address,
        Dept: data.Dept,
      });

      if (response && response.data && response.data.success) {
        setError("");
        setCurrentStep(3);
      } else {
        setError((response && response.data && response.data.msg) || "OTP verification failed.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.response?.data?.msg || error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: '1px solid #e2e8f0',
      boxShadow: 'none',
      '&:hover': {
        border: '1px solid #cbd5e0',
      },
      borderRadius: '0.5rem',
      padding: '2px',
      minHeight: '42px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f0f9ff' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
    }),
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center">
        <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${currentStep >= 1 ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"}`}>
          1
        </div>
        <div className={`h-1 w-10 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${currentStep >= 2 ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"}`}>
          2
        </div>
        <div className={`h-1 w-10 ${currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"}`}></div>
        <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${currentStep >= 3 ? "bg-green-600 border-green-600 text-white" : "border-gray-300 text-gray-500"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${currentStep >= 3 ? "text-white" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    if (currentStep === 3) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-green-100 p-6 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6 text-center">Your account has been created successfully.<br />You can now log in to access the ResearchX platform.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            Proceed to Login
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={showOtpField ? handleSubmit : handleSendOtp} className="space-y-5">
        {currentStep === 1 && (
          <>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={data.dob}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  value={data.mobile}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  placeholder="Enter your mobile number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={data.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm appearance-none bg-white"
                >
                  <option value="">Select Gender</option>
                  {["male", "female", "other"].map((option) => (
                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={data.address}
                onChange={handleChange}
                required
                rows="2"
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="Enter your complete address"
              ></textarea>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition flex items-center font-medium"
              >
                Next Step
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <select
                  name="idType"
                  value={data.idType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm appearance-none bg-white"
                >
                  <option value="">Select ID Type</option>
                  {["aadhaar", "passport", "pan", "driving license"].map((option) => (
                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={data.idNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                  placeholder={`Enter your ${data.idType ? data.idType : 'ID'} number`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
              <Select
                options={colleges}
                value={selectedOption}
                onChange={handleSelectChange}
                placeholder="Search for your institute"
                styles={customSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <p className="text-xs text-gray-500 mt-1">Type to search for your institution</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="Dept"
                value={data.Dept}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="E.g., Psychology, Computer Science, Medicine"
              />
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

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
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
          </>
        )}
      </form>
    );
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Create ResearchX Account</h2>
          <p className="text-gray-500 mt-1">Join our research community</p>
        </div>

        {renderStepIndicator()}

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

        {renderForm()}

        {currentStep !== 3 && (
          <div className="mt-8 pt-5 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in</a> instead.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;