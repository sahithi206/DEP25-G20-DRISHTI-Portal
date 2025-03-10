import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen text-center">
      <h1 className="text-4xl font-bold text-red-500">Error</h1>
      <p className="text-lg">Multiple tabs are not allowed.</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => navigate("/")}
      >
        Go Back to Home
      </button>
    </div>
  );
};

export default NotFound;
