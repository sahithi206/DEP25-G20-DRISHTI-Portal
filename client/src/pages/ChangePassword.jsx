import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
export default function ChangePassword() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); 
  const url = import.meta.env.VITE_REACT_APP_URL;
  let navigate = useNavigate();

  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const validatePassword = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const resetPassword = async () => {
    // Form validation
    if (!currentPassword || !password) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("New passwords don't match");
      setMessageType("error");
      return;
    }

    if (validatePassword(password) < 3) {
      setMessage("Please use a stronger password");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Invalid session. Please log in again.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      const response = await fetch(`${url}auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
        body: JSON.stringify({ currentPassword, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage("Password successfully changed! Redirecting to login...");
        setMessageType("success");
        await localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.msg || "Password change failed");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Something went wrong. Please try again later.");
      setMessageType("error");
    }
    
    setLoading(false);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    
                <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                    <HomeNavbar isSidebarOpen={isSidebarOpen} />
                    <div className="p-6 space-y-6 mt-16">
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
          <p className="text-gray-600 mt-1">Update your account password</p>
        </div>
        
        {message && (
          <div className={`p-4 mb-6 rounded-md ${
            messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {message}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={password}
              onChange={handlePasswordChange}
            />
            
            {/* Password strength indicator */}
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500">Password strength:</span>
                <span className="text-xs font-medium">
                  {passwordStrength === 0 && "Very weak"}
                  {passwordStrength === 1 && "Weak"}
                  {passwordStrength === 2 && "Medium"}
                  {passwordStrength === 3 && "Strong"}
                  {passwordStrength === 4 && "Very strong"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    passwordStrength === 0 ? "bg-gray-300 w-0" :
                    passwordStrength === 1 ? "bg-red-500 w-1/4" :
                    passwordStrength === 2 ? "bg-yellow-500 w-2/4" :
                    passwordStrength === 3 ? "bg-blue-500 w-3/4" :
                    "bg-green-500 w-full"
                  }`}
                ></div>
              </div>
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                <li className={password.length >= 8 ? "text-green-500" : ""}>• At least 8 characters</li>
                <li className={/[A-Z]/.test(password) ? "text-green-500" : ""}>• At least one uppercase letter</li>
                <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>• At least one number</li>
                <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : ""}>• At least one special character</li>
              </ul>
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                confirmPassword && password !== confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
            )}
          </div>
          
          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-blue-300 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Password...
              </span>
            ) : (
              "Update Password"
            )}
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-transparent text-gray-600 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
            </div>

    </div>
    </div>
      </div>
  );
}
