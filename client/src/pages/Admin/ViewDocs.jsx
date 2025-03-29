import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const url = import.meta.env.VITE_REACT_APP_URL;

const UtilizationCertificates = () => {
    const [activeSection, setActiveSection] = useState("ongoing");
    const [error, setError] = useState("");
    const [recurringCertificates, setRecurringCertificates] = useState([]);
    const [nonRecurringCertificates, setNonRecurringCertificates] = useState([]);
    const [expenditureCertificates, setSE] = useState([]);
    const [user,setUser]=useState();
    const navigate = useNavigate();
    const { id } = useParams();
    const [comment, setComment] = useState("");
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        const fetchCertificates = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("UnAuthorized Access");
                navigate("/");
            }
            try {

                const response = await fetch(`${url}admin/ucforms/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "accessToken": token
                    },
                });

                const data = await response.json();

                if (!data.success) {
                    setError(data.msg || "Error fetching certificates");
                    return;
                }
                console.log("Display", data);
                setRecurringCertificates(data.recurringgrant);
                setNonRecurringCertificates(data.grant);
                setSE(data.se);
                setUser(data.user);
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
            navigate(`/admin/certificate-details/${certificate.type}/${certificate._id}`);
        } else {
            setError("Failed to open certificate details");
        }
    };
   
    const openCommentModal = (certificate) => {
        setSelectedCertificate(certificate);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setComment(""); 
    };
    const handleSubmitComment = async () => {
        if (!comment.trim()) {
            alert("Comment cannot be empty");
            return;
        }
        try {
            const response = await fetch(`${url}admin/add-comment/${selectedCertificate._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": localStorage.getItem("token")
                },
                body: JSON.stringify({ comment,user,certificate:selectedCertificate}),
            });

            const data = await response.json();
            if (data.success) {
                alert("Comment added successfully!");
                closeModal();
            } else {
                alert("Failed to add comment.");
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert("Error submitting comment.");
        }
    };
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
                <AdminNavbar activeSection={activeSection} />
                <div className="p-6 space-y-1 mt-3">
                    <div className="mt-3 bg-white p-7 rounded-lg shadow-md">
                        <table className="w-full border table-fixed">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-4 text-left w-1/4">Certificate ID</th>
                                    <th className="p-4 text-left w-1/4">Type</th>
                                    <th className="p-4 text-left w-1/4">Year</th>
                                    <th className="p-4 text-center w-1/4" >Comments</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringCertificates && recurringCertificates.length > 0 && recurringCertificates.map((certificate) => (
                                    <tr key={certificate._id} className="border-b hover:bg-blue-50">
                                        <td className="p-4 w-1/4 cursor-pointer text-gray-500 hover:underline" onClick={() => handleViewCertificate(certificate)}>
                                            {certificate._id}
                                        </td>                                        
                                        <td className="p-4 w-1/4">{certificate.type}</td>
                                        <td className="p-4 w-1/4">{certificate.currentYear}</td>
                                        <td className="p-4 w-1/4 text-center">
                                            <button 
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                            onClick={() => openCommentModal(certificate)}>
                                                Add Comments
                                            </button>
                                        </td>
                                    </tr>
                                ))
                                }{nonRecurringCertificates && nonRecurringCertificates && nonRecurringCertificates.length > 0 && nonRecurringCertificates.map((certificate) => (
                                    <tr key={certificate._id} className="border-b hover:bg-blue-50">
                                        <td className="p-4 w-1/4 cursor-pointer text-gray-500 hover:underline" onClick={() => handleViewCertificate(certificate)}>
                                            {certificate._id}
                                        </td>
                                        <td className="p-4 w-1/4">{certificate.type}</td>
                                        <td className="p-4 w-1/4">{certificate.currentYear}</td>
                                        <td className="p-4 w-1/4 text-center">
                                        <button 
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                            onClick={() => openCommentModal(certificate)}>                                                Add Comments
                                            </button>
                                        </td>
                                    </tr>
                                ))
                                }
                                {expenditureCertificates && expenditureCertificates.length > 0 &&
                                    expenditureCertificates.map((certificate) => (
                                        <tr key={certificate._id} className="border-b hover:bg-blue-50">
                                            <td className="p-4 w-1/4 cursor-pointer text-gray-500 hover:underline" onClick={() => handleViewCertificate(certificate)}>
                                                {certificate._id}
                                            </td>                                            
                                            <td className="p-4 w-1/4">SE</td>
                                            <td className="p-4 w-1/4">{certificate.currentYear}</td>
                                            <td className="p-4 w-1/4 text-center">
                                            <button 
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                                            onClick={() => openCommentModal(certificate)}>                                                    Add Comments
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                {!nonRecurringCertificates && !recurringCertificates && !expenditureCertificates &&
                                    <tr>
                                        <td colSpan="4" className="p-6 text-center text-gray-500">No Non-Recurring Certificates Found</td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="w-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add Comment</h2>
                        <textarea
                            className="w-full p-6 border rounded"
                            rows="4"
                            placeholder="Enter your comment here..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end mt-4">
                            <button className="bg-gray-400 text-white px-4 py-2 rounded mr-2" onClick={closeModal}>Cancel</button>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleSubmitComment}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UtilizationCertificates;
