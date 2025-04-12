import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
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

    // Initialize form data from props
    useEffect(() => {
        if (recurring) {
            setTravel(recurring.travel || 0);
            setMaterials(recurring.consumables || []);
            setManpower(recurring.human_resources || []);
            setOtherExpenses(recurring.others || []);
        }
        if (nonRecurring) {
            setNonRecurringItems(nonRecurring.items || []);
        }
        if (budgetSummary) {
            setOverhead(parseFloat(budgetSummary.overhead) || 0);
        }
    }, [budgetSummary, recurring, nonRecurring]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvData = e.target.result;
                const rows = csvData.split(/\r?\n/).filter(row => row.trim() !== '');
                
                // Initialize empty arrays for each category
                const newNonRecurringItems = [];
                const newMaterials = [];
                const newManpower = [];
                const newOtherExpenses = [];
                let newOverhead = 0;
                
                let currentSection = null;
                
                rows.forEach(row => {
                    // Check for section headers
                    if (row.includes("Non-Recurring Items")) {
                        currentSection = "nonRecurring";
                        return;
                    } else if (row.includes("Materials")) {
                        currentSection = "materials";
                        return;
                    } else if (row.includes("Manpower")) {
                        currentSection = "manpower";
                        return;
                    } else if (row.includes("Other Expenses")) {
                        currentSection = "otherExpenses";
                        return;
                    } else if (row.includes("Overhead")) {
                        currentSection = "overhead";
                        return;
                    }
                    
                    // Skip empty rows or header rows
                    if (!currentSection || row.trim() === "" || row.includes("Item") || row.includes("Designation")) {
                        return;
                    }
                    
                    // Process rows based on current section
                    const values = row.split(",").map(val => val.trim());
                    
                    switch (currentSection) {
                        case "nonRecurring":
                            if (values.length >= 4) {
                                newNonRecurringItems.push({
                                    item: values[0],
                                    UnitCost: parseFloat(values[1]) || 0,
                                    quantity: parseInt(values[2]) || 0,
                                    total: parseFloat(values[3]) || 0
                                });
                            }
                            break;
                            
                        case "materials":
                            if (values.length >= 4) {
                                newMaterials.push({
                                    item: values[0],
                                    quantity: parseInt(values[1]) || 0,
                                    perUnitCost: parseFloat(values[2]) || 0,
                                    total: parseFloat(values[3]) || 0
                                });
                            }
                            break;
                            
                        case "manpower":
                            if (values.length >= 4) {
                                newManpower.push({
                                    designation: values[0],
                                    noOfEmployees: parseInt(values[1]) || 0,
                                    Emoluments: parseFloat(values[2]) || 0,
                                    Duration: parseFloat(values[3]) || 0,
                                    total: parseFloat(values[4]) || 0
                                });
                            }
                            break;
                            
                        case "otherExpenses":
                            if (values.length >= 2) {
                                newOtherExpenses.push({
                                    description: values[0],
                                    amount: parseFloat(values[1]) || 0
                                });
                            }
                            break;
                            
                        case "overhead":
                            if (values.length >= 1) {
                                newOverhead = parseFloat(values[0]) || 0;
                            }
                            break;
                    }
                });
                
                // Update state with parsed data
                setNonRecurringItems(newNonRecurringItems);
                setMaterials(newMaterials);
                setManpower(newManpower);
                setOtherExpenses(newOtherExpenses);
                setOverhead(newOverhead);
                
            } catch (error) {
                console.error("Error processing CSV:", error);
                alert("Invalid CSV format. Please check the file matches the expected structure.");
            }
        };
        
        reader.onerror = () => {
            alert("Error reading file. Please try again.");
        };
        
        reader.readAsText(file);
    };
    
    const handleDownloadCSV = () => {
        // Create CSV content matching the image structure
        const csvContent = [
            "Non-Recurring Items",
            "Item,Quantity,Unit Cost,Total",
            ...nonRecurringItems.map(item => `${item.item},${item.quantity},${item.UnitCost},${item.total}`),
            "",
            "Materials",
            "Item,Quantity,Per Unit Cost,Total",
            ...materials.map(item => `${item.item},${item.quantity},${item.perUnitCost},${item.total}`),
            "",
            "Manpower",
            "Designation,Number of Employees,Emoluments,Total",
            ...manpower.map(item => `${item.designation},${item.noOfEmployees},${item.Emoluments},${item.Duration},${item.total}`),
            "",
            "Other Expenses",
            "Description,Amount",
            ...otherExpenses.map(item => `${item.description},${item.amount}`),
            "",
            "Overhead",
            "Value",
            overhead,
            ""
        ].join("\n");
    
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `budget_export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper functions
    const addNewItem = (setState, state, template) => {
        setState([...state, template]);
    };

    const removeItem = (setState, state, index) => {
        setState(state.filter((_, i) => i !== index));
    };

    // Calculate totals
    const calculateTotalNonRecurring = () => {
        return nonRecurringItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2);
    };

    const calculateTotalRecurring = () => {
        const materialsTotal = materials.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        const manpowerTotal = manpower.reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
        const expensesTotal = otherExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        return (parseFloat(travel || 0) + materialsTotal + manpowerTotal + expensesTotal).toFixed(2);
    };
    
    const handleChange = (index, field, value, setState, state) => {
        const updatedItems = [...state];
        updatedItems[index][field] = value;
    
        // Calculate totals based on field changes
        if (field === "UnitCost" || field === "quantity") {
            const unitCost = parseFloat(updatedItems[index].UnitCost) || 0;
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            updatedItems[index].total = (unitCost * quantity).toFixed(2);
        } else if (field === "perUnitCost" || field === "quantity") {
            const perUnitCost = parseFloat(updatedItems[index].perUnitCost) || 0;
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            updatedItems[index].total = (perUnitCost * quantity).toFixed(2);
        } else if (field === "noOfEmployees" || field === "Emoluments"||field==="Duration") {
            const noOfEmployees = parseFloat(updatedItems[index].noOfEmployees) || 0;
            const Emoluments = parseFloat(updatedItems[index].Emoluments) || 0;
            const Duration = parseFloat(updatedItems[index].Duration) || 0;
            updatedItems[index].total = (noOfEmployees * Emoluments * Duration || 0).toFixed(2);
        }
    
        setState(updatedItems);
    };

    const calculateTotal = () => {
        const nonRecurringTotal = parseFloat(calculateTotalNonRecurring());
        const recurringTotal = parseFloat(calculateTotalRecurring());
        return (nonRecurringTotal + recurringTotal + parseFloat(overhead || 0)).toFixed(2);
    };

    // Submit form data
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
                alert(response.msg || "Budget submitted successfully!");
            } else {
                alert(response.msg || "Failed to submit budget. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred while submitting the budget");
        }
    };

    // Render form sections based on active tab
    const renderForm = () => {
        switch (activeTab) {
            case "Non-Recurring":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <div className="grid grid-cols-2 p-4 border rounded-lg mb-4">
                            <h2 className="text-xl font-bold">Overhead</h2>
                            <input 
                                type="number" 
                                placeholder="Overhead percentage" 
                                className="border p-2 rounded"
                                value={overhead}
                                onChange={(e) => setOverhead(e.target.value)}
                            />
                        </div>

                        <h2 className="text-xl font-bold mb-4">Non-Recurring Items</h2>
                        {nonRecurringItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg mb-4">
                                <input
                                    type="text"
                                    placeholder="Item name"
                                    className="border p-2 rounded"
                                    value={item.item}
                                    onChange={(e) => handleChange(index, "item", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input
                                    type="number"
                                    placeholder="Unit cost"
                                    className="border p-2 rounded"
                                    value={item.UnitCost}
                                    onChange={(e) => handleChange(index, "UnitCost", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    className="border p-2 rounded"
                                    value={item.quantity}
                                    onChange={(e) => handleChange(index, "quantity", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input
                                    type="number"
                                    placeholder="Total"
                                    className="border p-2 rounded bg-gray-100"
                                    readOnly
                                    value={item.total}
                                />
                                <button
                                    className="bg-red-500 text-white p-2 rounded"
                                    onClick={() => removeItem(setNonRecurringItems, nonRecurringItems, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setNonRecurringItems, nonRecurringItems, { 
                                item: "", 
                                UnitCost: "", 
                                quantity: "", 
                                total: "" 
                            })}
                        >
                            Add Non-Recurring Item
                        </button>
                    </div>
                );

            case "Recurring":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Recurring Costs</h2>
                        
                        {/* Travel Section */}
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg mb-6">
                            <h3 className="text-lg font-semibold">Travel Costs</h3>
                            <input
                                type="number"
                                placeholder="Amount"
                                className="border p-2 rounded"
                                value={travel}
                                onChange={(e) => setTravel(e.target.value)}
                            />
                        </div>

                        {/* Materials Section */}
                        <h3 className="text-lg font-semibold mb-2">Materials</h3>
                        {materials.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg mb-4">
                                <input
                                    type="text"
                                    placeholder="Material name"
                                    className="border p-2 rounded"
                                    value={item.item}
                                    onChange={(e) => handleChange(index, "item", e.target.value, setMaterials, materials)}
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    className="border p-2 rounded"
                                    value={item.quantity}
                                    onChange={(e) => handleChange(index, "quantity", e.target.value, setMaterials, materials)}
                                />
                                <input
                                    type="number"
                                    placeholder="Unit cost"
                                    className="border p-2 rounded"
                                    value={item.perUnitCost}
                                    onChange={(e) => handleChange(index, "perUnitCost", e.target.value, setMaterials, materials)}
                                />
                                <input
                                    type="number"
                                    placeholder="Total"
                                    className="border p-2 rounded bg-gray-100"
                                    readOnly
                                    value={item.total}
                                />
                                <button
                                    className="bg-red-500 text-white p-2 rounded"
                                    onClick={() => removeItem(setMaterials, materials, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded mb-6"
                            onClick={() => addNewItem(setMaterials, materials, { 
                                item: "", 
                                quantity: "", 
                                perUnitCost: "", 
                                total: "" 
                            })}
                        >
                            Add Material
                        </button>

                        {/* Manpower Section */}
                        <h3 className="text-lg font-semibold mb-2">Manpower</h3>
                        {manpower.map((item, index) => (
                            <div key={index} className="grid grid-cols-5 gap-4 p-4 border rounded-lg mb-4">
                                <select
                                    className="border p-2 rounded"
                                    value={item.designation}
                                    onChange={(e) => handleChange(index, "designation", e.target.value, setManpower, manpower)}
                                >
                                    <option value="">Select Designation</option>
                                    <option value="JRF">Junior Research Fellow</option>
                                    <option value="SRF">Senior Research Fellow</option>
                                    <option value="Lab Assistant">Lab Assistant</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Number"
                                    className="border p-2 rounded"
                                    value={item.noOfEmployees}
                                    onChange={(e) => handleChange(index, "noOfEmployees", e.target.value, setManpower, manpower)}
                                />
                                <input
                                    type="number"
                                    placeholder="Salary"
                                    className="border p-2 rounded"
                                    value={item.Emoluments}
                                    onChange={(e) => handleChange(index, "Emoluments", e.target.value, setManpower, manpower)}
                                />
                                 <input
                                    type="number"
                                    placeholder="Duration"
                                    className="border p-2 rounded"
                                    value={item.Duration}
                                    onChange={(e) => handleChange(index, "Duration", e.target.value, setManpower, manpower)}
                                />
                                <input
                                    type="number"
                                    placeholder="Total"
                                    className="border p-2 rounded bg-gray-100"
                                    readOnly
                                    value={item.total}
                                />
                                <button
                                    className="bg-red-500 text-white p-2 rounded"
                                    onClick={() => removeItem(setManpower, manpower, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded mb-6"
                            onClick={() => addNewItem(setManpower, manpower, { 
                                designation: "", 
                                noOfEmployees: "", 
                                Emoluments: "", 
                                Duration:"",
                                total: "" 
                            })}
                        >
                            Add Manpower
                        </button>

                        <h3 className="text-lg font-semibold mb-2">Other Expenses</h3>
                        {otherExpenses.map((item, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg mb-4">
                                <input
                                    type="text"
                                    placeholder="Description"
                                    className="border p-2 rounded col-span-2"
                                    value={item.description}
                                    onChange={(e) => handleChange(index, "description", e.target.value, setOtherExpenses, otherExpenses)}
                                />
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    className="border p-2 rounded"
                                    value={item.amount}
                                    onChange={(e) => handleChange(index, "amount", e.target.value, setOtherExpenses, otherExpenses)}
                                />
                                <button
                                    className="bg-red-500 text-white p-2 rounded"
                                    onClick={() => removeItem(setOtherExpenses, otherExpenses, index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setOtherExpenses, otherExpenses, { 
                                description: "", 
                                amount: "" 
                            })}
                        >
                            Add Expense
                        </button>
                    </div>
                );

            case "Summary":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-6">Budget Summary</h2>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-semibold">Overhead :</span>
                                <span>₹{overhead}</span>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold mb-3">Non-Recurring Costs</h3>
                                {nonRecurringItems.map((item, index) => (
                                    <div key={index} className="flex justify-between mb-1">
                                        <span>{item.item || `Item ${index + 1}`}</span>
                                        <span>₹{item.quantity*item.total || "0.00"}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                                    <span>Total Non-Recurring:</span>
                                    <span>₹{calculateTotalNonRecurring()}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-bold mb-3">Recurring Costs</h3>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-semibold mb-1">Travel:</h4>
                                        <div className="flex justify-between">
                                            <span>Travel Expenses</span>
                                            <span>₹{travel || "0.00"}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold mb-1">Materials:</h4>
                                        {materials.map((item, index) => (
                                            <div key={index} className="flex justify-between mb-1">
                                                <span>{item.item || `Material ${index + 1}`}</span>
                                                <span>₹{item.total*item.quantity || "0.00"}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold mb-1">Manpower:</h4>
                                        {manpower.map((item, index) => (
                                            <div key={index} className="flex justify-between mb-1">
                                                <span>{item.designation || `Position ${index + 1}`}</span>
                                                <span>₹{item.noOfEmployees*item.Emoluments*item.Duration|| "0.00"}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold mb-1">Other Expenses:</h4>
                                        {otherExpenses.map((item, index) => (
                                            <div key={index} className="flex justify-between mb-1">
                                                <span>{item.description || `Expense ${index + 1}`}</span>
                                                <span>₹{item.amount || "0.00"}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                                    <span>Total Recurring:</span>
                                    <span>₹{calculateTotalRecurring()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-lg font-bold pt-4 border-t">
                                <span>GRAND TOTAL:</span>
                                <span>₹{calculateTotal()}</span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0">Project Budget Form</h1>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex border rounded-md overflow-hidden">
                        {["Non-Recurring", "Recurring", "Summary"].map((tab) => (
                            <button
                                key={tab}
                                className={`px-2 py-1 ${activeTab === tab ? "bg-green-600 text-white" : "bg-white"}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                            Import CSV
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                        <a 
                            href="#"
                            onClick={handleDownloadCSV}
                            className="text-blue-600 underline hover:underline text-sm"
                        >
                            Download Template
                        </a>
                    </div>
                </div>
            </div>

            {renderForm()}

            <div className="mt-6 flex justify-end gap-4">
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Save Budget
                </button>
            </div>
        </div>
    );
};
BudgetForm.propTypes = {
    budgetSummary: PropTypes.shape({
        overhead: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    recurring: PropTypes.shape({
        travel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        consumables: PropTypes.arrayOf(PropTypes.object),
        human_resources: PropTypes.arrayOf(PropTypes.object),
        others: PropTypes.arrayOf(PropTypes.object),
    }),
    nonRecurring: PropTypes.shape({
        items: PropTypes.arrayOf(PropTypes.object),
    }),
};

export default BudgetForm;