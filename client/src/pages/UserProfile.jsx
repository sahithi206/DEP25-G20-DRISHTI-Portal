import { useState, useContext, useEffect } from "react";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
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
        department: "",
        idType: "",
        idNumber: "", address: ""
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
                role: userData.role,
                department: userData.Dept,
                idType: userData.idType,
                idNumber: userData.idNumber,
                address: userData.address
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
        <div className="flex min-h-screen bg-blue-50">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />

                <div className="p-8 space-y-6 mt-16">
                    <div className="bg-white shadow-lg p-8 rounded-lg max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">User Profile</h2>

                        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-y-4  pb-2 mb-4">
                            <p><strong>Username: </strong> {data.email}</p>
                            <p><strong>Name: </strong> {data.name}</p>
                            <p><strong>Date of Birth: </strong> {data.dob}</p>
                            <p><strong>Nationality: </strong> Indian</p>
                            <p><strong>Gender: </strong> {data.gender}</p>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mb-4">Contact Details</h3>
                        <div className="grid grid-cols-2 gap-y-4">
                            <p><strong>Mobile Number: </strong> {data.mobile}</p>
                            <p><strong>Landline Number: </strong> No</p>
                            <p><strong>Address: </strong> {data.address}</p>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mt-6 mb-4">Institute Details</h3>
                        <div className="grid grid-cols-2 gap-y-5">
                            <p><strong>Institute Name: </strong> {data.institute}</p>
                            <p><strong>Designation: </strong> {data.role}</p>
                            <p><strong>Department: </strong> {data.department}</p>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-800 border-b pb-2 mt-6 mb-4">Other Information</h3>
                        <p>
                            <strong>{data.idType === "aadhar" ? "Aadhar Number" : "Passport Number"}: </strong>
                            {data.idNumber}
                        </p>

                        <div className="mt-8 text-center">
                            <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition duration-300" onClick={exportAsJSON}>
                                Export as JSON
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
