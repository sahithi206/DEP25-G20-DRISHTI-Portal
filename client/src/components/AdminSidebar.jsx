import React, { useContext, useEffect, useState } from "react";
import { Home, ClipboardList, Users, Folder,DollarSign, CheckCircle, FileText, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../pages/Context/Authcontext";

const AdminSidebar = ({ activeSection, setActiveSection }) => {
    const { getAdmin } = useContext(AuthContext);
    const [admin, setAdmin] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        const fetchAdminDetails = async () => {
            try {
                const data = await getAdmin();
                setAdmin(data);
            } catch (error) {
                console.error("Error fetching admin:", error);
            }
        };

        fetchAdminDetails();
    }, [getAdmin]);

    if (!admin) {
        return (
            <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-screen">
                <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
                <p>Loading...</p>
            </div>
        );
    }

    const menuItems = [
        { label: "Dashboard", icon: Home, id: "dashboard", path: "/admin" },
    ];

    if (admin.role === "Head Coordinator") {
        menuItems.splice(1, 0, {
            label: "Scheme Management",
            icon: ClipboardList,
            id: "schemes",
            path: "/schemes"
        });
    }

    if (admin.role === "Coordinator") {
        const projectSubMenu = {
            label: "Projects",
            icon: Folder,
            id: "projects",
            children: [
                { label: "Approve Proposals", id: "approvals", path: "/review-proposals" },
                { label: "Sanction Projects", id: "sanction", path: "/admin/sanction-projects" },
                { label: "Ongoing Projects", id: "ongoing", path: "/admin/ongoing-projects" }
            ]
        };

        const quotations = {
            label: "Yearly Reports",
            icon: DollarSign,
            id: "grants",
            children: [
                { label: "Quotations", id: "quotations", path: "/grants/quotations" },
                { label: "UC", id: "uc", path: "/grants/uc" },
                { label: "SE", id: "se", path: "/grants/se" },
                { label: "Progress Report", id: "progress", path: "/grants/progress-report" }
            ]
        };
        let requests = {
            label: "Requests",
            icon: FileText,
            id: "requests",
            children: [
                { label: "Change of Institute", id: "changeInstitute", path: "/requests/change-institute" },
                { label: "Miscellaneous Request", id: "miscRequest", path: "/requests/miscellaneous" }
            ]
        };
        menuItems.splice(1, 0, projectSubMenu);
        menuItems.splice(2, 0, quotations);
        menuItems.splice(3, 0, requests);

    }

    return (
        <div className="w-72 bg-gray-900 text-white flex flex-col p-5 h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            <ul className="space-y-2">
                {menuItems.map(({ label, icon: Icon, id, path, children }) => (
                    <li key={id}>
                        {children ? (
                            <>
                                <div
                                    className={`p-3 flex items-center justify-between cursor-pointer rounded-lg transition-all hover:bg-gray-700 ${activeSection === id ? "bg-gray-700 text-blue-400 border-l-4 border-blue-400" : ""
                                        }`}
                                    onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                                >
                                    <div className="flex items-center">
                                        <Icon className="w-5 h-5 mr-3" />
                                        {label}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transform transition-transform ${openDropdown === id ? "rotate-180" : ""}`} />
                                </div>
                                {openDropdown === id && (
                                    <ul className="ml-6 mt-1 space-y-1">
                                        {children.map(({ label, id: subId, path: subPath }) => (
                                            <li key={subId}>
                                                <Link
                                                    to={subPath}
                                                    className={`p-2 block rounded-md hover:bg-gray-700 ${activeSection === subId ? "bg-gray-700 text-blue-400" : ""
                                                        }`}
                                                    onClick={() => setActiveSection(subId)}
                                                >
                                                    {label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                            </>
                        ) : (
                            <Link
                                to={path}
                                className={`p-3 flex items-center cursor-pointer rounded-lg transition-all hover:bg-gray-700 ${activeSection === id ? "bg-gray-700 text-blue-400 border-l-4 border-blue-400" : ""
                                    }`}
                                onClick={() => setActiveSection(id)}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminSidebar;
