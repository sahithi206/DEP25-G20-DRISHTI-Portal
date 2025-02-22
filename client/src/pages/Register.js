import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Select from "react-select";
import { AuthContext } from "../services/authServices";

const Register = () => {
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

export default Register;
