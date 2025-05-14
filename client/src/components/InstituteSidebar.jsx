import React, { useContext, useEffect, useState } from "react";
import {
  Home,
  Users,
  ClipboardList,
  ChevronDown,
  Folder,
  User,
  Target, // Using Lucide-react Target instead of FaBullseye for consistency
} from "lucide-react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../pages/Context/Authcontext";

const SidebarMenu = ({ activeSection, setActiveSection }) => {
  const { getInstUser } = useContext(AuthContext);
  const [instituteUser, setInstituteUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchInstituteUserDetails = async () => {
      try {
        const data = await getInstUser();
        setInstituteUser(data);
      } catch (error) {
        console.error("Error fetching institute user:", error);
      }
    };

    fetchInstituteUserDetails();
  }, [getInstUser]);

  if (!instituteUser) {
    return (
      <div className="bg-gray-900 text-white p-5 h-full sticky top-0">
        <h2 className="text-2xl font-bold mb-6">Institute Panel</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const menuItems = [
    { label: "Dashboard", icon: Home, id: "dashboard", path: "/institute-dashboard" },
    { label: "Institute Users", icon: Users, id: "users", path: "/institute-users" },
    { label: "Projects", icon: Folder, id: "sanctioned-projects", path: "/sanctioned-projects" },
  ];

  if (instituteUser.role === "Head of Institute") {
    menuItems.push({
      label: "Requests",
      icon: ClipboardList,
      id: "requests",
      path: "/institute/requests",
    });
  }

  let reportItems = [];

  if (instituteUser.role === "Head of Institute") {
    reportItems = [
      { label: "UC", id: "uc", path: "/institute/uc" },
      { label: "SE", id: "se", path: "/institute/se" },
    ];
  } else if (instituteUser.role === "CFO") {
    reportItems = [{ label: "UC", id: "uc", path: "/institute/uc" }];
  } else if (instituteUser.role === "Accounts Officer") {
    reportItems = [{ label: "SE", id: "se", path: "/institute/se" }];
  }

  if (reportItems.length > 0) {
    menuItems.push({
      label: "Reports",
      icon: Target, // Using Lucide-react's Target instead of FaBullseye
      id: "reports",
      children: reportItems,
    });
  }

  menuItems.push({ label: "Profile", icon: User, id: "profile", path: "/institute/profile" })

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col sticky top-0 min-h-screen overflow-y-auto transition-all duration-300 ${isSidebarOpen ? "w-72" : "w-16"}`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        {isSidebarOpen && <h2 className="text-xl font-bold">Institute Panel</h2>}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-xl focus:outline-none"
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <ul className="p-4 space-y-2">
        {menuItems.map(({ label, icon: Icon, id, path, children }) => (
          <li key={id}>
            {children ? (
              <>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${openDropdown === id || activeSection === id
                    ? "bg-gray-800 text-blue-400"
                    : "hover:bg-gray-700"
                    }`}
                  onClick={() =>
                    setOpenDropdown(openDropdown === id ? null : id)
                  }
                >
                  <div className="flex items-center">
                    {/* Always render the icon, centered when collapsed */}
                    <div className={isSidebarOpen ? "mr-3" : "mx-auto"}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSidebarOpen && <span>{label}</span>}
                  </div>
                  {isSidebarOpen && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${openDropdown === id ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </div>
                {openDropdown === id && isSidebarOpen && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {children.map(({ label, id: subId, path: subPath }) => (
                      <li key={subId}>
                        <Link
                          to={subPath}
                          className={`block px-3 py-2 rounded-md text-sm transition-all ${activeSection === subId
                            ? "bg-gray-700 text-blue-400"
                            : "hover:bg-gray-700"
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
                className={`flex items-center p-3 rounded-lg transition-all ${activeSection === id
                  ? "bg-gray-800 text-blue-400 border-l-4 border-blue-400"
                  : "hover:bg-gray-700"
                  }`}
                onClick={() => setActiveSection(id)}
              >
                {/* Center the icon when sidebar is collapsed */}
                <div className={isSidebarOpen ? "mr-3" : "mx-auto"}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSidebarOpen && <span>{label}</span>}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;