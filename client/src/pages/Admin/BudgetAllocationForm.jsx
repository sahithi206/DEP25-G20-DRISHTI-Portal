import React, { useState, useContext } from "react";
import { Bell, Settings, LogOut } from "lucide-react";
import { AuthContext } from "../Context/Authcontext";

const BudgetAllocationForm = ({ selectedProposal, onClose, onSubmit }) => {
  const { logout } = useContext(AuthContext);
  const [budget, setBudget] = useState({
    TotalCost: "",
    budgetTotal: {
      nonRecurring: "",
      recurring: {
        human_resources: "",
        consumables: "",
        others: "",
        total: "",
      },
      total: "",
    },
    budgetSanctioned: {
      nonRecurring: "",
      recurring: {
        human_resources: "",
        consumables: "",
        others: "",
        total: "",
      },
      yearTotal: "",
    },
  });

  const calculateTotals = (updatedBudget) => {
    const recurringTotal =
      parseFloat(updatedBudget.budgetSanctioned.recurring.human_resources || 0) +
      parseFloat(updatedBudget.budgetSanctioned.recurring.consumables || 0) +
      parseFloat(updatedBudget.budgetSanctioned.recurring.others || 0);

    const yearTotal =
      parseFloat(updatedBudget.budgetSanctioned.nonRecurring || 0) + recurringTotal;

    const budgetRecurringTotal =
      parseFloat(updatedBudget.budgetTotal.recurring.human_resources || 0) +
      parseFloat(updatedBudget.budgetTotal.recurring.consumables || 0) +
      parseFloat(updatedBudget.budgetTotal.recurring.others || 0);

    const budgetTotalSum =
      parseFloat(updatedBudget.budgetTotal.nonRecurring || 0) + budgetRecurringTotal;

    return {
      ...updatedBudget,
      TotalCost: yearTotal,
      budgetSanctioned: {
        ...updatedBudget.budgetSanctioned,
        recurring: {
          ...updatedBudget.budgetSanctioned.recurring,
          total: recurringTotal
        },
        yearTotal: yearTotal
      },
      budgetTotal: {
        ...updatedBudget.budgetTotal,
        recurring: {
          ...updatedBudget.budgetTotal.recurring,
          total: budgetRecurringTotal
        },
        total: budgetTotalSum
      }
    };
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? "" : parseFloat(value) || 0;

    const updatedBudget = { ...budget };

    if (name === "nonRecurring") {
      updatedBudget.budgetSanctioned.nonRecurring = numValue;
      updatedBudget.budgetTotal.nonRecurring = numValue;
    } else if (["human_resources", "consumables", "others"].includes(name)) {
      updatedBudget.budgetSanctioned.recurring[name] = numValue;
      updatedBudget.budgetTotal.recurring[name] = numValue;
    }

    setBudget(calculateTotals(updatedBudget));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!budget || !selectedProposal) {
      console.error("Budget or selected proposal is missing!");
      return;
    }

    const budgetData = {
      proposalId: selectedProposal.proposal._id,
      TotalCost: budget?.TotalCost ?? 0,
      budgetTotal: {
        nonRecurring: budget?.budgetTotal?.nonRecurring ?? 0,
        recurring: {
          human_resources: budget?.budgetTotal?.recurring?.human_resources ?? 0,
          consumables: budget?.budgetTotal?.recurring?.consumables ?? 0,
          others: budget?.budgetTotal?.recurring?.others ?? 0,
          total: budget?.budgetTotal?.recurring?.total ?? 0,
        },
        total: budget?.budgetTotal?.total ?? 0,
      },
      budgetSanctioned: {
        nonRecurring: budget?.budgetSanctioned?.nonRecurring ?? 0,
        recurring: {
          human_resources: budget?.budgetSanctioned?.recurring?.human_resources ?? 0,
          consumables: budget?.budgetSanctioned?.recurring?.consumables ?? 0,
          others: budget?.budgetSanctioned?.recurring?.others ?? 0,
          total: budget?.budgetSanctioned?.recurring?.total ?? 0,
        },
        yearTotal: budget?.budgetSanctioned?.yearTotal ?? 0,
      },
    };

    console.log("Submitting Budget Data:", budgetData);

    // Check for missing values before submitting
    if (!budgetData.TotalCost || !budgetData.budgetTotal || !budgetData.budgetSanctioned) {
      console.error("Missing budget details!");
      return;
    }

    onSubmit(budgetData);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-screen h-screen">
      <div className="bg-white w-full h-full overflow-y-auto">
        <div className="flex justify-between items-center bg-white p-4 shadow-md rounded-lg">
          <h1 className="text-2xl font-semibold">Budget Allocation</h1>
          <div className="flex space-x-4">
            <button className="p-2 bg-blue-500 text-white rounded-md flex items-center hover:bg-blue-600 transition">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-500 text-white rounded-md flex items-center hover:bg-gray-600 transition">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 bg-red-500 text-white rounded-md flex items-center hover:bg-red-600 transition">
              <LogOut className="w-5 h-5" onClick={logout} />
            </button>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-4">Allocate Budget</h2>
          <p className="mb-4">
            Proposal: <strong>{selectedProposal.researchDetails?.Title}</strong>
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Non-Recurring Costs*",
                  name: "nonRecurring",
                  value: budget.budgetSanctioned.nonRecurring,
                  hint: "Equipment, setup costs, etc."
                },
                {
                  label: "Human Resources (Recurring)*",
                  name: "human_resources",
                  value: budget.budgetSanctioned.recurring.human_resources,
                  hint: "Researcher salaries, assistants, etc."
                },
                {
                  label: "Consumables (Recurring)*",
                  name: "consumables",
                  value: budget.budgetSanctioned.recurring.consumables,
                  hint: "Lab supplies, materials, etc."
                },
                {
                  label: "Others (Recurring)*",
                  name: "others",
                  value: budget.budgetSanctioned.recurring.others,
                  hint: "Travel, overhead, miscellaneous costs"
                },
              ].map(({ label, name, value, hint }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={handleBudgetChange}
                    onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{hint}</p>
                </div>
              ))}
              
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Budget Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">Recurring Costs Total:</div>
                <div className="text-sm font-medium">${budget.budgetSanctioned.recurring.total || 0}</div>

                <div className="text-sm">Non-Recurring Costs:</div>
                <div className="text-sm font-medium">${budget.budgetSanctioned.nonRecurring || 0}</div>

                <div className="text-sm font-semibold">Year Total:</div>
                <div className="text-sm font-semibold">${budget.budgetSanctioned.yearTotal || 0}</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-6">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Allocate Budget & Approve
              </button>
              <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetAllocationForm;