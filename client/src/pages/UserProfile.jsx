import { useState } from "react";
import { FaUserCircle, FaPowerOff, FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaBuilding, FaIdBadge, FaPrint } from "react-icons/fa";
import { useState, useContext, useEffect } from "react";
import { FaUserCircle, FaPowerOff, FaUser, FaPhone, FaBuilding, FaPrint } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";
import { AuthContext } from "./Context/Authcontext";
const UserProfile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const user = {
        username: "john_doe",
        firstName: "John",
        middleName: "A.",
        lastName: "Doe",
        dob: "1995-06-15",
        gender: "Male",
        nationality: "Indian",
        mobile: "9876543210",
        category: "General",
        differentlyAbled: "No",
        institute: "IIT Bhubaneswar",
        instituteAddress: "Bhubaneswar, Odisha",
        designation: "Professor",
        department: "Computer Science",
    };
    const {getuser}=useContext(AuthContext);

    const [data, setData] = useState({
        name:"",
        email: "",
        dob: "",
        mobile:"",
        gender: "",
        institute: "",
        role: "",
    // department: "Electrical Engineering"  
    });
    
    useEffect(() => {
        const fetchData = async () => {
            const userData = await getuser();
            setData({name:userData.Name,
                email: userData.email,
                dob:userData.DOB,
                mobile:userData.Mobile,
                gender:userData.Gender,
                institute:userData.Institute,
                role: userData.role});
        };
        fetchData();
    }, []);
    
    const exportAsJSON = () => {
        if (!data) {
            alert("No data to export!");
            return;
        }
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "formData.json";
        link.click();
        URL.revokeObjectURL(url);
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-50 p-6">
            <div className="bg-white backdrop-blur-lg p-8 shadow-2xl rounded-2xl w-full max-w-3xl border border-gray-200">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-blue-700 drop-shadow-md">
                        Anusandhan National Research Foundation
                    </h2>
                    <p className="text-gray-500 text-sm">Empowering Innovation & Research</p>
                </div>

                {/* Profile Section */}
                <div className="mt-6 text-center">
                    <img
                        src="https://via.placeholder.com/120"
                        alt="User Avatar"
                        className="mx-auto mb-4 rounded-full border-4 border-blue-500 shadow-lg"
                    />
                    <h3 className="text-2xl font-semibold text-gray-800">{user.firstName} {user.middleName} {user.lastName}</h3>
                    <p className="text-gray-500">@{user.username}</p>
                </div>

                {/* User Details */}
                <div className="mt-6 space-y-6">
                    {/* Personal Details */}
                    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                        <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                            <FaUser className="text-gray-700" /> Personal Information
                        </h4>
                        <p><strong><FaCalendarAlt className="inline mr-2 text-gray-600"/> Date of Birth:</strong> {user.dob}</p>
                        <p><strong><FaVenusMars className="inline mr-2 text-gray-600"/> Gender:</strong> {user.gender}</p>
                        <p><strong>Nationality:</strong> {user.nationality}</p>
                        <p><strong>Category:</strong> {user.category}</p>
                        <p><strong>Is Differently Abled:</strong> {user.differentlyAbled}</p>
                    </div>

                    {/* Contact Details */}
                    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                        <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                            <FaPhone className="text-gray-700" /> Contact Details
                        </h4>
                        <p><strong>Mobile Number:</strong> {user.mobile}</p>
                        <p><strong>Landline Number:</strong> Not Provided</p>
                        <p><strong>Fax Number:</strong> Not Provided</p>
                        <p><strong>SMS Alerts:</strong> No</p>
                    </div>

                    {/* Institute Details */}
                    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                        <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                            <FaBuilding className="text-gray-700" /> Institute Details
                        </h4>
                        <p><strong>Institute Name:</strong> {user.institute}</p>
                        <p><strong>Institute Address:</strong> {user.instituteAddress}</p>
                        <p><strong>Designation:</strong> {user.designation}</p>
                        <p><strong>Department:</strong> {user.department}</p>
                    </div>

                    {/* Other Information */}
                    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                        <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                            <FaIdBadge className="text-gray-700" /> Other Information
                        </h4>
                        <p>No additional details available.</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="text-center mt-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md flex items-center gap-2 mx-auto transition duration-300">
                        <FaPrint /> Print Profile
                    </button>
                </div>
            </div>
        </div>
     );
};

export default UserProfile;
