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
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : users.length > 0 ? (
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
      </div>
      <Footer />
    </div>
  );
};

export default InstituteUsers;