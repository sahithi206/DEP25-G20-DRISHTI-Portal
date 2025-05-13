import { useState, useContext,useEffect } from "react";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
import { AuthContext } from "./Context/Authcontext";
import { toast } from "react-toastify";
const RegistrationForm = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { getuser,edituser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        email: "",
        Name: "",
        DOB: "",
        Gender: "",
        nationality: "Indian",
        Dept: "",
        idType: "", 
        idNumber: "",
        registeredElsewhere: "No",
        Mobile: "",
        address: ""
        });
     useEffect(() => {
            const fetchData = async () => {
                const userData = await getuser();
                console.log("USerdata",userData);
                setFormData({
                    Name: userData.Name,
                    email: userData.email,
                    DOB: userData.DOB,
                    Mobile: userData.Mobile,
                    Gender: userData.Gender,
                    Dept: userData.Dept,
                    idType: userData.idType,
                    idNumber: userData.idNumber,
                    address: userData.address
                });
            };
            fetchData();
        }, []);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        console.log("Updated Data:", formData);
        try {
            const resp = await edituser(formData);
            if (resp && resp.success) {
                toast.success(resp.msg);
                const updatedUser = await getuser(); 
                setFormData(updatedUser);
            } else {
                toast.error(resp.msg);
            }
        } catch (e) {
            console.error(e);
        }
    };
    

    return (
        <div className="flex min-h-screen bg-[#F0F9FF]">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />

                <div className="p-8 space-y-6 mt-16">
                    <div className="bg-white shadow-lg p-8 rounded-lg max-w-4xl mx-auto">
                        <h2 className="text-3xl font-semibold text-center text-[#1E40AF] mb-6 ">Edit Profile</h2>
                        
                        {/* Username */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Username:</label>
                            <input type="text" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        {/* Name */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Name:</label>
                            <input type="text" name="Name" value={formData.Name} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        {/* Date of Birth */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Date of Birth:</label>
                            <input type="date" name="DOB" value={formData.DOB} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        {/* Gender */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Gender:</label>
                            <select name="Gender" value={formData.Gender} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Transgender</option>
                            </select>
                        </div>

                        {/* Nationality */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Nationality:</label>
                            <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                <option>Indian</option>
                                <option>Other</option>
                            </select>
                        </div>

                        {/* Dept */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Expertise Area:</label>
                            <input type="text" name="Dept" value={formData.Dept} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        {/* PAN Number & Document Type */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Document Type:</label>
                            <select name="idType" value={formData.idType} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                <option value="Aadhaar">Aadhaar</option>
                                <option value="Passport">Passport</option>
                            </select>
                        </div>

                        {/* Document Number */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">{formData.idType} Number:</label>
                            <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        {/* Registered Elsewhere */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Are you registered elsewhere?</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="registeredElsewhere" value="Yes" checked={formData.registeredElsewhere === "Yes"} onChange={handleChange} /> Yes
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="registeredElsewhere" value="No" checked={formData.registeredElsewhere === "No"} onChange={handleChange} /> No
                                </label>
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Mobile Number:</label>
                            <input type="tel" name="Mobile" value={formData.Mobile} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        {/* Address */}
                        <div className="p-1 space-y-2 mt-1">
                            <label className="block font-medium text-gray-700">Address:</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                        </div>

                        {/* Save Changes Button */}
                        <div className="mt-8 text-center">
                            <button className="bg-[#1E40AF] text-white px-6 py-2 rounded-lg hover:bg-[#3B82F6] transition duration-300" onClick={handleEdit}>
                                Save Changes
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;
