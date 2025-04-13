import { useState } from "react";
import PropTypes from "prop-types";

const Filters = ({ onSearch, onDateChange, onSchemeChange, schemes }) => {
  const [selectedScheme, setSelectedScheme] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleSearch = () => {
    onSearch(searchText);
    onSchemeChange(selectedScheme);
    onDateChange(selectedDate);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-between">
      <input
        type="text"
        placeholder="Search Proposal ID or Scheme"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-64 px-3 py-2 border rounded shadow-sm"
      />

      <select
        value={selectedScheme}
        onChange={(e) => setSelectedScheme(e.target.value)}
        className="w-64 px-3 py-2 border rounded shadow-sm"
      >
        <option value="">All Schemes</option>
        {schemes&&schemes.map((scheme) => (
          <option key={scheme} value={scheme}>
            {scheme}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="px-3 py-2 border rounded shadow-sm"
      />

      <button
        onClick={handleSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm"
      >
        Apply Filters
      </button>
    </div>
  );
};
Filters.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onSchemeChange: PropTypes.func.isRequired,
  schemes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Filters;
