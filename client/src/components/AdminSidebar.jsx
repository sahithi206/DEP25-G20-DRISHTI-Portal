import React, { useContext, useEffect, useState } from "react";
import { Home, ClipboardList, Users, Folder, DollarSign, CheckCircle, FileText, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../pages/Context/Authcontext";

const AdminSidebar = ({ activeSection, setActiveSection }) => {
    const { getAdmin } = useContext(AuthContext);
    const [admin, setAdmin] = useState(() => {
        // Try to get from sessionStorage first
        const savedAdmin = sessionStorage.getItem("adminData");
        return savedAdmin ? JSON.parse(savedAdmin) : null;
    });
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isLoading, setIsLoading] = useState(!admin);
    const location = useLocation();

    useEffect(() => {
        const fetchAdminDetails = async () => {
            // Only fetch if admin data is not already in state
            if (!admin) {
                setIsLoading(true);
                try {
                    const data = await getAdmin();
                    setAdmin(data);
                    // Store in sessionStorage for persistence
                    sessionStorage.setItem("adminData", JSON.stringify(data));
                } catch (error) {
                    console.error("Error fetching admin:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchAdminDetails();
    }, [getAdmin, admin]); // Only depends on these values

    // Update active section based on location
    useEffect(() => {
        const path = location.pathname;

        // Map path to section ID
        if (path === "/admin") {
            setActiveSection("dashboard");
        } else if (path.includes("/schemes")) {
            setActiveSection("schemes");
        } else if (path.includes("/review-proposals")) {
            setActiveSection("approvals");
        } else if (path.includes("/admin/sanction-projects")) {
            setActiveSection("sanction");
        } else if (path.includes("/admin/ongoing-projects")) {
            setActiveSection("ongoing");
        } else if (path.includes("/admin/completed-projects")) {
            setActiveSection("completed");
        } else if (path.includes("/admin/quotations")) {
            setActiveSection("quotations");
        } else if (path.includes("/admin/uc_se")) {
            setActiveSection("uc");
        } else if (path.includes("/admin/progress-report")) {
            setActiveSection("progress");
        } else if (path.includes("/admin/budgetalloc")) {
            setActiveSection("budget");
        } else if (path.includes("/requests/change-institute")) {
            setActiveSection("changeInstitute");
        } else if (path.includes("/requests/miscellaneous")) {
            setActiveSection("miscRequest");
        }

        // Find parent category for automatic dropdown opening
        if (path.includes("/review-proposals") ||
            path.includes("/admin/sanction-projects") ||
            path.includes("/admin/ongoing-projects") ||
            path.includes("/admin/completed-projects")) {
            setOpenDropdown("projects");
        } else if (path.includes("/admin/quotations") ||
            path.includes("/admin/uc_se") ||
            path.includes("/admin/progress-report")) {
            setOpenDropdown("grants");
        } else if (path.includes("/requests/")) {
            setOpenDropdown("requests");
        }
    }, [location, setActiveSection]);

    if (isLoading) {
        return (
            <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    const menuItems = [
        { label: "Dashboard", icon: Home, id: "dashboard", path: "/admin" },
    ];

    if (admin?.role === "Head Coordinator") {
        let requests = {
            label: "Requests",
            icon: FileText,
            id: "requests",
            children: [
                { label: "Change of Institute", id: "changeInstitute", path: "/requests/change-institute" },
                { label: "Miscellaneous Request", id: "miscRequest", path: "/requests/miscellaneous" }
            ]
        };
        menuItems.splice(1, 0, {
            label: "Scheme Management",
            icon: ClipboardList,
            id: "schemes",
            path: "/schemes"
        });
        menuItems.splice(2, 0, requests);

    }

    if (admin?.role === "Coordinator") {
        const projectSubMenu = {
            label: "Projects",
            icon: Folder,
            id: "projects",
            children: [
                { label: "Approve Proposals", id: "approvals", path: "/review-proposals" },
                { label: "Sanction Projects", id: "sanction", path: "/admin/sanction-projects" },
                { label: "Ongoing Projects", id: "ongoing", path: "/admin/ongoing-projects" },
                { label: "Completed Projects", id: "completed", path: "/admin/completed-projects" },
            ]
        };

        const quotations = {
            label: "Yearly Reports",
            icon: DollarSign,
            id: "grants",
            children: [
                { label: "Quotations", id: "quotations", path: "/admin/quotations" },
                { label: "UC/SE", id: "uc", path: "/admin/uc_se" },
                { label: "Progress Report", id: "progress", path: "/admin/progress-report" },

            ]
        };

        menuItems.splice(1, 0, projectSubMenu);
        menuItems.splice(2, 0, quotations);
        menuItems.splice(4, 0, {
            label: "Budget Allocation",
            icon: ClipboardList,
            id: "budget",
            path: "/admin/budgetalloc"
        });
    }

    return (
        <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-screen sticky top-0 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6"></h2>
            <ul className="space-y-2">
                {menuItems.map(({ label, icon: Icon, id, path, children }) => (
                    <li key={id}>
                        {children ? (
                            <>
                                <div
                                    className={`p-3 flex items-center justify-between cursor-pointer rounded-lg transition-all hover:bg-gray-700 ${openDropdown === id || activeSection === id
                                            ? "bg-gray-700 text-blue-400 border-l-4 border-blue-400"
                                            : ""
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