import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/Authcontext";

const PISection = ({ title, data, onSave, onDelete, onView }) => {
    const [email, setEmail] = useState("");
    const { getpi } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await getpi(email);
            console.log(user);

            if (user.success) {
                onSave({
                    role: title,
                    email: user.isUser.email,
                    Name: user.isUser.Name,
                    Institute: user.isUser.Institute,
                    DOB: user.isUser.DOB,
                    Mobile: user.isUser.Mobile,
                    Gender: user.isUser.Gender,
                    address: user.isUser.address,
                    Dept: user.isUser.Dept,
                });
            } else {
                alert("PI/Co-PI Haven't SignedUp.");
            }
        } catch (error) {
            console.error("Error fetching PI:", error);
            alert("An error occurred while fetching PI data.");
        }
    };

    return (
        <div className="bg-white p-6 rounded shadow-md w-full">
            <h2 className="text-lg font-semibold mb-4">{title} Information</h2>
            <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
                <input
                    type="email"
                    name="email"
                    placeholder="Enter Registered Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full rounded"
                    required
                />
                <button type="submit" className="bg-blue-500 text-white px-5 rounded text-md flex items-center justify-center">
                    Fetch
                </button>
            </form>

            <h2 className="text-lg font-semibold">{title} List</h2>
            <table className="w-full border mt-2">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">No.</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Institute</th>
                        <th className="border p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((pi, index) => (
                        <tr key={index} className="border">
                            <td className="border p-2">{index + 1}</td>
                            <td className="border p-2">{pi.Name}</td>
                            <td className="border p-2">{pi.Institute}</td>
                            <td className="border p-2">
                                <button
                                    onClick={() => onView(pi)}
                                    className="bg-green-500 text-white px-2 py-1 rounded"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => onDelete(index)}
                                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Modal = ({ data, onClose }) => (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-md w-1/3">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            {data &&
                Object.entries(data).map(([key, value]) => (
                    <p key={key} className="mb-2">
                        <strong className="capitalize">{key.replace(/_/g, " ")}:</strong> {value}
                    </p>
                ))}
            <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 mt-4 rounded w-full">
                Close
            </button>
        </div>
    </div>
);

function PrincipalInvestigatorForm({ PIdetails }) {
    const { submitPIDetails, getuser } = useContext(AuthContext);
    const [piList, setPiList] = useState([]);
    const [coPiList, setCoPiList] = useState([]);
    const [selectedPI, setSelectedPI] = useState(null);

    useEffect(() => {
        const fetchPI = async () => {
            const user = await getuser();
            if (!user) return;

            const pi = {
                role: "Principal Investigator",
                email: user.email,
                Name: user.Name,
                Institute: user.Institute,
                DOB: user.DOB,
                Mobile: user.Mobile,
                Gender: user.Gender,
                address: user.address,
                Dept: user.Dept,
            };

            setPiList((prev) => {
                if (prev.some((p) => p.email === pi.email)) {
                    return prev;
                }
                return [...prev, pi];
            });
        };

        fetchPI();
        const nochange = () => {
            if (PIdetails) {
                if (PIdetails.piList) {
                    setPiList(PIdetails.piList);
                }
                if (PIdetails.coPiList) {
                    setCoPiList(PIdetails.coPiList);
                }
            }

        }
        nochange();
    }, [getuser, PIdetails]);
    const addPI = (pi) => {
        if (piList.some((p) => p.email === pi.email || coPiList.some((p) => p.email === pi.email))) {
            alert("This PI is already added.");
            return;
        }
        setPiList((prev) => [...prev, pi]);
    };

    const addCoPI = (copi) => {
        if (piList.some((p) => p.email === copi.email || coPiList.some((p) => p.email === copi.email))) {
            alert("This Co-PI is already added.");
            return;
        }
        setCoPiList((prev) => [...prev, copi]);
    };

    const deletePI = (index) => setPiList((prev) => prev.filter((_, i) => i !== index));
    const deleteCoPI = (index) => setCoPiList((prev) => prev.filter((_, i) => i !== index));

    const handleClick = async (e) => {
        e.preventDefault();
        await submitPIDetails({ piList, coPiList });
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-xl font-bold">
                Principal Investigator (PI) & Co-Principal Investigator (Co-PI)
            </h1>

            <PISection
                title="Principal Investigator"
                data={piList}
                onSave={addPI}
                onDelete={deletePI}
                onView={setSelectedPI}
            />

            <PISection
                title="Co-Principal Investigator"
                data={coPiList}
                onSave={addCoPI}
                onDelete={deleteCoPI}
                onView={setSelectedPI}
            />

            <button onClick={handleClick} className="bg-red-500 text-white px-4 py-2 mt-4 rounded">
                Save
            </button>

            {selectedPI && <Modal data={selectedPI} onClose={() => setSelectedPI(null)} />}
        </div>
    );
}

export default PrincipalInvestigatorForm;