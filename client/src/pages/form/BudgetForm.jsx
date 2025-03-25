import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/Authcontext";

const BudgetForm = ({ budgetSummary, recurring, nonRecurring }) => {
    const [activeTab, setActiveTab] = useState("Non-Recurring");
    const [nonRecurringItems, setNonRecurringItems] = useState([]);
    const [overhead, setOverhead] = useState(0);
    const [materials, setMaterials] = useState([]);
    const [manpower, setManpower] = useState([]);
    const [travel, setTravel] = useState(0);

    const [otherExpenses, setOtherExpenses] = useState([]);
    const { submitBudgetDetails } = useContext(AuthContext);

    useEffect(() => {
        console.log(recurring);
        const func = async () => {
            if (recurring) {
                setTravel(recurring.travel);
                setMaterials(recurring.consumables);
                setManpower(recurring.human_resources);
                setOtherExpenses(recurring.others);
            }
            if (nonRecurring) {
                setNonRecurringItems(nonRecurring.items);
            }
            if (budgetSummary) {
                setOverhead(parseFloat(budgetSummary.overhead));
            }
        };
        func();
    }, [budgetSummary, recurring, overhead, nonRecurring]);

    const handleChange = (index, field, value, setState, state) => {
        const updatedItems = [...state];
        updatedItems[index][field] = value;

        if (field === "UnitCost" || field === "quantity") {
            const unitCost = parseFloat(updatedItems[index].UnitCost) || 0;
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            updatedItems[index].total = (unitCost * quantity).toFixed(2);
        } else if (field === "perUnitCost" || field === "quantity") {
            const perUnitCost = parseFloat(updatedItems[index].perUnitCost) || 0;
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            updatedItems[index].total = (perUnitCost * quantity).toFixed(2);
        }
        else if (field === "noOfEmployees" || field === "Emoluments") {
            const noOfEmployees = parseFloat(updatedItems[index].noOfEmployees) || 0;
            const Emoluments = parseFloat(updatedItems[index].Emoluments) || 0;
            updatedItems[index].total = (noOfEmployees * Emoluments).toFixed(2);
        }

        setState(updatedItems);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setNonRecurringItems(jsonData.nonRecurringItems || []);
                    setMaterials(jsonData.materials || []);
                    setOverhead(jsonData.overhead || {});
                    setManpower(jsonData.manpower || []);
                    setOtherExpenses(jsonData.otherExpenses || []);
                } catch (error) {
                    console.error("Invalid JSON file", error);
                }
            };
            reader.readAsText(file);
        }
    };

    const addNewItem = (setState, state, newItem) => {
        setState([...state, newItem]);
    };

    const removeItem = (setState, state, index) => {
        const updatedItems = state.filter((_, i) => i !== index);
        setState(updatedItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await submitBudgetDetails({
                recurring_items: {
                    human_resources: manpower,
                    travel: travel,
                    consumables: materials,
                    others: otherExpenses
                },
                overhead: overhead,
                non_recurring_items: {
                    items: nonRecurringItems
                }
            });
            if (response.success) {
                alert(response.msg);
            }
        } catch (error) {
            console.error("Error submitting budget details:", error.message);
            alert("Failed to submit budget details");
        }
    };

    // Calculate totals
    const calculateTotalNonRecurring = () => {
        return nonRecurringItems.reduce((total, item) => total + parseFloat(item.total || 0), 0).toFixed(2);
    };

    const calculateTotalRecurring = () => {
        const totalTravel = parseFloat(travel);
        const totalMaterials = materials.reduce((total, item) => total + parseFloat(item.total || 0), 0);
        const totalManpower = manpower.reduce((total, item) => total + parseFloat(item.total || 0), 0);
        const totalOtherExpenses = otherExpenses.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
        return (totalTravel + totalMaterials + totalManpower + totalOtherExpenses).toFixed(2);
    };

    const calculateTotal = () => {
        const Overhead = parseFloat(overhead);
        const totalNonRecurring = parseFloat(calculateTotalNonRecurring());
        const totalRecurring = parseFloat(calculateTotalRecurring());
        return (totalNonRecurring + totalRecurring + Overhead).toFixed(2);
    };

    const renderForm = () => {
        switch (activeTab) {
            case "Non-Recurring":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <div className="grid grid-cols-2  p-4 border rounded-lg">
                            <h2 className="text-2xl font-bold mb-4">Overhead</h2>

                            <input type="number" placeholder="Overhead" className="border p-2 rounded w-full"
                                value={overhead}
                                onChange={(e) => { setOverhead(e.target.value) }}
                            />
                        </div>
                        <div className="p-4 space-x-4"></div>
                        <h2 className="text-2xl font-bold mb-2">Non-Recurring</h2>
                        <h3 className="text-lg font-semibold mb-2">Equipment Details</h3>
                        {nonRecurringItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                                <input type="text" placeholder="Item" className="border p-2 rounded w-full"
                                    value={item.item}
                                    onChange={(e) => handleChange(index, "item", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input type="number" placeholder="Unit Cost" className="border p-2 rounded w-full"
                                    value={item.UnitCost}
                                    onChange={(e) => handleChange(index, "UnitCost", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input type="number" placeholder="Quantity" className="border p-2 rounded w-full"
                                    value={item.quantity}
                                    onChange={(e) => handleChange(index, "quantity", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={item.total} />
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => removeItem(setNonRecurringItems, nonRecurringItems, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setNonRecurringItems, nonRecurringItems, { item: "", UnitCost: "", quantity: "", total: "" })}
                        >Add More</button>
                    </div>
                );

            case "Recurring":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring</h2>
                        <div className="grid grid-cols-2 gap-4 p-4 border mb-4 rounded-lg">
                            <h3 className="text-lg font-semibold ">Travel</h3>
                            <input type="number" placeholder="Travel" className="border p-2 rounded w-full"
                                value={travel}
                                onChange={(e) => setTravel(e.target.value)}
                            />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Materials</h3>
                        {materials.map((material, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                                <input type="text" placeholder="Item" className="border p-2 rounded w-full"
                                    value={material.item}
                                    onChange={(e) => handleChange(index, "item", e.target.value, setMaterials, materials)}
                                />
                                <input type="number" placeholder="Quantity" className="border p-2 rounded w-full"
                                    value={material.quantity}
                                    onChange={(e) => handleChange(index, "quantity", e.target.value, setMaterials, materials)}
                                />
                                <input type="number" placeholder="Per Unit Cost" className="border p-2 rounded w-full"
                                    value={material.perUnitCost}
                                    onChange={(e) => handleChange(index, "perUnitCost", e.target.value, setMaterials, materials)}
                                />
                                <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={material.total} />
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => removeItem(setMaterials, materials, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setMaterials, materials, { item: "", quantity: "", perUnitCost: "", total: "" })}
                        >Add More</button>

                        <h3 className="text-lg font-semibold mt-6">Manpower</h3>
                        {manpower.map((mp, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                                <select
                                    className="border p-2 rounded w-full"
                                    value={mp.designation}
                                    onChange={(e) => handleChange(index, "designation", e.target.value, setManpower, manpower)}
                                >
                                    <option value="">Select Designation</option>
                                    <option value="JRF">JRF</option>
                                    <option value="Lab asst">Lab asst.</option>
                                    <option value="SRF">SRF</option>
                                </select>
                                <input type="number" placeholder="No. of Employees" className="border p-2 rounded w-full"
                                    value={mp.noOfEmployees}
                                    onChange={(e) => handleChange(index, "noOfEmployees", e.target.value, setManpower, manpower)}
                                />
                                <input type="number" placeholder="Emoluments" className="border p-2 rounded w-full"
                                    value={mp.Emoluments}
                                    onChange={(e) => handleChange(index, "Emoluments", e.target.value, setManpower, manpower)}
                                />
                                <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={mp.total} />
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => removeItem(setManpower, manpower, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setManpower, manpower, { designation: "", noOfEmployees: "", Emoluments: "", total: "" })}
                        >Add More</button>

                        <h3 className="text-lg font-semibold mt-6">Others</h3>
                        {otherExpenses.map((expense, index) => (
                            <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                                <input type="text" placeholder="Description" className="border p-2 rounded w-full"
                                    value={expense.description}
                                    onChange={(e) => handleChange(index, "description", e.target.value, setOtherExpenses, otherExpenses)}
                                />
                                <input type="number" placeholder="Amount" className="border p-2 rounded w-full"
                                    value={expense.amount}
                                    onChange={(e) => handleChange(index, "amount", e.target.value, setOtherExpenses, otherExpenses)}
                                />
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                    onClick={() => removeItem(setOtherExpenses, otherExpenses, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setOtherExpenses, otherExpenses, { description: "", amount: "" })}>Add More</button>
                    </div>
                );

            case "Summary":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold">Overhead:</span>
                                <span className="text-lg">₹{overhead || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold">Total Non-Recurring Cost:</span>
                                <span className="text-lg">₹{calculateTotalNonRecurring()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold">Total Recurring Cost:</span>
                                <span className="text-lg">₹{calculateTotalRecurring()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-4">
                                <span className="text-lg font-semibold">Total Cost:</span>
                                <span className="text-lg font-bold">₹{calculateTotal()}</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <p>Select a category to enter budget details.</p>;
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <h1 className="text-2xl font-bold mb-4">Budget Details</h1>
                    {["Non-Recurring", "Recurring", "Summary"].map((tab) => (
                        <button
                            key={tab}
                            className={`p-2 border rounded-md ${activeTab === tab ? "bg-green-500 text-white" : "bg-gray-200"}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
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
                    Import CSV
                </label>
            </div>
            {renderForm()}
            <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
            </button>
        </div>
    );
};

export default BudgetForm;