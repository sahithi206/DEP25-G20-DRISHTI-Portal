import React, { useEffect, useContext, useState, useRef } from "react";
import { AuthContext } from "../Context/Authcontext";
import HomeNavbar from "../../components/Navbar";
import Sidebar from "../../components/InstituteSidebar";
import axios from "axios";
import { toast } from "react-toastify";
const url = import.meta.env.VITE_REACT_APP_URL;
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
const sanctionedData = [
  { year: "2010-11", projects: 2, outlay: 0.16 },
  { year: "2011-12", projects: 1, outlay: 0.13 },
  { year: "2012-13", projects: 2, outlay: 0.17 },
  { year: "2013-14", projects: 1, outlay: 0.03 },
  { year: "2014-15", projects: 1, outlay: 0.002 },
  { year: "2015-16", projects: 4, outlay: 0.23 },
  { year: "2016-17", projects: 6, outlay: 0.21 },
  { year: "2017-18", projects: 15, outlay: 0.76 },
  { year: "2018-19", projects: 17, outlay: 1.72 },
  { year: "2019-20", projects: 47, outlay: 3.12 },
  { year: "2020-21", projects: 79, outlay: 7.29 },
  { year: "2021-22", projects: 104, outlay: 4.01 },
  { year: "2022-23", projects: 151, outlay: 7.28 },
  { year: "2023-24", projects: 185, outlay: 10.74 },
];
const data = [
  { year: "2009-10", projects: 1, outlay: 0.99 },
  { year: "2010-11", projects: 9, outlay: 1.85 },
  { year: "2011-12", projects: 10, outlay: 4.85 },
  { year: "2012-13", projects: 10, outlay: 3.11 },
  { year: "2013-14", projects: 9, outlay: 5.11 },
  { year: "2014-15", projects: 19, outlay: 5.38 },
  { year: "2015-16", projects: 20, outlay: 4.49 },
  { year: "2016-17", projects: 24, outlay: 11.81 },
  { year: "2017-18", projects: 24, outlay: 12.10 },
  { year: "2018-19", projects: 38, outlay: 10.98 },
  { year: "2019-20", projects: 48, outlay: 18.85 },
  { year: "2020-21", projects: 54, outlay: 20.08 },
  { year: "2021-22", projects: 50, outlay: 20.02 },
  { year: "2022-23", projects: 67, outlay: 40.91 },
  { year: "2023-24", projects: 73, outlay: 35.89 },
];


