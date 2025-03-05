<<<<<<< HEAD
import { useState } from "react";

const BudgetForm = () => {

    
    const [activeTab, setActiveTab] = useState("Non-Recurring");
    const [nonRecurringItems, setNonRecurringItems] = useState([{ item: "", unitCost: "", quantity: "", total: "" }]);
    const [materials, setMaterials] = useState([{ material: "", quantity: "", perUnitCost: "", total: "" }]);
    const [manpower, setManpower] = useState([{ role: "", numEmployees: "", salary: "", total: "" }]);
    const [otherExpenses, setOtherExpenses] = useState([{ expense: "", amount: "" }]);
=======
import { useState, useEffect } from "react";

const BudgetForm = ({ formData, updateForm }) => {
    const [activeTab, setActiveTab] = useState("Non-Recurring");
    const [nonRecurringItems, setNonRecurringItems] = useState(formData.nonRecurring.items || []);
    const [materials, setMaterials] = useState(formData.recurring.material || []);
    const [manpower, setManpower] = useState(formData.recurring.manpower || []);
    const [otherExpenses, setOtherExpenses] = useState(formData.recurring.others || []);

    useEffect(() => {
        updateForm("budgetDetails", {
            nonRecurring: { items: nonRecurringItems },
            recurring: { material: materials, manpower: manpower, others: otherExpenses }
        });
    }, [nonRecurringItems, materials, manpower, otherExpenses]);

>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
    const handleChange = (index, field, value, setState, state) => {
        const updatedItems = [...state];
        updatedItems[index][field] = value;

        if (field === "unitCost" || field === "quantity") {
            const unitCost = parseFloat(updatedItems[index].unitCost) || 0;
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            updatedItems[index].total = (unitCost * quantity).toFixed(2);
        } else if (field === "perUnitCost" || field === "quantity") {
            const perUnitCost = parseFloat(updatedItems[index].perUnitCost) || 0;
            const quantity = parseFloat(updatedItems[index].quantity) || 0;
            updatedItems[index].total = (perUnitCost * quantity).toFixed(2);
        } else if (field === "numEmployees" || field === "salary") {
            const numEmployees = parseFloat(updatedItems[index].numEmployees) || 0;
            const salary = parseFloat(updatedItems[index].salary) || 0;
            updatedItems[index].total = (numEmployees * salary).toFixed(2);
        }

        setState(updatedItems);
    };

<<<<<<< HEAD
    const addNewItem = (setState, state, newItem) => {
        setState([...state, newItem]);
    };



    

=======
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    setNonRecurringItems(jsonData.nonRecurringItems || []);
                    setMaterials(jsonData.materials || []);
                    setManpower(jsonData.manpower || []);
                    setOtherExpenses(jsonData.otherExpenses || []);
                } catch (error) {
                    console.error("Invalid JSON file");
                }
            };
            reader.readAsText(file);
        }
    };

    const addNewItem = (setState, state, newItem) => {
        setState([...state, newItem]);
    };
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
    const renderForm = () => {
        switch (activeTab) {
            case "Non-Recurring":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Non-Recurring</h2>
                        <h3 className="text-lg font-semibold mb-2">Equipment Details</h3>
                        {nonRecurringItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                                <input type="text" placeholder="Item" className="border p-2 rounded w-full"
                                    value={item.item}
                                    onChange={(e) => handleChange(index, "item", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input type="number" placeholder="Unit Cost" className="border p-2 rounded w-full"
                                    value={item.unitCost}
                                    onChange={(e) => handleChange(index, "unitCost", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input type="number" placeholder="Quantity" className="border p-2 rounded w-full"
                                    value={item.quantity}
                                    onChange={(e) => handleChange(index, "quantity", e.target.value, setNonRecurringItems, nonRecurringItems)}
                                />
                                <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={item.total} />
                            </div>
                        ))}
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setNonRecurringItems, nonRecurringItems, { item: "", unitCost: "", quantity: "", total: "" })}
                        >Add More</button>
<<<<<<< HEAD
=======

>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                    </div>
                );

            case "Recurring":
                return (
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Recurring</h2>

                        {/* Materials */}
                        <h3 className="text-lg font-semibold mb-2">Materials</h3>
                        {materials.map((material, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                                <input type="text" placeholder="Material" className="border p-2 rounded w-full"
                                    value={material.material}
                                    onChange={(e) => handleChange(index, "material", e.target.value, setMaterials, materials)}
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
                            </div>
                        ))}
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setMaterials, materials, { material: "", quantity: "", perUnitCost: "", total: "" })}
                        >Add More</button>

                        {/* Manpower */}
                        <h3 className="text-lg font-semibold mt-6">Manpower</h3>
                        {manpower.map((mp, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                                <input type="text" placeholder="Role" className="border p-2 rounded w-full"
                                    value={mp.role}
                                    onChange={(e) => handleChange(index, "role", e.target.value, setManpower, manpower)}
                                />
                                <input type="number" placeholder="No. of Employees" className="border p-2 rounded w-full"
                                    value={mp.numEmployees}
                                    onChange={(e) => handleChange(index, "numEmployees", e.target.value, setManpower, manpower)}
                                />
                                <input type="number" placeholder="Monthly Salary" className="border p-2 rounded w-full"
                                    value={mp.salary}
                                    onChange={(e) => handleChange(index, "salary", e.target.value, setManpower, manpower)}
                                />
                                <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={mp.total} />
                            </div>
                        ))}
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setManpower, manpower, { role: "", numEmployees: "", salary: "", total: "" })}
                        >Add More</button>
