import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Toast from "./utils/toast";
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
import SchemeManagement from "./pages/Admin/SchemeManagement.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import RunningProjects from "./pages/college/RunningProjects.jsx";
import InstituteUsers from "./pages/college/InstituteUsers.jsx";
import UserProposalsInsti from "./pages/college/UserProposalsInsti.jsx";
import SanctionedProjects from "./pages/college/SanctionedProjects.jsx";
import UC from "./pages/uc/se/UC.jsx";
import SelectDate from "./pages/SelectDate.jsx";
import SanctionedProposals from "./pages/uc/se/SanctionedProposals.jsx"
import SE from "./pages/uc/se/SE.jsx";
import InstituteLogin from "./pages/college/InstituteLogin.jsx";
import InstituteDashboard from "./pages/college/InstituteDashboard.jsx";
import RegisterInstitute from "./pages/college/RegisterInstitute.jsx";
import DisplayUC from "./pages/uc/se/DisplayUC.jsx"
import Certificates from "./pages/uc/se/Certificate.jsx";
import SanctionedDashboard from "./pages/college/SanctionedDashboard.jsx";
import SEForm from "./pages/uc/se/SEdisplay.jsx";
import ProgressReportForm from "./pages/uc/se/ProgressReportForm.jsx";
import FinalReport from "./pages/uc/se/FinalReport.jsx";
import AdminLogin from "./pages/Admin/AdminLogin.jsx";
import AdminSignup from "./pages/Admin/AdminSignup.jsx";
import AddExpenses from "./pages/college/AddExpenses.jsx";
import ViewExpenses from "./pages/college/ViewExpenses.jsx";
import SanctionProjects from "./pages/Admin/SanctionProjects"
import BudgetAllocationForm from "./pages/Admin/BudgetAllocationForm.jsx";
import OngoingProjects from "./pages/Admin/OngoingProjects";
import PDashboard from "./pages/Admin/ProjectDashboard.jsx";
import ViewDocs from "./pages/Admin/ViewDocs.jsx";
import ViewCertificates from "./pages/Admin/certificates.jsx";
import ViewSE from "./pages/Admin/SE.jsx";
import CommentsPage from "./pages/uc/CommentsPage.jsx";
import ProjectExpenses from "./pages/ProjectExpenses.jsx";

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
      <Toast style={{ width: "900px" }} theme={"light"} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/adminSignup" element={<AdminSignup />} />
        <Route path="/institute-login" element={<InstituteLogin />} />
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
          <Route path="/progress-report/:id" element={<ProgressReportForm />} />
          <Route path="/final-report/:id" element={<FinalReport />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/uc/:id" element={<UC />} />
          <Route path="/se/:id" element={<SE />} />
          <Route path="/project-approval/:id" element={<SelectDate />} />
          <Route path="/ongoingproposals" element={<SanctionedProposals />} />
          <Route path="/certificates/:id" element={<DisplayUC />} />
          <Route path="/certificate-details/:type/:id" element={<Certificates />} />
          <Route path="/certificate-details/se/:id" element={<SEForm />} />
          <Route path="/error" element={<Error />} />
          <Route path="/project-dashboard/:id" element={<ProjectDashboard />} />
          <Route path="/project-expenses/:projectId" element={<ProjectExpenses />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/review-proposals" element={<AdminReviewProposals />} />
          <Route path="/admin/sanction-projects" element={<SanctionProjects />} />
          <Route path="/admin/allocate-budget/:id" element={<BudgetAllocationForm />} />
          <Route path="/fund-cycle" element={<FundCycleApproval />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/admin/ongoing-projects" element={<OngoingProjects />} />
          <Route path="/admin/project/:id" element={<PDashboard />} />
          <Route path="/admin/view-uc/se/:id" element={<ViewDocs />} />
          <Route path="/admin/certificate-details/:type/:id" element={<ViewCertificates />} />
          <Route path="/admin/certificate-details/se/:id" element={<ViewSE />} />


          <Route path="/schemes" element={<SchemeManagement />} />
          <Route path="/running-projects" element={<RunningProjects />} />
          <Route path="/institute-users" element={<InstituteUsers />} />
          <Route path="/register-institute" element={<RegisterInstitute />} />
          <Route path="/institute-dashboard" element={<InstituteDashboard />} />
          <Route path="/running-projects" element={<RunningProjects />} />
          <Route path="/institute/user-proposals/:userId" element={<UserProposalsInsti />} />
          <Route path="/sanctioned-projects" element={<SanctionedProjects />} />
          <Route path="/sanctioned-project-dashboard/:id" element={<SanctionedDashboard />} />
          <Route path="/add-expenses/:projectId" element={<AddExpenses />} />
          <Route path="/view-expenses/:projectId" element={<ViewExpenses />} />
          <Route path="/comments/:projectId/:ucType" element={<CommentsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
