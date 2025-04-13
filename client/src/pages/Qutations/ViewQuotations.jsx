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
    const [isEditing, setIsEditing] = useState(false);
    const handleEdit = () => {
        setIsEditing(true);
    };
    const handleSave = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${URL}quotations/pi/edit-quotation/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": token,
                },
                body: JSON.stringify({ quotation, equipments, salary }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.msg || "Saved successfully!");
                setIsEditing(false);
            } else {
                toast.error(data.msg || "Failed to save");
            }
        } catch (error) {
            toast.error(error.message || "Save failed");
        }
    };

    const handleClose = () => {
        setIsEditing(false);
    };



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
            } 
        };

        fetchQuotation();
    }, [id]);

    const maxYears = Math.max(
        ...((salary?.salary || []).map(item => item?.YearTotal?.length || 0))
    );
    const yearHeaders = Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`);



    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/view/Quotations/${quotation?.projectId}`} />
                <div className="p-6 space-y-4 mt-16"></div>

<div className="p-6 bg-gray-100 min-h-screen">
    <div className="bg-white p-6 rounded-2xl shadow-xl">
        
        <div className="mb-4">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Quotation</h1>

            <p className="text-xl text-gray-700">
                <span className="font-semibold">Quotation ID:</span> {id}
            </p>
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

                                            <td className="p-2 border">
                                                {isEditing ? (
                                                    <input
                                                        value={eq?.name || ""}
                                                        onChange={(e) => {
                                                            const updatedEquipments = [...equipments.equipments];
                                                            updatedEquipments[idx].name = e.target.value;
                                                            setEquip({ ...equipments, equipments: updatedEquipments });
                                                        }}
                                                        className="border p-1 w-full"
                                                    />
                                                ) : (
                                                    eq?.name || "N/A"
                                                )}
                                            </td>

                                            <td className="p-2 border">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={eq?.quantity || 0}
                                                        onChange={(e) => {
                                                            const updatedEquipments = [...equipments.equipments];
                                                            updatedEquipments[idx].quantity = parseInt(e.target.value) || 0;
                                                            setEquip({ ...equipments, equipments: updatedEquipments });
                                                        }}
                                                        className="border p-1 w-full"
                                                    />
                                                ) : (
                                                    eq?.quantity || 0
                                                )}
                                            </td>

                                            <td className="p-2 border">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={eq?.cost || 0}
                                                        onChange={(e) => {
                                                            const updatedEquipments = [...equipments.equipments];
                                                            updatedEquipments[idx].cost = parseFloat(e.target.value) || 0;
                                                            setEquip({ ...equipments, equipments: updatedEquipments });
                                                        }}
                                                        className="border p-1 w-full"
                                                    />
                                                ) : (
                                                    `₹${eq?.cost || 0}`
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 mt-3">
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

                                                <td className="p-2 border" rowSpan={2}>
                                                    {isEditing ? (
                                                        <input
                                                            value={item?.designation || ""}
                                                            onChange={(e) => {
                                                                const updatedSalary = [...salary.salary];
                                                                updatedSalary[idx].designation = e.target.value;
                                                                setSalary({ ...salary, salary: updatedSalary });
                                                            }}
                                                            className="border p-1 w-full"
                                                        />
                                                    ) : (
                                                        item?.designation || "N/A"
                                                    )}
                                                </td>

                                                {Array.from({ length: maxYears }).map((_, yearIdx) => (
                                                    <td key={`amount-${yearIdx}`} className="p-2 border font-semibold bg-gray-100">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                value={item?.YearTotal?.[yearIdx] || 0}
                                                                onChange={(e) => {
                                                                    const updatedSalary = [...salary.salary];
                                                                    if (!updatedSalary[idx].YearTotal) updatedSalary[idx].YearTotal = [];
                                                                    updatedSalary[idx].YearTotal[yearIdx] = parseFloat(e.target.value) || 0;
                                                                    setSalary({ ...salary, salary: updatedSalary });
                                                                }}
                                                                className="border p-1 w-full"
                                                            />
                                                        ) : (
                                                            `₹${item?.YearTotal?.[yearIdx] || 0}`
                                                        )}
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
                                                            {Array.from({ length: 4 }).map((_, i) => (
                                                                <div key={i}>
                                                                    {isEditing ? (
                                                                        <input
                                                                            type={i === 0 ? "number" : "text"}
                                                                            value={item?.breakup?.[i]?.value ?? ""}
                                                                            onChange={(e) => {
                                                                                const updatedSalary = [...salary.salary];
                                                                                if (!updatedSalary[idx].breakup) updatedSalary[idx].breakup = [];
                                                                                if (!updatedSalary[idx].breakup[i]) updatedSalary[idx].breakup[i] = {};
                                                                                updatedSalary[idx].breakup[i].value = e.target.value;
                                                                                setSalary({ ...salary, salary: updatedSalary });
                                                                            }}
                                                                            className="border p-1 w-full text-sm"
                                                                        />
                                                                    ) : (
                                                                        i === 0
                                                                            ? item?.breakup?.[i]?.value ?? "-"
                                                                            : `₹${item?.breakup?.[i]?.value ?? "-"}`
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        </>
                                    ))}


                                </tbody>
                            </table>
                        </div>

                        <div className="border rounded-md p-4 mt-4 mb-4">
                            <h2 className="text-lg font-semibold mb-2">RTGS Details</h2>
                            <div className=" grid grid-cols-2 text-medium text-gray-700 space-y-2">
                                <p><strong>Account Holder:</strong>{" "}
                                    {isEditing ? (
                                        <input
                                            value={quotation?.bank?.name || ""}
                                            onChange={e => setQuotation({
                                                ...quotation,
                                                bank: {
                                                    ...quotation?.bank,
                                                    name: e.target.value
                                                }
                                            })}
                                            className="border p-1"
                                        />
                                    ) : (
                                        quotation?.bank?.name || "N/A"
                                    )}
                                </p>

                                <p><strong>Account Number:</strong>{" "}
                                    {isEditing ? (
                                        <input
                                            value={quotation?.bank?.number || ""}
                                            onChange={e => setQuotation({
                                                ...quotation,
                                                bank: {
                                                    ...quotation?.bank,
                                                    number: e.target.value
                                                }
                                            })}
                                            className="border p-1"
                                        />
                                    ) : (
                                        quotation?.bank?.number || "N/A"
                                    )}
                                </p>

                                <p><strong>Bank Name:</strong>{" "}
                                    {isEditing ? (
                                        <input
                                            value={quotation?.bank?.bankName || ""}
                                            onChange={e => setQuotation({
                                                ...quotation,
                                                bank: {
                                                    ...quotation?.bank,
                                                    bankName: e.target.value
                                                }
                                            })}
                                            className="border p-1"
                                        />
                                    ) : (
                                        quotation?.bank?.bankName || "N/A"
                                    )}
                                </p>

                                <p><strong>IFSC Code:</strong>{" "}
                                    {isEditing ? (
                                        <input
                                            value={quotation?.bank?.Ifsc || ""}
                                            onChange={e => setQuotation({
                                                ...quotation,
                                                bank: {
                                                    ...quotation?.bank,
                                                    Ifsc: e.target.value
                                                }
                                            })}
                                            className="border p-1"
                                        />
                                    ) : (
                                        quotation?.bank?.Ifsc || "N/A"
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex gap-4"></div>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    (quotation?.status !== "Viewed" && <button
                                        onClick={handleEdit}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                    >
                                        Edit
                                    </button>
                                )
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
};

export default UploadDocuments;