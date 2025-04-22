import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
const url = import.meta.env.VITE_REACT_APP_URL;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [summaryCards, setSummaryCards] = useState([]);
  const [schemeProjects, setSchemeProjects] = useState([]);
  const [fundTrend, setFundTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectStats,setProjectStats] = [
    { name: "Ongoing", value: 15 },
    { name: "Completed", value: 8 },
    { name: "Approved", value: 5 }
  ];
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log("")
        if (!token) {
          // Redirect to login if no token
          // window.location.href = '/admin/login';
          setError("Authentication required. Please login.");
          setLoading(false);
          return;
        }

        // Include token in the request header
        const config = {
          headers: {
            'accessToken': token,
          }
        };

        const res = await axios.get(`${url}admin/dashboard-stats`, config);
        console.log("Dashboard API response:", res.data);
        const data = res.data;

        setSummaryCards([
          { title: "Total Schemes", value: data.summaryCards.totalSchemes },
          { title: "Total Projects", value: data.summaryCards.totalProjects },
          { title: "Active Projects", value: data.summaryCards.activeProjects },
          { title: "Fund Approved", value: data.summaryCards.fundApproved }
        ]);

        setProjectStats(data.projectStats || []);
        setSchemeProjects(data.schemeProjects || []);
        setFundTrend(data.fundTrend || []);

        setLoading(false);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        if (err.response?.status === 401) {
          setError("Authentication failed. Please login again.");
          // Optional: Redirect to login
          // window.location.href = '/admin/login';
        } else {
          setError("Failed to load dashboard data.");
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 p-6 overflow-y-auto">
        <AdminNavbar yes={1} />

        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Admin Dashboard Overview</h2>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <h3 className="text-lg font-medium mb-4">Project Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {projectStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

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

            <div className="bg-white p-4 rounded-2xl shadow-md col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Fund Approved Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fundTrend}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="funds" fill="#00C49F" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;