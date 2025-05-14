import React, { useContext, useEffect, useState } from "react";
import {
  Home,
  Users,
  ClipboardList,
  ChevronDown,
  Folder,
  User,
  Target,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { AuthContext } from "../pages/Context/Authcontext";

const SidebarMenu = ({ activeSection, setActiveSection }) => {
  const { getInstUser } = useContext(AuthContext);
  const [instituteUser, setInstituteUser] = useState(
    // Try to get from sessionStorage first
    JSON.parse(sessionStorage.getItem("instituteUser")) || null
  );
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(!instituteUser);
  const location = useLocation();

  // Handle responsive behavior
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-collapse sidebar on small screens
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fetch user data only if not already in sessionStorage
  useEffect(() => {
    const fetchInstituteUserDetails = async () => {
      if (!instituteUser) {
        setIsLoading(true);
        try {
          const data = await getInstUser();
          setInstituteUser(data);
          // Store in sessionStorage to persist between page navigations
          sessionStorage.setItem("instituteUser", JSON.stringify(data));
        } catch (error) {
          console.error("Error fetching institute user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInstituteUserDetails();
  }, [getInstUser, instituteUser]); // Only depends on these values

  // Update active section based on location
  useEffect(() => {
    const path = location.pathname;
    // Map path to section ID
    if (path.includes("institute-dashboard")) {
      setActiveSection("dashboard");
    } else if (path.includes("institute-users")) {
      setActiveSection("users");
    } else if (path.includes("sanctioned-projects")) {
      setActiveSection("sanctioned-projects");
    } else if (path.includes("institute/requests")) {
      setActiveSection("requests");
    } else if (path.includes("institute/uc")) {
      setActiveSection("uc");
    } else if (path.includes("institute/se")) {
      setActiveSection("se");
    } else if (path.includes("institute/profile")) {
      setActiveSection("profile");
    }

    // Close sidebar on navigation for mobile devices
    if (windowWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location, setActiveSection, windowWidth]);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Close any open dropdowns when collapsing sidebar
    if (isSidebarOpen) {
      setOpenDropdown(null);
    }
  };

  if (isLoading) {
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

  if (instituteUser?.role === "Head of Institute") {
    menuItems.push({
      label: "Requests",
      icon: ClipboardList,
      id: "requests",
      path: "/institute/requests",
    });
  }

  let reportItems = [];

  if (instituteUser?.role === "Head of Institute") {
    reportItems = [
      { label: "UC", id: "uc", path: "/institute/uc" },
      { label: "SE", id: "se", path: "/institute/se" },
    ];
  } else if (instituteUser?.role === "CFO") {
    reportItems = [{ label: "UC", id: "uc", path: "/institute/uc" }];
  } else if (instituteUser?.role === "Accounts Officer") {
    reportItems = [{ label: "SE", id: "se", path: "/institute/se" }];
  }

  if (reportItems.length > 0) {
    menuItems.push({
      label: "Reports",
      icon: Target,
      id: "reports",
      children: reportItems,
    });
  }

  menuItems.push({ label: "Profile", icon: User, id: "profile", path: "/institute/profile" });

  // Fixed sidebar width classes
  const sidebarWidthClass = isSidebarOpen ? "w-64 lg:w-72" : "w-16";

  return (
    <div
      className={`bg-gray-900 text-white flex flex-col sticky top-0 min-h-screen overflow-y-auto transition-all duration-300 ${sidebarWidthClass} z-10`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        {isSidebarOpen && (
          <h2 className="text-xl font-bold truncate">Institute Panel</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="text-xl focus:outline-none hover:text-blue-400 transition-colors"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
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
                  onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
                >
                  <div className="flex items-center">
                    <div className={isSidebarOpen ? "mr-3" : "mx-auto"}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSidebarOpen && <span className="truncate">{label}</span>}
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
                <div className={isSidebarOpen ? "mr-3" : "mx-auto"}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && windowWidth < 768 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default SidebarMenu;