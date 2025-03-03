import { useState, createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const url = "http://localhost:8000/";

const AuthProvider = (props) => {
  const navigate = useNavigate();
  const [authState] = useState("");

  const sendOtp = async (email) => {
    try {
      console.log(email);
      const response = await fetch(`${url}auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Failed to send OTP");

      console.log("OTP Sent:", json);
    } catch (e) {
      console.error("Cannot send OTP:", e.message);
      alert(e.message);
    }
  };

  const verifyOtp = async (data) => {
    try {
      console.log("Verifying OTP with data:", JSON.stringify(data));

      const response = await fetch(`${url}auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Signup Successful!", result);
        console.log("Your token: " + result.accessToken);

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

  const login = async (email, password) => {
    try {
      const response = await fetch(`${url}auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

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

export { AuthContext, AuthProvider };