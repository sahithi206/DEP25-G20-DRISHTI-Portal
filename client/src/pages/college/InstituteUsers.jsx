// This file is for managing institute users, including adding, editing, and viewing user details.

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { AuthContext } from "../Context/Authcontext";
import InstituteSidebar from "../../components/InstituteSidebar";
import { toast } from "react-toastify";
const InstituteUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchInstituteUsers } = useContext(AuthContext);
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersData = await fetchInstituteUsers();
        if (usersData) {
          setUsers(usersData);
          setFilteredUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [fetchInstituteUsers]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.Name.toLowerCase().includes(searchTerm.toLowerCase())||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())||
    user.Dept.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar yes={1}/>
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Users in Your Institute</h1>
          <div className="flex items-center justify-between mb-4 gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search projects by title, PI name, or scheme..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    role="img"
                    aria-label="Search icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-40 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
              </div>
            ) : filteredUsers?.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200 border border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">User Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500 hover:underline">
                        <Link to={`/institute/user-proposals/${user._id}`} className="hover:underline">
                          {user.Name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.Dept}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No users found in your institute.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InstituteUsers;