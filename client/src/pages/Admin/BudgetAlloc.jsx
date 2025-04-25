import React, { useState, useContext, useEffect } from "react";
import { Bell, Settings, LogOut, FileText, DollarSign, Check, Search } from "lucide-react";
import { AuthContext } from "../../pages/Context/Authcontext";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";

const MOCK_PROJECTS = [
  { id: "PRJ-2025-001", title: "Smart Agriculture IoT System", institute: "IIT Delhi", pi: "Dr. Sharma", sanctionedBudget: 450000 },
  { id: "PRJ-2025-002", title: "Renewable Energy Storage Solutions", institute: "IIT Bombay", pi: "Dr. Patel", sanctionedBudget: 620000 },
  { id: "PRJ-2025-003", title: "AI for Healthcare Diagnostics", institute: "AIIMS", pi: "Dr. Gupta", sanctionedBudget: 780000 },
  { id: "PRJ-2025-004", title: "Quantum Computing Applications", institute: "IISc Bangalore", pi: "Dr. Reddy", sanctionedBudget: 950000 },
  { id: "PRJ-2025-005", title: "Sustainable Urban Planning", institute: "CEPT University", pi: "Dr. Mehta", sanctionedBudget: 520000 }
];

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
  
  const [sanctionedBudget, setSanctionedBudget] = useState({
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
  });
  
  const [budgetData, setBudgetData] = useState({
    overhead: 0,
    nonRecurring: 0,
    recurring: {
      travel: 0,
      human_resources: 0,
      consumables: 0,
      others: 0,
      total: 0
    },
    total: 0,
    comments: ""
  });
  
  const [remainingBudget, setRemainingBudget] = useState({
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
  });

  useEffect(() => {
    // Use mock data instead of fetching
    setProjects(MOCK_PROJECTS);
    setLoading(false);
    
    // Simulate authentication check
    const checkAuth = async () => {
      try {
        // Assuming authentication is successful for demo purposes
        console.log("Authentication successful");
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    
    checkAuth();
  }, []);

  const handleFileNumberClick = () => {
    setShowFileSelector(true);
  };
  
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowFileSelector(false);
    
    // Generate budget details based on the selected project
    const mockSanctionedBudget = {
      overhead: project.sanctionedBudget * 0.1,
      nonRecurring: project.sanctionedBudget * 0.4,
      recurring: {
        travel: project.sanctionedBudget * 0.1,
        human_resources: project.sanctionedBudget * 0.2,
        consumables: project.sanctionedBudget * 0.15,
        others: project.sanctionedBudget * 0.05,
        total: project.sanctionedBudget * 0.5
      },
      total: project.sanctionedBudget
    };
    
    setSanctionedBudget(mockSanctionedBudget);
    setRemainingBudget(mockSanctionedBudget);
    
    // Reset allocation form
    setBudgetData({
      overhead: 0,
      nonRecurring: 0,
      recurring: {
        travel: 0,
        human_resources: 0,
        consumables: 0,
        others: 0,
        total: 0
      },
      total: 0,
      comments: ""
    });
  };

  const calculateTotals = (data) => {
    const recurringTotal = 
      parseFloat(data.recurring.travel) +
      parseFloat(data.recurring.human_resources) +
      parseFloat(data.recurring.consumables) +
      parseFloat(data.recurring.others);
      
    const total = 
      parseFloat(data.overhead) +
      parseFloat(data.nonRecurring) +
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
    
    // Update remaining budget
    const updatedRemainingBudget = {
      overhead: sanctionedBudget.overhead - updatedBudgetData.overhead,
      nonRecurring: sanctionedBudget.nonRecurring - updatedBudgetData.nonRecurring,
      recurring: {
        travel: sanctionedBudget.recurring.travel - updatedBudgetData.recurring.travel,
        human_resources: sanctionedBudget.recurring.human_resources - updatedBudgetData.recurring.human_resources,
        consumables: sanctionedBudget.recurring.consumables - updatedBudgetData.recurring.consumables,
        others: sanctionedBudget.recurring.others - updatedBudgetData.recurring.others,
        total: sanctionedBudget.recurring.total - updatedBudgetData.recurring.total
      },
      total: sanctionedBudget.total - updatedBudgetData.total
    };
    
    setRemainingBudget(updatedRemainingBudget);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }
    
    if (budgetData.total > sanctionedBudget.total) {
      toast.error("Allocation exceeds sanctioned budget");
      return;
    }
    
    // For demo: Show successful toast without actual API call
    toast.success("Budget allocated successfully!");
    
    // Reset the form
    setSelectedProject(null);
    setBudgetData({
      overhead: 0,
      nonRecurring: 0,
      recurring: {
        travel: 0,
        human_resources: 0,
        consumables: 0,
        others: 0,
        total: 0
      },
      total: 0,
      comments: ""
    });
    setSanctionedBudget({
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
    });
    setRemainingBudget({
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
    });
  };

  const filteredProjects = searchTerm
    ? projects.filter(project => 
        project.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.pi.toLowerCase().includes(searchTerm.toLowerCase())
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
                <DollarSign className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Budget Allocation</h2>
              </div>
              <p className="text-gray-600">Allocate budgets for sanctioned project proposals.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center text-green-600 mb-4">
                <FileText className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-semibold">Project Details</h2>
              </div>
              <p className="text-gray-600">View sanctioned project details and remaining budget.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center text-purple-600 mb-4">
                <Check className="w-6 h-6 mr-2" />
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
                  value={selectedProject ? `${selectedProject.id} - ${selectedProject.title}` : ""}
                  readOnly
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project File Number"
                />
                <button
                  onClick={handleFileNumberClick}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-1 rounded"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => {
                  if (selectedProject) {
                    setSelectedProject(null);
                    setSanctionedBudget({
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
                    });
                    setBudgetData({
                      overhead: 0,
                      nonRecurring: 0,
                      recurring: {
                        travel: 0,
                        human_resources: 0,
                        consumables: 0,
                        others: 0,
                        total: 0
                      },
                      total: 0,
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
                            key={project.id}
                            className="p-3 hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleProjectSelect(project)}
                          >
                            <div className="font-medium">{project.id} - {project.title}</div>
                            <div className="text-sm text-gray-600">
                              {project.institute} | PI: {project.pi}
                            </div>
                            <div className="text-sm font-semibold mt-1">
                              Sanctioned Budget: ₹{project.sanctionedBudget.toLocaleString()}
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
                      <p className="text-sm mb-1"><strong>ID:</strong> {selectedProject.id}</p>
                      <p className="text-sm mb-1"><strong>Title:</strong> {selectedProject.title}</p>
                      <p className="text-sm mb-1"><strong>Institute:</strong> {selectedProject.institute}</p>
                      <p className="text-sm mb-1"><strong>PI:</strong> {selectedProject.pi}</p>
                      <p className="text-sm font-semibold mt-2">
                        <strong>Total Sanctioned:</strong> ₹{selectedProject.sanctionedBudget.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-medium text-green-700 mb-2">Sanctioned Budget</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Overhead:</span>
                          <span>₹{sanctionedBudget.overhead.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Non-Recurring:</span>
                          <span>₹{sanctionedBudget.nonRecurring.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Human Resources:</span>
                          <span>₹{sanctionedBudget.recurring.human_resources.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Travel:</span>
                          <span>₹{sanctionedBudget.recurring.travel.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Consumables:</span>
                          <span>₹{sanctionedBudget.recurring.consumables.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Others:</span>
                          <span>₹{sanctionedBudget.recurring.others.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t mt-1">
                          <span>Total:</span>
                          <span>₹{sanctionedBudget.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-purple-50">
                      <h3 className="font-medium text-purple-700 mb-2">Remaining Budget</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Overhead:</span>
                          <span className={remainingBudget.overhead < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{remainingBudget.overhead.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Non-Recurring:</span>
                          <span className={remainingBudget.nonRecurring < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{remainingBudget.nonRecurring.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Human Resources:</span>
                          <span className={remainingBudget.recurring.human_resources < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{remainingBudget.recurring.human_resources.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Travel:</span>
                          <span className={remainingBudget.recurring.travel < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{remainingBudget.recurring.travel.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Consumables:</span>
                          <span className={remainingBudget.recurring.consumables < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{remainingBudget.recurring.consumables.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Others:</span>
                          <span className={remainingBudget.recurring.others < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{remainingBudget.recurring.others.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-1 border-t mt-1">
                          <span>Total Remaining:</span>
                          <span className={remainingBudget.total < 0 ? "text-red-600 font-bold" : ""}>
                            ₹{remainingBudget.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              
                <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
                  <h2 className="text-xl font-semibold mb-4">Budget Allocation Form</h2>
                  
                  <form onSubmit={handleSubmit}>
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
                          max={sanctionedBudget.overhead}
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
                          max={sanctionedBudget.nonRecurring}
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
                          max={sanctionedBudget.recurring.human_resources}
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
                          max={sanctionedBudget.recurring.travel}
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
                          max={sanctionedBudget.recurring.consumables}
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
                          max={sanctionedBudget.recurring.others}
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
                        <div className="text-sm font-medium">₹{budgetData.overhead.toLocaleString()}</div>
                        
                        <div className="text-sm">Non-Recurring:</div>
                        <div className="text-sm font-medium">₹{budgetData.nonRecurring.toLocaleString()}</div>
                        
                        <div className="text-sm">Recurring Total:</div>
                        <div className="text-sm font-medium">₹{budgetData.recurring.total.toLocaleString()}</div>
                        
                        <div className="text-sm font-semibold">Total Allocated:</div>
                        <div className="text-sm font-semibold">₹{budgetData.total.toLocaleString()}</div>
                        
                        <div className="col-span-2 mt-2 pt-2 border-t">
                          <div className={`text-${budgetData.total > sanctionedBudget.total ? 'red' : 'green'}-600 font-bold text-sm`}>
                            {budgetData.total > sanctionedBudget.total 
                              ? 'Warning: Allocation exceeds sanctioned budget!'
                              : 'Allocation is within sanctioned budget.'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setBudgetData({
                            overhead: 0,
                            nonRecurring: 0,
                            recurring: {
                              travel: 0,
                              human_resources: 0,
                              consumables: 0,
                              others: 0,
                              total: 0
                            },
                            total: 0,
                            comments: ""
                          });
                          setRemainingBudget(sanctionedBudget);
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                      >
                        Reset
                      </button>
                      
                      <button
                        type="submit"
                        disabled={budgetData.total > sanctionedBudget.total || budgetData.total === 0}
                        className={`flex items-center px-4 py-2 rounded-md transition ${
                          budgetData.total > sanctionedBudget.total || budgetData.total === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Allocation
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
            
            {!selectedProject && (
              <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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