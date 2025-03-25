import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";

const ExcelToCSV = ({ onConvert }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const convertToCSV = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      onConvert(csvData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveFile = () => {
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset the file state
    setFile(null);
    
    // Clear the converted CSV data
    onConvert('');
  };

  return (
    <div className="p-4 flex items-center space-x-2">
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".xlsx, .xls" 
        onChange={handleFileUpload} 
        className="flex-grow"
      />
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={convertToCSV}
        disabled={!file}
      >
        Convert to CSV
      </button>
      {file && (
        <button
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleRemoveFile}
        >
          Remove
        </button>
      )}
    </div>
  );
};

export default ExcelToCSV;