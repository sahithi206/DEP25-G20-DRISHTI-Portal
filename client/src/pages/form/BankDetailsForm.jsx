<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from "react";

const BankDetailsForm = ({ formData, updateForm }) => {
    const section = "bankDetails"; // Unique key for this section
    const [data, setData] = useState(formData);

    // Sync changes automatically with parent
    useEffect(() => {
        updateForm(section, data);
    }, [data]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setData(jsonData);  // FIXED LINE
                } catch (error) {
                    console.error("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        }
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
    };

    return (
        <div className="container mx-auto p-6">
<<<<<<< HEAD
            <h1 className="text-2xl font-bold mb-4">Bank Details Form</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
=======
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-4">Bank Details Form</h1>
                <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileUpload}
                />
                <label
                    htmlFor="fileInput"
                    className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                >
                    Import JSON
                </label>
            </div>

            <form className="bg-white p-6 rounded-lg shadow-md">
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                <div className="mb-4">
                    <label className="block font-semibold">Account Holder Name</label>
                    <input
                        type="text"
                        name="accountHolderName"
<<<<<<< HEAD
                        value={bankDetails.accountHolderName}
=======
                        value={data.accountHolderName}
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
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
<<<<<<< HEAD
                        value={bankDetails.accountNumber}
=======
                        value={data.accountNumber}
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
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
<<<<<<< HEAD
                        value={bankDetails.ifscCode}
=======
                        value={data.ifscCode}
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Account Type</label>
                    <select
                        name="accountType"
<<<<<<< HEAD
                        value={bankDetails.accountType}
=======
                        value={data.accountType}
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
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
<<<<<<< HEAD
                        value={bankDetails.bankName}
=======
                        value={data.bankName}
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
<<<<<<< HEAD

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Submit
                </button>
=======
                {/* 
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                </button> */}
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
            </form>
        </div>
    );
};

export default BankDetailsForm;
