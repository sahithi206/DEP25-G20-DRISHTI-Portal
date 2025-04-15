import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  // Sample data (replace with real data from backend if needed)
  const projectStats = [
    { name: "Ongoing", value: 15 },
    { name: "Completed", value: 8 },
    { name: "Approved", value: 5 }
  ];

  const schemeProjects = [
    { scheme: "Scheme A", projects: 6 },
    { scheme: "Scheme B", projects: 10 },
    { scheme: "Scheme C", projects: 5 },
    { scheme: "Scheme D", projects: 7 }
  ];

  const fundTrend = [
    { month: "Jan", funds: 200000 },
    { month: "Feb", funds: 350000 },
    { month: "Mar", funds: 150000 },
    { month: "Apr", funds: 420000 },
    { month: "May", funds: 300000 }
  ];

  const summaryCards = [
    { title: "Total Schemes", value: 12 },
    { title: "Total Projects", value: 28 },
    { title: "Active Projects", value: 15 },
    { title: "Fund Approved", value: "₹ 48L" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 p-6 overflow-y-auto">
        <AdminNavbar />

        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Admin Dashboard Overview</h2>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {summaryCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl shadow-md text-center border hover:shadow-lg transition duration-300"
              >
                <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Project Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={projectStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {projectStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Projects per Scheme</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={schemeProjects}>
                  <XAxis dataKey="scheme" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects" fill="#8884d8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="bg-white p-4 rounded-2xl shadow-md col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Fund Disbursement Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fundTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="funds" stroke="#00C49F" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;