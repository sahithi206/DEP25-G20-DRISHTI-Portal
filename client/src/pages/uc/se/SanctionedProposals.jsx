import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../utils/Sidebar";
import HomeNavbar from "../../../utils/HomeNavbar";
import { AuthContext } from "../../Context/Authcontext";
const SanctionedProposals = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { approvedProjects } = useContext(AuthContext);
    const [acceptedProjects, setProjects] = useState();
    useEffect(() => {
        const projects = async () => {
            const proj = await approvedProjects();
            const Projects = await proj.map((project) => {
                let id = project.proposalId;
                let title = project.researchDetails.Title;
                return { id, title };
            })
            setProjects(Projects);
        }
        projects();
    }, [])

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen text-gray-900">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />
                <div className="p-6 space-y-6 mt-16">
                    <div className="p-6 space-y-6">
                        <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700">
                            <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                            <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
                            <p className="mt-3 text-2xl font-bold text-blue-800">Sanctioned Projects</p>
                        </div>
                        <div className="bg-white shadow-md rounded-xl overflow-hidden">

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-700 text-white">
                                        <tr>
                                            <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">File No.</th>
                                            <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Project Title</th>
                                            <th className="p-4 text-center font-semibold text-xs border-b border-blue-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {acceptedProjects && acceptedProjects.length > 0 ? (
                                            acceptedProjects.map((project) => (
                                                <tr key={project.id} className="group hover:bg-blue-50 transition-colors border-b last:border-b-0">
                                                    <td className="p-4 text-center font-semibold text-xs">{project.id}</td>
                                                    <td className="p-4 text-center font-semibold text-xs">{project.title}</td>
                                                    <td className="p-4 text-center font-semibold text-xs">
                                                        <button
                                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                            onClick={() => {
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
                                                <td className="p-4 text-center font-semibold text-xs border-b border-blue-200" colSpan="4">
                                                    No Sanctioned Projects
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SanctionedProposals;
