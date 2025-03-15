import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const url = import.meta.env.VITE_REACT_APP_URL;
  let navigate = useNavigate();

  const resetPassword = async () => {
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Invalid session. Please log in again.");
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
        setMessage("Password successfully changed!");
        await localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.msg);
      }
    } catch (err) {
      setMessage("Something went wrong!");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Change Password</h2>

        {message && <p className="text-red-500 mb-3">{message}</p>}

        <div className="flex flex-col items-center">
          <input
            type="password"
            placeholder="Enter current password"
            className="w-80 p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter new password"
            className="w-80 p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-80 bg-blue-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
