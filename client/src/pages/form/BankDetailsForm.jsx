import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/Authcontext";
import HomeNavbar from "../../utils/HomeNavbar";

const BankDetailsForm = ({bankDetails }) => {
    const section = "bankDetails"; 
    const [data, setData] = useState({});
    const { submitBankDetails } = useContext(AuthContext);

    useEffect(() => {
        const nochange =async ()=>{
            if(bankDetails){
                    setData({  
                        name:bankDetails.name,
                        accountNumber:bankDetails.accountNumber,
                        ifscCode:bankDetails.ifscCode,
                        bankName: bankDetails.bankName,
                        accountType:bankDetails.accountType,
                    })
            }
        }
        nochange();
    }, [bankDetails]);

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
                    setData(jsonData);
                } catch (error) {
                    console.error("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await submitBankDetails(data);
            console.log(response);
            alert(response.msg);
        } catch (error) {
            console.error("Error submitting bank details:", error.message);
            alert("Failed to submit bank details");
        }
    };

    return (


        <div className="container mx-auto p-6">
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

            <form className="bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block font-semibold">Account Holder Name</label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
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
                        value={data.accountNumber}
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
                        value={data.ifscCode}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold">Account Type</label>
                    <select
                        name="accountType"
                        value={data.accountType}
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
                        value={data.bankName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                </button>
            </form>
        </div>

    );
};

export default BankDetailsForm;