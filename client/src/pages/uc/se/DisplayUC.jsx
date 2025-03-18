import { useState, useEffect } from "react";
import { useNavigate,useParams } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";

const url = import.meta.env.VITE_REACT_APP_URL;

const UtilizationCertificates = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [error, setError] = useState("");
    const [recurringCertificates, setRecurringCertificates] = useState([]);
    const [nonRecurringCertificates, setNonRecurringCertificates] = useState([]);
    const navigate = useNavigate();
     const {id}=useParams();
    useEffect(() => {
        const fetchCertificates = async () => {
            const token=localStorage.getItem("token");
            if(!token){
                alert("UnAuthorized Access");
                navigate("/");
            }
            try {
                
                const response = await fetch(`${url}projects/ucforms/${id}`, {
                    method: "GET",
                    headers: {
                         "Content-Type": "application/json",
                         "accessToken":token
                    },
                });

                const data = await response.json();

                if (!data.success) {
                    setError(data.msg || "Error fetching certificates");
                    return;
                }
                console.log("Display",data);
                setRecurringCertificates(data.recurringgrant);
                setNonRecurringCertificates(data.grant);
            } catch (error) {
                console.error("Error fetching certificates:", error);
                setError("Internal Server Error");
            }
        };

        fetchCertificates();
    }, []);

    const handleViewCertificate = (certificate) => {
        if (certificate && certificate._id) {
            console.log(certificate)
            navigate(`/certificate-details/${certificate.type}/${certificate._id}`);
        } else {
            setError("Failed to open certificate details");
        }
    };

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />

                <div className="p-6 space-y-6 mt-16">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Utilization Certificates</h1>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-bold text-gray-800">Recurring Utilization Certificates</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm bg-white rounded-lg shadow-md overflow-hidden">
                                <thead className="bg-blue-700">
                                    <tr>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">Certificate ID</th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">Scheme</th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recurringCertificates.length > 0 ? (
                                        recurringCertificates.map((certificate) => (
                                            <tr key={certificate._id} className="hover:bg-blue-50 transition-colors border-b border-blue-200 last:border-b-0">
                                                <td className="p-4 text-center text-sm text-gray-600">{certificate._id}</td>
                                                <td className="p-4 text-center text-sm text-gray-600">{certificate.scheme}</td>
                                                <td className="p-4 text-center">
                                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                                                        onClick={() => handleViewCertificate(certificate)}>
                                                        View Certificate
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="p-6 text-center text-gray-500">No Recurring Certificates Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-bold text-gray-800">Non-Recurring Utilization Certificates</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm bg-white rounded-lg shadow-md overflow-hidden">
                                <thead className="bg-green-700">
                                    <tr>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-green-200">Certificate ID</th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-green-200">Scheme</th>
                                        <th className="p-4 text-center font-semibold text-sm text-white border-b border-green-200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nonRecurringCertificates.length > 0 ? (
                                        nonRecurringCertificates.map((certificate) => (
                                            <tr key={certificate._id} className="hover:bg-green-50 transition-colors border-b border-green-200 last:border-b-0">
                                                <td className="p-4 text-center text-sm text-gray-600">{certificate._id}</td>
                                                <td className="p-4 text-center text-sm text-gray-600">{certificate.scheme}</td>
                                                <td className="p-4 text-center">
                                                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                                                        onClick={() => handleViewCertificate(certificate)}>
                                                        View Certificate
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="p-6 text-center text-gray-500">No Non-Recurring Certificates Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-center">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default UtilizationCertificates;
