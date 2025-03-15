import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar"; 
import Footer from "../../components/Footer";

const InstituteUsers = () => {
  const [users, setUsers] = useState([]);
  const [institute, setInstitute] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/institute/users?institute=${institute}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Users in Your Institute</h1>
        <input
          type="text"
          placeholder="Enter Institute Name"
          value={institute}
          onChange={(e) => setInstitute(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <button
          onClick={fetchUsers}
          className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Enter"}
        </button>
        {users.length > 0 ? (
          <table className="w-full border text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">User Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Department</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border">
                  <td className="border p-2">
                    <Link to={`/institute/user-proposals/${user._id}`} className="text-blue-500 hover:underline">
                      {user.Name}
                    </Link>
                  </td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.Dept}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No users found in your institute.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default InstituteUsers;