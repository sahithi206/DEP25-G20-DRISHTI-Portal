import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import { AuthContext } from "./Context/Authcontext";
import HomeNavbar from "../utils/HomeNavbar";
import { ToastContainer, toast } from 'react-toastify';


const ProposalScheme = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState("");
    const [error,setError] = useState("");
    const navigate = useNavigate();
    const { submitProposal, incompleteProposals, getSchemes, deleteProposal } = useContext(AuthContext);
    const [incompProposals, setProposals] = useState([]);
    const [schemes, setSchemes] = useState([]);

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const schemeList = await getSchemes();
                setSchemes(schemeList);
                console.log(schemeList);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSchemes();
    }, []);

    useEffect(() => {
        const proposals = async () => {
            try {
                const props = await incompleteProposals();
                setProposals(props||[]);
                console.log(props);
            } catch (error) {
                console.error(error);
            }
        }
        proposals();
    }, [incompleteProposals]);

    const handleDelete = async (proposalId) => {
        try {
            await deleteProposal(proposalId);
            setProposals(incompProposals.filter(proposal => proposal._id !== proposalId));
        } catch (error) {
            console.error("Error deleting proposal:", error.message);
        }
    };

    const handleNext = async () => {
        if (!selectedProposal) {
            toast.warning("Please select a scheme before proceeding.");
            return;
        }

        try {
            const response = await submitProposal(selectedProposal);
            if (response && response.success) {
                toast.success(response.msg || "Proposal submitted successfully!");
                localStorage.setItem("ProposalID", response.prop._id);
                navigate("/dashboard");
            } else {
                toast.error(response.msg);
            }
        } catch (error) {
            console.error("Error creating proposal:", error.message);
            const parsedMessage = JSON.parse(error.message);
            if (parsedMessage.msg) toast.error(parsedMessage.msg|| "Proposal submitted successfully!");
        }
    };

    const handleEdit = async ({ proposal }) => {
        try {
            if (proposal && proposal._id) {
                localStorage.setItem("ProposalID", proposal._id);
                navigate("/dashboard");
            } else {
                toast.info("Failed to redirect");
            }
        } catch (error) {
            console.error("Error Editing proposal:", error.message);
            toast.error("Failed to Edit proposal");
        }
    };

    return (
        <div>
            <div className="flex bg-gray-100 min-h-screen">
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                    <HomeNavbar isSidebarOpen={isSidebarOpen} />

                    <div className="p-6 space-y-6 mt-16">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                अनुसंधान नेशनल रिसर्च फाउंडेशन
                            </h1>
                            <h2 className="text-xl font-semibold text-gray-700">
                                Anusandhan National Research Foundation
                            </h2>
                            <p className="mt-3 text-2xl font-bold text-blue-800">
                                Submission Form
                            </p>
                        </div>

                        <div className="mt-6 mx-auto max-w-2xl bg-blue-100 p-6 rounded-md border">
                            <div className="flex justify-between items-center">
                                <label className="font-semibold text-white-600">
                                    Scheme: <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="p-2 border rounded bg-white w-2/3"
                                    value={selectedProposal}
                                    onChange={(e) => {
                                        setSelectedProposal(e.target.value);
                                    }}
                                >
                                    <option value="">Select scheme</option>
                                    {schemes.map((scheme) => (
                                        <option key={scheme._id} value={scheme._id}>
                                            {scheme.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                        </div>

                        <div className="text-right text-sm font-semibold text-red-700 mt-2 pr-2">
                            * Mandatory Fields
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        </div>
                        <div className="mt-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm bg-white rounded-lg shadow-md overflow-hidden">
                                    <thead className="bg-blue-700">
                                        <tr>
                                            <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200 rounded-tl-lg">
                                                Proposal ID
                                            </th>
                                            <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200">
                                                Scheme
                                            </th>
                                            <th className="p-4 text-center font-semibold text-sm text-white border-b border-blue-200 rounded-tr-lg">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {incompProposals.length > 0 ? (
                                            incompProposals.map((proposal) => (
                                                <tr key={proposal._id} className="group hover:bg-blue-50 transition-colors border-b border-blue-200 last:border-b-0">
                                                    <td className="p-4 text-center font-medium text-sm text-gray-600">
                                                        {proposal._id}
                                                    </td>
                                                    <td className="p-4 text-center font-medium text-sm text-gray-600">
                                                        {proposal.schemeName}
                                                    </td>
                                                    <td className="p-4 text-center font-medium  space-x-6 text-sm text-gray-600 ">
                                                        <button className="bg-blue-600 text-white px-4 py-2 pr-4 rounded-lg hover:bg-blue-700 transition-all" onClick={() => handleEdit({ proposal })}>
                                                            Edit
                                                        </button>
                                                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all ml-2" onClick={() => handleDelete(proposal._id)}>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="p-6 text-center text-gray-500">
                                                    No Incomplete Proposals Found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalScheme;
