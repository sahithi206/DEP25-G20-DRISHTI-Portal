import React,{useEffect} from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomeNavbar from "./utils/HomeNavbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
//import Footer from "./components/Footer";
import ProposalScheme from "./pages/ProposalScheme";
import SavedProposals from "./pages/SavedProposals";
import ProposalInbox from "./pages/ProposalInbox";
import ChangeOfInstitute from "./pages/ChangeOfInstitute";
import Dashboard from "./pages/Dashboard";
import GeneralInfo from "./pages/form//GeneralInfo"
import ProjectInvestigator from "./pages/form/PrincipalInvestigatorForm";
import MenuPage from "./pages/MenuPage";
import Techform from "./pages/form/TechForm";
import AboutUs from "./components/AboutUs";
import MiscRequest from "./pages/MiscellanousReq";
import UserProfile from "./pages/UserProfile";
import axios from "axios";
import {AuthProvider} from './pages/Context/Authcontext.jsx';

function App() {
  const getData=async()=>{
    try {
      const response = await axios.get(import.meta.env.VITE_APP_URL); 
       console.log(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  useEffect(()=>{
    getData();
  },[])
  return (
    <Router>
      <AuthProvider>
         <MainLayout />
      </AuthProvider>
    </Router>
  );
}

function MainLayout() {
  const location = useLocation(); // Get current route

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/menupage" element={<MenuPage />} />
        <Route path="/proposalscheme" element={<ProposalScheme />} />
        <Route path="/savedproposals" element={<SavedProposals />} />
        <Route path="/proposalinbox" element={<ProposalInbox />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/changeofinstitute" element={<ChangeOfInstitute />} />
        <Route path="/generalinfo" element={<GeneralInfo />} />
        <Route path="/projectinvestigator" element={<ProjectInvestigator />} />
        <Route path="/pi" element={<ProjectInvestigator />} />
        <Route path="/techform" element={<Techform />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/misc-request" element={<MiscRequest />} />
        <Route path="/view-profile" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default App;




