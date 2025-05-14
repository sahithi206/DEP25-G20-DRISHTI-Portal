import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/InstituteSidebar";
import TermsAndConditions from "../uc/se/TermsAndConditions";
import jsPDF from "jspdf";
import "jspdf-autotable";


const url = import.meta.env.VITE_REACT_APP_URL;

const UCPage = () => {
  const { projectId } = useParams();
  const [ucType, setUcType] = useState("recurring");
  const [comments, setComments] = useState([]);
  const [uc, setUc] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeSection, setActiveSection] = useState("uc-page");
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [ucData, setUCData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      console.log("comments display");
      try {
        const response = await fetch(`${url}uc-comments/${projectId}/${ucType}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            //   accessToken: localStorage.getItem("token"),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          setFetchError(result.message || "Failed to fetch comments");
          return;
        }

        setComments(result.data);
      } catch (err) {
        console.error("Error fetching comments:", err.message);
        setFetchError("Failed to fetch comments");
      }
    };

    const fetchUC = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${url}institute/ucforms/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: token
          }
        });

        const data = await response.json();
        if (response.ok) {
          setUc([...data.grant]);
        }
      } catch (err) {
        console.error("Error fetching UC:", err.message);
        setFetchError("Failed to fetch UC");
      }
    }
    fetchUC();
    fetchComments();
  }, [projectId, ucType, url]);

  // if (loading) 
  //  <div>Loading...</div>;
  // if (!ucData) return <div>No UC data found.</div>;

  const handleAddComment = async (e) => {
    e.preventDefault();
    // setLoading(true);
    setError("");

    try {
      const response = await fetch(`${url}uc-comments/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token"),
        },
        body: JSON.stringify({ projectId, ucType, comment: newComment }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        setError(result.message || "Failed to add comment");
        return;
      }

      setComments((prevComments) => [...prevComments, result.data]);
      console.log("Fetched Comments:", result.data);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err.message);
      setError("Failed to add comment");
    }
  };

  const fetchUCData = async (type) => {
    // setLoading(true);
    setError("");
    setUCData(null);

    try {
      const endpoint =
        ucType === "recurring"
          ? `${url}projects/generate-uc/recurring/${projectId}`
          : `${url}projects/generate-uc/nonRecurring/${projectId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accessToken: localStorage.getItem("token"),
        },
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.message || `Error fetching ${ucType} UC data`);
        return;
      }

      setUCData(result.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error(`Error fetching ${ucType} UC data:`, err.message);
      setError(`Failed to fetch ${ucType} UC data`);
    }
  };
  const handleSaveAsPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFontSize(16);
    pdf.text("Utilization Certificate", 105, 20, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Title of the Project: ${ucData.title}`, 10, 40);
    pdf.text(`Name of the Scheme: ${ucData.scheme}`, 10, 50);
    pdf.text(`Present Year of Project: ${ucData.currentYear}`, 10, 60);
    pdf.text(`Start Date of Year: ${ucData.startDate}`, 10, 70);
    pdf.text(`End Date of Year: ${ucData.endDate}`, 10, 80);

    const tableData = [
      [
        "Carry Forward",
        "Grant Received",
        "Total",
        ...(ucType === "recurring"
          ? ["Recurring Expenditure", "Human Resources", "Consumables", "Others"]
          : ["Non-Recurring Expenditure"]),
      ],
      [
        `Rs ${ucData.CarryForward}`,
        `Rs ${ucData.yearTotal}`,
        `Rs ${ucData.total}`,
        ...(ucType === "recurring"
          ? [
            `Rs ${ucData.recurringExp}`,
            `Rs ${ucData.human_resources}`,
            `Rs ${ucData.consumables}`,
            `Rs ${ucData.others}`,
          ]
          : [`Rs ${ucData.nonRecurringExp}`]),
      ],
    ];

    pdf.autoTable({
      head: [tableData[0]],
      body: [tableData[1]],
      startY: 90,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    pdf.save(`UC_${ucData.title}_${ucType}.pdf`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUCData(null);
  };

  // const handleSelection = (ucType) => {
  //   setucType(ucType);
  //   fetchUCData(ucType);
  // };
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [filtereduc, setFilteredUC] = useState("");
  const [statFilter, setStatFilter] = useState("");
  useEffect(() => {
    let filtered = uc;

    if (statusFilter) {
      filtered = filtered.filter((proposal) => proposal.type === statusFilter);
    }
    if (statFilter) {
      filtered = filtered.filter((proposal) => proposal.status === statFilter);
    }

    if (searchTitle) {
      filtered = filtered.filter((proposal) =>
        proposal.ucData.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
        (proposal.ucData?.principalInvestigator?.toLowerCase().includes(searchTitle.toLowerCase()) ?? "")
      );
    }

    setFilteredUC(filtered);
  }, [statusFilter, statFilter, searchTitle, uc]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar yes={1} />
      <div className="flex flex-grow">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="p-6 space-y-6 mt-5 mr-9 ml-9 flex-grow">
          <div className="bg-white shadow-md rounded-xl p-6 border-l-8 border-teal-600">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">Utilization Certificates</h1>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md shadow-mt">
            <div className="mb-6">
              <label htmlFor="ucType" className="font-semibold mr-2 text-center">
                UC Type:
              </label>
              <select
                id="ucType"
                value={ucType}
                onChange={(e) => setUcType(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="recurring">Recurring</option>
                <option value="nonRecurring">Non-Recurring</option>
              </select>
            </div>
            <button
              onClick={fetchUCData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View UC
            </button>
            <div></div>
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-1">Comments</h2>
            {fetchError ? (
              <p className="text-center text-red-500">{fetchError}</p>
            ) : comments && comments.length > 0 ? (
              <ul className="space-y-4">
                {comments.map((comment) => (
                  <li key={comment._id} className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-gray-700">
                      <strong>Added By:</strong> {comment.role} {comment.userId?.Name}

                    </p>
                    <p className="text-gray-700">
                      <strong>Comment:</strong> {comment.comment}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Date:</strong> {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No comments available for this UC type.</p>
            )}
            <div className="mt-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border p-2 rounded mb-4"
              />
              <button
                onClick={handleAddComment}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Add Comment
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-4">
            <div className="flex justify-between mb-4 gap-4">
              <input
                type="text"
                placeholder="Search by Title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="flex-grow border border-gray-300 rounded-md px-4 py-2"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                <option value="">All Type</option>
                <option value="nonRecurring">Non Recurring</option>
                <option value="recurring">Recurring</option>
              </select>
              <select
                value={statFilter}
                onChange={(e) => setStatFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                <option value="">All Status</option>
                <option value="approvedByAdmin">Approved By Admin</option>
                <option value="approvedByInst">Approved By Institute</option>
                <option value="pendingAdminApproval">Pending By Admin</option>
                <option value="rejectedByAdmin">Rejected By Admin</option>
                <option value="pending">Pending By Institute</option>

              </select>
            </div>

            {filtereduc.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Project ID</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Principal Investigator(s)</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtereduc.map((proposal) => (
                    <tr key={proposal._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <Link to={`/institute/project-dashboard/${proposal._id}`} className="text-blue-500 hover:underline">
                          {proposal._id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{proposal?.ucData.title || "No Title"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {proposal?.ucData.principalInvestigator?.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {proposal?.ucData.principalInvestigator.map((name, idx) => (
                              <li key={idx}>{name}</li>
                            ))}
                          </ul>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{proposal?.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{proposal?.status === "approvedByAdmin" ? "Approved By Admin" : proposal?.status === "approvedByInst" ? "Approved By Institute" : proposal?.status === "pendingAdminApproval" ? "Pending By Admin" : proposal.status === "rejectedByAdmin" ? "Rejected By Admin" : "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center">No Projects found for this user.</p>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Utilization Certificate - {ucType} </h2>

              <div className="space-y-4 text-sm text-gray-700">
                {ucData ? (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-[90%] max-h-[90vh] overflow-y-auto p-6">
                      <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
              <img src="/3.png" alt="DRISHTI: OneRND India Logo" className="mx-auto w-84 h-32 object-contain"/>
                        <p className="mt-3 text-2xl font-bold text-blue-800">Utilization Certificate</p>
                      </div>

                      <div id="uc-details" className="bg-white shadow-md rounded-lg p-6 mt-6 border-t-4 border-blue-800">
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-bold">GFR 12-A</h3>
                          <p className="text-sm font-medium">[See Rule 238 (1)]</p>
                          <h2 className="text-xl font-bold mt-2">
                            FINAL UTILIZATION CERTIFICATE FOR THE YEAR {ucData.currentYear} in respect of
                          </h2>
                          <p className="text-lg font-semibold">
                            {ucType === "recurring" ? "Recurring" : "Non-Recurring"}
                          </p>
                        </div>

                        <h3 className="text-lg font-semibold text-blue-700 mb-4">
                          {ucType === "recurring" ? "Recurring Grant Details" : "Non-Recurring Grant Details"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <label className="font-semibold text-gray-700">Title of the Project:</label>
                          <span className="px-3 py-1 w-full">: {ucData.title}</span>
                          <label className="font-semibold text-gray-700">Name of the Scheme:</label>
                          <span className="px-3 py-1 w-full">: {ucData.scheme}</span>
                          <label className="font-semibold text-gray-700">Name of the Grant Receiving Organisation:</label>
                          <span className="px-3 py-1 w-full">: {ucData.instituteName}</span>
                          <label className="font-semibold text-gray-700">Name of the Principal Investigator:</label>
                          <span className="px-3 py-1 w-full">: {ucData.principalInvestigator}</span>
                          <label className="font-semibold text-gray-700">Present Year of Project:</label>
                          <span className="px-3 py-1 w-full">: {ucData.currentYear}</span>
                          {/* <label className="font-semibold text-gray-700">Start Date of Year:</label>
                          <span className="px-3 py-1 w-full">: {ucData.startDate}</span>
                          <label className="font-semibold text-gray-700">End Date of Year:</label>
                          <span className="px-3 py-1 w-full">: {ucData.endDate}</span> */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                              Grants position at the beginning of the Financial year
                            </h3>
                            <div className="pl-11 grid grid-cols-2 gap-4">
                              <label className="text-gray-700">Carry forward from previous financial year</label>
                              <span className="px-3 py-1 w-full text-gray-700">₹ {ucData.CarryForward.toLocaleString()}</span>

                              <label className="text-gray-700">Others, If any</label>
                              <span className="px-3 py-1 w-full text-gray-700">₹ 0</span>

                              <label className="text-gray-700">Total</label>
                              <span className="px-3 py-1 w-full text-gray-700">₹ {ucData.CarryForward.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-700 mb-4">Financial Summary</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-300 rounded-lg">
                            <thead>
                              <tr className="bg-blue-100 text-gray-700">
                                <th className="border border-gray-400 px-4 py-2">Unspent Balances of Grants received years (figure as at Sl. No. 7 (iii))</th>
                                <th className="border border-gray-400 px-4 py-2">Interest Earned thereon</th>
                                <th className="border border-gray-400 px-4 py-2">Interest deposited back to Funding Agency</th>
                                <th className="border border-gray-400 px-4 py-2" colSpan="3">Grant received during the year</th>
                                <th className="border border-gray-400 px-4 py-2">Total (1+2 - 3+4)</th>
                                <th className="border border-gray-400 px-4 py-2">Expenditure incurred</th>
                                <th className="border border-gray-400 px-4 py-2">Closing Balances (5 - 6)</th>
                              </tr>
                              <tr className="bg-blue-50 text-gray-700">
                                <th className="border border-gray-400 px-4 py-2">1</th>
                                <th className="border border-gray-400 px-4 py-2">2</th>
                                <th className="border border-gray-400 px-4 py-2">3</th>
                                <th className="border border-gray-400 px-4 py-2">Sanction No.</th>
                                <th className="border border-gray-400 px-4 py-2">Date</th>
                                <th className="border border-gray-400 px-4 py-2">Amount</th>
                                <th className="border border-gray-400 px-4 py-2">5</th>
                                <th className="border border-gray-400 px-4 py-2">6</th>
                                <th className="border border-gray-400 px-4 py-2">7</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="text-center">
                                <td className="border border-gray-400 px-4 py-2">₹ {ucData.CarryForward}</td>
                                <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                                <td className="border border-gray-400 px-4 py-2">₹ 0</td>
                                <td className="border border-gray-400 px-4 py-2">{ucData.sanctionNumber || 'N/A'}</td>
                                <td className="border border-gray-400 px-4 py-2">{ucData.sanctionDate || 'N/A'}</td>
                                <td className="border border-gray-400 px-4 py-2">₹ {ucData.yearTotal}</td>
                                <td className="border border-gray-400 px-4 py-2">₹ {ucData.total}</td>
                                <td className="border border-gray-400 px-4 py-2">₹ {ucData.recurringExp}</td>
                                <td className="border border-gray-400 px-4 py-2">₹ {ucData.total - ucData.recurringExp}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {(ucType === "recurring" || ucType !== "recurring") && (
                          <>
                            <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-4">
                              Component-wise Utilization of Grants
                            </h3>
                            <div className="overflow-x-auto">
                              <table className="w-full border border-gray-300 rounded-lg">
                                <thead>
                                  <tr className="bg-blue-100 text-gray-700">
                                    <th className="border border-gray-400 px-4 py-2">Grant-in-aid-General</th>
                                    <th className="border border-gray-400 px-4 py-2">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="text-center">
                                    <td className="border border-gray-400 px-4 py-2">
                                      ₹ {ucType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                                    </td>
                                    <td className="border border-gray-400 px-4 py-2">
                                      ₹ {ucType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp}
                                    </td>
                                  </tr>

                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-blue-700 mb-4">
                            Details of grants position at the end of the year
                          </h3>
                          <div className="pl-5">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex">
                                <span className="mr-2">(i)</span>
                                <span>Balance available at end of financial year</span>
                              </div>
                              <span>
                                : ₹ {ucData.total - (ucType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                              </span>

                              <div className="flex">
                                <span className="mr-2">(ii)</span>
                                <span>Unspent balance refunded to Funding Agency (if any)</span>
                              </div>
                              <span>: ₹ 0</span>

                              <div className="flex">
                                <span className="mr-2">(iii)</span>
                                <span>Balance (Carry forward to next financial year)</span>
                              </div>
                              <span>
                                : ₹ {ucData.total - (ucType === "recurring" ? ucData.recurringExp : ucData.nonRecurringExp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <TermsAndConditions />

                      {/* <div className="border-t border-gray-200 pt-4 mb-6">
                        <h3 className="text-xl font-semibold mb-4">Signatures</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="border p-4 rounded-lg">
                            <h4 className="font-medium  mb-1">Principal Investigator Signature</h4>
                            <p className="text-medium mb-2 text-gray-500">{ucData.principalInvestigator}</p>
                            <div className="border p-2 rounded mb-2">
                              <img src={piSignature} alt="PI Signature" className="h-24 object-contain" />
                            </div>

                          </div>

                          <div className="border p-4 rounded-lg">
                            <h4 className="font-medium  mb-1">CFO Signature</h4>
                            <p className="text-medium mb-2 text-gray-500">Chief Finance Officer</p>
                            <div className="border p-2 rounded mb-2">
                              <img src={authSignature} alt="CFO Signature" className="h-24 object-contain" />
                            </div>

                          </div>

                          <div className="border p-4 rounded-lg">

                            <h4 className="font-medium  mb-1">Institute Approval</h4>
                            <p className="text-medium mb-2 text-gray-500">{ucData.instituteName}</p>

                            <div className="border p-2 rounded mb-2">
                              <img src={instituteStamp} alt="Institute Stamp" className="h-24 object-contain" />
                            </div>

                          </div>
                        </div>
                      </div> */}

                      <div className="flex justify-end mt-4">
                        <button
                          className="bg-gray-400 text-white px-4 py-2 rounded"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Loading UC data...</p>
                )}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UCPage;

