import { useState, useContext, useEffect } from "react";
import { FaUserCircle, FaPowerOff, FaUser, FaPhone, FaBuilding, FaPrint } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar"
import { AuthContext } from "./Context/Authcontext";
const UserProfile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { getuser } = useContext(AuthContext);

    const [data, setData] = useState({
        name: "",
        email: "",
        dob: "",
        mobile: "",
        gender: "",
        institute: "",
        role: "",
        // department: "Electrical Engineering"  
    });

    useEffect(() => {
        const fetchData = async () => {
            const userData = await getuser();
            setData({
                name: userData.Name,
                email: userData.email,
                dob: userData.DOB,
                mobile: userData.Mobile,
                gender: userData.Gender,
                institute: userData.Institute,
                role: userData.role
            });
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
        link.download = "User.json";
        link.click();
        URL.revokeObjectURL(url);
    };




    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                {/* Header */}
                <HomeNavbar />

                {/* Profile Section */}
                <div className="p-8">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-800">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                            <h2 className="text-xl font-semibold text-gray-600">Anusandhan National Research Foundation</h2>
                            <h3 className="mt-4 text-2xl font-semibold text-blue-700">Profile Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                    <FaUser className="text-gray-700" /> Personal Information
                                </h4>
                                <p> <strong>Name</strong> {data.name}</p>
                                <p> <strong>Date of Birth:</strong> {data.dob}</p>
                                <p><strong>Gender:</strong> {data.gender}</p>
                                <p><strong>Nationality:</strong> Indian </p>
                            </div>

                            <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                    <FaPhone className="text-gray-700" /> Contact Details
                                </h4>
                                <p><strong>Mobile Number:</strong> {data.mobile}</p>
                                <p><strong>Email Id:</strong> {data.email}</p>
                            </div>

                            {/* Institute Details */}
                            <div className="p-4 bg-gray-100 rounded-lg shadow-sm col-span-2">
                                <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                                    <FaBuilding className="text-gray-700" /> Institute Details
                                </h4>
                                <p><strong>Institute Name:</strong> {data.institute}</p>
                                <p><strong>Designation:</strong> {data.role}</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center mt-6">
                            <button type="button" onClick={exportAsJSON} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md flex items-center gap-2 mx-auto transition duration-300">
                                <FaPrint /> Print Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;


