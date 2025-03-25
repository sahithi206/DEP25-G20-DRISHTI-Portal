import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaMoneyBillWave, FaUser } from "react-icons/fa";
import { MdRequestPage } from "react-icons/md";

const SidebarMenu = [
    {        title: "Proposal Submission",
        icon: <IoDocumentTextOutline className='inline-block mr-2' />,
        dropdown: [
            { name: "Form Submission", path: "/formsubmission" },

        ],
    },
    {
        title: "Projects",
        icon: <FaMoneyBillWave className='inline-block mr-2' />,
        dropdown: [
            { name: "Submitted Proposals", path: "/proposalinbox" },
            { name: "Accepted Proposals", path: "/savedproposals" },
            { name: "Sanctioned Projects", path: "/sanctionedproposals" }
        ],
    },
    {
        title: "Requests",
        icon: <MdRequestPage className='inline-block mr-2' />,
        dropdown: [
            { name: "Request for Change Of Institute ", path: "/changeofinstitute" },
            { name: "Miscellaneous Request", path: "/misc-request" }
        ],
    },
    {
        title: "User Profile",
        icon: <FaUser className='inline-block mr-2' />,
        dropdown: [
            { name: "View Profile", path: "/view-profile" },
            { name: "Edit Profile", path: "/edit-profile" },
            { name: "Change Password", path: "/change-password" },
        ],
    }
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const navigate = useNavigate();

    return (
        <div className={`h-screen bg-gray-900 text-white fixed transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"} overflow-y-auto`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                {isSidebarOpen && <h1 className="text-lg font-bold cursor-pointer" onClick={() => navigate("/menupage")}>ANRFOnline Home</h1>}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-xl">
                    {isSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Sidebar Menu */}
            <ul className="mt-4">
                {SidebarMenu.map((menu, index) => (
                    <li key={index} className="px-4 py-2 hover:bg-gray-800 cursor-pointer">
                        <div
                            className="flex items-center justify-between"
                            onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                        >
                            <span className="flex items-center">
                                {menu.icon} {isSidebarOpen && menu.title}
                            </span>
                            {menu.dropdown.length > 0 && (
                                <IoMdArrowDropdown className={`transform transition-transform ${openDropdown === index ? "rotate-180" : ""}`} />
                            )}
                        </div>
                        {/* Dropdown Items */}
                        <div
                            className={`transition-all duration-300 overflow-hidden ${openDropdown === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <ul className="ml-6 mt-2 space-y-1">
                                {menu.dropdown.map((item, subIndex) => (
                                    <li key={subIndex} className="text-sm px-2 py-1 bg-gray-800 rounded hover:bg-gray-700">
                                        <Link to={item.path} className="block w-full h-full">{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
