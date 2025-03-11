import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import { AuthContext } from "./Context/Authcontext";
import HomeNavbar from '../utils/HomeNavbar'
const SavedProposals = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { approvedProjects } = useContext(AuthContext);
    const [acceptedProjects, setProjects] = useState();

    const [id, setID] = useState();
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const proj = await approvedProjects();
                if (proj) {
                    const Projects = proj.map((project) => ({
                        id: project.proposalId,
                        title: project.researchDetails.Title
                    }));
                    setProjects(Projects);
                }
            } catch (error) {
                console.error("Error fetching approved projects:", error);
            }
        };
        fetchProjects();
    }, [approvedProjects]);
    

    return (
        <div className="flex min-h-screen">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar />

                <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Accepted Proposals </p>
                    </div>
                    <div className="mt-4">
                        <table className="w-full border border-gray-300 shadow-md">
                            <thead className="bg-blue-800 text-white">
                                <tr>
                                    <th className="p-2 border border-gray-300 text-center">File No.</th>
                                    <th className="p-2 border border-gray-300 text-center">Project Title</th>
                                    <th className="p-2 border border-gray-300 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {acceptedProjects && acceptedProjects.length > 0 ? (
                                    acceptedProjects.map((project) => (
                                        <tr key={project.id} className="bg-gray-100 hover:bg-gray-200 cursor-pointer">
                                            <td className="p-2 border border-gray-300 text-center">{project.id}</td>
                                            <td className="p-2 border border-gray-300 text-center">{project.title}</td>
                                            <td className="p-2 border border-gray-300 text-center">
                                                <button
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                    onClick={() => {
                                                        setID(project.id);
                                                        navigate(`/project-dashboard/${project.id}`);
                                                    }}
                                                >
                                                    View Dashboard
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="bg-gray-100">
                                        <td className="p-2 border border-gray-300 text-center" colSpan="4">
                                            No Accepted Projects
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedProposals;
