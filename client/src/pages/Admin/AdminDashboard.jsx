import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminNavbar from "../../components/AdminNavbar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, ComposedChart,
  Area
} from "recharts";

// Sample data for dashboard
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

// Sample statewise data
const statewiseFunds = [
  { state: "Maharashtra", allocated: 245, utilized: 185 },
  { state: "Gujarat", allocated: 198, utilized: 157 },
  { state: "Tamil Nadu", allocated: 184, utilized: 142 },
  { state: "Karnataka", allocated: 162, utilized: 128 },
  { state: "Uttar Pradesh", allocated: 210, utilized: 148 },
  { state: "Rajasthan", allocated: 150, utilized: 112 },
  { state: "Madhya Pradesh", allocated: 135, utilized: 98 },
  { state: "Delhi", allocated: 120, utilized: 92 }
];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [summaryCards, setSummaryCards] = useState([]);
  const [schemeProjects, setSchemeProjects] = useState([]);
  const [fundTrend, setFundTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectStats, setProjectStats] = useState([]);
  const [showSchemesList, setShowSchemesList] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [userRole, setUserRole] = useState("Head Coordinator");
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showSchemeDetails, setShowSchemeDetails] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [schemeDetailsLoading, setSchemeDetailsLoading] = useState(false);
  const [selectedView, setSelectedView] = useState("bar"); // For toggling between chart types
  const [activeYear, setActiveYear] = useState("2023"); // For filtering state data by year

  useEffect(() => {
    // Simulate API call with sample data
    const loadSampleData = () => {
      setTimeout(() => {
        // Sample summary cards data
        setSummaryCards([
          { title: "Total Schemes", value: 28, type: "schemes", icon: "document" },
          { title: "Total Projects", value: 145, type: "projects", icon: "folder" },
          { title: "Active Projects", value: 87, type: "active", icon: "activity" },
          { title: "Fund Approved", value: "₹ 12.8 Cr", type: "funds", icon: "currency" }
        ]);

        // Sample project status distribution
        setProjectStats([
          { name: "Active", value: 87 },
          { name: "Completed", value: 32 },
          { name: "Pending", value: 18 },
          { name: "Delayed", value: 8 }
        ]);

        // Sample schemes and projects data
        setSchemeProjects([
          { scheme: "PMAY", projects: 32 },
          { scheme: "MGNREGA", projects: 28 },
          { scheme: "Smart City", projects: 24 },
          { scheme: "Jal Jeevan", projects: 19 },
          { scheme: "Swachh Bharat", projects: 15 },
          { scheme: "Others", projects: 27 }
        ]);

        // Sample fund trend data
        setFundTrend([
          { month: "Jan", funds: 105, projects: 8 },
          { month: "Feb", funds: 128, projects: 10 },
          { month: "Mar", funds: 98, projects: 7 },
          { month: "Apr", funds: 132, projects: 12 },
          { month: "May", funds: 79, projects: 6 },
          { month: "Jun", funds: 118, projects: 9 },
          { month: "Jul", funds: 160, projects: 14 },
          { month: "Aug", funds: 142, projects: 11 },
          { month: "Sep", funds: 135, projects: 10 },
        ]);

        setLoading(false);
      }, 1200); // Simulate loading time
    };

    loadSampleData();
  }, []);

  const fetchSchemes = async () => {
    setSchemesLoading(true);

    // Sample schemes data for demonstration
    setTimeout(() => {
      const sampleSchemes = [
        {
          _id: "1",
          name: "Pradhan Mantri Awas Yojana (PMAY)",
          description: "Housing for All initiative to provide affordable housing to urban poor and rural families.",
          status: "Active",
          budget: 30000000000,
          department: "Housing & Urban Affairs",
          startDate: "2023-01-15",
          endDate: "2026-12-31",
          projects: [
            { name: "Affordable Housing Project - Phase 1", description: "Construction of 5000 housing units in Delhi NCR", status: "Active" },
            { name: "Urban Housing Development", description: "Urban housing development in Mumbai Metropolitan Region", status: "Active" },
            { name: "Rural Housing Initiative", description: "Housing assistance to rural areas in Bihar", status: "Pending" }
          ]
        },
        {
          _id: "2",
          name: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
          description: "Employment scheme providing at least 100 days of wage employment in a financial year to rural households.",
          status: "Active",
          budget: 45000000000,
          department: "Rural Development",
          startDate: "2022-04-01",
          endDate: "2025-03-31",
          projects: [
            { name: "Water Conservation Project", description: "Creating water bodies in drought-prone areas", status: "Active" },
            { name: "Rural Road Development", description: "Construction of rural roads in Rajasthan", status: "Active" },
            { name: "Irrigation Canal Repair", description: "Repair of irrigation canals in Gujarat", status: "Completed" }
          ]
        },
        {
          _id: "3",
          name: "Smart Cities Mission",
          description: "Urban renewal and retrofitting program to develop smart cities across the country.",
          status: "Active",
          budget: 50000000000,
          department: "Urban Development",
          startDate: "2023-07-01",
          endDate: "2027-06-30",
          projects: [
            { name: "Smart Traffic Management System", description: "Implementation of intelligent traffic system in Bangalore", status: "Active" },
            { name: "Smart Water Management", description: "IoT-based water distribution and leakage detection in Chennai", status: "Active" },
            { name: "Smart Waste Management", description: "Automated waste collection and segregation in Pune", status: "Pending" }
          ]
        },
        {
          _id: "4",
          name: "Jal Jeevan Mission",
          description: "Provide safe and adequate drinking water through individual household tap connections to all households in rural India.",
          status: "Active",
          budget: 35000000000,
          department: "Water Resources",
          startDate: "2022-10-15",
          endDate: "2025-12-31",
          projects: [
            { name: "Rural Pipe Water Supply", description: "Pipe water supply to 200 villages in Madhya Pradesh", status: "Active" },
            { name: "Community Water Treatment Plants", description: "Setting up water treatment plants in 50 villages in Uttar Pradesh", status: "Pending" },
            { name: "Water Conservation Structures", description: "Building water conservation structures in Maharashtra", status: "Active" }
          ]
        },
        {
          _id: "5",
          name: "Swachh Bharat Mission",
          description: "National campaign to eliminate open defecation and improve solid waste management.",
          status: "Active",
          budget: 20000000000,
          department: "Sanitation & Public Health",
          startDate: "2023-04-01",
          endDate: "2026-03-31",
          projects: [
            { name: "Community Toilet Construction", description: "Construction of community toilets in urban slums", status: "Active" },
            { name: "Waste Management Implementation", description: "Implementation of waste segregation in 100 cities", status: "Active" },
            { name: "Sanitation Awareness Campaign", description: "Nationwide awareness campaign on sanitation", status: "Completed" }
          ]
        },
        {
          _id: "6",
          name: "Digital India",
          description: "Initiative to transform India into a digitally empowered society and knowledge economy.",
          status: "Active",
          budget: 25000000000,
          department: "Electronics & Information Technology",
          startDate: "2022-08-15",
          endDate: "2025-08-14",
          projects: [
            { name: "Rural Internet Connectivity", description: "Providing broadband connectivity to 100,000 gram panchayats", status: "Active" },
            { name: "Digital Literacy Program", description: "Training 10 million people in digital literacy", status: "Active" },
            { name: "Government e-Services Portal", description: "Developing comprehensive e-services portal for citizens", status: "Pending" }
          ]
        },
        {
          _id: "7",
          name: "Ayushman Bharat",
          description: "Health insurance scheme to provide coverage of up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
          status: "Pending",
          budget: 40000000000,
          department: "Health & Family Welfare",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          projects: [
            { name: "Health Insurance Implementation", description: "Implementation of health insurance in 10 states", status: "Pending" },
            { name: "Health & Wellness Centers", description: "Setting up 10,000 health and wellness centers", status: "Pending" },
            { name: "Hospital Empanelment Drive", description: "Empanelment of 5,000 hospitals under the scheme", status: "Pending" }
          ]
        },
        {
          _id: "8",
          name: "National Education Policy Implementation",
          description: "Implementation of National Education Policy 2020 to transform the education system.",
          status: "Pending",
          budget: 30000000000,
          department: "Education",
          startDate: "2023-06-01",
          endDate: "2027-05-31",
          projects: [
            { name: "Curriculum Reform", description: "Revising school curriculum as per NEP guidelines", status: "Pending" },
            { name: "Teacher Training Program", description: "Training 500,000 teachers in new pedagogical approaches", status: "Pending" },
            { name: "Higher Education Reforms", description: "Implementing multidisciplinary education in 100 universities", status: "Pending" }
          ]
        },
        {
          _id: "9",
          name: "Skill India Mission",
          description: "Initiative to empower youth with skill sets for increasing employability.",
          status: "Completed",
          budget: 15000000000,
          department: "Skill Development & Entrepreneurship",
          startDate: "2020-04-01",
          endDate: "2023-03-31",
          projects: [
            { name: "Vocational Training Centers", description: "Establishing 1,000 vocational training centers", status: "Completed" },
            { name: "Industry-Academia Partnership", description: "Forging partnerships with 500 industries for skills training", status: "Completed" },
            { name: "Entrepreneurship Development", description: "Training 100,000 youth in entrepreneurship skills", status: "Completed" }
          ]
        },
        {
          _id: "10",
          name: "PM Kisan Samman Nidhi",
          description: "Direct income support to farmers to procure inputs for agriculture.",
          status: "Active",
          budget: 75000000000,
          department: "Agriculture & Farmers Welfare",
          startDate: "2022-12-01",
          endDate: "2025-11-30",
          projects: [
            { name: "Farmer Registration Drive", description: "Registration of 100 million farmers under the scheme", status: "Active" },
            { name: "Direct Benefit Transfer", description: "Implementing DBT for farmers across all states", status: "Active" },
            { name: "Financial Inclusion Campaign", description: "Ensuring bank account access for all beneficiary farmers", status: "Completed" }
          ]
        }
      ];

      setSchemes(sampleSchemes);
      setSchemesLoading(false);
    }, 800);
  };

  const fetchSchemeDetails = async (schemeId) => {
    setSchemeDetailsLoading(true);
    setShowSchemeDetails(true);

    // Find the scheme in our sample data
    setTimeout(() => {
      const scheme = schemes.find(s => s._id === schemeId);
      if (scheme) {
        setSelectedScheme(scheme);
      }
      setSchemeDetailsLoading(false);
    }, 600);
  };

  const handleCardClick = (cardType) => {
    if (cardType === "schemes") {
      setShowSchemesList(true);
      fetchSchemes();
    }
  };

  const closeSchemesList = () => {
    setShowSchemesList(false);
    setSearchTerm("");
    setSelectedStatus("All");
  };

  const closeSchemeDetails = () => {
    setShowSchemeDetails(false);
    setSelectedScheme(null);
  };

  const handleViewDetails = (scheme) => {
    fetchSchemeDetails(scheme._id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Filter schemes based on search term and status
  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All" || scheme.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Get unique statuses for the filter dropdown
  const statusOptions = ["All", ...new Set(schemes.map(scheme => scheme.status).filter(Boolean))];

  // Function to toggle between chart views for statewise data
  const toggleChartView = (view) => {
    setSelectedView(view);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center bg-white p-8 shadow-lg rounded-lg">
          <div className="text-red-500 text-5xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 p-6 overflow-y-auto">
        <AdminNavbar yes={1} />

        <div className="p-6">
          {/* Summary Cards with Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {summaryCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition duration-300 cursor-pointer transform hover:translate-y-1"
                onClick={() => handleCardClick(card.type)}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-500 font-medium">{card.title}</h3>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${card.type === "schemes" ? "bg-blue-100 text-blue-600" :
                    card.type === "projects" ? "bg-green-100 text-green-600" :
                      card.type === "active" ? "bg-yellow-100 text-yellow-600" :
                        "bg-purple-100 text-purple-600"
                    }`}>
                    {card.icon === "document" && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {card.icon === "folder" && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    )}
                    {card.icon === "activity" && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {card.icon === "currency" && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                {card.type === "schemes" && (
                  <div className="mt-2 text-blue-500 text-xs flex items-center">
                    <span>Click to view details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Statewise Fund Allocation & Utilization */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">State-wise Fund Allocation & Utilization</h3>
                <p className="text-gray-500 text-sm">Overview of fund distribution and utilization across states (in Crores)</p>
              </div>
              <div className="mt-2 md:mt-0 flex items-center space-x-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => toggleChartView('bar')}
                    className={`px-3 py-1 text-xs rounded-md ${selectedView === 'bar' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    Bar
                  </button>
                  <button
                    onClick={() => toggleChartView('line')}
                    className={`px-3 py-1 text-xs rounded-md ${selectedView === 'line' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => toggleChartView('composed')}
                    className={`px-3 py-1 text-xs rounded-md ${selectedView === 'composed' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                  >
                    Composed
                  </button>
                </div>
                <select
                  className="text-sm border border-gray-300 rounded-md py-1 pl-3 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={activeYear}
                  onChange={(e) => setActiveYear(e.target.value)}
                >
                  <option value="2023">FY 2023-24</option>
                  <option value="2022">FY 2022-23</option>
                  <option value="2021">FY 2021-22</option>
                </select>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {selectedView === 'bar' && (
                  <BarChart data={statewiseFunds} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value} Cr`} />
                    <Legend />
                    <Bar dataKey="allocated" name="Allocated Funds" fill="#3b82f6" />
                    <Bar dataKey="utilized" name="Utilized Funds" fill="#10b981" />
                  </BarChart>
                )}

                {selectedView === 'line' && (
                  <LineChart data={statewiseFunds} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value} Cr`} />
                    <Legend />
                    <Line type="monotone" dataKey="allocated" name="Allocated Funds" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="utilized" name="Utilized Funds" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                )}

                {selectedView === 'composed' && (
                  <ComposedChart data={statewiseFunds} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value} Cr`} />
                    <Legend />
                    <Bar dataKey="allocated" name="Allocated Funds" fill="#3b82f6" />
                    <Area type="monotone" dataKey="utilized" name="Utilized Funds" fill="#10b981" stroke="#10b981" />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-between text-sm">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-gray-600">Total Allocation: ₹1,404 Cr</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-600">Total Utilization: ₹1,062 Cr (75.6%)</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-gray-600">Average Utilization Rate: 75.6%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Project Status Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Status Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {projectStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} Projects`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Schemes Project Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Schemes Project Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={schemeProjects}>
                    <XAxis dataKey="scheme" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [`${value} Projects`, "Count"]}
                      labelFormatter={(label) => `Scheme: ${label}`}
                    />
                    <Bar dataKey="projects" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Fund Allocation Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Fund Allocation Trend & Project Count (2023)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "funds") return [`₹ ${value} Lakhs`, "Funds Allocated"];
                      if (name === "projects") return [`${value}`, "Projects Initiated"];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="funds"
                    fill="#6366f1"
                    name="Funds Allocated (Lakhs)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="projects"
                    fill="#10b981"
                    name="Projects Initiated"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm">
              <p className="text-gray-600">
                Total funds allocated in 2023 (till September): <span className="font-medium">₹ 1097 Lakhs</span> across <span className="font-medium">87</span> projects
              </p>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">New project added under Smart Cities Mission</p>
                  <p className="text-xs text-gray-500">2 hours ago • By Rajesh Kumar (Project Manager)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">Project 'Rural Road Development' marked as Completed</p>
                  <p className="text-xs text-gray-500">Yesterday • By Anil Sharma (Field Officer)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">Fund allocation updated for Jal Jeevan Mission</p>
                  <p className="text-xs text-gray-500">2 days ago • By Priya Patel (Finance Officer)</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">Delay reported in Urban Housing Development project</p>
                  <p className="text-xs text-gray-500">3 days ago • By Sanjay Gupta (Site Engineer)</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Activities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes List Modal */}
      {showSchemesList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Government Schemes</h3>
                <button onClick={closeSchemesList} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search schemes..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <select
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map((status, idx) => (
                    <option key={idx} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {schemesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                filteredSchemes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No schemes found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSchemes.map((scheme) => (
                      <div key={scheme._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800">{scheme.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${scheme.status === "Active" ? "bg-green-100 text-green-800" :
                            scheme.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                            {scheme.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scheme.description}</p>
                        <div className="text-xs text-gray-500 mb-3">
                          <div className="flex justify-between mb-1">
                            <span>Department:</span>
                            <span className="font-medium">{scheme.department}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span>Budget:</span>
                            <span className="font-medium">₹ {(scheme.budget / 10000000).toFixed(2)} Cr</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timeline:</span>
                            <span className="font-medium">{formatDate(scheme.startDate).split(" ")[0]} - {formatDate(scheme.endDate).split(" ")[0]}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(scheme)}
                          className="w-full py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheme Details Modal */}
      {showSchemeDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Scheme Details</h3>
                <button onClick={closeSchemeDetails} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {schemeDetailsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : selectedScheme ? (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">{selectedScheme.name}</h4>
                      <p className="text-sm text-gray-600">{selectedScheme.description}</p>
                    </div>
                    <span className={`mt-2 sm:mt-0 text-sm px-3 py-1 rounded-full ${selectedScheme.status === "Active" ? "bg-green-100 text-green-800" :
                      selectedScheme.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                      {selectedScheme.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Scheme Information</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span className="font-medium text-gray-800">{selectedScheme.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Budget Allocated:</span>
                          <span className="font-medium text-gray-800">₹ {(selectedScheme.budget / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span className="font-medium text-gray-800">{formatDate(selectedScheme.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span className="font-medium text-gray-800">{formatDate(selectedScheme.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Projects Summary</h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Projects:</span>
                          <span className="font-medium text-gray-800">{selectedScheme.projects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Projects:</span>
                          <span className="font-medium text-gray-800">{selectedScheme.projects.filter(p => p.status === "Active").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completed Projects:</span>
                          <span className="font-medium text-gray-800">{selectedScheme.projects.filter(p => p.status === "Completed").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pending Projects:</span>
                          <span className="font-medium text-gray-800">{selectedScheme.projects.filter(p => p.status === "Pending").length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-md font-medium text-gray-800 mb-4">Projects Under This Scheme</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedScheme.projects.map((project, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{project.name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{project.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === "Active" ? "bg-green-100 text-green-800" :
                                  project.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-blue-100 text-blue-800"
                                  }`}>
                                  {project.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Scheme details not found.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex justify-end">
                <button
                  onClick={closeSchemeDetails}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2"
                >
                  Close
                </button>
                {selectedScheme && (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Scheme
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;