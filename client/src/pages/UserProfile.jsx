<<<<<<< HEAD
// import React from "react";

// const UserProfile = ({ user }) => {
//     if (!user) {
//         return <div className="text-center mt-10 text-red-600">User data is missing!</div>;
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//             <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-4xl border">
//                 <h2 className="text-3xl font-bold text-center text-emerald-800 mb-6">
//                     Anusandhan National Research Foundation
//                 </h2>
//                 <h3 className="text-xl font-semibold text-center mb-4">User Profile</h3>
                
//                 <div className="border p-4 mb-4">
//                     <p><strong>Username:</strong> {user.username || "N/A"}</p>
//                     <p><strong>Name:</strong> {user.firstName || ""} {user.middleName || ""} {user.lastName || ""}</p>
//                     <p><strong>Date of Birth:</strong> {user.dob || "N/A"}</p>
//                     <p><strong>Gender:</strong> {user.gender || "N/A"}</p>
//                     <p><strong>Category:</strong> General</p>
//                     <p><strong>Nationality:</strong> {user.nationality || "N/A"}</p>
//                     <p><strong>Is Differently abled:</strong> Yes</p>
//                 </div>
                
//                 <div className="border p-4 mb-4">
//                     <h4 className="font-semibold mb-2">Contact Details</h4>
//                     <p><strong>Mobile Number:</strong> {user.mobile || "N/A"}</p>
//                     <p><strong>Landline Number:</strong> No</p>
//                     <p><strong>Fax Number:</strong> No</p>
//                     <p><strong>Do you want to receive SMS alerts?</strong> No</p>
//                 </div>
                
//                 <div className="border p-4 mb-4">
//                     <h4 className="font-semibold mb-2">Institute Address Details</h4>
//                     <p><strong>Institute Name:</strong> No Institute</p>
//                     <p><strong>Institute Address:</strong> , Pin - 0</p>
//                     <p><strong>Designation:</strong></p>
//                     <p><strong>Department:</strong></p>
//                 </div>
                
//                 <div className="border p-4">
//                     <h4 className="font-semibold mb-2">Other Information</h4>
//                     <p>There is no other important details.</p>
//                 </div>
                
//                 <div className="text-center mt-4">
//                     <button className="bg-blue-600 text-white px-4 py-2 rounded">Print</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserProfile;
import React from "react";
import { FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaBuilding, FaIdBadge, FaPrint } from "react-icons/fa";

const UserProfile = () => {
    // Sample hardcoded user data
=======
import { useState } from "react";
import { FaUserCircle, FaPowerOff, FaUser, FaCalendarAlt, FaVenusMars, FaPhone, FaBuilding, FaIdBadge, FaPrint } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";

const UserProfile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
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

    return (
<<<<<<< HEAD
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
=======
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Component */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
                    <h2 className="text-xl font-semibold">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <FaUserCircle className="text-3xl" />
                        <span className="text-lg font-medium">Welcome, Ms. Varsha</span>
                        <FaPowerOff className="text-2xl cursor-pointer text-red-400 hover:text-red-600" />
                    </div>
                </header>

                {/* Profile Section */}
                <div className="p-8">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-800">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                            <h2 className="text-xl font-semibold text-gray-600">Anusandhan National Research Foundation</h2>
                            <h3 className="mt-4 text-2xl font-semibold text-blue-700">Profile Details</h3>
                        </div>

                        {/* User Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Personal Details */}
                            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                    <FaUser className="text-gray-700" /> Personal Information
                                </h4>
                                <p><FaCalendarAlt className="inline text-gray-600 mr-2" /> <strong>Date of Birth:</strong> {user.dob}</p>
                                <p><FaVenusMars className="inline text-gray-600 mr-2" /> <strong>Gender:</strong> {user.gender}</p>
                                <p><strong>Nationality:</strong> {user.nationality}</p>
                                <p><strong>Category:</strong> {user.category}</p>
                                <p><strong>Is Differently Abled:</strong> {user.differentlyAbled}</p>
                            </div>

                            {/* Contact Details */}
                            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                    <FaPhone className="text-gray-700" /> Contact Details
                                </h4>
                                <p><strong>Mobile Number:</strong> {user.mobile}</p>
                                <p><strong>Landline Number:</strong> Not Provided</p>
                                <p><strong>Fax Number:</strong> Not Provided</p>
                                <p><strong>SMS Alerts:</strong> No</p>
                            </div>
                        </div>

                        {/* Institute Details */}
                        <div className="p-4 bg-gray-100 rounded-lg shadow-sm mt-6">
                            <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                <FaBuilding className="text-gray-700" /> Institute Details
                            </h4>
                            <p><strong>Institute Name:</strong> {user.institute}</p>
                            <p><strong>Institute Address:</strong> {user.instituteAddress}</p>
                            <p><strong>Designation:</strong> {user.designation}</p>
                            <p><strong>Department:</strong> {user.department}</p>
                        </div>

                        {/* Action Button */}
                        <div className="text-center mt-6">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md flex items-center gap-2 mx-auto transition duration-300">
                                <FaPrint /> Print Profile
                            </button>
                        </div>
                    </div>
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
