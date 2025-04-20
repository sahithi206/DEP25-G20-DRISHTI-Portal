import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../Context/Authcontext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
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
      const response = await axios.post(`${URL}auth/send-otp`, { email: data.email });

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
      const response = await createInstitute({
        name: data.name,
        role: data.role,
        email: data.email,
        password: data.password,
        college: data.instituteName,
        otp: String(data.otp)
      });
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
      <Navbar  yes={1}/>
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
              <label className="block font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={data.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block font-medium">Role</label>
              <select
                name="role"
                value={data.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2"
              >
                <option value="Head of Institute">Head of Institute</option>
                <option value="CFO">CFO</option>
                <option value="Accounts Officer">Accounts Officer</option>
              </select>
            </div>
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
    </div>
  );
};

export default RegisterInstitute;