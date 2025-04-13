import { useState } from "react";
import { Home, Users, ClipboardList, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", icon: Home, id: "dashboard", path: "/institute-dashboard" },
  { label: "Institute Users", icon: Users, id: "users", path: "/institute-users" },
  { label: "Sanctioned Projects", icon: ClipboardList, id: "sanctioned-projects", path: "/sanctioned-projects" },
  { label: "Requests", icon: FileText, id: "requests", path: "/institute/requests" }
];

const dropdownItems = [
  { label: "UC", icon: ClipboardList, id: "uc", path: "/institute/uc" },
  { label: "SE", icon: ClipboardList, id: "se", path: "/institute/se" }
];

export default function SidebarMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-95% screen">
      {menuItems.map((item) => (
        <Link
          to={item.path}
          key={item.id}
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-200"
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Link>
      ))}

      <div className="mt-4">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between w-full px-4 py-2 rounded hover:bg-gray-200"
        >
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
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
