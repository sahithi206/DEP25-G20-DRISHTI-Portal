import React, { useContext, useEffect, useState } from "react";
import { Home, Users, ClipboardList, DollarSign, FileText, ChevronDown, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { FaBullseye } from "react-icons/fa";
import { AuthContext } from "../pages/Context/Authcontext";

const SidebarMenu = ({ activeSection, setActiveSection }) => {
  const { getInstUser } = useContext(AuthContext);
  const [instituteUser, setInstituteUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const fetchInstituteUserDetails = async () => {
      try {
        const data = await getInstUser();
        // console.log("SIDEBAR DATA:", data);
        setInstituteUser(data);
      } catch (error) {
        console.error("Error fetching institute user:", error);
      }
    };

    fetchInstituteUserDetails();
  }, [getInstUser]);

  if (!instituteUser) {
    return (
      <div className="w-72 bg-gray-900 text-white flex flex-col p-5 h-full sticky top-0">
        <h2 className="text-2xl font-bold mb-6">Institute Panel</h2>
        <p>Loading...</p>
      </div>
    );
  }

  // Define base menu items
  const menuItems = [
    { label: "Dashboard", icon: Home, id: "dashboard", path: "/institute-dashboard" },
  ];

  // Add additional menu items based on role
  if (instituteUser.role === "Head of Institute") {
    menuItems.push({
      label: "Institute Users",
      icon: Users,
      id: "users",
      path: "/institute-users"
    });

    menuItems.push({
      label: "Ongoing Projects",
      icon: Folder,
      id: "sanctioned-projects",
      path: "/sanctioned-projects"
    });

    menuItems.push({
      label: "Requests",
      icon: ClipboardList,
      id: "requests",
      path: "/institute/requests"
    });
  }

  // Define reports based on role
  let reportItems = [];

  if (instituteUser.role === "Head of Institute") {
    // Head of Institute can see all reports
    reportItems = [
      { label: "UC", id: "uc", path: "/institute/uc" },
      { label: "SE", id: "se", path: "/institute/se" },
      { label: "Progress Report", id: "progress", path: "/institute/progress-report" }
    ];
  } else if (instituteUser.role === "CFO") {
    // CFO can only see UC
    reportItems = [
      { label: "UC", id: "uc", path: "/institute/uc" }
    ];
  } else if (instituteUser.role === "Accounts Officer") {
    // Accounts Officer can only see SE
    reportItems = [
      { label: "SE", id: "se", path: "/institute/se" }
    ];
  }

  // Add Reports dropdown if there are any report items for the role
  if (reportItems.length > 0) {
    menuItems.push({
      label: "Reports",
      icon: FaBullseye,
      id: "reports",
      children: reportItems
    });
  }

  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-screen sticky top-0 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Institute Panel</h2>
      <ul className="space-y-2 pb-6">
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
                    {typeof Icon === 'function' ? (
                      <Icon className="w-5 h-5 mr-3" />
                    ) : (
                      <Icon className="w-5 h-5 mr-3" />
                    )}
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
                {typeof Icon === 'function' ? (
                  <Icon className="w-5 h-5 mr-3" />
                ) : (
                  <Icon className="w-5 h-5 mr-3" />
                )}
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;