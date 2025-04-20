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
        console.log("SIDEBAR DATA:", data);
        setInstituteUser(data);
      } catch (error) {
        console.error("Error fetching institute user:", error);
      }
    };

    fetchInstituteUserDetails();
  }, [getInstUser]);

  if (!instituteUser) {
    return (
      <div className="w-72 bg-gray-900 text-white flex flex-col p-5 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Institute Panel</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const menuItems = [
    { label: "Dashboard", icon: Home, id: "dashboard", path: "/institute-dashboard" },
    { label: "Projects", icon: Folder, id: "sanctioned-projects", path: "/institute-users"}
  ];

  if (instituteUser.role === "Head of Institute") {
    menuItems.push({
      label: "Institute Users",
      icon: Users,
      id: "users",
      path: "/institute-users"
    });

   
    menuItems.push({
      label: "Requests",
      icon: ClipboardList,
      id: "requests",
      path: "/institute/requests"
    });
  }

  menuItems.push({
    label: "Reports",
    icon: FaBullseye,
    id: "reports",
    children: [
      { label: "UC", id: "uc", path: "/institute/uc" },
      { label: "SE", id: "se", path: "/institute/se" },
    ]
  });

  return (
    <div className="w-72 bg-gray-900 text-white flex flex-col p-5 h-screen overflow-y-auto">
    <ul className="space-y-2">
      {menuItems.map(({ label, icon: Icon, id, path, children }) => (
        <li key={id}>
          {children ? (
            <>
              <div
                className={`p-3 flex items-center justify-between cursor-pointer rounded-lg transition-all hover:bg-gray-700 ${
                  activeSection === id
                    ? "bg-gray-700 text-slate-400 border-l-4 border-slate-400"
                    : ""
                }`}
                onClick={() =>
                  setOpenDropdown(openDropdown === id ? null : id)
                }
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  {label}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transform transition-transform ${
                    openDropdown === id ? "rotate-180" : ""
                  }`}
                />
              </div>
              {openDropdown === id && (
                <ul className="ml-6 mt-1 space-y-1">
                  {children.map(({ label, id: subId, path: subPath }) => (
                    <li key={subId}>
                      <Link
                        to={subPath}
                        className={`p-2 block rounded-md hover:bg-gray-700 ${
                          activeSection === subId
                            ? "bg-gray-700 text-slate-400"
                            : ""
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
              className={`p-3 flex items-center cursor-pointer rounded-lg transition-all hover:bg-gray-700 ${
                activeSection === id
                  ? "bg-gray-700 text-slate-400 border-l-4 border-blue-400"
                  : ""
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

export default SidebarMenu;