import React, { useState, createContext} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const url = process.env.REACT_APP_URL; 

const AuthProvider = (props) => {
  let navigate = useNavigate();
  const [authState] = useState("");

  const sendOtp = async (data) => {
    try {
      console.log(data);
      const response = await fetch(`${url}auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email:data}),
      });
       console.log(JSON.stringify(data));
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Failed to send OTP");

      console.log("OTP Sent:", json);
    } catch (e) {
      console.error("Cannot send OTP:", e.message);
      alert(e.message);
    }
  };

  const verifyOtp= async (data) => {
    try {
      console.log( JSON.stringify({
        email: data.email,
        password: data.password,
        Name: data.Name,
        Institute:data.Institute,
        DOB: data.DOB,
        Mobile: data.Mobile,
        Gender: data.Gender,
        idType: data.idType,
        idNumber: data.idNumber,
        role: data.role,
        otp: data.otp,
      }));
      const response = await fetch(`${url}auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          Name: data.Name,
          Institute:data.Institute,
          DOB: data.DOB,
          Mobile: data.Mobile,
          Gender: data.Gender,
          idType: data.idType,
          idNumber: data.idNumber,
          role: data.role,
          otp: data.otp,
        }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        console.log("Signup Successful!", result);
        console.log("Signup Successful! Your token: " + result.accessToken);
  
        localStorage.setItem("token", result.accessToken);
        navigate("/dashboard");
      } else {
        console.error("Error:", result.msg);
        alert("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Something went wrong while verifying OTP.");
    }
  };
  
  
  const login = async (email,password) => {
    try {
      const response = await fetch(`${url}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({email,password}),
      });
         console.log(response);
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Invalid credentials");

      console.log("User Logged in successfully:", json);
      if (json.success) {
        localStorage.setItem("token", json.accessToken);
        navigate("/dashboard");
      }
    } catch (e) {
      console.error("Cannot Login:", e.message);
      alert(e.message || "Invalid Credentials");
    }
  };

  return (
    <AuthContext.Provider value={{ sendOtp, verifyOtp, login, authState }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext , AuthProvider};
