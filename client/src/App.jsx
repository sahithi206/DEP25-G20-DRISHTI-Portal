import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./ProtectedRoute.jsx";
import EditProfile from "./pages/EditUser.jsx";
import ProposalScheme from "./pages/ProposalScheme";
import SavedProposals from "./pages/SavedProposals";
import ProposalInbox from "./pages/ProposalInbox";
import ChangeOfInstitute from "./pages/ChangeOfInstitute";
import Dashboard from "./pages/Dashboard";
import GeneralInfo from "./pages/form/GeneralInfo";
import ProjectInvestigator from "./pages/form/PrincipalInvestigatorForm";
import MenuPage from "./pages/MenuPage";
import Techform from "./pages/form/TechForm";
import AboutUs from "./components/AboutUs";
import MiscRequest from "./pages/MiscellanousReq";
import UserProfile from "./pages/UserProfile";
import ProjectDashboard from "./pages/ProjectDashboard";
import axios from "axios";
import { AuthProvider } from './pages/Context/Authcontext.jsx';
import Error from "./pages/Error"
import Forgotpassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminReviewProposals from "./pages/Admin/AdminReviewProposals";
import FundCycleApproval from "./pages/Admin/FundCyclePage.jsx"; 
import RequestsPage from "./pages/Admin/AdminRequests.jsx"; 
import SchemeManagement from "./pages/admin/SchemeManagement.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import RunningProjects from "./pages/college/RunningProjects.jsx";
import InstituteUsers from "./pages/college/InstituteUsers.jsx";
import UserProposalsInsti from "./pages/college/UserProposalsInsti.jsx";
import UC from "./pages/uc/se/UC.jsx";
import SelectDate from "./pages/SelectDate.jsx";
import SanctionedProposals from "./pages/uc/se/SanctionedProposals.jsx"
import SE from "./pages/uc/se/SE.jsx";
import InstituteLogin from "./pages/college/InstituteLogin";
import InstituteDashboard from "./pages/college/InstituteDashboard";
import RegisterInstitute from "./pages/college/RegisterInstitute.jsx";



function App() {
  const getData = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_APP_URL);
      console.log(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
        <Route path="/menupage" element={<MenuPage />} />
        <Route path="/formsubmission" element={<ProposalScheme />} />
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
        <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/change-password" element={<ChangePassword/>} />
          <Route path="/uc/:id" element={<UC/>} />
          <Route path="/se/:id" element ={<SE/>}/>
          <Route path="/project-approval/:id" element={<SelectDate/>}/>
          <Route path="/sanctionedproposals" element={<SanctionedProposals/>}/>
          <Route path="/error" element={<Error />} />
          <Route path="/project-dashboard/:id" element={<ProjectDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/review-proposals" element={<AdminReviewProposals />} />
          <Route path="/fund-cycle" element={<FundCycleApproval />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/schemes" element={<SchemeManagement />} />
          <Route path="/running-projects" element={<RunningProjects />} />
          <Route path="/institute-users" element={<InstituteUsers />} />
          <Route path="/institute-login" element={<InstituteLogin />} />
        <Route path="/register-institute" element={<RegisterInstitute />} />
        <Route path="/institute-dashboard" element={<InstituteDashboard />} />
        <Route path="/running-projects" element={<RunningProjects />} />
          <Route path="/institute/user-proposals/:userId" element={<UserProposalsInsti />} />
         </Route>
      </Routes>
    </div>
  );
}

export default App;
