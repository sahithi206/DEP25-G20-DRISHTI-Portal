import React, { useState ,useContext} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroundImage from '../images/background.jpg';
import {AuthContext} from '../services/authServices';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const {login}= useContext(AuthContext);
  const handleSubmit = (e) => {    
    if (!email || !password || !role) {
      setError('All fields are required');
      return;
    }
    login(email,password);
    console.log('Logging in with:', email, password, role);
    setError('');
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <div className="row justify-content-center align-items-center" style={{ height: '100%' }}>
        <div
          className="col-md-6 col-lg-4 bg-light p-5 rounded shadow"
          style={{ minWidth: '350px', maxWidth: '500px', height: '500px' }} 
        >
          <h2 className="text-center mb-4">Login to Your Account</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">Select User Role</label>
              <select
                className="form-control"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="pi">PI</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="username">Please Enter User Name</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Please Enter Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="button" className="btn btn-primary btn-block mt-4" onClick={handleSubmit}>
              Login
            </button>

            <div className="d-flex justify-content-between mt-3">
           {/* eslint-disable-next-line*/} 
              <a href="#" className="btn btn-link">Forgot Password</a>
              <a href="/register" className="btn btn-link">New User</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;