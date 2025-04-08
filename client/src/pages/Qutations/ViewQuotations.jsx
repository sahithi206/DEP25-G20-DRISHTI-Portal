import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../utils/Sidebar";
import HomeNavbar from "../../utils/HomeNavbar";
import { toast } from "react-toastify";
const URL = import.meta.env.VITE_REACT_APP_URL;

const UploadDocuments = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { id } = useParams();
    let navigate = useNavigate();
    const [quotation, setQuotation] = useState(null);
    const [equipments, setEquip] = useState([]);
    const [salary, setSalary] = useState([]);
    useEffect(() => {
        const fetchQuotation = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`${URL}quotations/pi/get-quotation/${id}`, {
                    method: "GET",
                    headers: {
                        accessToken: token
                    },
                });
                const data = await response.json();
                if (response.ok) {
                    setQuotation(data.quotation);
                    setEquip(data.equipments);
                    setSalary(data.salary);
                } else {
                    throw new Error(data.message || "Failed to load quotation.");
                }
            } catch (err) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotation();
    }, [id]);

    const maxYears = Math.max(
        ...((salary?.salary || []).map(item => item?.YearTotal?.length || 0))
    );
    const yearHeaders = Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);
    const handleEdit = async () => {
        const token = localStorage.getItem("token");
        console.log(id);
        try {
            const res = await fetch(`${URL}quotations/admin/markasread/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.msg || "Marked as read successfully!");
            } else {
                toast.error(data.msg || "Failed to mark as read");
            }
            navigate('/admin/quotations')

        } catch (error) {
            toast.error(error.message || "Failed to mark as read");
        }
    };



    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />

                <div className="p-6 space-y-6 mt-16"></div>
                <div className="p-6 bg-gray-100 min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-md">
                                        <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-gray-800">Quotation Details</h1>
                        <p><strong>Project ID:</strong> {quotation?.projectId}</p>
                        <p><strong>Quotation ID:</strong> {quotation?._id}</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Equipments</h2>
                        <table className="table-auto border w-full">
                            <thead className="bg-gray-200 text-center">
                                <tr>
                                    <th className="p-2 border">S.No</th>
                                    <th className="p-2 border">Name</th>
                                    <th className="p-2 border">Quantity</th>
                                    <th className="p-2 border">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(equipments?.equipments) ? equipments.equipments : []).map((eq, idx) => (
                                    <tr key={idx} className="text-center">
                                        <td className="p-2 border">{idx + 1}</td>
                                        <td className="p-2 border">{eq?.name || "N/A"}</td>
                                        <td className="p-2 border">{eq?.quantity || 0}</td>
                                        <td className="p-2 border">₹{eq?.cost || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Salary Breakup</h2>
                        <table className="table-auto border w-full">
                            <thead className="bg-gray-200 text-center">
                                <tr>
                                    <th className="p-2 border" >S.No</th>
                                    <th className="p-2 border">Designation</th>
                                    {yearHeaders.map((year, idx) => (
                                        <th key={idx} className="p-2 border">{year}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(salary?.salary) ? salary.salary : []).map((item, idx) => (
                                    <>
                                        <tr key={`main-${idx}`} className="text-center bg-white">
                                            <td className="p-2 border" rowSpan={2}>{idx + 1}</td>
                                            <td className="p-2 border" rowSpan={2}>{item?.designation || "N/A"}</td>
                                            {Array.from({ length: maxYears }).map((_, yearIdx) => (
                                                <td key={`amount-${yearIdx}`} className="p-2 border font-semibold bg-gray-100">
                                                    ₹{item?.YearTotal?.[yearIdx] || 0}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr key={`breakup-${idx}`} className="text-center bg-gray-10 text-sm text-gray-700">
                                            {Array.from({ length: maxYears }).map((_, yearIdx) => (
                                                <td key={yearIdx} className="p-2 border">
                                                    <div className="grid grid-cols-4 gap-1 text-xs font-semibold mb-1">
                                                        <div>No. of Persons</div>
                                                        <div>Monthly Emol.</div>
                                                        <div>HRA</div>
                                                        <div>Medical</div>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-1 text-sm text-gray-800 font-medium">
                                                        <div>{item?.breakup?.[0]?.value ?? "-"}</div>
                                                        <div>₹{item?.breakup?.[1]?.value ?? "-"}</div>
                                                        <div>₹{item?.breakup?.[2]?.value ?? "-"}</div>
                                                        <div>₹{item?.breakup?.[3]?.value ?? "-"}</div>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>

                                    </>
                                ))}

                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">RTGS Details</h2>
                        <div className="text-medium text-gray-700 space-y-1">
                            <p><strong>Account Holder:</strong> {quotation?.bank?.name}</p>
                            <p><strong>Account Number:</strong> {quotation?.bank?.number}</p>
                            <p><strong>Bank Name:</strong> {quotation?.bank?.bankName}</p>
                            <p><strong>IFSC Code:</strong> {quotation?.bank?.Ifsc}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-4">
                            <button
                                onClick={handleEdit}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default UploadDocuments;