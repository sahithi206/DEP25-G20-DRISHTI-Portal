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
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Expected column headers in correct order
        const expectedHeaders = ['Date', 'CommittedDate', 'Description', 'Amount', 'Type'];
        
        // Check if all required headers exist (case-insensitive)
        const headers = Object.keys(jsonData[0] || {});
        const missingHeaders = expectedHeaders.filter(header => 
          !headers.some(h => h.toLowerCase() === header.toLowerCase())
        );
        
        if (missingHeaders.length > 0) {
          setError(`Missing required columns: ${missingHeaders.join(', ')}. Please ensure your Excel file has these columns.`);
          setLoading(false);
          return;
        }
        
        // Map to our expected format
        const formattedData = jsonData.map(row => {
          // Find the actual header names in the file (case-insensitive)
          const dateHeader = headers.find(h => h.toLowerCase() === 'date');
          const committedDateHeader = headers.find(h => h.toLowerCase() === 'committeddate');
          const descriptionHeader = headers.find(h => h.toLowerCase() === 'description');
          const amountHeader = headers.find(h => h.toLowerCase() === 'amount');
          const typeHeader = headers.find(h => h.toLowerCase() === 'type');
          
          // Extract and format the data
          const date = row[dateHeader];
          const committedDate = row[committedDateHeader];
          const description = row[descriptionHeader];
          const amount = row[amountHeader];
          const type = row[typeHeader];
          
          // Format dates properly
          const formatDate = (dateValue) => {
            if (!dateValue) return '';
            // Handle Excel serial dates
            if (typeof dateValue === 'number') {
              const excelDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
              return excelDate.toISOString().split('T')[0];
            }
            // Handle string dates
            if (typeof dateValue === 'string') {
              const parts = dateValue.split(/[-\/]/);
              if (parts.length === 3) {
                // Try to parse as YYYY-MM-DD or MM/DD/YYYY
                const dateObj = new Date(dateValue);
                if (!isNaN(dateObj.getTime())) {
                  return dateObj.toISOString().split('T')[0];
                }
              }
            }
            return dateValue.toString();
          };
          
          // Build the CSV row with proper ordered columns
          return {
            date: formatDate(date),
            committedDate: formatDate(committedDate),
            description: description?.toString() || '',
            amount: amount?.toString() || '0',
            type: type?.toString().toLowerCase() || ''
          };
        });
        
        // Create CSV string with headers
        const csvHeaders = expectedHeaders.join(',');
        const csvRows = formattedData.map(row => {
          return [
            row.date,
            row.committedDate,
            `"${row.description.replace(/"/g, '""')}"`, // Escape quotes in description
            row.amount,
            row.type
          ].join(',');
        });
        
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
        className={`px-4 py-2 rounded font-medium text-white w-full ${
          !selectedFile || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Converting..." : "Convert Excel to CSV"}
      </button>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ExcelToCSV;