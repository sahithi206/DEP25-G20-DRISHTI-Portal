import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { AuthContext } from "../Context/Authcontext";
import InstituteSidebar from "../../components/InstituteSidebar";

const InstituteUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("users");
  const { fetchInstituteUsers } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersData = await fetchInstituteUsers();
        if (usersData) {
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [fetchInstituteUsers]);

  return (
    <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex flex-grow">
      <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Users in Your Institute</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
            </div>
          ) : users?.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs  text-gray-500 uppercase tracking-wider">User Name</th>
                  <th className="px-6 py-3 text-left text-xs  text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs  text-gray-500 uppercase tracking-wider">Department</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
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
            <div className="text-center py-8">
              <p className="text-gray-500">No users found in your institute.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  </div>
  
  );
};

export default InstituteUsers;