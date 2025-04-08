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
  const [showInstructions, setShowInstructions] = useState(false);
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

      const result = await response.json();

      if (!response.ok) {
        console.error("Upload error response:", result);
        throw new Error(result.message || "Failed to upload expenses");
      }

      alert(`${result.message} (${result.added} added, ${result.skipped} skipped:Transaction date must be on or after the committed date)`);
      setCsvData("");
      setUploadSuccess(true);
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

      const result = await response.json(); // <- Properly parse as JSON here

      if (!response.ok) {
        alert(result.message || "Failed to add expense");
        return;
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

  // const generateAndDownloadExcelTemplate = () => {
  //   try {
  //     // Use the existing CSV generation logic but enhance it
  //     const headers = "Date,CommittedDate,Description,Amount,Type\n";

  //     // Add multiple example rows to better demonstrate the expected format
  //     const exampleRows = [
  //       '2025-04-01,2025-03-25,Travel Expense,1500,travel\n',
  //       ',,Equipment Purchase,5000,equipment\n', // Example with empty date fields
  //       '2025-04-05,2025-04-01,Consumables,750.50,consumables\n'
  //     ];

  //     // Create a Blob containing the CSV data
  //     const blob = new Blob([headers, ...exampleRows], { type: 'text/csv;charset=utf-8;' });

  //     // Create a download link and trigger the download
  //     const link = document.createElement('a');
  //     const fileUrl = URL.createObjectURL(blob);
  //     link.setAttribute('href', fileUrl);
  //     link.setAttribute('download', `Expense_Template_Project_${projectId}.csv`);
  //     link.style.visibility = 'hidden';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);

  //     // Clean up the URL object
  //     setTimeout(() => {
  //       URL.revokeObjectURL(fileUrl);
  //     }, 100);

  //     // Show success message
  //     alert("Template downloaded successfully. Please fill in your expense data and then convert using the tool below.");
  //   } catch (error) {
  //     console.error('Error generating template:', error);
  //     alert(`Failed to generate template: ${error.message}`);
  //   }
  // };

  const openExcelWithTemplate = async () => {
    try {
      const response = await fetch(`${url}institute/generate-excel-template?projectId=${projectId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Server returned ${response.status}: ${errorText || response.statusText}`);
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `Expense_Template_for_${project.Title}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Detailed Excel download error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      alert(`Failed to download Excel template: ${error.message}`);
    }
  };

  const downloadExcelTemplate = () => {
    const headers = "Date,CommittedDate,Description,Amount,Type\n";

    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Expense_Template_for_${project.Title}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

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

                  {/* Excel Format Instructions */}
                  <div className="mb-4">
                    <button
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="text-blue-600 underline flex items-center gap-1"
                    >
                      {showInstructions ? 'Hide' : 'Show'} Excel Upload Instructions
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                      </svg>
                    </button>

                    {showInstructions && (
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="font-semibold mb-2">Excel Sheet Format Instructions:</h3>
                        <p className="mb-2">Your Excel file must contain the following columns:</p>
                        <ul className="list-disc ml-5 mb-4">
                          <li><strong>description</strong> - Description of the expense</li>
                          <li><strong>amount</strong> - Numeric amount (e.g., 1500.00)</li>
                          <li><strong>date</strong> - Transaction date in YYYY-MM-DD format (can be left empty)</li>
                          <li><strong>committedDate</strong> - Committed date in YYYY-MM-DD format</li>
                          <li><strong>type</strong> - One of the following expense types:</li>
                        </ul>
                        <div className="grid grid-cols-2 gap-2 mb-4 ml-5">
                          {expenseTypes.map(type => (
                            <div key={type.value} className="flex items-center gap-1">
                              <span className="w-3 h-3 inline-block bg-gray-300 rounded-full"></span>
                              <span><code>{type.value}</code> ({type.label})</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">Note: The first row of your Excel file should contain these column headers exactly as shown above. Date fields can be left empty if needed.</p>

                        <div className="mt-4">
                          <button
                            onClick={downloadExcelTemplate}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                              <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                            </svg>
                            Download Excel Template
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Excel Edit Button */}
                  <div className="mb-6">
                    <button
                      onClick={openExcelWithTemplate}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium w-full flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V9H3V2a1 1 0 0 1 1-1h5.5v2z" />
                        <path d="M3 12v-2h2v2H3zm0 1h2v2H4a1 1 0 0 1-1-1v-1zm3 2v-2h7v1a1 1 0 0 1-1 1H6zm7-3H6v-2h7v2z" />
                      </svg>
                      Open Excel Template for Editing
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      This will open a pre-formatted Excel template that you can edit and save to your computer.
                    </p>
                  </div>

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
                        Transaction Date <span className="text-gray-500 text-sm">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={manualExpense.date}
                        onChange={handleManualInputChange}
                        className="w-full p-2 border rounded"
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