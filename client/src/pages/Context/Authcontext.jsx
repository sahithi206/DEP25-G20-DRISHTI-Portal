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
      alert(e.msg || "Invalid Credentials");
    }
  };
  
  const getuser=async()=>{
     const token= localStorage.getItem("token");
     try{
         console.log(token);
         if(!token){
          console.log("Use valid Token");
          return;
         }
         const response = await fetch(`${url}auth/get-user`, {
          method: "GET",
          headers: { "Content-Type": "application/json",
            "accessToken":`${token}`,
           },
        });
        console.log(response);
        if(!response.ok){
          throw new Error("Cannot fetch userDetails");
        }
        const json= await response.json();
        console.log(json);
        const user=json.user;
        console.log(user);
        if(!json.success){
          alert(json.msg);
          return ;
        }
        return user;
     }catch(e){
      console.log(e);
      alert(e.msg||"Cannot fetch User Details");
     }
  }

  const edituser = async (updatedData) => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.log("Use a valid Token");
        alert("Authentication required.");
        return;
    }
    try {
        const response = await fetch(`${url}auth/edit-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accessToken": token,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error("Failed to update user details");
        }
        const json = await response.json();
        alert(json.msg);
    } catch (error) {
        console.error("Edit user error:", error);
        alert(error.message || "Failed to update user details");
    }
};

  return (
    <AuthContext.Provider value={{ sendOtp, verifyOtp, login,getuser, edituser,authState }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };