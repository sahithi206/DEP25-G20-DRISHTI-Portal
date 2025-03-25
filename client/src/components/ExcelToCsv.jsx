import React, { useState } from "react";
import * as XLSX from "xlsx";

const ExcelToCSV = ({ onConvert }) => {
  const [file, setFile] = useState(null);

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

  return (
    <div className="p-4">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={convertToCSV}
        disabled={!file}
      >
        Convert to CSV
      </button>
    </div>
  );
};

export default ExcelToCSV;
