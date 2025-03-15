import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar"; 
import Footer from "../../components/Footer";
import { AuthContext } from "../Context/Authcontext"; 

const UserProposalsInsti = () => {
  const { userId } = useParams();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInstiAcceptedProposals } = useContext(AuthContext); 

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const projects = await userInstiAcceptedProposals(userId);
        console.log("Fetched Proposals:", projects); // Debugging
        setProposals(projects || []); 
      } catch (error) {
        console.error("Error fetching proposals:", error);
        alert("Failed to fetch proposals");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [userInstiAcceptedProposals, userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Accepted Proposals</h1>
        {proposals.length > 0 ? (
          <table className="w-full border text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Project ID</th>
                <th className="border p-2">Title</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal._id} className="border">
                  <td className="border p-2">
                    <Link to={`/project-dashboard/${proposal._id}`} className="text-blue-500 hover:underline">
                      {proposal._id}
                    </Link>
                  </td>
                  <td className="border p-2">{proposal.researchDetails?.Title || "No Title"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No accepted proposals found for this user.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default UserProposalsInsti;