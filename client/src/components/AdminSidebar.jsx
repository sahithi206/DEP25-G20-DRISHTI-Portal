import React, { useContext, useEffect, useState } from "react";
import { Home, ClipboardList, Users, DollarSign, CheckCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../pages/Context/Authcontext";

const AdminSidebar = ({ activeSection, setActiveSection }) => {
    const { getAdmin } = useContext(AuthContext);
    const [admin, setAdmin] = useState(null);

    // Fetch admin data once when the component mounts
    useEffect(() => {
        const fetchAdminDetails = async () => {
            try {
                const data = await getAdmin();
                console.log("Resolved Admin Data:", data);
                setAdmin(data);
            } catch (error) {
                console.error("Error fetching admin:", error);
            }
        };

        fetchAdminDetails();
    }, [getAdmin]);

    // If admin data is not available yet, return a loading indicator
    if (!admin) {
        return (
            <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-screen">
                <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
                <p>Loading...</p>
            </div>
        );
    }

    // Define the sidebar menu items
    const menuItems = [
        { label: "Dashboard", icon: Home, id: "dashboard", path: "/" },
        { label: "Quotations/SE/UC Grants", icon: DollarSign, id: "grants", path: "/grants" },
        { label: "Fund Cycle Approval", icon: CheckCircle, id: "fundCycle", path: "/fundCycle" },
        { label: "Requests", icon: FileText, id: "requests", path: "/requests" }
    ];

    // If the admin has the role "Head Coordinator", add the "Scheme Management" menu item
    if (admin.role === "Head Coordinator") {
        menuItems.splice(1, 0, { label: "Scheme Management", icon: ClipboardList, id: "schemes", path: "/schemes" });
    }

    // Only show "Proposal Approvals" if the admin is a "Coordinator"
    if (admin.role === "Coordinator") {
        menuItems.splice(1, 0, { label: "Proposal Approvals", icon: Users, id: "approvals", path: "/review-proposals" });
    }

    return (
        <div className="w-72 bg-gray-900 text-white flex flex-col p-5 h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
            <ul className="space-y-2">
                {menuItems.map(({ label, icon: Icon, id, path }) => (
                    <li key={id} role="button">
                        <Link
                            to={path}
                            className={`p-3 flex items-center cursor-pointer rounded-lg transition-all hover:bg-gray-700
                            ${activeSection === id ? "bg-gray-700 text-blue-400 border-l-4 border-blue-400" : ""}`}
                            onClick={() => setActiveSection(id)}
                        >
                            <Icon className="w-5 h-5 mr-3" /> {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminSidebar;
