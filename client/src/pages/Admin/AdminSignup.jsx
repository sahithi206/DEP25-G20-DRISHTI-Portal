import { useNavigate } from "react-router-dom";
import React, { useState, useContext } from "react";
import { AuthContext } from "../Context/Authcontext.jsx";
import Select from "react-select";

const AdminSignup = () => {
    const { sendOtp, adminVerifyOtp } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        otp: "",
    });
    const [error, setError] = useState("");
    const [showOtpField, setShowOtpField] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const navigate = useNavigate();

    const roleOptions = [
        { value: "Head Coordinator", label: "Head Coordinator" },
        { value: "Coordinator", label: "Coordinator" }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (selectedOption) => {
        setFormData({ ...formData, role: selectedOption.value });
        setSelectedOption(selectedOption);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError("Please enter an email to receive OTP.");
            return;
        }
        try {
            setLoading(true);
            console.log("Sending OTP to:", formData.email);
            await sendOtp(formData.email);
            setShowOtpField(true);
            setError("");
        } catch (error) {
            console.error("Error sending OTP:", error);
            setError("Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.role) {
            setError("Please select a role.");
            return;
        }
        try {
            setLoading(true);
            const response = await adminVerifyOtp({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: selectedOption ? selectedOption.value : "",
                otp: String(formData.otp)
            });
            if (response.data.success) {
                setError("");
                // navigate("/admin");
            } else {
                setError(response.data.msg || "OTP verification failed.");
            }
        } catch (error) {
            setError(error.response?.data?.msg || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-4">Admin Signup</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={showOtpField ? handleSubmit : handleSendOtp} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm"
                            placeholder="Enter your full name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm"
                            placeholder="your.email@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm"
                                placeholder="Create a strong password"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Role</label>
                        <Select
                            options={roleOptions}
                            onChange={handleRoleChange}
                            placeholder="Select Role"
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                    {showOtpField ? (
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Enter OTP</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm"
                                    placeholder="Enter OTP sent to your email"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Please check your email for the OTP</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600 mb-2">We'll send an OTP to verify your email address</p>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200 flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                showOtpField ? "Complete Registration" : "Send OTP"
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default AdminSignup;
