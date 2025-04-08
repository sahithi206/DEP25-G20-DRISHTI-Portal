import React, { useState, useEffect } from "react";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ChangeOfInstitute = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fileNumbers, setFileNumbers] = useState([]);
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    
    const [formData, setFormData] = useState({
        fileNumber: "",
        piName: "",
        projectTitle: "",
        currentInstitute: "",
        currentInstituteAddress: "",
        state: "",
        district: "",
        newInstitute: "",
        department: "",
        designation: "",
        resignationDate: "",
        joiningDate: "",
        justification: ""
    });

    useEffect(() => {
        // Fetch file numbers
        fetchUserProjects();
        // Fetch states
        fetchStates();
    }, []);

    // Modified to fetch user projects from the user's proposals array
    const fetchUserProjects = async () => {
        try {
            const response = await fetch("/api/user/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token")
                }
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }
            
            const userData = await response.json();
            
            if (userData && userData.proposals && userData.proposals.length > 0) {
                // Fetch details for each project in the proposals array
                const projectPromises = userData.proposals.map(projectId => 
                    fetch(`/api/projects/${projectId}`, {
                        headers: {
                            "auth-token": localStorage.getItem("token")
                        }
                    }).then(res => res.json())
                );
                
                const projectsData = await Promise.all(projectPromises);
                setFileNumbers(projectsData.map(project => ({
                    id: project._id, // Use _id as per MongoDB schema
                    fileNumber: project.fileNumber || project._id // Use fileNumber or _id as fallback
                })));
            } else {
                setFileNumbers([]);
            }
        } catch (error) {
            console.error("Error fetching user projects:", error);
            toast.error("Failed to load your projects");
        }
    };

    const fetchStates = async () => {
        try {
            const response = await fetch("/api/states");
            
            if (!response.ok) {
                throw new Error("Failed to fetch states");
            }
            
            const data = await response.json();
            setStates(data);
        } catch (error) {
            console.error("Error fetching states:", error);
            toast.error("Failed to load states");
        }
    };

    const fetchDistricts = async (stateId) => {
        try {
            const response = await fetch(`/api/districts/${stateId}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch districts");
            }
            
            const data = await response.json();
            setDistricts(data);
            setFormData(prev => ({ ...prev, district: "" }));
        } catch (error) {
            console.error("Error fetching districts:", error);
            toast.error("Failed to load districts");
        }
    };

    const fetchInstitutions = async (districtId) => {
        try {
            const response = await fetch(`/api/institutions/${districtId}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch institutions");
            }
            
            const data = await response.json();
            setInstitutions(data);
            setFormData(prev => ({ ...prev, newInstitute: "" }));
        } catch (error) {
            console.error("Error fetching institutions:", error);
            toast.error("Failed to load institutions");
        }
    };

    const handleFileNumberChange = async (e) => {
        const fileNumber = e.target.value;
        setFormData(prev => ({ ...prev, fileNumber }));
        
        if (fileNumber) {
            try {
                const response = await fetch(`/api/projects/${fileNumber}`, {
                    headers: {
                        "auth-token": localStorage.getItem("token")
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Failed to fetch project details");
                }
                
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    piName: data.piName || data.Name || "",
                    projectTitle: data.projectTitle || data.title || "",
                    currentInstitute: data.institution || data.Institute || "",
                    currentInstituteAddress: data.institutionAddress || data.address || ""
                }));
            } catch (error) {
                console.error("Error fetching project details:", error);
                toast.error("Failed to load project details");
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === "state") {
            fetchDistricts(value);
        } else if (name === "district") {
            fetchInstitutions(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Create request payload using the Request schema structure
            const requestPayload = {
                requestType: "Change of Institute",
                description: JSON.stringify({
                    fileNumber: formData.fileNumber,
                    piName: formData.piName,
                    projectTitle: formData.projectTitle,
                    currentInstitute: formData.currentInstitute,
                    currentInstituteAddress: formData.currentInstituteAddress,
                    newInstitute: formData.newInstitute,
                    state: formData.state,
                    district: formData.district,
                    department: formData.department,
                    designation: formData.designation,
                    resignationDate: formData.resignationDate,
                    joiningDate: formData.joiningDate,
                    justification: formData.justification
                })
            };
            
            const response = await fetch("/api/requests/submit-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem("token")
                },
                body: JSON.stringify(requestPayload)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                toast.success("Change of institute request submitted successfully!");
                navigate("/dashboard");
            } else {
                toast.error(data.msg || "Failed to submit request");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An error occurred while submitting your request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={"/form-submission"} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="p-6 space-y-6">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                            <p className="mt-3 text-2xl font-bold text-blue-800">Change of Institute </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        File Number <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        className="border border-gray-400 rounded px-3 py-2 w-full"
                                        name="fileNumber"
                                        value={formData.fileNumber}
                                        onChange={handleFileNumberChange}
                                        required
                                    >
                                        <option value="">Select File Number</option>
                                        {fileNumbers.map(file => (
                                            <option key={file.id} value={file.id}>{file.fileNumber}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Name of Principal Investigator:
                                    </label>
                                    <input 
                                        type="text" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full bg-gray-100" 
                                        name="piName"
                                        value={formData.piName}
                                        disabled 
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Project Title:
                                    </label>
                                    <input 
                                        type="text" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full bg-gray-100" 
                                        name="projectTitle"
                                        value={formData.projectTitle}
                                        disabled 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Current Institute:
                                    </label>
                                    <input 
                                        type="text" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full bg-gray-100" 
                                        name="currentInstitute"
                                        value={formData.currentInstitute}
                                        disabled 
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Current Institute Address:
                                    </label>
                                    <input 
                                        type="text" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full bg-gray-100" 
                                        name="currentInstituteAddress"
                                        value={formData.currentInstituteAddress}
                                        disabled 
                                    />
                                </div>
                            </div>

                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">New Institute Details</h3>
                                <p className="text-sm text-gray-600">Please fill in the details of the institute you are transferring to.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        className="border border-gray-400 rounded px-3 py-2 w-full"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state._id} value={state._id}>{state.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        District <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        className="border border-gray-400 rounded px-3 py-2 w-full"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.state}
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(district => (
                                            <option key={district._id} value={district._id}>{district.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Institute Name <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        className="border border-gray-400 rounded px-3 py-2 w-full"
                                        name="newInstitute"
                                        value={formData.newInstitute}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.district}
                                    >
                                        <option value="">Select Institute</option>
                                        {institutions.map(inst => (
                                            <option key={inst._id} value={inst._id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full" 
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Designation <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full" 
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Date of Resignation In Current Institution <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full" 
                                        name="resignationDate"
                                        value={formData.resignationDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Effective Date of Transfer <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        className="border border-gray-400 rounded px-3 py-2 w-full" 
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block font-semibold text-gray-700 mb-1">
                                    Detailed Justification of Transfer <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    className="border border-gray-400 rounded px-3 py-2 w-full h-32" 
                                    name="justification"
                                    value={formData.justification}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Please provide a detailed justification for your transfer..."
                                />
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                                <h4 className="text-md font-semibold text-blue-700">Note:</h4>
                                <p className="text-sm text-gray-600">Your request will require approval from both your current institution and the admin. You will be notified when the status changes.</p>
                            </div>

                            <div className="flex justify-center">
                                <button 
                                    type="submit" 
                                    className="bg-blue-700 text-white px-8 py-3 rounded-md shadow-md hover:bg-blue-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangeOfInstitute;