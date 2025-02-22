import React,{useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import axios from "axios";
import Register from './pages/Register';
import Navbar from './components/Navbar';
import {AuthProvider} from './services/authServices';
import Dashboard from './pages/Dashboard';
function App() {
    const getData=async()=>{
      try {
        const response = await axios.get("http://localhost:8000/"); 
         console.log(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    useEffect(()=>{
      getData();
    },[])
  return (
    <div>
    <Router>
      <AuthProvider>
       <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
       </div>
      </AuthProvider>

    </Router>
    </div>
  );
}

export default App;