const InstituteDashboard = () => {
  const { fetchInstituteProjects, fetchInstituteUsers } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const sidebarRef = useRef(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const projects = [
    {
      id: 1,
      agency: "SERB-CRG",
      name: "Dr. Biplab Sarkar (PI), Indian Institute of Petroleum, Post doctorate IIP, Mohanpur, Dehradun and Dr. Nevin Gopinathan (Co-PI)",
      dept: "Chemical Engineering",
      title: "Production of propylene and hydrogen via propane dehydrogenation: catalyst and process development at bench scale",
      amount: "0.24"
    },
    {
      id: 2,
      agency: "DST-TDT",
      name: "Dr. Rajendra Srivastava and Dr. Suman Lata Jain, IIF, Mohanpur, Haridwar, PI",
      dept: "Chemistry",
      title: "Creation of Nodal Centers for development and Production of testing materials, membranes and other raw materials that are required by Health Care Sector",
      amount: "0.21"
    },
    {
      id: 3,
      agency: "ICMR",
      name: "Prof. Javed N Agrewala",
      dept: "Centre of Biomedical Engineering",
      title: "Boosting BCG efficacy by expressing memory enhancing cytokines: IL-7 and IL-15 to obtain long-lasting memory T cells and protection against Mycobacterium tuberculosis",
      amount: "0.27"
    },
    {
      id: 4,
      agency: "SERB-CRG",
      name: "Dr. Partha Sharathi Dutta",
      dept: "Mathematics",
      title: "Analyzing Nonlinear Dynamics of Coupled Human-Environment Systems",
      amount: "0.25"
    },
    {
      id: 5,
      agency: "SERB-TTR",
      name: "Dr. Abhanna Poudarick",
      dept: "Centre of Biomedical Engineering",
      title: "An osseo-adhesive composition, material and method for preparation",
      amount: "0.30"
    },
    {
      id: 6,
      agency: "ICSSR",
      name: "Dr. Amrithesh (PI) and Dr. Ravi Kumar (Co–PI)",
      dept: "Humanities & Social Sciences",
      title: "Employment in India: Exploring the India roots and its impact on wellbeing and sustainable lifestyle consumption",
      amount: "0.11"
    },
    {
      id: 7,
      agency: "Ministry of Mines",
      name: "Dr. Rajiv Kumar",
      dept: "Metallurgical & Materials Engineering",
      title: "Development and scale up – TRL 5–6 of cost effective Copper Graphene Coatings using in-situ synthesis and coating in Fluidized Bed Process Systems",
      amount: "0.12"
    },
    {
      id: 8,
      agency: "SERB–CRG",
      name: "Dr. Deveniyan Samanta",
      dept: "Mechanical",
      title: "Investigations on the efficacy of nano-bubble fluids in enhancing the evaporative rate and heat transfer rate during pool-boiling",
      amount: "0.29"
    },
    {
      id: 9,
      agency: "ICMR",
      name: "Dr. Srivatsava Naidu",
      dept: "Centre of Biomedical Engineering",
      title: "Long non-coding RNAs in regulation of MMPs in transporation Novel Molecular Sensors of Rheumatoid arthritis",
      amount: "0.20"
    },
    {
      id: 10,
      agency: "CSIR",
      name: "Dr. C D Reddy",
      dept: "Electrical Engineering",
      title: "Development of New Equipment of Condition Assessment of Power Cable",
      amount: "1.84"
    },
    {
      id: 11,
      agency: "SPARC",
      name: "Dr. Samaresh Bardhan (PI) Prof. Paramita Mukherjee (International Management Institute Kolkata) Co-PI",
      dept: "Humanities & Social Sciences",
      title: "Strategic Asset Allocation Choices for India's National Pension System",
      amount: "0.71"
    },
    {
      id: 12,
      agency: "SPARC",
      name: "Prof. Javed N Agrewala (PI) Dr. Sharvan Sethawat (IISE & Research Mohali)",
      dept: "Centre of Biomedical Engineering",
      title: "Modulation of the differentiation, sustenance and endurance of memory T cells by gut microbiota",
      amount: "0.84"
    },
    {
      id: 13,
      agency: "SERB-RJF Ramanujan Fellowship",
      name: "Dr. Satnesh Singh",
      dept: "Electrical Engineering",
      title: "",
      amount: "1.19"
    },
    {
      id: 14,
      agency: "DST-INSpire Faculty",
      name: "Dr. Raghav Sharma",
      dept: "Electrical Engineering",
      title: "",
      amount: "1.10"
    },
    {
      id: 15,
      agency: "SERB-CRG",
      name: "Dr. Jitendra Kumar",
      dept: "Mathematics",
      title: "Coarsegrained CFD-DEM-PBM simulations of industrial granulating beds",
      amount: "0.26"
    },
    {
      id: 16,
      agency: "I-HUB Quantum Technology Foundation (Chanakya Post-Doctoral Fellowship 2022-23)",
      name: "Dr. Rajesh V. Nair",
      dept: "Physics",
      title: "Development of diamond nanowires to generate bright room temperature array of single photon sources",
      amount: "0.13"
    },
    {
      id: 17,
      agency: "CSIR",
      name: "Dr. C. M. Nagaraja",
      dept: "Chemistry",
      title: "Development of Porphyim-based lefrequcction Photocatalysts for visible-light-driven production of solar fuels",
      amount: "0.10"
    },
    {
      id: 18,
      agency: "SRB-CRG",
      name: "Dr. Srinatsava Naidu",
      dept: "Centre of Biomedical Engineering",
      title: "Identification and functional characterization of circular RNAs originating from encoding RNA Polymerase I transcriptional machinery - a novel molecular basis od cancer",
      amount: "0.50"
    },
    {
      id: 19,
      agency: "SRB-SRG",
      name: "Dr. Mamnohan Vashisth",
      dept: "Mathematics",
      title: "Inverse coefficients and shape identification problems for partial differential equations (PDEs)",
      amount: "0.13"
    },
    {
      id: 20,
      agency: "Department of Space-ISRO",
      name: "Dr. Santosh Kumar Vipparthi",
      dept: "Electrical Engineering",
      title: "Consultant for delivering Training on Advanced Process Control understanding and development issues in Automotive Systems",
      amount: "0.18"
    },
    {
      id: 21,
      agency: "SERB-RJF Ramanujan Fellowship",
      name: "Dr. Lakhan Bainsia",
      dept: "Physics",
      title: "",
      amount: "1.19"
    },
    {
      id: 22,
      agency: "Indo-German WISER-Science & Technology Centre (IGSTC)",
      name: "Dr. Monika Gupta",
      dept: "Chemistry",
      title: "Development of Solid-state Solar Thermal Fuels Derived from Liquid Crystalline Norbornadiene Derivatives",
      amount: "0.37"
    },
    {
      id: 23,
      agency: "DST-Inspire Faculty",
      name: "Dr. Meghna Sharma",
      dept: "Civil Engineering",
      title: "",
      amount: "1.10"
    },
    {
      id: 24,
      agency: "THIAN-ITT Hyderabad",
      name: "Dr. Sudeepta Mishra (PI) and Dr. Shashi Sekhar Jha (Co-PI)",
      dept: "Computer Science & Engineering",
      title: "Divya Drishit Leveraging IoT and CPS for Immersive Real-time Monitoring and Interaction-based Navigation with Drones",
      amount: "0.25"
    },
    {
      id: 25,
      agency: "ARBD",
      name: "Dr. Anupam Agrawal (PI) and Prof. Navin Kumar (Co-PI)",
      dept: "Mechanical Engineering",
      title: "Development of Incremental Forming process incorporating Novel Strategies for Titanium Alloy based Aerospace Applications",
      amount: "0.37"
    },
    {
      id: 26,
      agency: "SERB-CRG",
      name: "Dr. Chander Shekhar Sharma",
      dept: "Mechanical Engineering",
      title: "Development of novel vapor chamber for thermal management of microelectronics",
      amount: "0.25"
    },
    {
      id: 27,
      agency: "STARS-MoE",
      name: "Dr. Chander Shekhar Sharma",
      dept: "Mechanical Engineering",
      title: "Study of droplet dynamics and phase change on soft materials towards enhanced atmospheric water harvesting",
      amount: "0.50"
    },
    {
      id: 28,
      agency: "SERB-SPG",
      name: "Dr. Lipika Kabiraj",
      dept: "Mechanical Engineering",
      title: "Unsteady fragmentation in shear-thinning viscoelastic fluid films",
      amount: "0.55"
    },
    {
      id: 29,
      agency: "National Centre for Mathematics -IIT Bombay",
      name: "Dr. Tapas Chatterjee",
      dept: "Mathematics",
      title: `Conduct of NOM Annual Foundation School-I at ${users.Institute}`,
      amount: "0.11"
    },
    {
      id: 30,
      agency: "SERB-SRG",
      name: "Dr. Aslam Chandbhai Shaikh",
      dept: "Chemistry",
      title: "Electro-photocatalysis-Merging Light and Electricity to generate a sustainable way for Catalytic Organic Transformations",
      amount: "0.33"
    },
    {
      id: 31,
      agency: "DST",
      name: "Department of MME",
      dept: "MME",
      title: "DST - RST Program",
      amount: "1.63"
    },
    {
      id: 32,
      agency: "Ministry of Electronics & Information Technology (MeiIY)",
      name: "Dr. Rohit Y. Sharma (PI) and Dr. Mahendra Sakare, Devarshi Mrinal Das (Co-PI)",
      dept: "Electrical Engineering",
      title: "ASIC and Package Design of Ultra Small Atomic Clock under Chips to Startup (C2S) Programme",
      amount: "0.95"
    },
    {
      id: 33,
      agency: "DST-INCP",
      name: "Dr. Reet Kamal Tiwari (PI) and Dr. C K Narayanan, IIT Palakkad (Co-PI)",
      dept: "Civil Engineering",
      title: "Deep Learning Based Automated Mapping of Glacial Lakes in Himalayas",
      amount: "0.39"
    },
    {
      id: 34,
      agency: "DST-Indo-Russia",
      name: "Dr. Anupam Agrawal (Co-PI)",
      dept: "Mechanical Engineering",
      title: "Enhancing the accuracy of robotorming through prediction and compensation of elastic behaviour using Artificial Intelligence techniques",
      amount: "0.14"
    },
    {
      id: 35,
      agency: "ISRO-DMSP",
      name: "Dr. Reet Kamal Tiwari (Co-PI)",
      dept: "Civil Engineering",
      title: "Permafrost destabilization induced mass wasting vulnerable zones modelling in higher Himalayan regions (Bhagirahi-Alaknanda Valley) through Snow cover-climate-terrain interactive mechanism employing Deep Learning techniques",
      amount: "0.00"
    },
    {
      id: 36,
      agency: "DRDO-DGRE-CARS",
      name: "Dr. Reet Kamal Tiwari",
      dept: "Civil Engineering",
      title: "Development of remote sensing based dynamic decision support (DSS) system for avalanche susceptibility mapping using AI/ML techniques for NW-Himalaya",
      amount: "0.49"
    },
    {
      id: 37,
      agency: "CPRI",
      name: "Dr. C O Reddy",
      dept: "Electrical Engineering",
      title: "Research and Development of New Equipment for Condition Assessment of Pwer Cable",
      amount: "1.84"
    },
    {
      id: 38,
      agency: "MoES-Ministry of Earth Sciences under Deep Ocean Mission",
      name: "Dr.Jayaram Valluru",
      dept: "Chemical Engineering",
      title: "Leveraging the capabilities of AI/ML for deep ocean exploration and climate change",
      amount: "0.36"
    },
    {
      id: 39,
      agency: "SERB-CRG",
      name: "Dr. Shankhadeep Chakrabortty",
      dept: "Physics",
      title: "Singular limits of String Theory",
      amount: "0.22"
    },
    {
      id: 40,
      agency: "THI-IoT-IIT Bombay",
      name: "Dr. Shashi Shekhar Jha (PI) and Dr. Sudeepta Mishra",
      dept: "Computer Science & Engineering",
      title: "Autonomous Precision Landing of Drones for Uninterrupted Surveillance",
      amount: "0.46"
    },
    {
      id: 41,
      agency: "SERB-MTR",
      name: "Dr. Brajesh Rawat",
      dept: "Electrical Engineering",
      title: "Computationally Efficient Quantum Transport Model for Two-dimensional Material-based Devices: An Open Source Multiscale Modeling Tool",
      amount: "0.07"
    },
    {
      id: 42,
      agency: "SERB-MTR",
      name: "Dr. G. Sankara Rajukosuru",
      dept: "Mathematics",
      title: "Dynamics of Operator Shifts on Directed Trees",
      amount: "0.07"
    },
    {
      id: 43,
      agency: "MoES/PAMC /DOM",
      name: "Dr. Sam Darshi (PI) Dr. Birjesh Khumbani and Dr. Satyam Agrawal (Co-PI)",
      dept: "Electrical Engineering",
      title: "Design of RSMA based Cooperative Vehicular Network for Deep Ocean Critical Missions",
      amount: "0.54"
    },
    {
      id: 44,
      agency: "DST-Inspire",
      name: "Dr. Ritu Gurpta",
      dept: "Physics",
      title: "",
      amount: "0.35"
    },
    {
      id: 45,
      agency: "DBT",
      name: "Dr. Bodhisatwa Das (PI) and Dr. Degrit R Bathula (Co-PI)",
      dept: "CBME & OSE",
      title: "Antioxidative hydrogel-mesenchymal stem cells combinatorial therapy for targeting reactive astrogliosis (RA) induced neuropathy gain post spinal cord injury (SCI)",
      amount: "0.56"
    },
    {
      id: 46,
      agency: "SERB-CRG",
      name: "Dr. Deepika Choudhury",
      dept: "Physics",
      title: "Evolution of nuclear shell structure in the region around Z = 82",
      amount: "0.25"
    },
    {
      id: 47,
      agency: "SERB-EEQ",
      name: "Dr. Bidhan Chandra Sardar",
      dept: "Mathematics",
      title: "Multi-scale Analysis and Computation of Optimal Control Problems",
      amount: "0.21"
    },
    {
      id: 48,
      agency: "THH-OT-IIT Bombay",
      name: "Dr. Jayaram Valluru (PI) and Dr. Senthil Kumar vadivelu, Applied Materials India (co-pi)",
      dept: "Chemical",
      title: "Development of Robust Multi-Rate and Multi-Sensor Fusion Toolbox for Soil-Sensing and Advances control application",
      amount: "0.44"
    },
    {
      id: 49,
      agency: "ICMR",
      name: "Dr. Atharva Poundarik",
      dept: "Gentre of Biomedical Engineering",
      title: "Fabrication and preclinical trial of 3D printed placenta based bioactive hybrid dressing for full thickness second degree burn management",
      amount: "1.14"
    },
    {
      id: 50,
      agency: "SERB-SRG",
      name: "Dr. Shweta Jain (PI) and Dr. Shashi Sekhar Jha (Co-PI)",
      dept: "Computer Science & Engineering",
      title: "Beyond AI models: Integrating Human Expertise with AI for Improving their Combined Performance",
      amount: "0.36"
    },
    {
      id: 51,
      agency: "SERB-CRG",
      name: "Dr. Debaparsad Mandal",
      dept: "Chemistry",
      title: "Polyoxometalates based mixed-metal catalysts for CO2 reduction",
      amount: "0.37"
    },
    {
      id: 52,
      agency: "SERB-CRG",
      name: "Dr. Sudeerpta Mishra (PI) and Dr. Shashi Sekhar Jha (Co-PI)",
      dept: "Computer Science & Engineering",
      title: "Optimising Machine Learning Models for Resource-Constrained Edge Devices in AloT Applications through ML Model Compression",
      amount: "0.40"
    },
    {
      id: 53,
      agency: "DST",
      name: "Department of CSE",
      dept: "CSE",
      title: "FIST Program",
      amount: "1.58"
    },
    {
      id: 54,
      agency: "SERB-CRG",
      name: "Dr. Saifullah Payami",
      dept: "Electrical Engineering",
      title: "Design and Development of Low Cost and High Power Density Multi-Phase Interior Permanent Magnet Motor drive with Integrated Charger for Electric Vehicle Applications",
      amount: "0.38"
    },
    {
      id: 55,
      agency: "SERB-CRG",
      name: "Dr. Puneet Goyal",
      dept: "Computer Science & Engineering",
      title: "Doc-Forensics: Effective Methods for Source Camera Identification of Document Images in Real-World Scenarios",
      amount: "0.45"
    },
    {
      id: 56,
      agency: "SERB-CRG",
      name: "Dr. Deepit R Bathula (PI) and Dr.Balwinder Singh Sodhi and Dr.Jitender Saini (NIIR) (Co-PI)",
      dept: "Computer Science & Engineering",
      title: "Characterization of Pertusion Deficit in Stroke Using Resting- State Functional Magnetic Resonance Imaging (fMRI)",
      amount: "0.31"
    },
    {
      id: 57,
      agency: "SERB-MTR",
      name: "Dr. HVR Mittal",
      dept: "Mathematics",
      title: "Fluid flow and heat convection past an oscillating ellipse shaped cylinder",
      amount: "0.07"
    },
    {
      id: 58,
      agency: "SERB-CRG",
      name: "Dr. Sagar Rohidas Chavan",
      dept: "Civil Engineering",
      title: "Development of an algorithmic procedure to extract Geomorphological attributes governing floods in headwater catchments and evaluating their potential in predicting design floods at ungauged locations",
      amount: "0.25"
    },
    {
      id: 59,
      agency: "SERB-CRG",
      name: "Dr. Mitesh Surana",
      dept: "Civil Engineering",
      title: "Seismic design provisions to incorporate amplification in force demands on acceleration-sensitive secondary systems due to building irregularities",
      amount: "0.20"
    },
    {
      id: 60,
      agency: "SERB-SRG",
      name: "Dr. Rajendra Kumar Munian",
      dept: "Mechanical Engineering",
      title: "Multi-objective Design of Novel Composite Meta-structures",
      amount: "0.31"
    },
    {
      id: 61,
      agency: "ICSSR",
      name: "Dr. Bhavesh Garg",
      dept: "Humanities & Social Sciences",
      title: "Does a rising Workforce via Increased Labour Force Participation help revive the Manufacturing and MSME Sectors' Exports and Output Growth?",
      amount: "0.09"
    },
    {
      id: 62,
      agency: "SERB-CRG",
      name: "Dr. Rahul TM",
      dept: "Civil Engineering",
      title: "How to improve the penetration of electric vehicles in Indian market - Understanding effect of government policies and people's perceptions on electric vehicle adoption",
      amount: "0.22"
    },
    {
      id: 63,
      agency: "ARDB-DRDD",
      name: "Dr. Ashwani Sharma (PI) and Prof. C. C. Reddy (Co-PI)",
      dept: "Electrical",
      title: "Development of Switched Multi-beam Antennas for Drone and Drone pad for High Communication range with 3D Coverage Enhancement and Interference Avoidance",
      amount: "0.27"
    },
    {
      id: 64,
      agency: "I-HUB Foundation for COBOTICS (IHFC)",
      name: "Prof. Navin Kumar",
      dept: "Mechanical Engineering",
      title: "A hand-held medical device for in-vivo mechanical characterization of bone",
      amount: "0.23"
    },
    {
      id: 65,
      agency: "ICMR",
      name: "Dr. Prabal Banerjee",
      dept: "Chmeistry",
      title: "Small molecules inhibitor of human IGRM as a broad anti-viral agent's preclinical Study",
      amount: "0.17"
    },
    {
      id: 66,
      agency: "SERB-CRG",
      name: "Dr. S. C. Martha",
      dept: "Math",
      title: "Mathematical analysis of wave blocking, energy transfer and hydrodynamic morphology of Rayleigh Taylor instability in multilayer fluid systems with arbitrary bottom topography",
      amount: "0.21"
    },
    {
      id: 67,
      agency: "IHUB NTHAC Foundation (IIT Kanpur)",
      name: "Dr. Jagpreet Singh (Co-PI)",
      dept: "Computer Science & Engineering",
      title: "Verified Communication Protocol Implementation for Internet of Things",
      amount: "0.18"
    },
    {
      id: 68,
      agency: "SERB-CRG",
      name: "Dr. Schin Kumar (PI) and Dr. Candrakant Kumar Nirala (Co-PI)",
      dept: "Mechanical Engineering",
      title: "Design and Development of lightweight sandwich composite panels with auxetic core for impact applications",
      amount: "0.38"
    },
    {
      id: 69,
      agency: "SERB-NPDF",
      name: "Dr. Pooja Rani -N-PDF",
      dept: "Chemistry",
      title: "",
      amount: "0.27"
    },
    {
      id: 70,
      agency: "IIT-Indore under Jaya Prakash Narayan National Centre of Excellence in the Humanities, IIT Indore",
      name: "Dr. Dibyakusum Ray PI",
      dept: "Humanities & Social Sciences",
      title: "Magahi Culture and the Endangered Indigene of India: A Project of Archiving Dissemination and Pedagogy",
      amount: "0.08"
    },
    {
      id: 71,
      agency: "SERB-RJF Ramanujan Fellowship",
      name: "Dr. Kasturi Sala",
      dept: "Metallurgical & Materials Engineering",
      title: "Development of a novel and sustainable Vanadium based metal membrane for hydrogen energy applications through alloy design and process optimization",
      amount: "1.19"
    },
    {
      id: 72,
      agency: "SERB-SRG",
      name: "Dr. Abhishek Sharma",
      dept: "Electrical Engineering",
      title: "Engineering High Performance Resonant Magnetic Tunnel Junctions: 'Weaving NECF+DFT based quantum transport with magnetization dynamics'",
      amount: "0.32"
    }
  ];

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
    });

    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current);
    }

    return () => {
      if (sidebarRef.current) {
        resizeObserver.unobserve(sidebarRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);
  const [profile, setProfile] = useState("");
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          "accessToken": token,
        },
      };

      const res = await axios.get(`${url}institute/profile`, config);
      setProfile(res.data.institute);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };
  const agencyBudgetData = projects.reduce((acc, project) => {
    const existingAgency = acc.find(item => item.name === project.agency);
    const amount = parseFloat(project.amount) || 0;

    if (existingAgency) {
      existingAgency.value += amount;
    } else {
      acc.push({
        name: project.agency,
        value: amount
      });
    }
    return acc;
  }, []);
  const topAgencies = [...agencyBudgetData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#A4DE6C', '#D0ED57', '#FFC658', '#82CA9D', '#8DD1E1'
  ];
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const [filters, setFilters] = useState({
    searchTerm: "",
    selectedAgency: ""
  });

  const handleSearchChange = (e) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  const handleAgencyChange = (e) => {
    setFilters({ ...filters, selectedAgency: e.target.value });
  };

  const filteredProjects = projects.filter((project) => {
    const searchTermLower = filters.searchTerm.toLowerCase();
    const selectedAgencyLower = filters.selectedAgency.toLowerCase();
    return (
      (project.agency.toLowerCase().includes(searchTermLower) ||
        project.name.toLowerCase().includes(searchTermLower) ||
        project.dept.toLowerCase().includes(searchTermLower) ||
        project.title.toLowerCase().includes(searchTermLower)) &&
      (filters.selectedAgency === "" || project.agency.toLowerCase().includes(selectedAgencyLower))
    );
  });
  const uniqueAgencies = [...new Set(projects.map((project) => project.agency))];
  const [projectFilter, setProjectFilter] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [summaryCards, setSummaryCards] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectsData = await fetchInstituteProjects();
        const usersData = await fetchInstituteUsers();
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setSummaryCards([
      { title: "Total Ongoing Projects", value: 89, type: "projects" },
      { title: "Fund Approved in 2023-2024 (Cr)", value: 35.89, type: "funds" },
      { title: "Fund Sanctioned in 2023-2024 (Cr)", value: 10.41, type: "funds" }

    ]);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <HomeNavbar yes={1} />
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-grow container mx-auto p-6">

          
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-blue-900 border-b pb-2">RESEARCH AND DEVELOPMENT ACTIVITIES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {summaryCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-200 p-6 rounded-2xl shadow-md text-center border border-gray-100 hover:shadow-lg hover:border-blue-200 transition duration-300 cursor-pointer"
                  >
                    <h3 className="text-gray-500 text-sm font-medium mb-2">{card.title}</h3>
                    <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  </div>
                ))}
              </div>
              <ul className="list-disc pl-6 space-y-2 text-gray-800">
                <li><strong>CSR Funds:</strong> With greater emphasis on corporate funding, the Institute has received/sanctioned CSR funding of Rs. 0.87 crore from different industries. In the coming years, the same is going to substantially increase through continuous and rigorous efforts of the R&D team.</li>
                <li><strong>Research Initiation Support (IRIS):</strong> Institute Research Initiation Support (IRIS) scheme has been announced for supporting newly joined faculty members at {profile.college}. This grant is constituted to give new faculty members a “leg-up” in their future research without waiting for a proposal to be approved by the external funding agencies or the regular Ph.D. intake in the institute to add research personnel to their group.</li>
                <li><strong>Summer Internship for Noetic Exposure (SINE) Program:</strong> SINE program has been announced for giving an opportunity to exceptionally qualified UG/PG students to execute an innovative R&D project under the guidance of {profile.college} faculty members. The students at different engineering institutes in India or abroad, who are within Top #15 Ranks in their respective program/branch, are eligible to apply.</li>
                <li>The ICSR-II Board has been renamed as Research and Development Advisory Board.</li>
              </ul>

              <h2 className="text-xl font-semibold mb-1 text-center uppercase">
                SPONSORED RESEARCH PROJECTS SANCTIONED ANNUALLY              </h2>
              <p className="text-sm text-center mb-6 text-gray-600">
                No. of Projects till 2023-24: 476 with outlay of Rs. 202.91 (Crore)
              </p>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" orientation="left" stroke="#1f77b4" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ff7f0e" />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "Sanctioned Amount (Cr)"
                        ? [`₹${value} Cr`, name]
                        : [value, name]
                    }
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="projects"
                    fill="#1f77b4"
                    name="No. of projects Sanctioned"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="outlay"
                    fill="#ff7f0e"
                    name="Total Sanctioned Amount (Cr)"
                  />
                </BarChart>
              </ResponsiveContainer>

              <h2 className="text-xl font-semibold mb-1 text-center uppercase">
                AMOUNT SANCTIONED ANNUALLY (SPONSORED PROJECTS)
              </h2>
              <p className="text-sm text-center mb-4">
                No. of Project till 2023-24 : 615 with outlay of Rs. 35.85 Crore
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={sanctionedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "Sanctioned Amount (Cr)"
                        ? [`₹${value} Cr`, name]
                        : [value, name]
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="projects"
                    fill="#1f77b4"
                    name="No. of Projects Sanctioned"
                  />
                  <Bar
                    dataKey="outlay"
                    fill="#ff7f0e"
                    name="Sanctioned Amount (Cr)"
                  />
                </BarChart>
              </ResponsiveContainer>

              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Budget Distribution by Funding Agencies (Top 10)
                </h2>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/2 h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topAgencies}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {topAgencies.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`₹${value.toFixed(2)} Cr`, "Amount"]}
                        />

                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-medium mb-4">Top Funding Agencies</h3>
                    <div className="space-y-2">
                      {topAgencies.map((agency, index) => (
                        <div key={agency.name} className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm">
                            {agency.name}: <strong>₹{agency.value.toFixed(2)} Cr</strong>
                            ({((agency.value / agencyBudgetData.reduce((sum, a) => sum + a.value, 0)) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      ))}

                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">Total Budget:</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{agencyBudgetData.reduce((sum, a) => sum + a.value, 0).toFixed(2)} Crores
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Showing top 10 agencies out of {agencyBudgetData.length}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-[70%]">
                  <input
                    type="text"
                    name="agency"
                    placeholder="Search by Title, Faculty, Amount"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.searchTerm}
                    onChange={handleSearchChange}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      role="img"
                      aria-label="Search icon"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="relative w-[30%]">
                  <select
                    name="agency"
                    value={filters.selectedAgency}
                    onChange={(e) => setFilters({ ...filters, selectedAgency: e.target.value })}
                    className="w-full pl-5 pr-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Agency</option>
                    {uniqueAgencies.map((agency) => (
                      <option key={agency} value={agency}>
                        {agency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  Sponsored Projects FY 2023–24
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-2 text-left">Sr. No.</th>
                        <th className="border px-4 py-2 text-left">Funding Agency</th>
                        <th className="border px-4 py-2 text-left">Faculty Name</th>
                        <th className="border px-4 py-2 text-left">Department</th>
                        <th className="border px-4 py-2 text-left">Title of Project</th>
                        <th className="border px-4 py-2 text-right">Amount (Cr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects && filteredProjects.length > 0 && filteredProjects.map((proj, index) => (
                        <tr key={proj.id} className="even:bg-gray-50">
                          <td className="border px-4 py-2 text-center">{index + 1}</td>
                          <td className="border px-4 py-2">{proj.agency}</td>
                          <td className="border px-4 py-2">{proj.name}</td>
                          <td className="border px-4 py-2">{proj.dept}</td>
                          <td className="border px-4 py-2">{proj.title}</td>
                          <td className="border px-4 py-2 text-right">{proj.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
        
        </main>
      </div>
    </div>
  );
};
export default InstituteDashboard;