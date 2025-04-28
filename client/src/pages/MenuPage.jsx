import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaPowerOff, FaFlask, FaFileAlt, FaUsers, FaChartLine, FaCalendarAlt, FaBell } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";

const MenuPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Sample data for dashboard statistics
    const stats = [
        { title: "Active Projects", value: 3, icon: <FaFlask className="text-blue-600" size={24} /> },
        { title: "Pending Proposals", value: 2, icon: <FaFileAlt className="text-orange-500" size={24} /> },
        { title: "Team Members", value: 7, icon: <FaUsers className="text-green-600" size={24} /> },
        { title: "Publications", value: 12, icon: <FaChartLine className="text-purple-600" size={24} /> }
    ];

    // Sample recent activities
    const recentActivities = [
        { id: 1, title: "Grant proposal submitted", date: "April 25, 2025", status: "Pending Review" },
        { id: 2, title: "Team meeting", date: "April 22, 2025", status: "Completed" }
    ];

    // Sample upcoming events
    const upcomingEvents = [
        { id: 1, title: "Department Seminar", date: "May 3, 2025", time: "10:00 AM" },
        { id: 2, title: "Grant Deadline", date: "May 15, 2025", time: "11:59 PM" }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <HomeNavbar yes={0} isSidebarOpen={isSidebarOpen} />

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Principal Investigator Dashboard</h1>
                        <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">ResearchX Platform</span>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">PI Access</span>
                        </div>
                    </div>

                    {/* Profile Alert Banner */}
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <FaUserCircle className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700">
                                    Your profile is incomplete. Please update the following information before submitting proposals:
                                    <span className="font-medium"> Pin Code, Address, Biodata, Photo</span>
                                </p>
                            </div>
                            <div className="ml-auto">
                                <Link to="/update-profile" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition">
                                    Complete Profile
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-full">
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Activities */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-1 lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
                                <Link to="/activities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</Link>
                            </div>

                            <div className="space-y-4">
                                {recentActivities.map(activity => (
                                    <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                                            <FaFileAlt className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{activity.title}</p>
                                            <p className="text-sm text-gray-500">{activity.date}</p>
                                        </div>
                                        <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${activity.status === "Completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                                            }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                ))}

                                {recentActivities.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        No recent activities
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
                                <Link to="/calendar" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Calendar</Link>
                            </div>

                            <div className="space-y-4">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                            <FaCalendarAlt className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{event.title}</p>
                                            <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                                        </div>
                                    </div>
                                ))}

                                {upcomingEvents.length === 0 && (
                                    <div className="text-center py-4 text-gray-500">
                                        No upcoming events
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/new-proposal" className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center transition-colors">
                                <FaFileAlt className="text-blue-600 mr-3" />
                                <span className="font-medium text-gray-800">Submit New Proposal</span>
                            </Link>
                            <Link to="/guidelines" className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex items-center transition-colors">
                                <FaFileAlt className="text-green-600 mr-3" />
                                <span className="font-medium text-gray-800">PI Guidelines</span>
                            </Link>
                            <Link to="/team-management" className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex items-center transition-colors">
                                <FaUsers className="text-purple-600 mr-3" />
                                <span className="font-medium text-gray-800">Manage Research Team</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;