import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelToCSV = ({ onConvert }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

  const convertToCSV = () => {
    if (!selectedFile) {
      setError("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Required headers except for optional 'Date'
        const requiredHeaders = ['CommittedDate', 'Description', 'Amount', 'Type'];
        const optionalHeader = 'Date';
        const allExpectedHeaders = [...requiredHeaders, optionalHeader];

        const headers = Object.keys(jsonData[0] || {});
        const missingHeaders = requiredHeaders.filter(header =>
          !headers.some(h => h.toLowerCase() === header.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          setError(`Missing required columns: ${missingHeaders.join(', ')}.`);
          setLoading(false);
          return;
        }

        // Utility to get matching header from Excel
        const getHeader = (target) =>
          headers.find(h => h.toLowerCase() === target.toLowerCase());

        const hDate = getHeader('Date');
        const hCommittedDate = getHeader('CommittedDate');
        const hDescription = getHeader('Description');
        const hAmount = getHeader('Amount');
        const hType = getHeader('Type');

        const formatDate = (dateValue) => {
          if (!dateValue) return '';
          if (typeof dateValue === 'number') {
            const excelDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
            return excelDate.toISOString().split('T')[0];
          }
          if (typeof dateValue === 'string') {
            const dateObj = new Date(dateValue);
            if (!isNaN(dateObj.getTime())) {
              return dateObj.toISOString().split('T')[0];
            }
          }
          return '';
        };

        const formattedData = [];
        const rowErrors = [];

        jsonData.forEach((row, index) => {
          const committedDate = formatDate(row[hCommittedDate]);
          const description = row[hDescription]?.toString().trim();
          const amount = parseFloat(row[hAmount]);
          const type = row[hType]?.toString().toLowerCase().trim();
          const date = formatDate(row[hDate]);

          if (!committedDate || !description || isNaN(amount) || !type) {
            rowErrors.push(`Row ${index + 2} is missing required fields.`);
            return;
          }

          formattedData.push({
            date,
            committedDate,
            description,
            amount: amount.toFixed(2),
            type,
          });
        });

        if (rowErrors.length > 0) {
          setError(`Errors found:\n${rowErrors.join('\n')}`);
          setLoading(false);
          return;
        }

        const csvHeaders = ['Date', 'CommittedDate', 'Description', 'Amount', 'Type'].join(',');
        const csvRows = formattedData.map(row =>
          [
            row.date,
            row.committedDate,
            `"${row.description.replace(/"/g, '""')}"`,
            row.amount,
            row.type
          ].join(',')
        );

        const csvString = [csvHeaders, ...csvRows].join('\n');

        onConvert(csvString);
        setSelectedFile(null);
        setError(null);
      } catch (error) {
        console.error("Error converting file:", error);
        setError("Failed to convert Excel file. Please check the format and try again.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
      setLoading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".xlsx,.xls"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={convertToCSV}
        disabled={!selectedFile || loading}
        className={`px-4 py-2 rounded font-medium text-white w-full ${!selectedFile || loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
          }`}
      >
        {loading ? "Converting..." : "Convert Excel to CSV"}
      </button>

      {error && (
        <pre className="text-red-500 mt-2 whitespace-pre-wrap text-sm">{error}</pre>
      )}
    </div>
  );
};

export default ExcelToCSV;
