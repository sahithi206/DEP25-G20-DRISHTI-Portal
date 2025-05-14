import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../Context/Authcontext"; 
import InstituteSidebar from "../../components/InstituteSidebar";
import Navbar from "../../components/Navbar"; 
import { toast } from "react-toastify";
const UserProposalsInsti = () => {
  const { userId } = useParams();
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const { userInstiAcceptedProposals } = useContext(AuthContext); 
  useEffect(() => {
    const fetchProposals = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("Use a valid Token");
        toast.error("Authentication required.");
        return;
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}institute/${userId}/accepted-proposals`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "accessToken": ` ${token}`,
          },
        });
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        const data = await response.json();
        setProposals(data.projects);
        setFilteredProposals(data.projects);
      } catch (e) {
        console.log(e);
      }
    };

    fetchProposals();
  }, [userId]);

  useEffect(() => {
    let filtered = proposals;

    if (statusFilter) {
      filtered = filtered.filter((proposal) => proposal.status === statusFilter);
    }else {
      filtered = proposals;
    }

    if (searchTitle) {
      filtered = filtered.filter((proposal) =>
        proposal.Title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    setFilteredProposals(filtered);
  }, [statusFilter, searchTitle, proposals]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar yes={1} />
      <div className="flex flex-grow">
        <InstituteSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">
          <h1 className="text-4xl font-bold mb-4 text-center">Projects</h1>
          <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden p-4">
            <div className="flex justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Search by Title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="flex-grow border border-gray-300 rounded-md px-4 py-2"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                <option value="">All Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Approved">Approved</option>
              </select>
            </div>

            {filteredProposals&&filteredProposals.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Project ID</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProposals.map((proposal) => (
                    <tr key={proposal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <Link to={`/institute/project-dashboard/${proposal._id}`} className="text-blue-500 hover:underline">
                          {proposal._id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{proposal?.Title || "No Title"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{proposal?.status || "Ongoing"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center">No Projects found for this user.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProposalsInsti;