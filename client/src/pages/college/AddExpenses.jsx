import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import InstituteSidebar from "../../components/InstituteSidebar";
import ExcelToCSV from "../../components/ExcelToCsv";
const url = import.meta.env.VITE_REACT_APP_URL;

const AddExpense = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { fetchInstituteGetProject } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("expenses");
  const [project, setProject] = useState({});
  const [generalInfo, setGeneral] = useState({});
  const [researchDetails, setResearch] = useState({});
  const [budget, setBudget] = useState({});
  const [budgetused, setBudgetUsed] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pilist, setPI] = useState([]);
  const [copilist, setCopi] = useState([]);
  const [csvData, setCsvData] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [manualExpense, setManualExpense] = useState({
    description: "",
    amount: "",
    date: "",
    committedDate: "",
    type: ""
  });


  useEffect(() => {
    if (!projectId) {
      setError("Invalid or missing project ID.");
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        console.log(projectId);
        const data = await fetchInstituteGetProject(projectId);
        console.log(data);
        setProject(data.data.project);
        setGeneral(data.data.generalInfo);
        setResearch(data.data.researchDetails);
        setBudget(data.data.budget);
        setBudgetUsed(data.data.budgetused);
        setPI(data.data.PIDetails?.piList);
        setCopi(data.data.PIDetails?.coPiList);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, fetchInstituteGetProject]);

  const handleCSVConversion = (csv) => {
    setCsvData(csv);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!csvData) {
      alert("Please convert an Excel file first.");
      return;
    }
  
    setIsUploading(true);
  
    try {
      if (!csvData || csvData.trim() === '') {
        throw new Error("CSV data is empty or invalid");
      }
  
      console.log('Upload Payload:', {
        projectId,
        csvDataLength: csvData.length,
        csvDataPreview: csvData.substring(0, 500)
      });
  
      const response = await fetch(`${url}institute/upload-expenses`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          projectId, 
          csvData 
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Detailed Server Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
  
      const result = await response.json();
      setUploadSuccess(true);
      alert(result.message);
      setCsvData("");
    } catch (error) {
      console.error("Comprehensive Upload Error:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualExpense({
      ...manualExpense,
      [name]: value
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${url}institute/add-expense`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          projectId,
          ...manualExpense
        }),
      });
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);
  
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parsing Error:', parseError);
        throw new Error(`Server returned non-JSON response: ${responseText}`);
      }
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add expense');
      }
  
      alert("Expense added successfully!");
      setManualExpense({
        description: "",
        amount: "",
        date: "",
        committedDate: "",
        type: ""
      });
    } catch (error) {
      console.error("Detailed error adding expense:", error);
      alert(`Failed to add expense: ${error.message}`);
    }
  };

  const expenseTypes = [
    { value: "human_resources", label: "Human Resources" },
    { value: "travel", label: "Travel" },
    { value: "consumables", label: "Consumables" },
    { value: "overhead", label: "Overhead" },
    { value: "others", label: "Others" },
    { value: "equipment", label: "Equipment" },
    { value: "material", label: "Material" },
    { value: "contingency", label: "Contingency" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Add Expenses</h1>

          {loading ? (
            <p className="text-center">Loading project details...</p>
          ) : (
            <>
              {project ? (
                <div className="bg-gray-100 p-4 mb-6 rounded">
                  <h2 className="text-xl font-semibold mb-2">Project: {project.Title}</h2>
                  <p><strong>ID:</strong> {projectId}</p>
                </div>
              ) : (
                <p className="text-center text-red-500 mb-6">Project not found.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bulk Upload Section */}
                <section className="bg-white p-4 rounded border">
                  <h2 className="text-xl font-bold mb-4">Bulk Upload Expenses</h2>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <ExcelToCSV onConvert={handleCSVConversion} />
                  </div>

                  {csvData && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">CSV Preview:</h3>
                      <div className="border border-gray-300 rounded overflow-hidden">
                        <textarea
                          className="w-full p-2 bg-gray-50 font-mono text-sm"
                          rows="6"
                          readOnly
                          value={csvData}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={handleUpload}
                      className={`px-4 py-2 rounded font-medium text-white ${!csvData || isUploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      disabled={!csvData || isUploading}
                    >
                      {isUploading ? "Uploading..." : "Upload Expenses"}
                    </button>

                    {uploadSuccess && (
                      <span className="text-green-600 font-medium">
                        Expenses uploaded successfully!
                      </span>
                    )}
                  </div>
                </section>

                {/* Manual Entry Section */}
                <section className="bg-white p-4 rounded border">
                  <h2 className="text-xl font-bold mb-4">Add Single Expense</h2>
                  <form onSubmit={handleManualSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1" htmlFor="description">
                        Description
                      </label>
                      <input
                        type="text"
                        id="description"
                        name="description"
                        value={manualExpense.description}
                        onChange={handleManualInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1" htmlFor="amount">
                        Amount
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={manualExpense.amount}
                        onChange={handleManualInputChange}
                        className="w-full p-2 border rounded"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1" htmlFor="date">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={manualExpense.date}
                        onChange={handleManualInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1" htmlFor="committedDate">
                        Committed Date
                      </label>
                      <input
                        type="date"
                        id="committedDate"
                        name="committedDate"
                        value={manualExpense.committedDate}
                        onChange={handleManualInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1" htmlFor="type">
                        Expense Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={manualExpense.type}
                        onChange={handleManualInputChange}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Select an expense type</option>
                        {expenseTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
                    >
                      Add Expense
                    </button>
                  </form>
                </section>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate(`/sanctioned-projects`)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  Back to Project
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddExpense;