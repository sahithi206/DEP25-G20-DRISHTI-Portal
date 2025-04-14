import { useState } from "react";
import { Home, Users, ClipboardList, FileText, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { FaBullseye, FaDochub, FaDollarSign, FaFolder } from "react-icons/fa";

const menuItems = [
  { label: "Dashboard", icon: Home, id: "dashboard", path: "/institute-dashboard" },
  { label: "Institute Users", icon: Users, id: "users", path: "/institute-users" },
  { label: "Ongoing Projects", icon:FaFolder, id: "sanctioned-projects", path: "/sanctioned-projects" },
  { label: "Requests", icon: ClipboardList, id: "requests", path: "/institute/requests" }
];

const dropdownItems = [
  { label: "UC", icon:DollarSign, id: "uc", path: "/institute/uc" },
  { label: "SE", icon: DollarSign, id: "se", path: "/institute/se" }
];

export default function SidebarMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-95% screen">
      {menuItems.map((item) => (
        <>
        <div className="mt-2">
        <Link
          to={item.path}
          key={item.id}
          className="flex items-center gap-4 px-4 py-2 rounded hover:bg-gray-200"
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Link>
        </div>
        </>
      ))}

      <div className="mt-2">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between w-full px-4 py-2 rounded hover:bg-gray-200"
        >
          <div className="flex items-center gap-4">
            <FaBullseye className="w-4 h-4" />
            Reports
          </div>
          <span>{dropdownOpen ? "▲" : "▼"}</span>
        </button>

        {dropdownOpen && (
          <div className="ml-6 mt-2 space-y-1">
            {dropdownItems.map((item) => (
              <Link
                to={item.path}
                key={item.id}
                className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-gray-200"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
