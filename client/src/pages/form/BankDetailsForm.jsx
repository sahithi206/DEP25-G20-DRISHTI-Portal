import React, { useState } from "react";

const BankDetailsForm = () => {
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "",
        bankName: "",
    });

    const handleChange = (e) => {
        setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitted Bank Details:", bankDetails);
        alert("Bank Details Submitted Successfully!");
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Bank Details Form</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block font-semibold">Account Holder Name</label>
                    <input
                        type="text"
                        name="accountHolderName"
                        value={bankDetails.accountHolderName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Account Number</label>
                    <input
                        type="text"
                        name="accountNumber"
                        value={bankDetails.accountNumber}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">IFSC Code</label>
                    <input
                        type="text"
                        name="ifscCode"
                        value={bankDetails.ifscCode}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Account Type</label>
                    <select
                        name="accountType"
                        value={bankDetails.accountType}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">Select Account Type</option>
                        <option value="Savings">Savings</option>
                        <option value="Current">Current</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Bank Name</label>
                    <input
                        type="text"
                        name="bankName"
                        value={bankDetails.bankName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default BankDetailsForm;