<<<<<<< HEAD
                    





 {/* Other Expenses */}
 <h3 className="text-lg font-semibold mt-6">Others</h3>
 {otherExpenses.map((expense, index) => (
     <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
         <input type="text" placeholder="Expense" className="border p-2 rounded w-full"
             value={expense.expense}
             onChange={(e) => handleChange(index, "expense", e.target.value, setOtherExpenses, otherExpenses)}
         />
         <input type="number" placeholder="Amount" className="border p-2 rounded w-full"
             value={expense.amount}
             onChange={(e) => handleChange(index, "amount", e.target.value, setOtherExpenses, otherExpenses)}
         />
     </div>
 ))}
 <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
     onClick={() => addNewItem(setOtherExpenses, otherExpenses, { expense: "", amount: "" })}
 >Add More</button>




</div>);


            

=======
                        {/* Other Expenses */}
                        <h3 className="text-lg font-semibold mt-6">Others</h3>
                        {otherExpenses.map((expense, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                                <input type="text" placeholder="Expense" className="border p-2 rounded w-full"
                                    value={expense.expense}
                                    onChange={(e) => handleChange(index, "expense", e.target.value, setOtherExpenses, otherExpenses)}
                                />
                                <input type="number" placeholder="Amount" className="border p-2 rounded w-full"
                                    value={expense.amount}
                                    onChange={(e) => handleChange(index, "amount", e.target.value, setOtherExpenses, otherExpenses)}
                                />
                            </div>
                        ))}
                        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => addNewItem(setOtherExpenses, otherExpenses, { expense: "", amount: "" })}>Add More</button>
                    </div>);
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
            default:
                return <p>Select a category to enter budget details.</p>;
        }
    };

    return (
        <div className="p-4">
<<<<<<< HEAD
            <div className="flex space-x-2 mb-4">
                {["Non-Recurring", "Recurring"].map((tab) => (
                    <button
                        key={tab}
                        className={`p-2 border rounded-md ${activeTab === tab ? "bg-green-500 text-white" : "bg-gray-200"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
=======
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <h1 className="text-2xl font-bold mb-4">Budget Details</h1>
                    {["Non-Recurring", "Recurring"].map((tab) => (
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
                    Import JSON
                </label>
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
            </div>
            {renderForm()}
        </div>
    );
};

export default BudgetForm;

<<<<<<< HEAD
            
            {/* Travel */}
            {/* 
            <h3 className="text-lg font-semibold mt-6">Travel</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <input type="text" placeholder="Destination" className="border p-2 rounded w-full" />
                <input type="number" placeholder="Cost" className="border p-2 rounded w-full" />
            </div>
            */}

            {/* Overhead */}
            {/* 
            <h3 className="text-lg font-semibold mt-6">Overhead</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <input type="text" placeholder="Description" className="border p-2 rounded w-full" />
                <input type="number" placeholder="Cost" className="border p-2 rounded w-full" />
            </div>
            */}

            {/* Bank Details */}
            {/* 
            <h3 className="text-lg font-semibold mt-6">Bank Details</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <input type="text" placeholder="Account Name" className="border p-2 rounded w-full" />
                <input type="text" placeholder="Account Number" className="border p-2 rounded w-full" />
            </div>
            */}

            {/* Contingency */}
            {/* 
            <h3 className="text-lg font-semibold mt-6">Contingency</h3>
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <input type="text" placeholder="Description" className="border p-2 rounded w-full" />
                <input type="number" placeholder="Amount" className="border p-2 rounded w-full" />
            </div>
            */}




=======



// import { useState } from "react";

// const BudgetForm = () => {
//     const [activeTab, setActiveTab] = useState("Non-Recurring");
//     const [nonRecurringItems, setNonRecurringItems] = useState([{ item: "", unitCost: "", quantity: "", total: "" }]);
//     const [materials, setMaterials] = useState([{ material: "", quantity: "", perUnitCost: "", total: "" }]);
//     const [manpower, setManpower] = useState([{ role: "", numEmployees: "", salary: "", total: "" }]);
//     const [otherExpenses, setOtherExpenses] = useState([{ expense: "", amount: "" }]);
//     const handleChange = (index, field, value, setState, state) => {
//         const updatedItems = [...state];
//         updatedItems[index][field] = value;

//         if (field === "unitCost" || field === "quantity") {
//             const unitCost = parseFloat(updatedItems[index].unitCost) || 0;
//             const quantity = parseFloat(updatedItems[index].quantity) || 0;
//             updatedItems[index].total = (unitCost * quantity).toFixed(2);
//         } else if (field === "perUnitCost" || field === "quantity") {
//             const perUnitCost = parseFloat(updatedItems[index].perUnitCost) || 0;
//             const quantity = parseFloat(updatedItems[index].quantity) || 0;
//             updatedItems[index].total = (perUnitCost * quantity).toFixed(2);
//         } else if (field === "numEmployees" || field === "salary") {
//             const numEmployees = parseFloat(updatedItems[index].numEmployees) || 0;
//             const salary = parseFloat(updatedItems[index].salary) || 0;
//             updatedItems[index].total = (numEmployees * salary).toFixed(2);
//         }

//         setState(updatedItems);
//     };

//     const handleFileUpload = (event) => {
//         const file = event.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 try {
//                     const jsonData = JSON.parse(e.target.result);
//                     setNonRecurringItems(jsonData.nonRecurringItems || []);
//                     setMaterials(jsonData.materials || []);
//                     setManpower(jsonData.manpower || []);
//                     setOtherExpenses(jsonData.otherExpenses || []);
//                 } catch (error) {
//                     console.error("Invalid JSON file");
//                 }
//             };
//             reader.readAsText(file);
//         }
//     };

//     const addNewItem = (setState, state, newItem) => {
//         setState([...state, newItem]);
//     };

//     const renderForm = () => {
//         switch (activeTab) {
//             case "Non-Recurring":
//                 return (
//                     <div className="p-6 bg-white rounded-lg shadow-md">
//                         <h2 className="text-2xl font-bold mb-4">Non-Recurring</h2>
//                         <h3 className="text-lg font-semibold mb-2">Equipment Details</h3>
//                         {nonRecurringItems.map((item, index) => (
//                             <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
//                                 <input type="text" placeholder="Item" className="border p-2 rounded w-full"
//                                     value={item.item}
//                                     onChange={(e) => handleChange(index, "item", e.target.value, setNonRecurringItems, nonRecurringItems)}
//                                 />
//                                 <input type="number" placeholder="Unit Cost" className="border p-2 rounded w-full"
//                                     value={item.unitCost}
//                                     onChange={(e) => handleChange(index, "unitCost", e.target.value, setNonRecurringItems, nonRecurringItems)}
//                                 />
//                                 <input type="number" placeholder="Quantity" className="border p-2 rounded w-full"
//                                     value={item.quantity}
//                                     onChange={(e) => handleChange(index, "quantity", e.target.value, setNonRecurringItems, nonRecurringItems)}
//                                 />
//                                 <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={item.total} />
//                             </div>
//                         ))}
//                         <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                             onClick={() => addNewItem(setNonRecurringItems, nonRecurringItems, { item: "", unitCost: "", quantity: "", total: "" })}
//                         >Add More</button>

//                     </div>
//                 );

//             case "Recurring":
//                 return (
//                     <div className="p-6 bg-white rounded-lg shadow-md">
//                         <h2 className="text-2xl font-bold mb-4">Recurring</h2>

//                         {/* Materials */}
//                         <h3 className="text-lg font-semibold mb-2">Materials</h3>
//                         {materials.map((material, index) => (
//                             <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
//                                 <input type="text" placeholder="Material" className="border p-2 rounded w-full"
//                                     value={material.material}
//                                     onChange={(e) => handleChange(index, "material", e.target.value, setMaterials, materials)}
//                                 />
//                                 <input type="number" placeholder="Quantity" className="border p-2 rounded w-full"
//                                     value={material.quantity}
//                                     onChange={(e) => handleChange(index, "quantity", e.target.value, setMaterials, materials)}
//                                 />
//                                 <input type="number" placeholder="Per Unit Cost" className="border p-2 rounded w-full"
//                                     value={material.perUnitCost}
//                                     onChange={(e) => handleChange(index, "perUnitCost", e.target.value, setMaterials, materials)}
//                                 />
//                                 <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={material.total} />
//                             </div>
//                         ))}
//                         <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                             onClick={() => addNewItem(setMaterials, materials, { material: "", quantity: "", perUnitCost: "", total: "" })}
//                         >Add More</button>

//                         {/* Manpower */}
//                         <h3 className="text-lg font-semibold mt-6">Manpower</h3>
//                         {manpower.map((mp, index) => (
//                             <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
//                                 <input type="text" placeholder="Role" className="border p-2 rounded w-full"
//                                     value={mp.role}
//                                     onChange={(e) => handleChange(index, "role", e.target.value, setManpower, manpower)}
//                                 />
//                                 <input type="number" placeholder="No. of Employees" className="border p-2 rounded w-full"
//                                     value={mp.numEmployees}
//                                     onChange={(e) => handleChange(index, "numEmployees", e.target.value, setManpower, manpower)}
//                                 />
//                                 <input type="number" placeholder="Monthly Salary" className="border p-2 rounded w-full"
//                                     value={mp.salary}
//                                     onChange={(e) => handleChange(index, "salary", e.target.value, setManpower, manpower)}
//                                 />
//                                 <input type="number" placeholder="Total" className="border p-2 rounded w-full bg-gray-100" readOnly value={mp.total} />
//                             </div>
//                         ))}
//                         <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                             onClick={() => addNewItem(setManpower, manpower, { role: "", numEmployees: "", salary: "", total: "" })}
//                         >Add More</button>
//                         {/* Other Expenses */}
//                         <h3 className="text-lg font-semibold mt-6">Others</h3>
//                         {otherExpenses.map((expense, index) => (
//                             <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
//                                 <input type="text" placeholder="Expense" className="border p-2 rounded w-full"
//                                     value={expense.expense}
//                                     onChange={(e) => handleChange(index, "expense", e.target.value, setOtherExpenses, otherExpenses)}
//                                 />
//                                 <input type="number" placeholder="Amount" className="border p-2 rounded w-full"
//                                     value={expense.amount}
//                                     onChange={(e) => handleChange(index, "amount", e.target.value, setOtherExpenses, otherExpenses)}
//                                 />
//                             </div>
//                         ))}
//                         <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
//                             onClick={() => addNewItem(setOtherExpenses, otherExpenses, { expense: "", amount: "" })}>Add More</button>
//                     </div>);
//             default:
//                 return <p>Select a category to enter budget details.</p>;
//         }
//     };

//     return (
//         <div className="p-4">
//             <div className="flex justify-between items-center mb-4">
//                 <div className="flex space-x-2">
//                     <h1 className="text-2xl font-bold mb-4">Budget Details</h1>
//                     {["Non-Recurring", "Recurring"].map((tab) => (
//                         <button
//                             key={tab}
//                             className={`p-2 border rounded-md ${activeTab === tab ? "bg-green-500 text-white" : "bg-gray-200"}`}
//                             onClick={() => setActiveTab(tab)}
//                         >
//                             {tab}
//                         </button>
//                     ))}
//                 </div>
//                 <input
//                     type="file"
//                     accept=".json"
//                     className="hidden"
//                     id="fileInput"
//                     onChange={handleFileUpload}
//                 />
//                 <label
//                     htmlFor="fileInput"
//                     className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
//                 >
//                     Import JSON
//                 </label>
//             </div>
//             {renderForm()}
//         </div>
//     );
// };

// export default BudgetForm;
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
