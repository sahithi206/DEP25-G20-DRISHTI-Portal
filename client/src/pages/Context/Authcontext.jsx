import { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
const AuthContext = createContext();
const url = import.meta.env.VITE_REACT_APP_URL;
console.log(url);
const AuthProvider = (props) => {
  const navigate = useNavigate();
  const [authState] = useState("");
  useEffect(() => {
    const newTabId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem("activeTab", newTabId);

    const checkTabs = () => {
      const activeTab = localStorage.getItem("activeTab");
      if (activeTab && activeTab !== newTabId) {
        navigate("/");
      }
    };

    window.addEventListener("storage", checkTabs);

    return () => {
      window.removeEventListener("storage", checkTabs);
      localStorage.removeItem("activeTab");
    };
  }, [navigate]);

  const getuser = async () => {
    const token = localStorage.getItem("token");
    try {
      console.log(token);
      if (!token) {
        console.log("Use valid Token");
        return;
      }
      const response = await fetch(`${url}auth/get-user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Cannot fetch userDetails");
      }
      const json = await response.json();
      const user = json.user;
      if (!json.success) {
        toast.error(json.msg);
        return;
      }
      return user;
    } catch (e) {
      console.log(e);
      toast.error(e.msg || "Cannot fetch User Details");
    }
  }

  const edituser = async (data) => {
    const token = localStorage.getItem("token");
    try {
      console.log(token);
      if (!token) {
        console.log("Use valid Token");
        return;
      }
      const response = await fetch(`${url}auth/edit-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
        body: JSON.stringify({
          Name: data.Name,
          email: data.email,
          DOB: data.DOB,
          Mobile: data.Mobile,
          Gender: data.Gender,
          Dept: data.Dept,
          idType: data.idType,
          idNumber: data.idNumber,
          address: data.address
        }),
      });
      if (!response.ok) {
        throw new Error("Cannot Edit userDetails");
      }
      const json = await response.json();
      console.log(json);
      return json;
    } catch (e) {
      console.log(e);
      toast.error(e.msg || "Cannot Edit User Details");
    }
  }

  const getpi = async (email) => {
    try {
      const response = await fetch(`${url}auth/get-pi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Failed to Fetch details");
      return json;
    } catch (e) {
      console.log(e);
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
      toast.error(e.message);
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
        navigate("/formsubmission");
      } else {
        console.error("Error:", result.msg);
        toast.error("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Something went wrong while verifying OTP.");
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
        navigate("/formsubmission");
      }
    } catch (e) {
      console.error("Cannot Login:", e.message);
      toast.error(e.msg || "Invalid Credentials");
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

  const uploadFile = async (file, type, userId) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${url}upload/${type}/${userId}`, {
        method: "POST",
        body: formData,
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return await response.json();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      return { success: false, message: error.message || "Upload failed" };
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
          "Content-Type": "application/json",
          "accessToken": `${token}`
        },
        body: JSON.stringify(researchDetailsData),
      });
      console.log("REsearch", response);
      const json = await response.json();
      if (!response.ok) throw new Error(json.msg || "Failed to submit research details");

      console.log("Research Details Submitted:", json);
      return json;
    } catch (e) {
      console.error("Cannot submit research details:", e.message);
      toast.error(e.message);
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

  const submitPIDetails = async ({ piList, coPiList }) => {
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
        body: JSON.stringify({ piList, coPiList })
      });
      console.log(response);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit PI details");
      }
      const json = await response.json();
      console.log("PI Details Submitted:", json);
      toast.success("PI/Co-PI details Submitted!!");
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
      await localStorage.removeItem("ProposalID");
      const json = await response.json();
      console.log("Acknowledgement Submitted:", json);
      return json;
    } catch (e) {
      console.error("Cannot submit acknowledgement:", e.message);
      throw e;
    }
  };

  const unsavedProposal = async () => {
    const token = localStorage.getItem("token");
    const proposalId = localStorage.getItem("ProposalID");
    try {
      if (!token) {
        navigate("/formsubmission");
        throw new Error("User not authenticated");
      }
      if (!proposalId) {
        navigate("/formsubmission");
        throw new Error("Proposal ID not found in local storage");
      }

      const response = await fetch(`${url}form/get-proposal/${proposalId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to Fetch Proposal");
      }
      const json = await response.json();
      console.log(json);
      if (json.msg === "Proposal was Already Submitted") {
        navigate("/formsubmission");
        return;
      }
      return json;
    } catch (e) {
      console.error("Cannot Fetch the Proposal:", e.message);
      throw e;
    }
  }

  const incompleteProposals = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
      return;
    }
    try {
      const response = await fetch(`${url}form/incompleteProposals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to Fetch Proposals");
      }
      const json = await response.json();
      return json.proposals;
    } catch (error) {
      console.error("Edit user error:", error);
      console.log(error.message || "Failed to fetch Proposals");
    }
  };

  const approvedProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
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
        throw new Error("Failed to Fetch Proposals");
      }
      const json = await response.json();
      toast.success(json.msg);
      console.log(json.msg);
      return json.data;
    } catch (error) {
      console.error("Fetch Proposals error:", error);
      toast.error(error.message || "Failed to Fetch Proposals");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/");
    console.log("User logged out!!");
  }

  const getProject = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
      return;
    }

    try {
      console.log("Proposal", id);
      const response = await fetch(`${url}projects/get-project/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": ` ${token}`,
        },
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      const data = await response.json();
      console.log("Data", data);
      return { data };
    } catch (error) {
      console.error(error);
    }
  };

  const getSchemes = async () => {
    try {
      const response = await fetch(`${url}schemes/get-schemes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schemes: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching schemes:", error);
      return [];
    }
  };

  // Admin Side
  const adminVerifyOtp = async (data) => {
    try {
      console.log("Verifying OTP with data:", JSON.stringify(data));

      const response = await fetch(`${url}auth/admin-verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Signup Successful!", result);
        console.log("Your token: " + result.accessToken);

        localStorage.setItem("token", result.accessToken);
        navigate("/adminLogin");
      } else {
        console.error("Error:", result.msg);
        toast.error("Error: " + result.msg);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Something went wrong while verifying OTP.");
    }
  };

  const getAdmin = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token not found. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${url}auth/get-admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": token,
        },
      });

      const json = await response.json();
      if (!json.success) {
        console.error(json.msg);
        return;
      }

      // console.log("Logged-in Admin:", json.admin);
      return json.admin;
    } catch (error) {
      console.error("Error fetching admin:", error);
    }
  };

  const adminLogin = async (email, password, navigate) => {
    try {
      const response = await fetch(`${url}auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.msg || "Invalid credentials");

      console.log("Admin logged in successfully:", json);

      if (json.success) {
        localStorage.setItem("token", json.accessToken);
        navigate("/admin");
      }
    } catch (e) {
      console.error("Cannot Login:", e.message);
      toast.error(e.message || "Invalid Credentials");
    }
  };

  // institute side 
  // to be used when institute verification done 
  //  alright its done

  const createInstitute = async (email, password, instituteName, otp) => {
    try {
      const response = await fetch(`${url}auth/create-institute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, college: instituteName, otp }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Failed to create institute");

      console.log("Institute Created Successfully:", json);
      if (json.success) {
        localStorage.setItem("token", json.accessToken);
        navigate("/institute-dashboard");
      }
    } catch (e) {
      console.error("Cannot create institute:", e.message);
      toast.error(e.message);
    }
  };

  const loginInstitute = async (email, password) => {
    try {
      const response = await fetch(`${url}auth/institute-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Invalid credentials");

      console.log("Institute Logged in successfully:", json);
      if (json.success) {
        localStorage.setItem("token", json.accessToken);
        navigate("/institute-dashboard"); // make institute dashboard :(
      }
    } catch (e) {
      console.error("Cannot Login:", e.message);
      toast.error(e.msg || "Invalid Credentials");
    }
  }

  const fetchInstituteProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
      return;
    }
    try {
      const response = await fetch(`${url}institute/institute-projects`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch institute projects");
      }
      const json = await response.json();
      console.log("Institute Projects:", json.projects);
      return json.projects;
    } catch (error) {
      console.error("Error fetching institute projects:", error);
      toast.error(error.message || "Failed to fetch institute projects");
    }
  };

  const fetchInstituteUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
      return;
    }
    try {
      const response = await fetch(`${url}institute/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch institute users");
      }
      const json = await response.json();
      console.log("Institute Users:", json.users);
      return json.users;
    } catch (error) {
      console.error("Error fetching institute users:", error);
      toast.error(error.message || "Failed to fetch institute users");
    }
  };

  const userInstiAcceptedProposals = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
      return;
    }
    try {
      console.log(token);
      const response = await fetch(`${url}institute/${userId}/accepted-proposals`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch accepted proposals");
      }
      const json = await response.json();
      console.log("Accepted Proposals:", json.proposals);
      return json.projects;
    } catch (error) {
      console.error("Error fetching accepted proposals:", error);
      toast.error(error.message || "Failed to fetch accepted proposals");
    }
  };

  const fetchSanctionedProjects = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
      return;
    }
    try {
      const response = await fetch(`${url}institute/sanctioned-projects`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sanctioned projects");
      }

      const json = await response.json();
      console.log("Sanctioned Projects:", json.projects);
      return json.projects;
    } catch (error) {
      console.error("Error fetching sanctioned projects:", error);
      toast.error(error.message || "Failed to fetch sanctioned projects");
    }
  };

  const fetchInstituteGetProject = async (projectId) => {

    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      console.log("Use a valid Token");
      toast.error("Authentication required.");
      return;
    }
    try {
      const response = await fetch(`${url}institute/get-project-insti/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      const data = await response.json();
      console.log("Data", data);
      return { data };
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProposal = async (proposalId) => {
    try {
      const response = await fetch(`${url}form/deleteProposal/${proposalId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting proposal:", error);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      const response = await fetch(`${url}institute/delete-expense/${expenseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const editExpense = async (expenseId, updatedExpense) => {
    try {
      if (!updatedExpense || typeof updatedExpense !== "object") {
        throw new Error("Invalid updatedExpense object");
      }

      const response = await fetch(`${url}institute/edit-expense/${expenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: updatedExpense.description,
          amount: updatedExpense.amount,
          type: updatedExpense.type,
          date: updatedExpense.date,
          committedDate: updatedExpense.committedDate,
        }),
      });

      const data = await response.json();

      if (!response.success) {
        return {
          success: false,
          message: data?.message || "Failed to update expense",
        };
      }

      return {
        success: true,
        updatedExpense: data.updatedExpense,
      };
    } catch (err) {
      console.error("Error updating expense:", err);

      let message = "Failed to update expense";

      // Extract validation errors from Mongoose
      if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map(e => e.message);
        message = errors.join(", ");
      }

      res.status(400).json({ success: false, message });
    }
  };


  return (
    <AuthContext.Provider value={{
      sendOtp, verifyOtp, login, unsavedProposal,
      authState, edituser, incompleteProposals, getpi, submitProposal, logout, uploadFile,
      submitGeneralInfo, submitResearchDetails, submitBudgetDetails, submitBankDetails,
      submitPIDetails, submitAcknowledgement, getuser, approvedProjects, fetchInstituteProjects,
      userInstiAcceptedProposals, createInstitute, fetchInstituteUsers, loginInstitute, getProject,
      fetchSanctionedProjects, fetchInstituteGetProject, getSchemes, deleteProposal, adminLogin,
      adminVerifyOtp, getAdmin, deleteExpense, editExpense
    }}>
      {props.children}
    </AuthContext.Provider>
  );
};




export { AuthContext, AuthProvider };
