// This file is for managing budget allocation for projects, including form submission and validation.

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faFileAlt, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { AuthContext } from "../Context/Authcontext";

const url = import.meta.env.VITE_REACT_APP_URL;

const BudgetAllocation = () => {
  const [activeSection, setActiveSection] = useState("budgetalloc");
  const { getAdmin } = useContext(AuthContext) || { getAdmin: () => Promise.resolve(true) };
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const initialBudgetState = {
    overhead: 0,
    nonRecurring: 0,
    recurring: {
      travel: 0,
      human_resources: 0,
      consumables: 0,
      others: 0,
      total: 0
    },
    total: 0
  };

  const [totalUsed, setTotalUsed] = useState(initialBudgetState);
  const [sanctionedBudget, setSanctionedBudget] = useState(initialBudgetState);
  const [remainingBudget, setRemainingBudget] = useState(initialBudgetState);

  const [budgetData, setBudgetData] = useState({
    ...initialBudgetState,
    comments: ""
  });

  useEffect(() => {
    const fetchPendingProposals = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${url}admin/get-projects`, {
          method: "GET",
          headers: { "accessToken": token },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(data.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProposals();
  }, [navigate]);

  const handleFileNumberClick = () => {
    setShowFileSelector(true);
  };

  const calculateRemainingBudget = (sanctioned, used) => {
    return {
      overhead: sanctioned.overhead - used.overhead,
      nonRecurring: sanctioned.nonRecurring - used.nonRecurring,
      recurring: {
        travel: sanctioned.recurring.travel - used.recurring.travel,
        human_resources: sanctioned.recurring.human_resources - used.recurring.human_resources,
        consumables: sanctioned.recurring.consumables - used.recurring.consumables,
        others: sanctioned.recurring.others - used.recurring.others,
        total: sanctioned.recurring.total - used.recurring.total
      },
      total: sanctioned.total - used.total
    };
  };

  const handleProjectSelect = (project) => {
    if (!project || !project.proposal) return;

    setSelectedProject(project);
    setShowFileSelector(false);

    const proposalBudget = project.proposal.budgetTotal || initialBudgetState;

    const newSanctionedBudget = {
      overhead: proposalBudget.overhead || 0,
      nonRecurring: proposalBudget.nonRecurring || 0,
      recurring: {
        travel: proposalBudget.recurring?.travel || 0,
        human_resources: proposalBudget.recurring?.human_resources || 0,
        consumables: proposalBudget.recurring?.consumables || 0,
        others: proposalBudget.recurring?.others || 0,
        total: proposalBudget.recurring?.total || 0
      },
      total: proposalBudget.total || 0
    };

    setSanctionedBudget(newSanctionedBudget);

    let totalUsedCalc = JSON.parse(JSON.stringify(initialBudgetState));

    if (project.proposal.YearlyDataId && Array.isArray(project.proposal.YearlyDataId)) {
      project.proposal.YearlyDataId.forEach(yearData => {
        if (yearData.budgetUsed) {
          totalUsedCalc.overhead += yearData.budgetUsed.overhead || 0;
          totalUsedCalc.nonRecurring += yearData.budgetUsed.nonRecurring || 0;

          totalUsedCalc.recurring.travel += yearData.budgetUsed.recurring?.travel || 0;
          totalUsedCalc.recurring.human_resources += yearData.budgetUsed.recurring?.human_resources || 0;
          totalUsedCalc.recurring.consumables += yearData.budgetUsed.recurring?.consumables || 0;
          totalUsedCalc.recurring.others += yearData.budgetUsed.recurring?.others || 0;
          totalUsedCalc.recurring.total += yearData.budgetUsed.recurring?.total || 0;

          totalUsedCalc.total += yearData.budgetUsed.yearTotal || 0;
        }
      });
    }

    setTotalUsed(totalUsedCalc);
    setRemainingBudget(calculateRemainingBudget(newSanctionedBudget, totalUsedCalc));

    setBudgetData({
      ...initialBudgetState,
      comments: ""
    });
  };

  const calculateTotals = (data) => {
    const recurringTotal =
      (parseFloat(data.recurring.travel) || 0) +
      (parseFloat(data.recurring.human_resources) || 0) +
      (parseFloat(data.recurring.consumables) || 0) +
      (parseFloat(data.recurring.others) || 0);

    const total =
      (parseFloat(data.overhead) || 0) +
      (parseFloat(data.nonRecurring) || 0) +
      recurringTotal;

    return {
      ...data,
      recurring: {
        ...data.recurring,
        total: recurringTotal
      },
      total: total
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    let updatedBudgetData = { ...budgetData };

    if (name === "comments") {
      updatedBudgetData.comments = value;
    } else if (name === "overhead" || name === "nonRecurring") {
      updatedBudgetData[name] = numValue;
    } else if (["travel", "human_resources", "consumables", "others"].includes(name)) {
      updatedBudgetData.recurring[name] = numValue;
    }

    updatedBudgetData = calculateTotals(updatedBudgetData);
    setBudgetData(updatedBudgetData);
  };

  const handleSubmit = async () => {

    if (!selectedProject) {
      toast.error("Please select a project first");
      console.log("Please select a project first");
      return;
    }

    if (budgetData.total > remainingBudget.total) {
      toast.error("Allocation exceeds remaining budget");
      console.log("Allocation exceeds remaining budget");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      console.log(budgetData);
      console.log(selectedProject);
      const response = await fetch(`${url}admin/allocateBudget`, {
        method: "POST",
        headers: {
          "accessToken": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          budgetData,
          projectId: selectedProject?.proposal?._id || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Budget allocation failed");
      }

      if (data.success) {
        toast.success("Budget allocated successfully!");
        const updatedProjects = projects.map(proj =>
          proj._id === selectedProject.proposal._id ? data.updatedProject : proj
        );
        setProjects(updatedProjects);
        navigate("/admin");
      } else {
        throw new Error(data.message || "Budget allocation was unsuccessful");
      }
    } catch (error) {
      console.error("Error allocating budget:", error);
      toast.error(error.message || "An error occurred while allocating the budget.");
    }
  };

  const filteredProjects = searchTerm
    ? projects.filter(project =>
      project?.proposal?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.proposal?.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project?.proposal?.PI?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : projects;

  return (
    <div className="flex">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 bg-gray-100 min-h-screen">
        <div className="p-4">
          <AdminNavbar activeSection={activeSection} />
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Budget Allocation</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center text-blue-600 mb-4">
                <FontAwesomeIcon icon={faDollarSign} className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Budget Allocation</h2>
              </div>
              <p className="text-gray-600">Allocate budgets for sanctioned project proposals.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center text-green-600 mb-4">
                <FontAwesomeIcon icon={faFileAlt} className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Project Details</h2>
              </div>
              <p className="text-gray-600">View sanctioned project details and remaining budget.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center text-purple-600 mb-4">
                <FontAwesomeIcon icon={faCheck} className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Approval</h2>
              </div>
              <p className="text-gray-600">Review and approve budget allocations for projects.</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <div className="relative flex-1 mr-4">
                <input
                  type="text"
                  value={selectedProject ? `${selectedProject.proposal._id} - ${selectedProject.proposal.Title}` : ""}
                  readOnly
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project File Number"
                />
                <button
                  onClick={handleFileNumberClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1 rounded"
                >
                  <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  if (selectedProject) {
                    setSelectedProject(null);
                    setSanctionedBudget(initialBudgetState);
                    setBudgetData({
                      ...initialBudgetState,
                      comments: ""
                    });
                  } else {
                    setShowFileSelector(true);
                  }
                }}
                className="bg-gray-500 text-white px-4 py-3 rounded hover:bg-gray-600"
              >
                {selectedProject ? "Clear" : "Select Project"}
              </button>
            </div>
          </div>

          {showFileSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-auto">
                <h2 className="text-xl font-bold mb-4">Select Project</h2>

                <div className="mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search projects..."
                    className="w-full p-2 border rounded"
                  />
                </div>

                {loading ? (
                  <p className="text-center py-4">Loading projects...</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {filteredProjects.length > 0 ? (
                      <ul className="divide-y">
                        {filteredProjects.map((project) => (
                          <li
                            key={project.proposal._id}
                            className="p-3 hover:bg-blue-50 cursor-pointer border border-blue-100 rounded"
                            onClick={() => handleProjectSelect(project)}
                          >
                            <div className="font-medium">{project.proposal._id} | {project.proposal.Title}</div>
                            <div className="text-sm text-gray-600">
                              {project.generalInfo?.instituteName} | PI: {project.proposal.PI}
                            </div>
                            <div className="text-sm font-semibold mt-1">
                              Sanctioned Budget: ₹{(project.proposal.budgetTotal?.total || 0).toLocaleString()}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center py-4">No projects found</p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowFileSelector(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedProject && (
              <>
                <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
                  <h2 className="text-xl font-semibold mb-4">Sanctioned Budget Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h3 className="font-medium text-blue-700 mb-2">Project Information</h3>
                      <p className="text-sm mb-1"><strong>ID:</strong> {selectedProject.proposal._id}</p>
                      <p className="text-sm mb-1"><strong>Title:</strong> {selectedProject.proposal.Title}</p>
                      <p className="text-sm mb-1"><strong>Institute:</strong> {selectedProject.generalInfo?.instituteName}</p>
                      <p className="text-sm mb-1"><strong>PI:</strong> {selectedProject.proposal.PI}</p>
                      <p className="text-sm font-semibold mt-2">
                        <strong>Total Sanctioned:</strong> ₹{(selectedProject.proposal.budgetTotal?.total || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-medium text-green-700 mb-2">Sanctioned Budget</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Overhead:</span>
                          <span>₹{(sanctionedBudget.overhead || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Non-Recurring:</span>
                          <span>₹{(sanctionedBudget.nonRecurring || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Human Resources:</span>
                          <span>₹{(sanctionedBudget.recurring.human_resources || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Travel:</span>
                          <span>₹{(sanctionedBudget.recurring.travel || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Consumables:</span>
                          <span>₹{(sanctionedBudget.recurring.consumables || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Others:</span>
                          <span>₹{(sanctionedBudget.recurring.others || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t mt-1">
                          <span>Total:</span>
                          <span>₹{(sanctionedBudget.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-purple-50">
                      <h3 className="font-medium text-purple-700 mb-2">Remaining Budget</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Overhead:</span>
                          <span className={remainingBudget.overhead < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{(remainingBudget.overhead || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Non-Recurring:</span>
                          <span className={remainingBudget.nonRecurring < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{(remainingBudget.nonRecurring || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Human Resources:</span>
                          <span className={remainingBudget.recurring.human_resources < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{(remainingBudget.recurring.human_resources || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Travel:</span>
                          <span className={remainingBudget.recurring.travel < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{(remainingBudget.recurring.travel || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Consumables:</span>
                          <span className={remainingBudget.recurring.consumables < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{(remainingBudget.recurring.consumables || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Others:</span>
                          <span className={remainingBudget.recurring.others < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{(remainingBudget.recurring.others || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t mt-1">
                          <span>Total Remaining:</span>
                          <span className={remainingBudget.total < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{(remainingBudget.total || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
                  <h2 className="text-xl font-semibold mb-4">Budget Allocation Form</h2>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Overhead Amount (₹)
                        </label>
                        <input
                          type="number"
                          name="overhead"
                          value={budgetData.overhead}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                          min="0"
                          max={remainingBudget.overhead}
                        />
                        <p className="text-xs text-gray-500 mt-1">Includes institutional overheads</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Non-Recurring Amount (₹)
                        </label>
                        <input
                          type="number"
                          name="nonRecurring"
                          value={budgetData.nonRecurring}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                          min="0"
                          max={remainingBudget.nonRecurring}
                        />
                        <p className="text-xs text-gray-500 mt-1">Equipment, setup costs, etc.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Human Resources (₹)
                        </label>
                        <input
                          type="number"
                          name="human_resources"
                          value={budgetData.recurring.human_resources}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                          min="0"
                          max={remainingBudget.recurring.human_resources}
                        />
                        <p className="text-xs text-gray-500 mt-1">Salaries, stipends, etc.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Travel (₹)
                        </label>
                        <input
                          type="number"
                          name="travel"
                          value={budgetData.recurring.travel}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                          min="0"
                          max={remainingBudget.recurring.travel}
                        />
                        <p className="text-xs text-gray-500 mt-1">Travel expenses for research</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Consumables (₹)
                        </label>
                        <input
                          type="number"
                          name="consumables"
                          value={budgetData.recurring.consumables}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                          min="0"
                          max={remainingBudget.recurring.consumables}
                        />
                        <p className="text-xs text-gray-500 mt-1">Lab supplies, materials, etc.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Others (₹)
                        </label>
                        <input
                          type="number"
                          name="others"
                          value={budgetData.recurring.others}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                          min="0"
                          max={remainingBudget.recurring.others}
                        />
                        <p className="text-xs text-gray-500 mt-1">Miscellaneous expenses</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comments
                      </label>
                      <textarea
                        name="comments"
                        value={budgetData.comments}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Add any comments regarding budget allocation..."
                      ></textarea>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h3 className="font-medium mb-2">Allocation Summary</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">Overhead:</div>
                        <div className="text-sm font-medium">₹{(budgetData.overhead || 0).toLocaleString()}</div>

                        <div className="text-sm">Non-Recurring:</div>
                        <div className="text-sm font-medium">₹{(budgetData.nonRecurring || 0).toLocaleString()}</div>

                        <div className="text-sm">Recurring Total:</div>
                        <div className="text-sm font-medium">₹{(budgetData.recurring.total || 0).toLocaleString()}</div>

                        <div className="text-sm font-semibold">Total Allocated:</div>
                        <div className="text-sm font-semibold">₹{(budgetData.total || 0).toLocaleString()}</div>





                        <div className="col-span-2 mt-2 pt-2 border-t">
                          <div className={`text-${budgetData.total > remainingBudget.total ? 'red' : 'green'}-600 font-bold text-sm`}>
                            {budgetData.total > remainingBudget.total
                              ? 'Warning: Allocation exceeds remaining budget!'
                              : 'Allocation is within remaining budget.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="submit"
                        disabled={budgetData.total > remainingBudget.total || budgetData.total === 0 || loading}
                        className={`flex items-center px-4 py-2 rounded-md transition ${budgetData.total > remainingBudget.total || budgetData.total === 0 || loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                            Approve Allocation
                          </>
                        )}
                      </button>

                    </div>
                  </form>
                </div>
              </>
            )}

            {!selectedProject && (
              <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faDollarSign} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No Project Selected</h3>
                  <p className="text-gray-500 mb-6">Please select a project to allocate budget.</p>
                  <button
                    onClick={() => setShowFileSelector(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Select Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAllocation;