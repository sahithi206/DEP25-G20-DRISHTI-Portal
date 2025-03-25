import React, { useState, useContext, useEffect } from "react";
import { Bell, Settings, LogOut } from "lucide-react";
import { AuthContext } from "../Context/Authcontext";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const url = import.meta.env.VITE_REACT_APP_URL;
const BudgetAllocationForm = ({ }) => {
  const [activeSection, setActiveSection] = useState("sanction");
  const { logout } = useContext(AuthContext);
  const [comment, setComment] = useState("");
  const { id } = useParams();
  const [selectedProposal, setProposals] = useState({});
  useEffect(() => {
    const fetchPendingProposals = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      try {
        const response = await fetch(`${url}admin/approvedProposal/${id}`, {
          method: "GET",
          headers: { "accessToken": token },
        });
        const data = await response.json();
        console.log("Data:", data);
        setProposals(data || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPendingProposals();
  }, [id])
  const [budget, setBudget] = useState({
    TotalCost: 0,
    budgetTotal: {
      overhead: 0,
      nonRecurring: 0,
      recurring: {
        travel: 0,
        human_resources: 0,
        consumables: 0,
        others: 0,
        total: 0,
      },
      total: 0,
    },
    budgetSanctioned: {
      overhead: 0,
      nonRecurring: 0,
      recurring: {
        travel: 0,
        human_resources: 0,
        consumables: 0,
        others: 0,
        total: 0,
      },
      yearTotal: 0,
    },
  });

  const calculateTotals = (updatedBudget) => {

    const budgetRecurringTotal =
      parseFloat(updatedBudget.budgetTotal?.recurring?.travel || 0) +
      parseFloat(updatedBudget.budgetTotal?.recurring?.human_resources || 0) +
      parseFloat(updatedBudget.budgetTotal?.recurring?.consumables || 0) +
      parseFloat(updatedBudget.budgetTotal?.recurring?.others || 0);

    const budgetTotalSum =
      parseFloat(updatedBudget.budgetTotal.nonRecurring || 0) + budgetRecurringTotal + parseFloat(updatedBudget.budgetTotal.overhead || 0);

    return {
      budgetTotal: {
        overhead: parseFloat(updatedBudget.budgetTotal.overhead || 0),
        nonRecurring: parseFloat(updatedBudget.budgetTotal.nonRecurring),
        recurring: {
          travel: parseFloat(updatedBudget.budgetTotal?.recurring?.travel || 0),
          human_resources: parseFloat(updatedBudget.budgetTotal?.recurring?.human_resources || 0),
          consumables: parseFloat(updatedBudget.budgetTotal?.recurring?.consumables || 0),
          others: parseFloat(updatedBudget.budgetTotal?.recurring?.others || 0),
          total: budgetRecurringTotal
        },
        total: budgetTotalSum
      }
    };
  };
  const calculateSanctionedTotals = (updatedBudget) => {
    const budgetRecurringTotal =
      parseFloat(updatedBudget.budgetSanctioned?.recurring?.travel || 0) +
      parseFloat(updatedBudget.budgetSanctioned?.recurring?.human_resources || 0) +
      parseFloat(updatedBudget.budgetSanctioned?.recurring?.consumables || 0) +
      parseFloat(updatedBudget.budgetSanctioned?.recurring?.others || 0);

    return {
      budgetSanctioned: {
        overhead: parseFloat(updatedBudget.budgetSanctioned.overhead || 0),
        nonRecurring: parseFloat(updatedBudget.budgetSanctioned.nonRecurring),
        recurring: {
          travel: parseFloat(updatedBudget.budgetSanctioned?.recurring?.travel || 0),
          human_resources: parseFloat(updatedBudget.budgetSanctioned?.recurring?.human_resources || 0),
          consumables: parseFloat(updatedBudget.budgetSanctioned?.recurring?.consumables || 0),
          others: parseFloat(updatedBudget.budgetSanctioned?.recurring?.others || 0),
          total: budgetRecurringTotal
        },
        yearTotal: parseFloat(updatedBudget.budgetSanctioned.nonRecurring || 0) + budgetRecurringTotal + parseFloat(updatedBudget.budgetSanctioned.overhead || 0)
      }
    };
  };


  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    setBudget((prevBudget) => {
      const updatedBudget = { ...prevBudget };

      if (name === "overhead") {
        updatedBudget.budgetSanctioned.overhead = numValue;
      } else if (name === "nonRecurring") {
        updatedBudget.budgetSanctioned.nonRecurring = numValue;
      } else if (["human_resources", "consumables", "others", "travel"].includes(name)) {
        updatedBudget.budgetSanctioned.recurring[name] = numValue;
      }

      const newTotals = calculateSanctionedTotals(updatedBudget);

      return {
        ...updatedBudget,
        budgetSanctioned: newTotals.budgetSanctioned
      };
    });
  };


  const handleBudgetTotalChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    setBudget((prevBudget) => {
      const updatedBudget = { ...prevBudget };

      if (name === "overhead") {
        updatedBudget.budgetTotal.overhead = numValue;
      } else if (name === "nonRecurring") {
        updatedBudget.budgetTotal.nonRecurring = numValue;
      } else if (["human_resources", "consumables", "others", "travel"].includes(name)) {
        updatedBudget.budgetTotal.recurring[name] = numValue;
      }

      const newTotals = calculateTotals(updatedBudget);

      return {
        ...updatedBudget,
        budgetTotal: newTotals.budgetTotal,
        TotalCost: newTotals.budgetTotal.total
      };
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!budget || !selectedProposal) {
      console.error("Budget or selected proposal is missing!");
      return;
    }

    const budgetData = {
      proposalId: id,
      TotalCost: budget?.TotalCost ?? 0,
      budgetTotal: {
        overhead: budget?.budgetTotal?.overhead ?? 0,
        nonRecurring: budget?.budgetTotal?.nonRecurring ?? 0,
        recurring: {
          human_resources: budget?.budgetTotal?.recurring?.human_resources ?? 0,
          travel: budget?.budgetTotal?.recurring?.travel ?? 0,
          consumables: budget?.budgetTotal?.recurring?.consumables ?? 0,
          others: budget?.budgetTotal?.recurring?.others ?? 0,
          total: budget?.budgetTotal?.recurring?.total ?? 0,
        },
        total: budget?.budgetTotal?.total ?? 0,
      },
      budgetSanctioned: {
        overhead: budget?.budgetSanctioned?.overhead ?? 0,
        nonRecurring: budget?.budgetSanctioned?.nonRecurring ?? 0,
        recurring: {
          human_resources: budget?.budgetSanctioned?.recurring?.human_resources ?? 0,
          travel: budget?.budgetSanctioned?.recurring?.travel ?? 0,
          consumables: budget?.budgetSanctioned?.recurring?.consumables ?? 0,
          others: budget?.budgetSanctioned?.recurring?.others ?? 0,
          total: budget?.budgetSanctioned?.recurring?.total ?? 0,
        },
        yearTotal: budget?.budgetSanctioned?.yearTotal ?? 0,
      },
    };

    console.log("Submitting Budget Data:", budgetData);
    if (!budgetData.TotalCost || !budgetData.budgetTotal || !budgetData.budgetSanctioned) {
      console.error("Missing budget details!");
      return;
    }

    handleBudgetSubmit(budgetData);
  };


  const handleBudgetSubmit = async (budgetData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      console.log("Budget data to submit:", budgetData);

      if (
        !budgetData.TotalCost ||
        !budgetData.budgetTotal ||
        !budgetData.budgetSanctioned
      ) {
        throw new Error("All budget details must be provided!");
      }

      const finalComment = comment?.trim() ? comment : "Proposal approved with budget allocation.";

      const approvalResponse = await fetch(`${url}admin/allocate-budget/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "accessToken": token,
        },
        body: JSON.stringify({
          status: "Sanctioned",
          comment: finalComment,
          budgetsanctioned: budgetData.budgetSanctioned,
          budgettotal: budgetData.budgetTotal,
          TotalCost: budgetData.TotalCost,
        }),
      });

      const approvalResult = await approvalResponse.json();
      toast.success(approvalResult.msg);
      console.log("Approval Response:", approvalResult);

      if (!approvalResponse.ok) {
        throw new Error(approvalResult.msg || "Failed to approve proposal");
      }
    } catch (err) {
      console.error("Error in handleBudgetSubmit:", err);
    }
  };


  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="flex-1 p-6 overflow-y-auto">
        <AdminNavbar activeSection={activeSection} />
        <div className="p-8">
          <div className="p-8 border rounded-lg bg-gray-50 shadow-sm">

            <h2 className="text-2xl font-semibold mb-4">Budget Allocation</h2>
            <p className="mb-4">
              Proposal: <strong>{selectedProposal.researchDetails?.Title}</strong>
            </p>
            <h3 className="font-bold text-lg mb-2">Proposed Budget Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between mt-2 border-t pt-4">
                <span className="text-gray-900 font-medium text-lg">Total Cost:</span>
                <span className="font-bold text-blue-700">₹{selectedProposal.budget?.total}</span>
              </div>
              <div className="flex justify-between mt-2 border-t pt-4">
                <span className="text-gray-900 font-medium text-lg">Overhead:</span>
                <span className="font-bold text-blue-700">₹{selectedProposal.budget?.overhead}</span>
              </div>
              <div className="flex justify-between mt-2 border-t pt-4">
                <span className="text-gray-900 font-medium text-lg">Non Recurring Cost:</span>
                <span className="font-bold text-blue-700">₹{selectedProposal.budget?.non_recurring_total}</span>
              </div>
              <div className="flex justify-between mt-2 border-t pt-4">
                <span className="text-gray-900 font-medium text-lg">Recurring Cost:</span>
                <span className="font-bold text-blue-700">₹{selectedProposal.budget?.recurring_total}</span>
              </div>

            </div>

            <div className="mb-4"></div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h3 className="font-bold text-lg mb-2">Total Cost of Sanctioned Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{
                  label: "Overhead*",
                  name: "overhead",
                  value: budget.budgetTotal.overhead,
                  hint: "includes rent, utilities, etc."
                },
                {
                  label: "Non-Recurring Costs*",
                  name: "nonRecurring",
                  value: budget.budgetTotal.nonRecurring,
                  hint: "Equipment, setup costs, etc."
                },
                {
                  label: "Human Resources (Recurring)*",
                  name: "human_resources",
                  value: budget.budgetTotal?.recurring?.human_resources,
                  hint: "Researcher salaries, assistants, etc."
                },
                {
                  label: "Travel (Recurring)*",
                  name: "travel",
                  value: budget.budgetTotal?.recurring?.travel,
                  hint: "Travel expenses for Conferences, networking etc."
                },
                {
                  label: "Consumables (Recurring)*",
                  name: "consumables",
                  value: budget.budgetTotal?.recurring?.consumables,
                  hint: "Lab supplies, materials, etc."
                },
                {
                  label: "Others (Recurring)*",
                  name: "others",
                  value: budget.budgetTotal?.recurring?.others,
                  hint: "Travel, overhead, miscellaneous costs"
                },
                ].map(({ label, name, value, hint }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="number"
                      name={name}
                      value={value}
                      onChange={handleBudgetTotalChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{hint}</p>
                  </div>
                ))}

              </div>


              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Budget Summary of Total Sanctioned Project</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">Total Overhead :</div>
                  <div className="text-sm font-medium">₹{budget.budgetTotal?.overhead || 0}</div>
                  <div className="text-sm"> Total Recurring Costs:</div>
                  <div className="text-sm font-medium">₹{budget.budgetTotal?.recurring?.total || 0}</div>

                  <div className="text-sm">Total Non-Recurring Costs:</div>
                  <div className="text-sm font-medium">₹{budget?.budgetTotal?.nonRecurring || 0}</div>

                  <div className="text-sm font-semibold">Total Cost of the Project:</div>
                  <div className="text-sm font-semibold">₹{budget?.budgetTotal?.total || 0}</div>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">Total Budget of 1st Year of Sanctioned Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{
                  label: "Overhead*",
                  name: "overhead",
                  value: budget?.budgetSanctioned?.overhead,
                  hint: "includes rent, utilities, etc."
                },
                {
                  label: "Non-Recurring Costs*",
                  name: "nonRecurring",
                  value: budget?.budgetSanctioned?.nonRecurring,
                  hint: "Equipment, setup costs, etc."
                },
                {
                  label: "Human Resources (Recurring)*",
                  name: "human_resources",
                  value: budget?.budgetSanctioned?.recurring?.human_resources,
                  hint: "Researcher salaries, assistants, etc."
                },
                {
                  label: "Travel (Recurring)*",
                  name: "travel",
                  value: budget?.budgetSanctioned?.recurring?.travel,
                  hint: "Travel expenses for Conferences, networking etc."
                },
                {
                  label: "Consumables (Recurring)*",
                  name: "consumables",
                  value: budget?.budgetSanctioned?.recurring?.consumables,
                  hint: "Lab supplies, materials, etc."
                },
                {
                  label: "Others (Recurring)*",
                  name: "others",
                  value: budget?.budgetSanctioned?.recurring?.others,
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
                      className="w-full p-2 border rounded"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{hint}</p>
                  </div>
                ))}

              </div>


              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Budget Summary for 1st Year of the Project</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">Overhead:</div>
                  <div className="text-sm font-medium">₹{budget.budgetSanctioned?.overhead || 0}</div>

                  <div className="text-sm">Recurring Costs Total:</div>
                  <div className="text-sm font-medium">₹{budget.budgetSanctioned?.recurring?.total || 0}</div>

                  <div className="text-sm">Non-Recurring Costs:</div>
                  <div className="text-sm font-medium">₹{budget.budgetSanctioned?.nonRecurring || 0}</div>

                  <div className="text-sm font-semibold">Year Total:</div>
                  <div className="text-sm font-semibold">₹{budget.budgetSanctioned?.yearTotal || 0}</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-6">
                <button type="submit" onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Allocate Budget & Approve
                </button>
                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAllocationForm;