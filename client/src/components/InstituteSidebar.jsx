import React from "react";
import { Home, ClipboardList, Users, DollarSign, CheckCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const InstituteSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { label: "Dashboard", icon: Home, id: "dashboard", path: "/institute-dashboard" },
    { label: "Accepted Projects", icon: ClipboardList, id: "projects", path: "/running-projects" },
    { label: "Institute Users", icon: Users, id: "users", path: "/institute-users" },
    { label: "Sanctioned Projects", icon: ClipboardList, id: "sanctioned-projects", path: "/sanctioned-projects" },
    // { label: "Proposals", icon: FileText, id: "proposals", path: "/user-proposals" },
    // { label: "Payments", icon: DollarSign, id: "payments", path: "/payments" },
    // { label: "Completed Projects", icon: CheckCircle, id: "completed-projects", path: "/completed-projects" },
];

  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-95% screen">
      <h2 className="text-2xl font-bold mb-6">Institute Panel</h2>
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

export default InstituteSidebar;