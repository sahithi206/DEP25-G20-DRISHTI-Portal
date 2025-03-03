import { useState } from "react";

const BudgetForm = () => {
    const [activeTab, setActiveTab] = useState("Non-Recurring");

    const renderForm = () => {
        switch (activeTab) {
            case "Non-Recurring":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Non-Recurring</h2>
                        <h3 className="text-lg font-semibold mb-2">Equipment/Accessories Details</h3>
                        <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                            <input type="text" placeholder="Equipment/Accessories" className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Justification" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Unit Cost" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Qty." className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Total Cost" className="border p-2 rounded w-full bg-gray-100" readOnly />
                        </div>
                        <h3 className="text-lg font-semibold mt-6">Other Cost Details</h3>
                        <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                            <input type="text" placeholder="Other Cost Description" className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Justification" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Amount" className="border p-2 rounded w-full" />
                        </div>
                    </div>
                );
            case "Human Resource":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring - Human Resource</h2>
                        <h3 className="text-lg font-semibold mb-2">Human Resource Details</h3>
                        <p className="text-sm text-gray-600 mb-4">* The details of the emoluments including HRA qualification etc can be given under Resource details.</p>
                        <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                            <select className="border p-2 rounded w-full">
                                <option>-Select-</option>
                            </select>
                            <textarea placeholder="Justification and guideline for hiring" className="border p-2 rounded w-full"></textarea>
                            <input type="number" placeholder="No." className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Monthly Emoluments" className="border p-2 rounded w-full" />
                        </div>
                    </div>
                );
            case "Consumables":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring - Consumables</h2>
                        <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                            <input type="text" placeholder="Details" className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Justification" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Qty." className="border p-2 rounded w-full" defaultValue={0} />
                            <input type="number" placeholder="Amount" className="border p-2 rounded w-full" defaultValue={0} />
                            <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" defaultValue={0} readOnly />
                        </div>
                    </div>
                );
            case "Bank Details":
                return (
                    <div>
                        <h2 className="text-xl font-bold">Account Holder/Bank Details</h2>

                        {/* Account Holder Details */}
                        <h3 className="text-lg font-semibold text-green-600">Account Holder Details</h3>
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg shadow-md">
                            <div className="flex flex-col">
                                <label className="font-medium">Account Holder Name *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Postal Address * (Max 500)</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Telephone No. *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Email Id *</label>
                                <input type="email" className="border p-2 rounded-md" />
                            </div>
                        </div>

                        {/* Bank Details */}
                        <h3 className="text-lg font-semibold text-green-600 mt-6">Bank Details</h3>
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg shadow-md">
                            <div className="flex flex-col">
                                <label className="font-medium">Account Number *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Account Type *</label>
                                <select className="border p-2 rounded-md">
                                    <option>--Select--</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Bank Name *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Branch Name *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col col-span-2">
                                <label className="font-medium">Postal Address * (Max 500)</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Telephone No. *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">Email Id *</label>
                                <input type="email" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">IFSC Code *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                            <div className="flex flex-col">
                                <label className="font-medium">MICR Code *</label>
                                <input type="text" className="border p-2 rounded-md" />
                            </div>
                        </div>
                    </div>
                );

            case "Contingency":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring - Contingency</h2>
                        <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                            <input type="text" placeholder="Description" className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Justification" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Amount" className="border p-2 rounded w-full" defaultValue={0} />
                        </div>
                    </div>
                );
            case "Overhead":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring - Overhead</h2>
                        <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                            <input type="text" placeholder="Description" className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Justification" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Amount" className="border p-2 rounded w-full" defaultValue={0} />
                        </div>
                    </div>
                );
            case "Other Item":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring - Other Item</h2>
                        <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                            <input type="text" placeholder="Description" className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Justification" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Amount" className="border p-2 rounded w-full" defaultValue={0} />
                        </div>
                    </div>
                );
            case "Travel":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring - Travel</h2>
                        <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                            <input type="text" placeholder="Description" className="border p-2 rounded w-full" />
                            <input type="text" placeholder="Justification" className="border p-2 rounded w-full" />
                            <input type="number" placeholder="Amount" className="border p-2 rounded w-full" defaultValue={0} />
                        </div>
                    </div>
                );
            default:
                return <p>Select a category to enter budget details.</p>;
        }
    };

    return (
        <div className="p-4">
            <div className="flex space-x-2 mb-4">
                {["Non-Recurring", "Human Resource", "Consumables", "Travel", "Contingency", "Overhead", "Other Item", "Bank Details"].map((tab) => (
                    <button
                        key={tab}
                        className={`p-2 border rounded-md ${activeTab === tab ? "bg-green-500 text-white" : "bg-gray-200"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {renderForm()}
        </div>
    );
};

export default BudgetForm;
