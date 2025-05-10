import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "./Context/Authcontext";
const URL = import.meta.env.VITE_REACT_APP_URL;

const ChangeOfInstitute = () => {
    const navigate = useNavigate();
      const [colleges, setColleges] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");

    const [id, setID] = useState();

    const [states] = useState([
        { _id: "1", name: "Punjab" },
        { _id: "2", name: "Telangana" },
        { _id: "3", name: "Delhi" },
        { _id: "4", name: "Maharashtra" },
        { _id: "5", name: "Karnataka" }
    ]);
    const [previousRequests, setPreviousRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    useEffect(() => {
        const fetchColleges = async () => {
            try {
              const URL ="https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";
              const response = await fetch(URL);
                let result = await response.json();
               
              const collegeOptions = result
                .filter((college) => college.country === "India" || college.alpha_two_code === "IN")
                .map((college) => ({
                  label: college.name,
                  value: college.name,
                }));
              setColleges(collegeOptions);
            } catch (error) {
              console.error("Error fetching college list:", error);
            }
          };
          fetchColleges();
        const fetchPreviousRequests = async () => {
            try {
                const response = await fetch(`${URL}requests/pi/getcirequests`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": localStorage.getItem("token")
                    }
                });

                const data = await response.json();
                console.log(data);

                setPreviousRequests(data.requests);

                console.log(previousRequests);

            } catch (error) {
                console.error("Error fetching previous requests:", error);
                toast.error("An error occurred while fetching previous requests");
            }
        };

        fetchPreviousRequests();
    }, []);


    const [districts] = useState([
        { _id: "1", name: "Rupnagar", stateId: "1" },
        { _id: "2", name: "Ludhiana", stateId: "1" },
        { _id: "3", name: "Hyderabad", stateId: "2" },
        { _id: "4", name: "New Delhi", stateId: "3" },
        { _id: "5", name: "Pune", stateId: "4" },
        { _id: "6", name: "Bengaluru Urban", stateId: "5" }
    ]);

    const [institutions] = useState([
        { _id: "1", name: "IIT Ropar", districtId: "1" },
        { _id: "2", name: "IIT Hyderabad", districtId: "3" },
        { _id: "3", name: "Delhi University", districtId: "4" },
        { _id: "4", name: "IIT Bombay", districtId: "5" },
        { _id: "5", name: "IISc Bangalore", districtId: "6" },
        { _id: "6", name: "Guru Nanak Dev Engineering College", districtId: "2" }
    ]);

    const { getuser } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
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
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };
    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleSort = () => {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    };

    const filteredAndSortedRequests = previousRequests
        .filter((req) => {
            const matchesSearch =
                req.FormData?.piName?.toLowerCase().includes(searchQuery) ||
                req.FormData?.currentInstitute?.toLowerCase().includes(searchQuery) ||
                req.FormData?.newInstitute?.toLowerCase().includes(searchQuery);
            const matchesStatus = statusFilter ? req.status === statusFilter : true;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const dateA = new Date(a.submittedAt);
            const dateB = new Date(b.submittedAt);
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getuser();
                setFormData(prev => ({
                    ...prev,
                    piName: res.Name,
                    currentInstitute: res.Institute
                }));
            } catch (e) {
                console.error(e);
                toast.error("Failed to load user data");
            }
        };
        fetchUser();
        fetchUserProjects();
    }, []);

    const fetchUserProjects = async () => {
        try {
            const response = await fetch(`${URL}requests/pi/getongoingprojects`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token")
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user projects");
            }

            const userData = await response.json();
            setProjects(userData.projects.map(project => ({
                ...project,
                selected: false
            })));
        } catch (error) {
            console.error("Error fetching user projects:", error);
            toast.error("Failed to load your projects");
        }
    };

    const ChangeStatus = async (status) => {
        try {
            const response = await fetch(`${URL}requests/pi/${id}/update-status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token")
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user projects");
            }

        } catch (error) {
            console.error("Error fetching user projects:", error);
            toast.error("Failed to load your projects");
        }
    };

    const toggleProjectSelection = (projectId) => {
        setProjects(prevProjects =>
            prevProjects.map(project =>
                project._id === projectId ? { ...project, selected: !project.selected } : project
            )
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "state" && { district: "", newInstitute: "" }),
            ...(name === "district" && { newInstitute: "" })
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const selectedProjectIds = projects
                .filter(project => project.selected)
                .map(project => project._id);

            if (selectedProjectIds.length === 0) {
                toast.error("Please select at least one project to transfer");
                setLoading(false);
                return;
            }

            const requestPayload = {
                projects: selectedProjectIds,
                description: {
                    piName: formData.piName,
                    projectTitle: formData.projectTitle,
                    currentInstitute: formData.currentInstitute,
                    currentInstituteAddress: formData.currentInstituteAddress,
                    newInstitute: institutions.find(inst => inst._id === formData.newInstitute)?.name || "",
                    state: states.find(s => s._id === formData.state)?.name || "",
                    district: districts.find(d => d._id === formData.district)?.name || "",
                    department: formData.department,
                    designation: formData.designation,
                    resignationDate: formData.resignationDate,
                    joiningDate: formData.joiningDate,
                    justification: formData.justification
                }
            };
            console.log(requestPayload);
            const response = await fetch(`${URL}requests/submit-cirequest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accessToken: localStorage.getItem("token")
                },
                body: JSON.stringify(requestPayload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Change of institute request submitted successfully!");
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

    const filteredDistricts = districts.filter(
        district => district.stateId === formData.state
    );

    const filteredInstitutions = institutions.filter(
        institution => institution.districtId === formData.district
    );

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={"/form-submission"} />
                <div className="p-6 space-y-6 mt-10">
                    <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center  hover:shadow-xl transition-shadow">
                        <img src="/3.png" alt="ResearchX Logo" className="mx-auto w-84 h-32 object-contain" />
                        {/*  <h1 className="text-3xl font-black text-gray-900 mb-2">ResearchX</h1>
                        <h3 className="text-medium font-semibold text-gray-700">Empowering Research Through Technology</h3>*/}
                            <p className="mt-3 text-2xl font-bold ml-9 text-blue-800">Change of Institute </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Name of Principal Investigator:
                                    </label>
                                    <p className="px-3 py-2 w-full">{formData.piName}</p>
                                </div>
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Current Institute:
                                    </label>
                                    <p className="px-3 py-2 w-full">{formData.currentInstitute}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-1">
                                        Current Institute Address:
                                    </label>
                                    <input
                                        type="text"
                                        className="border border-gray-400 rounded px-3 py-2 w-full"
                                        name="currentInstituteAddress"
                                        value={formData.currentInstituteAddress}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6 : bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6 ">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">Projects</h3>
                                <p className="text-sm text-gray-600 mb-4">Please select the projects you wish to be transferred</p>

                                <table className="w-full text-sm border border-gray-300:w-[92px] text-sm border border-gray-300:w-[30px] text-sm border border-gray-300">
                                    <thead className="bg-green-100">
                                        <tr>
                                            <th className="border p-2">Select</th>
                                            <th className="border p-2">Project ID</th>
                                            <th className="border p-2">Title</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projects.length > 0 ? (
                                            projects.map((project) => (
                                                <tr key={project._id}>
                                                    <td className="border p-2 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={project.selected || false}
                                                            onChange={() => toggleProjectSelection(project._id)}
                                                            className="h-4 w-4 text-green-600"
                                                        />
                                                    </td>
                                                    <td className="border p-2 text-center">{project._id}</td>
                                                    <td className="border p-2">{project.Title}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="border p-2 text-center text-gray-500">
                                                    No ongoing projects found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                                <h3 className="text-lg font-semibold text-green-700 mb-2">New Institute Details</h3>
                                <p className="text-sm text-gray-600">Please fill in the details of the institute you are transferring to.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 mt-4">
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">
                                            Institute Name <span className="text-red-500">*</span>
                                        </label>
                                        <select
               type="text"
               name="newInstitute"
               value={formData.newInstitute}
               onChange={handleInputChange}
               className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
               placeholder="Select Institute"
              >
              <option value="">Select Institute</option>
              {colleges && colleges.length > 0 && colleges.map((val, idx) => (
                 <option key={idx} value={val.value}>{val.value}</option>
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
                                    ) : "Send For Institute's Approval"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="bg-white shadow-md rounded-lg p-8 mt-2  border-blue-800 mb-4 mx-12">

                    <div className="flex justify-between items-center mb-4">
                        <div className="w-1/2 mr-4">
                            <input
                                type="text"
                                placeholder="Search by PI Name, Current Institute, or New Institute"
                                className="px-3 py-2 w-full"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            <div className="h-px bg-gray-300 mt-1 w-full"></div>
                        </div>

                        <div className="mr-4">
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilter}
                                className="border border-gray-400 rounded px-3 py-2"
                            >
                                <option value="">All Status</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Rejected">Sent</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSort}
                            className="bg-blue-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-800 transition"
                        >
                            Sort by Date
                        </button>
                    </div>



                    {filteredAndSortedRequests.length > 0 ? (
                        <>
                            <table className="w-full text-sm border border-gray-300:w-[80px] text-sm border border-gray-300::w-[30px] text-sm border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2">Request ID</th>
                                        <th className="border p-2">PI Name</th>
                                        <th className="border p-2">Current Institute</th>
                                        <th className="border p-2">New Institute</th>
                                        <th className="border p-2">Status</th>
                                        <th className="border p-2">Date</th>
                                        <th className="border p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedRequests.map((req) => (
                                        <tr key={req._id}>
                                            <td className="border p-2 text-center">{req._id}</td>
                                            <td className="border p-2 text-center">{req.FormData?.piName || "-"}</td>
                                            <td className="border p-2 text-center">{req.FormData?.currentInstitute || "-"}</td>
                                            <td className="border p-2 text-center">{req.FormData?.newInstitute || "-"}</td>
                                            <td className="border p-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-white text-xs ${req.status === "Approved"
                                                    ? "bg-green-600"
                                                    : req.status === "Rejected"
                                                        ? "bg-red-600"
                                                        : "bg-yellow-400"
                                                    }`}>
                                                    {req.status || "Pending"}
                                                </span>
                                            </td>
                                            <td className="border p-2 text-center">{new Date(req.date).toLocaleDateString()}</td>
                                            {req.status === "Pending For Admin's Approval" && (
                                                <td className="border p-2 text-center">
                                                    <button
                                                        className="bg-green-500 text-white px-5 py-2 rounded-md shadow-md hover:bg-blue-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                                                        onClick={async () => {
                                                            setID(req._id);
                                                            await ChangeStatus("Sent");
                                                        }}
                                                    >
                                                        Submit
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">No matching requests found.</p>
                    )}
                </div>

            </div>
        </div>
    )
}

export default ChangeOfInstitute;
