import React from "react";
import Sidebar from "../utils/Sidebar"
import HomeNavbar from "../utils/HomeNavbar";

const ProposalScheme = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-16"> {/* Shift content to the right of sidebar */}
                <HomeNavbar />

                <div className="p-8 mt-12"> {/* Push content below navbar */}
                    <div className="bg-white shadow-md rounded p-4">
                        <h1 className="text-center text-xl font-bold text-gray-900">
                            अनुसंधान नेशनल रिसर्च फाउंडेशन
                        </h1>
                        <h2 className="text-center text-lg font-semibold text-gray-700">
                            Anusandhan National Research Foundation
                        </h2>
                    </div>

                    <div className="text-center mt-4 text-gray-700 text-lg font-semibold">
                        Submission Form
                    </div>

                    <div className="mt-6 mx-auto max-w-2xl bg-blue-100 p-6 rounded-md border">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-gray-700">
                                Scheme: <span className="text-red-500">*</span>
                            </label>
                            <select className="p-2 border rounded w-2/3">
                                <option>Select scheme</option>
                            </select>
                        </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-red-700 mt-2 pr-2">
                        * Mandatory Fields
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalScheme;
