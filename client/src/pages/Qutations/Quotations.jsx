import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext";
import { toast } from "react-toastify";
import { useContext } from "react";
import Sidebar from "../../utils/Sidebar"
import HomeNavbar from "../../utils/HomeNavbar";
const url = import.meta.env.VITE_REACT_APP_URL;
import axios from "axios";

const UploadDocuments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { id } = useParams();
  const navigate= useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [showBreakup, setShowBreakup] = useState(false);
  const [modalData, setModalData] = useState(null);
  const { getProject } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    make: "",
    model: "",
    quantity: 0,
    imported: "",
    cost: 0,
    remarks: ""
  });
  const [bank, setBank] = useState({
    name: "",
    number: "",
    bankName: "",
    address: "",
    Ifsc: "",
  });
  const [projectDuration, setDuration] = useState({ years: 0, months: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [modalInputs, setModalInputs] = useState([]);

  useEffect(() => {
    const fetchProjectDuration = async () => {
      try {
        const response = await getProject(id);
        const years = response?.data?.project?.years;
        const totalMonths = parseFloat(years) * 12;
        const remainingMonths = totalMonths % 12;

        setDuration({ 
          years: Math.floor(totalMonths / 12), 
          months: remainingMonths 
        });
      } catch (e) {
        console.error(e);
      }
    };

    fetchProjectDuration(id);
  }, [id, getProject]);

  const generateYearColumns = () => {
    let years = [];
    for (let i = 1; i <= projectDuration.years; i++) {
      years.push({ year: `Year ${i}`, months: 12 });
    }
    if (projectDuration.months > 0) {
      years.push({ 
        year: `Year ${projectDuration.years + 1}`, 
        months: projectDuration.months 
      });
    }
    return years;
  };

  const yearColumns = generateYearColumns();

  const [salaryRows, setSalaryRows] = useState([
    {
      designation: "",
      ...Object.fromEntries(yearColumns.map(y => [y.year, 0])),
      breakup: {}
    }
  ]);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('quotation', selectedFile);
      const response = await axios.post(
        `${url}upload/equipment/${selectedEquipment.id}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setEquipments(equipments.map(eq =>
        eq.id === selectedEquipment.id
          ? { ...eq, quotationFile: response.data.filePath }
          : eq
      ));
      setIsModalOpen(false);
      setSelectedFile(null);

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  const handleUploadClick = (equipment) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };

  const addEquipment = () => {
    if (!form.name || !form.make || !form.model) {
      alert('Please fill in all required equipment fields');
      return;
    }
    
    setEquipments([...equipments, { 
      ...form, 
      id: Date.now(), 
      quantity: Number(form.quantity),
      cost: Number(form.cost)
    }]);
    setForm({ 
      name: "", 
      make: "", 
      model: "", 
      quantity: 0, 
      imported: "", 
      cost: 0, 
      remarks: "" 
    });
  };

  const addRow = () => {
    setSalaryRows([
      ...salaryRows,
      {
        designation: "",
        ...Object.fromEntries(yearColumns.map(y => [y.year, 0])),
        breakup: {}
      }
    ]);
  };

  const openModal = (designation, year, rowIndex) => {
    setModalData({ designation, year, rowIndex });
    const { years, months } = projectDuration;

    const projectYearIndex = parseInt(year.split(" ")[1]) - 1;
    const isFinalYear = projectYearIndex === years;
    const applicableMonths = isFinalYear && months > 0 ? months : 12;

    const existingBreakup = salaryRows[rowIndex]?.breakup?.[year] || [
      { name: "noOfPersons", value: 0 },
      { name: "Monthly Emol.", value: 0, months: applicableMonths },
      { name: "HRA (Monthly)", value: 0, months: applicableMonths },
      { name: "Medical Allowances (Yearly)", value: 0, months: 1 }
    ];

    setModalInputs(existingBreakup);
  };

  const handleModalInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedInputs = [...modalInputs];
    updatedInputs[index] = {
      ...updatedInputs[index],
      [name]: name === "months" ? Number(value) : Number(value)
    };
    setModalInputs(updatedInputs);
  };

  const calculateTotal = (inputs) => {
    if (!inputs) return 0;
     let number=1;
     const total = inputs.reduce((acc, item) => {
      if (item.name === "noOfPersons") {
        number = item.value; 
        return acc; 
      }
      return acc + (item.value * (item.months || 1));
    }, 0);
    return total*number;
  };

  const closeModal = () => {
    if (modalData) {
      setSalaryRows(prevRows => {
        const newRows = [...prevRows];
        const { rowIndex, year } = modalData;

        if (!newRows[rowIndex]) return prevRows;

        const total = calculateTotal(modalInputs);

        newRows[rowIndex] = {
          ...newRows[rowIndex],
          [year]: total,
          breakup: {
            ...newRows[rowIndex].breakup,
            [year]: modalInputs
          }
        };

        return newRows;
      });
    }
    setModalData(null);
  };

  const deleteEquipRow = (index) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      const updatedRows = equipments.filter((_, i) => i !== index);
      setEquipments(updatedRows);
    }
  };

  const deleteSalaryRow = (index) => {
    if (window.confirm('Are you sure you want to delete this salary row?')) {
      setSalaryRows(salaryRows.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBank(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!bank.name || !bank.number || !bank.bankName || !bank.Ifsc) {
      alert('Please fill in all required bank details');
      return false;
    }
    if (equipments.length === 0) {
      alert('Please add at least one equipment');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }
  
      const submissionData = {
        bank,
        equipments,
        salaryRows
      };
      console.log(submissionData);
      const response = await fetch(`${url}quotations/submit-quotation/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accessToken": `${token}`,
        },
        body: JSON.stringify(submissionData)
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit data');
      }
  
      if (responseData.success) {
        toast.success(responseData.msg);
        navigate(`/project-dashboard/${id}`)
      } else {
        toast.error('Submission failed: ' + (responseData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      toast.error(`Failed to submit data: ${error.message}`);
    } 
  };
  
  return (
     <div className="flex bg-gray-100 min-h-screen">
                <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    
                <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                    <HomeNavbar isSidebarOpen={isSidebarOpen} path={`/project-dashboard/${id}`} />
    
                    <div className="p-6 space-y-6 mt-16">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow"></div>
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Quotations/RTGS</h2>

        <div className="flex items-center gap-1 mb-4">
          <label className="block font-medium text-lg">File Number:</label>
          <p className="text-lg font-bold text-blue-800">{id}</p>
        </div>

        <div className="border rounded-md p-4 mb-6">
          <h3 className="font-semibold mb-2">Add Equipment</h3>
          <h5 className="text-sm font-medium mb-3 text-blue-800">* Quotations are Only required for equipment Costing more than Rs.25000 </h5>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input 
              placeholder="Generic Name" 
              className="border p-2 rounded" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required
            />
            <input 
              placeholder="Make" 
              className="border p-2 rounded" 
              value={form.make} 
              onChange={(e) => setForm({ ...form, make: e.target.value })} 
              required
            />
            <input 
              placeholder="Model" 
              className="border p-2 rounded" 
              value={form.model} 
              onChange={(e) => setForm({ ...form, model: e.target.value })} 
              required
            />
            <input 
              placeholder="Quantity" 
              type="number" 
              min="1"
              className="border p-2 rounded" 
              value={form.quantity} 
              onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
            />
            <input 
              placeholder="Imported (Y/N)" 
              className="border p-2 rounded" 
              value={form.imported} 
              onChange={(e) => setForm({ ...form, imported: e.target.value.toUpperCase() })} 
            />
            <input 
              placeholder="Estimated Cost" 
              type="number" 
              min="0"
              className="border p-2 rounded" 
              value={form.cost} 
              onChange={(e) => setForm({ ...form, cost: e.target.value })} 
            />
          </div>
          <div className="grid grid-cols-1 gap-2 mb-4">
            <textarea 
              placeholder="Remarks" 
              className="border p-2 rounded" 
              value={form.remarks} 
              onChange={(e) => setForm({ ...form, remarks: e.target.value })} 
            />
          </div>

          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={addEquipment}
          >
            Add Equipment
          </button>
        </div>

        {equipments.length > 0 && (
          <>
            <h3 className="font-semibold mt-6 mb-2">Quotation Upload</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">S.No</th>
                    <th className="border p-2">Generic Name</th>
                    <th className="border p-2">Make</th>
                    <th className="border p-2">Model</th>
                    <th className="border p-2">Quantity</th>
                    <th className="border p-2">Imported</th>
                    <th className="border p-2">Estimated Cost</th>
                    <th className="border p-2">Remarks</th>
                    <th className="border p-2">File</th>
                    <th className="border p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {equipments.map((equipment, index) => (
                    <tr key={equipment.id} className="border">
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2">{equipment.name}</td>
                      <td className="border p-2">{equipment.make}</td>
                      <td className="border p-2">{equipment.model}</td>
                      <td className="border p-2 text-center">{equipment.quantity}</td>
                      <td className="border p-2 text-center">{equipment.imported}</td>
                      <td className="border p-2 text-right">{equipment.cost.toLocaleString()}</td>
                      <td className="border p-2">{equipment.remarks}</td>
                      <td className="border p-2 text-center">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md"
                          onClick={() => handleUploadClick(equipment)}
                        >
                          {equipment.quotationFile ? 'Re-upload' : 'Upload'}
                        </button>
                        {equipment.quotationFile && (
                          <div className="text-xs mt-1 text-green-600">File uploaded</div>
                        )}
                      </td>
                      <td className="border p-2 text-center">
                        <button 
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md" 
                          onClick={() => deleteEquipRow(index)}
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {isModalOpen && selectedEquipment && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
              <div className="space-y-2 mb-4">
                <p><strong>Generic Name:</strong> {selectedEquipment.name}</p>
                <p><strong>Make:</strong> {selectedEquipment.make}</p>
                <p><strong>Model:</strong> {selectedEquipment.model}</p>
                <p><strong>Quantity:</strong> {selectedEquipment.quantity}</p>
                <p><strong>Estimated Cost:</strong> ₹{selectedEquipment.cost.toLocaleString()}</p>
              </div>

              <label className="block mt-4 mb-2">Upload File (PDF, JPG, PNG):</label>
              <input
                type="file"
                className="border p-2 w-full"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  onClick={handleFileUpload}
                  disabled={!selectedFile}
                >
                  Upload File
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border rounded-md p-4 mb-6">
          <h3 className="font-semibold mb-2">Salary Breakup, RTGS Details, and Undertaking</h3>

          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md mb-4"
            onClick={() => setShowBreakup(!showBreakup)}
          >
            {showBreakup ? 'Hide Salary Breakup' : 'Add Salary Breakup'}
          </button>

          {showBreakup && (
            <div className="border rounded-md p-4 mb-6">
              <h3 className="font-semibold mb-2">Salary Breakup</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Designation</th>
                      {yearColumns.map((y, i) => (
                        <th key={i} className="border p-2">{y.year} ({y.months} months)</th>
                      ))}
                      <th className="border p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border">
                        <td className="border p-2">
                          <input
                            type="text"
                            className="border p-1 w-full"
                            value={row.designation}
                            onChange={(e) => {
                              const newRows = [...salaryRows];
                              newRows[rowIndex].designation = e.target.value;
                              setSalaryRows(newRows);
                            }}
                            placeholder="Enter designation"
                          />
                        </td>
                        {yearColumns.map((y, i) => (
                          <td
                            key={i}
                            className="border p-2 cursor-pointer text-blue-600 underline hover:text-blue-800"
                            onClick={() => openModal(row.designation || `Row ${rowIndex + 1}`, y.year, rowIndex)}
                          >
                            {row[y.year] ? row[y.year].toLocaleString() : 0}
                          </td>
                        ))}
                        <td className="border p-2 text-center">
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                            onClick={() => deleteSalaryRow(rowIndex)}
                          >
                            ✖
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button 
                className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                onClick={addRow}
              >
                Add Row
              </button>
            </div>
          )}

          {modalData && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {modalData.designation} - {modalData.year} Breakup
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 mb-4">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="border p-2">Item</th>
                        <th className="border p-2">Amount (in INR)</th>
                        <th className="border p-2">Man Months</th>
                        <th className="border p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalInputs.map((input, index) => (
                        <tr key={index}>
                          <td className="border p-2">
                            {input.name === "noOfPersons" 
                              ? "No. of Persons" 
                              : input.name.replace(/\)$/, '').replace(/\(/g, ' (')}
                          </td>
                          <td className="border p-2">
                            <input
                              type="number"
                              className="border p-1 w-full"
                              name="value"
                              value={input.value}
                              onChange={(e) => handleModalInputChange(index, e)}
                              min="0"
                            />
                          </td>
                          <td className="border p-2">
                            {input.name !== "noOfPersons" && (
                              <input
                                type="number"
                                className="border p-1 w-full"
                                name="months"
                                value={input.months}
                                onChange={(e) => handleModalInputChange(index, e)}
                                min="1"
                                max={input.name.includes("Yearly") ? 1 : 12}
                              />
                            )}
                          </td>
                          <td className="border p-2 text-right">
                            {input.name === "noOfPersons" 
                              ? input.value 
                              : (input.value * input.months).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="font-semibold text-lg">
                    Grand Total: ₹{calculateTotal(modalInputs).toLocaleString()}
                  </div>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                    onClick={closeModal}
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border rounded-md p-4 mb-4">
            <h3 className="font-semibold mb-2">RTGS Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mb-2"
                  value={bank.name}
                  name="name"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Account Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mb-2"
                  value={bank.number}
                  name="number"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Bank Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mb-2"
                  value={bank.bankName}
                  name="bankName"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Branch Name & Address</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mb-2"
                  value={bank.address}
                  name="address"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">IFSC Code</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mb-2"
                  value={bank.Ifsc}
                  name="Ifsc"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Send for Approval'}
          </button>
        </div>
      </div>
    </div>
    </div>
      </div>
    </div>
  );
};

export default UploadDocuments;