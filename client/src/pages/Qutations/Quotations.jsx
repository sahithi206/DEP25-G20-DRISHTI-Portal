import React, { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext";
import { useContext } from "react";
const url = import.meta.env.VITE_REACT_APP_URL;
import axios from "axios";
const UploadDocuments = () => {
  const { id } = useParams();
  const [equipments, setEquipments] = useState([]);
  const [showBreakup, setShowBreakup] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { getProject }=useContext(AuthContext);
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
    number:"",
    bankName:"",
    address:"",
    Ifsc:"", 
  });
  const [projectDuration,setDuration] = useState({ years:0, months:0});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  useEffect(() => {
    const fetchProjectDuration = async () => {
      try {
        const response = await getProject(id);
        const years = response?.data?.project?.years;
        const totalMonths = parseFloat(years) * 12; 
        const remainingMonths = totalMonths % 12;

        setDuration({years, months: remainingMonths});
        console.log({years, months: remainingMonths});
      } catch(e) {
        console.error(e);
      }
    };
  
    fetchProjectDuration();
  }, [id]);

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
  const generateYearColumns = () => {
    let years = [];
    for (let i = 1; i <= projectDuration.years; i++) {
      years.push({ year: `Year ${i}`, months: 12 });
    }
    if (projectDuration.months > 0) {
      years.push({ year: `Year ${projectDuration.years + 1}`, months: projectDuration.months });
    }
    return years;
  };

  const yearColumns = generateYearColumns();
  console.log("yearCoumns",yearColumns);

  const [salaryRows, setSalaryRows] = useState([
    { designation: " ", ...Object.fromEntries(yearColumns.map(y => [y.year, 0])) },
  ]);

  const handleUploadClick = (equipment) => {
    setSelectedEquipment(equipment);
    setIsModalOpen(true);
  };
  const [modalInputs, setModalInputs] = useState([]);
  const addEquipment = () => {
    setEquipments([...equipments, { ...form, id: equipments.length + 1 }]);
    setForm({ name: "", make: "", model: "", quantity: 0, imported: "", cost:0, remarks: "" });
  };

  const addRow = () => {
    setSalaryRows([
      ...salaryRows,
      { designation: "", ...Object.fromEntries(yearColumns.map(y => [y.year, 0])) },
    ]);
  };

  const openModal = (designation, year, amount, index) => {
    setModalData({ designation, year, index });
      const { years, months } = projectDuration;
    let inputs = [];
  
    const projectYearIndex = parseInt(year.split(" ")[1]) - 1;
  
    const isFinalYear = projectYearIndex === years;
    const applicableMonths = isFinalYear && months > 0 ? months : 12;
  
    inputs.push(
      { name: "Monthly Emol.", value:0, months: applicableMonths },
      { name: "HRA (Monthly)", value: 0, months: applicableMonths },
      { name: "Medical Allowances (Yearly)", value: 0, months: 1 }
    );
  
    setModalInputs(inputs);
  };

  const handleModalInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedInputs = modalInputs.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [name]: name === "months" ? Number(value) : Number(value)
        };
      }
      return item;
    });
    setModalInputs(updatedInputs);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBank(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    return modalInputs.reduce((total, item) => total + item.value * item.months, 0);
  };

  const closeModal = () => {
    if (modalData) {
        setSalaryRows((prevRows) => {
            const updatedRows = [...prevRows];
            const yearKey = modalData.year; 
            updatedRows[modalData.index] = {
                ...updatedRows[modalData.index], 
                [yearKey]: calculateTotal(),
            };
            return updatedRows;
        });
    }
    setModalData(null); 
};  

  const deleteEquipRow = (index) => {
    const updatedRows = equipments.filter((_, i) => i !== index);
    setEquipments(updatedRows);
  };
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Quotations/RTGS</h2>

        <div className="flex justify-items gap-1 mb-4">
          <label className="block mb-2 font- text-lg">File Number:</label>
          <p className="text-lg font-bold text-blue-800">{id}</p>
        </div>

        <div className="border rounded-md p-4 mb-6">
          <h3 className="font-semibold mb-2">Add Equipment</h3>
          <h5 className="text-sm font-medium mb-3 text-blue-800">* Quotations are Only required for equipment Costing more than Rs.25000 </h5>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input placeholder="Generic Name" className="border p-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Make" className="border p-2 rounded" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
            <input placeholder="Model" className="border p-2 rounded" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            <input placeholder="Quantity" type="number" className="border p-2 rounded" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input placeholder="Imported (Y/N)" className="border p-2 rounded" value={form.imported} onChange={(e) => setForm({ ...form, imported: e.target.value })} />
            <input placeholder="Estimated Cost" type="number" className="border p-2 rounded" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 gap-2 mb-4">
            <textarea placeholder="Remarks" className="border p-2 rounded" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </div>

          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={addEquipment}>Add Equipment</button>
        </div>
        {equipments && equipments.length > 0 && (
        <>
          <h3 className="font-semibold mt-6 mb-2">Quotation Upload</h3>
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
                <tr key={index} className="border">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{equipment.name}</td>
                  <td className="border p-2">{equipment.make}</td>
                  <td className="border p-2">{equipment.model}</td>
                  <td className="border p-2">{equipment.quantity}</td>
                  <td className="border p-2">{equipment.imported}</td>
                  <td className="border p-2">{equipment.cost}</td>
                  <td className="border p-2">{equipment.remarks}</td>
                  <td className="border p-2 text-center">
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded-md"
                      onClick={() => handleUploadClick(equipment)}
                    >
                      Upload
                    </button>
                  </td>
                  <td className="border p-2 text-center">
                        <button className="bg-red-500 text-white px-3 py-1 rounded-md" onClick={() => deleteEquipRow(index)}>✖</button>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

{isModalOpen && selectedEquipment && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-md w-1/2">
      <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>
      <p><strong>Generic Name:</strong> {selectedEquipment.name}</p>
      <p><strong>Make:</strong> {selectedEquipment.make}</p>
      <p><strong>Model:</strong> {selectedEquipment.model}</p>
      <p><strong>Quantity:</strong> {selectedEquipment.quantity}</p>
      <p><strong>Estimated Cost:</strong> {selectedEquipment.cost}</p>

      <label className="block mt-4">Upload File:</label>
              <input
                type="file"
                className="border p-2 w-full"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}

      <div className="mt-4 flex justify-end">
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
          onClick={() => {
            setIsModalOpen(false);
            setSelectedFile(null);
          }}
        >
          Close
        </button>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded-md"
          onClick={handleFileUpload}
          disabled={!selectedFile}
        >
          Save
        </button>
        <label className="block mt-4">Upload File:</label>

      </div>
    </div>
  </div>
)}
        {modalData && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-md w-100">
              <h3 className="text-xl font-semibold mb-4">{modalData.year} Breakup</h3>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Item</th>
                    <th className="border p-2">Amount (in INR)</th>
                    <th className="border p-2">Man Months</th>
                    <th className="border p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {modalInputs.map((input, index) => (
                    <tr key={index}>
                      <td className="border p-2">{input.name}</td>
                      <td className="border p-2">
                        <input
                          type="number"
                          className="border p-1 w-full"
                          name={"value"}
                          value={input.value}
                          onChange={(e) => handleModalInputChange(index, e)}
                        />
                      </td>
                      <td className="border p-2"> <input
                          type="number"
                          className="border p-1 w-full"
                          name={"months"}
                          value={input.months}
                          onChange={(e) => handleModalInputChange(index, e)}
                        /></td>
                      <td className="border p-2">{input.value * input.months}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border p-2 font-semibold" colSpan="3">
                      Grand Total
                    </td>
                    <td className="border p-2 font-semibold">{calculateTotal()}</td>
                  </tr>
                </tbody>
              </table>
              <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-md w-full" onClick={closeModal}>
                Save & Close
              </button>
            </div>
          </div>
        )}


        <div className="border rounded-md p-4 mb-6">
          <h3 className="font-semibold mb-2">Salary Breakup, RTGS Details, and Undertaking</h3>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md mb-4" onClick={() => setShowBreakup(!showBreakup)}>Add Salary Breakup</button>
          {showBreakup&& (
           <div className="border rounded-md p-4 mb-6">
              <h3 className="font-semibold mb-2">Salary Breakup</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-gray-200">
                <th className="border p-2">Designation</th>
                {yearColumns.map((y, i) => (
                  <th key={i} className="border p-2">{y.year} ({y.months} months)</th>
                ))}
                <th className="border p-2">Delete</th>
              </tr>
                </thead>
                <tbody>
                {salaryRows.map((row, index) => (
                <tr key={index} className="border">
                  <td className="border p-2">
                    <input type="text" className="border p-1 w-full" value={row.designation} onChange={(e) => {
                      const newRows = [...salaryRows];
                      newRows[index].designation = e.target.value;
                      setSalaryRows(newRows);
                    }} />
                  </td>
                  {yearColumns.map((y, i) => (
                    <td key={i} className="border p-2 cursor-pointer text-blue-600 underline" onClick={() => openModal(row.designation, y.year, row[y.year], index)}>
                      {row[y.year]}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    <button className="bg-red-500 text-white px-3 py-1 rounded-md" onClick={() => {
                      setSalaryRows(salaryRows.filter((_, i) => i !== index));
                    }}>✖</button>
                  </td>
                </tr>
              ))}
                </tbody>
              </table>
              <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md" onClick={addRow}>Add Rows</button>
            </div>
          )}
          <div className="border rounded-md p-4 mb-4">
            <h3 className="font-semibold mb-2">RTGS Details</h3>
            <input
              type="text"
              placeholder="Account Holder Name"
              className="w-full p-2 border rounded-md mb-2"
              value={bank.name}
              onChange={handleInputChange} />
            <input
              type="text"
              placeholder="Account Number"
              className="w-full p-2 border rounded-md mb-2"
              value={bank.number}
              onChange={handleInputChange} />
            <input type="text" placeholder="Bank Name" className="w-full p-2 border rounded-md mb-2"
              value={bank.bankName} 
              onChange={handleInputChange} />
            <input type="text" placeholder="Branch Name & Address" className="w-full p-2 border rounded-md mb-2"
              value={bank.address} 
              onChange={handleInputChange} />
            <input type="text" placeholder="IFSC Code" className="w-full p-2 border rounded-md mb-2"
              value={bank.Ifsc} 
              onChange={handleInputChange} />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md">Preview</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Send for Approval</button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;
