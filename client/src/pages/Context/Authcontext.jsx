import { useState, createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const url = "http://localhost:8000/";

const AuthProvider = (props) => {
  const navigate = useNavigate();
  const [authState] = useState("");



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
  
  const submitProposal = async (scheme) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`${url}form/ProposalID`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accessToken": `${token}`
            },
            body: JSON.stringify({ Scheme: scheme }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to create proposal");
        }

        const json = await response.json();
        console.log("Proposal Submitted Successfully:", json);
        return json;
    } catch (e) {
        console.error("Error submitting proposal:", e.message);
        throw e;
    }
};
  

const submitGeneralInfo = async (generalInfoData) => {
  try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const proposalId = localStorage.getItem("ProposalID");
      if (!proposalId) throw new Error("Proposal ID not found in local storage");

      const response = await fetch(`${url}form/submitGI/${proposalId}`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "accessToken": `${token}`
          },
          body: JSON.stringify(generalInfoData),
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to submit general info");
      }

      const json = await response.json();
      console.log("General Info Submitted:", json);
      return json;
  } catch (e) {
      console.error("Cannot submit general info:", e.message);
      throw e;
  }
};


  const submitResearchDetails = async (researchDetailsData) => {
    try {

      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");


      const proposalId = localStorage.getItem("ProposalID");
      if (!proposalId) throw new Error("Proposal ID not found in local storage");

      const response = await fetch(`${url}form/submit-research-details/${proposalId}`, {
        method: "POST",
        headers: {
           "Content-Type": "application/json" ,
          "accessToken": `${token}`
        },
        body: JSON.stringify(researchDetailsData),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.msg || "Failed to submit research details");

      console.log("Research Details Submitted:", json);
      return json;
    } catch (e) {
      console.error("Cannot submit research details:", e.message);
      alert(e.message);
    }
  };


  const submitBudgetDetails = async (budgetDetailsData) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const proposalId = localStorage.getItem("ProposalID");
        if (!proposalId) throw new Error("Proposal ID not found in local storage");
        console.log(JSON.stringify(budgetDetailsData));
        const response = await fetch(`${url}form/submit-budget/${proposalId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accessToken": `${token}`
            },
            body: JSON.stringify(budgetDetailsData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Failed to submit budget details");
        }

        const json = await response.json();
        console.log("Budget Details Submitted:", json);
        return json;
    } catch (e) {
        console.error("Cannot submit budget details:", e.message);
        throw e;
    }
};

const submitBankDetails = async (bankDetailsData) => {
  try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const proposalId = localStorage.getItem("ProposalID");
      if (!proposalId) throw new Error("Proposal ID not found in local storage");

      const response = await fetch(`${url}form/submit-bank-details/${proposalId}`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "accessToken": `${token}`
          },
          body: JSON.stringify(bankDetailsData),
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to submit bank details");
      }

      const json = await response.json();
      console.log("Bank Details Submitted:", json);
      return json;
  } catch (e) {
      console.error("Cannot submit bank details:", e.message);
      throw e;
  }
};


const submitPIDetails = async (piDetailsData) => {
  try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const proposalId = localStorage.getItem("ProposalID");
      if (!proposalId) throw new Error("Proposal ID not found in local storage");

      const response = await fetch(`${url}form/submit-pi-details/${proposalId}`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "accessToken": `${token}`
          },
          body: JSON.stringify(piDetailsData),
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to submit PI details");
      }

      const json = await response.json();
      console.log("PI Details Submitted:", json);
      return json;
  } catch (e) {
      console.error("Cannot submit PI details:", e.message);
      throw e;
  }
};

const submitAcknowledgement = async (accept) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const proposalId = localStorage.getItem("ProposalID");
    if (!proposalId) throw new Error("Proposal ID not found in local storage");

    const response = await fetch(`${url}form/submit-acknowledgement/${proposalId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accessToken": `${token}`
      },
      body: JSON.stringify({ accept }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to submit acknowledgement");
    }

    const json = await response.json();
    console.log("Acknowledgement Submitted:", json);
    return json;
  } catch (e) {
    console.error("Cannot submit acknowledgement:", e.message);
    throw e;
  }
};


const approvedProjects = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
      console.log("Use a valid Token");
      alert("Authentication required.");
      return;
  }
  try {
      const response = await fetch(`${url}form/acceptedproposals`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "accessToken": `${token}`,
          },
      });

      if (!response.ok) {
          throw new Error("Failed to update user details");
      }
      const json = await response.json();
      alert(json.msg);
      console.log(json.msg);
      return json.data;
  } catch (error) {
      console.error("Edit user error:", error);
      alert(error.message || "Failed to update user details");
  }
};



  return (
    <AuthContext.Provider value={{ sendOtp, verifyOtp, login, authState, submitProposal, submitGeneralInfo, submitResearchDetails, submitBudgetDetails, submitBankDetails, submitPIDetails, submitAcknowledgement, getuser, approvedProjects }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };