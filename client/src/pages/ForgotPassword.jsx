import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 const url=import.meta.env.VITE_REACT_APP_URL;
 let navigate=useNavigate();
  const sendOTP = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${url}auth/forgot-passwordotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setMessage(data.msg);
      }
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${url}auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      console.log(res);
      const data = await res.json();
      if (data.success) {
        setMessage("Password successfully changed!");
      } else {
        setMessage(data.msg);
      }
      navigate("/login");
    } catch (err) {
      setMessage("Something went wrong!");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-96 p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Forgot Password
        </h2>
        
        {message && <p className="text-red-500 text-center">{message}</p>}

        {step === 1 ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full p-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
