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
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

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
      await sendOtp(data.email);
      setShowOtpField(true);
      setError("");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP.");
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
      });

      if (response.data.success) {
        alert("Registration successful! You can now log in.");
        setError("");
      } else {
        setError(response.data.msg || "OTP verification failed.");
      }
    } catch (error) {
      setError(error.response?.data?.msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={showOtpField ? handleSubmit : handleSendOtp} className="w-50 mx-auto">
        {[
          { label: "Name", type: "text", name: "name" },
          { label: "Email", type: "email", name: "email" },
          { label: "Password", type: "password", name: "password" },
          { label: "Date of Birth", type: "date", name: "dob" },
          { label: "Mobile", type: "tel", name: "mobile" },
        ].map(({ label, type, name }) => (
          <div className="mb-3" key={name}>
            <label htmlFor={name} className="form-label">{label}</label>
            <input
              type={type}
              className="form-control"
              id={name}
              name={name}
              value={data[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="mb-3">
          <label htmlFor="gender" className="form-label">Gender</label>
          <select className="form-control" id="gender" name="gender" value={data.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="idType" className="form-label">ID Type</label>
          <select className="form-control" id="idType" name="idType" value={data.idType} onChange={handleChange} required>
            <option value="">Select ID Type</option>
            <option value="aadhaar">Aadhaar</option>
            <option value="passport">Passport</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="idNumber" className="form-label">ID Number</label>
          <input
            type="text"
            className="form-control"
            id="idNumber"
            name="idNumber"
            value={data.idNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="institute" className="form-label">Institute</label>
          <Select
            options={colleges}
            value={selectedOption}
            onChange={handleSelectChange}
            name="institute"
            placeholder="--Select--"
            id="institute"
            isSearchable
          />
        </div>

        {showOtpField && (
          <div className="mb-3">
            <label htmlFor="otp" className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-control"
              id="otp"
              name="otp"
              value={data.otp}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Processing..." : showOtpField ? "Register" : "Send OTP"}
        </button>
      </form>
    </div>
  );
};

export default Signup;

// src/pages/Signup.jsx
/*import { useState } from "react";

const Signup = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        mobile: "",
        gender: "",
        category: "",
        nationality: "Indian",
        identityProofType: "",
        identityProofNumber: "",
        isDifferentlyAbled: "No",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Signup Data:", formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-3xl">
                <h2 className="text-3xl font-bold text-center text-emerald-800 mb-6">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label className="block font-semibold text-gray-700">Email (Username) *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-gray-700">Password *</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Confirm Password *</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700 mb-1">Name *</label>
                        <div className="grid grid-cols-4 gap-2">
                            <select className="p-2 border rounded focus:ring focus:ring-blue-300">
                                <option>Dr.</option>
                                <option>Mr.</option>
                                <option>Ms.</option>
                            </select>

                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="p-2 border rounded focus:ring focus:ring-blue-300"
                            />

                            <input
                                type="text"
                                name="middleName"
                                placeholder="Middle Name"
                                value={formData.middleName}
                                onChange={handleChange}
                                className="p-2 border rounded focus:ring focus:ring-blue-300"
                            />

                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="p-2 border rounded focus:ring focus:ring-blue-300"
                            />
                        </div>
                    </div>


                    <div>
                        <label className="block font-semibold text-gray-700">Date of Birth *</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700">Mobile Number *</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-gray-700">Gender *</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            >
                                <option value="">Select One</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-gray-700">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            >
                                <option value="">Select One</option>
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC/ST">SC/ST</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-gray-700">Identity Proof *</label>
                        <select
                            name="identityProofType"
                            value={formData.identityProofType}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                        >
                            <option value="">Select One</option>
                            <option value="PAN">PAN Number</option>
                            <option value="Aadhar">Aadhar Number</option>
                            <option value="Passport">Passport Number</option>
                        </select>
                    </div>

                    {formData.identityProofType && (
                        <div>
                            <label className="block font-semibold text-gray-700">
                                {formData.identityProofType} Number *
                            </label>
                            <input
                                type="text"
                                name="identityProofNumber"
                                value={formData.identityProofNumber}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block font-semibold text-gray-700">Differently Abled *</label>
                        <select
                            name="isDifferentlyAbled"
                            value={formData.isDifferentlyAbled}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
                        >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" className="mr-2" required />
                        <p>
                            I agree to the{" "}
                            <a href="#" className="text-emerald-600 underline">
                                terms of service and privacy policy
                            </a>
                        </p>
                    </div>

                    <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded font-bold">
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
*/
