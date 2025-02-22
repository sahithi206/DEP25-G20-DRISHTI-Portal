
import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";


function Register() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');

  



const [colleges, setColleges] = useState([]);
const [selectedOption, setSelectedOption] = useState(null);

useEffect(() => {
  const fetchColleges = async () => {
    try {
      const response = await axios.get("http://universities.hipolabs.com/search?country=India");
      const collegeOptions = response.data.map(college => ({
        label: college.name,   // The label to display in the dropdown
        value: college.name    // The value to store when a selection is made
      }));
      setColleges(collegeOptions);
    } catch (error) {
      console.error("Error fetching college list:", error);
    }
  };

  fetchColleges();
}, []);


  








  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/register', {
        Name: name,
        email,
        password,
        otp,
        DOB: dob,
        Mobile: mobile,
        Gender: gender,
        idType,
        idNumber,
        institute: selectedOption ? selectedOption.value : '', 
      });
      console.log('Registration successful:', response.data);
      setError('');
    } catch (error) {
      console.error('Error registering:', error);
      setError('Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input 
            type="text" 
            className="form-control" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input 
            type="email" 
            className="form-control" 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="otp" className="form-label">OTP</label>
          <input 
            type="number" 
            className="form-control" 
            id="otp" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="dob" className="form-label">Date of Birth</label>
          <input 
            type="date" 
            className="form-control" 
            id="dob" 
            value={dob} 
            onChange={(e) => setDob(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="mobile" className="form-label">Mobile</label>
          <input 
            type="tel" 
            className="form-control" 
            id="mobile" 
            value={mobile} 
            onChange={(e) => setMobile(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-3">
          <label htmlFor="gender" className="form-label">Gender</label>
          <select 
            className="form-control" 
            id="gender" 
            value={gender} 
            onChange={(e) => setGender(e.target.value)} 
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="idType" className="form-label">ID Type</label>
          <select 
            className="form-control" 
            id="idType" 
            value={idType} 
            onChange={(e) => setIdType(e.target.value)} 
            required
          >
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
            value={idNumber} 
            onChange={(e) => setIdNumber(e.target.value)} 
            required 
          />
        </div>





        {/* to be fixed !!!!!!!!! */}
        <div style={{ width: "400px", margin: "20px" }}>
        <h3>Select Institution:</h3>
        <Select
        options={colleges}
        value={selectedOption}
        onChange={setSelectedOption}
        placeholder="--Select--"
        isSearchable
        />
        </div>










        <button type="submit" className="btn btn-primary w-100">Register</button>
      </form>
    </div>
  );
}

export default Register;









