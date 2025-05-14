import { useState, useContext } from "react";
import jsPDF from "jspdf";
import { AuthContext } from "../Context/Authcontext";
import PropTypes from "prop-types";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
export const ReviewAndSubmit = ({ generalInfo, PIdetails, researchDetails, budgetSummary, bankDetails, onEditDetails = {} }) => {
const [isChecked, setIsChecked] = useState(false);
const [submitted, setSubmitted] = useState(false);
const { submitAcknowledgement } = useContext(AuthContext);
const [showModal, setShowModal] = useState(false);


const EditDetails = async (section) => {
    switch (section) {
        case "generalInfo":
            onEditDetails("General Information");
            break;
        case "PIdetails":
            onEditDetails("Principal Investigator");
            break;
        case "researchDetails":
            onEditDetails("Technical Details");
            break;
        case "budgetSummary":
            onEditDetails("Budget Related Details");
            break;
        case "bankDetails":
            onEditDetails("Bank Details");
            break;
        default:
            break;
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    if (isChecked) {
        try {
            await submitAcknowledgement(isChecked);
            setSubmitted(true);
            console.log("Declaration submitted successfully!");
            toast.success("Proposal submitted successfully!")
        } catch (error) {
            console.error("Error submitting declaration:", error.message);
            toast.error("Failed to submit declaration");
        }
    } else {
        toast.error("Please accept the declaration before submitting.");
    }
};

const exportAsPDF = () => {
    if (
        Object.keys(generalInfo || {}).length === 0 &&
        Object.keys(PIdetails || {}).length === 0 &&
        Object.keys(researchDetails || {}).length === 0 &&
        Object.keys(budgetSummary || {}).length === 0 &&
        Object.keys(bankDetails || {}).length === 0
    ) {
        toast.error("No data to export!");
        return;
    }

    const doc = new jsPDF();
    let y = 20;
    const marginLeft = 15;
    const maxWidth = 160;
    const sectionSpacing = 10;
    const lineSpacing = 7;

    const image = new Image();
    image.src = "/3.png";
    image.onload = function () {
        doc.addImage(image, "PNG", 68, y, 80, 30);
        y += 40;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("ResearchX Proposal Submission", 68, y);
        y += 10;

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(marginLeft, y, 200, y);
        y += sectionSpacing;

        if (generalInfo?.proposalId) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(`Proposal ID: ${generalInfo.proposalId}`, marginLeft, y);
            y += sectionSpacing;
        }

        const renderSection = (title, lines) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(title, marginLeft, y);
            y += sectionSpacing;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            lines.forEach((text) => {
                const wrapped = doc.splitTextToSize(text, maxWidth);
                wrapped.forEach(line => {
                    if (y + lineSpacing > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, marginLeft, y);
                    y += lineSpacing;
                });
            });
            y += sectionSpacing;
        };

        // General Info
        if (generalInfo && Object.keys(generalInfo).length > 0) {
            const generalInfoDetails = [
                ["Name", generalInfo.name],
                ["Email", generalInfo.email],
                ["Address", generalInfo.address],
                ["Mobile No", generalInfo.mobileNo],
                ["Institute", generalInfo.instituteName],
                ["Department", generalInfo.areaOfSpecialization],
                ["Ongoing DBT Projects", generalInfo.DBTproj_ong || "0"],
                ["Completed DBT Projects", generalInfo.DBTproj_completed || "0"],
                ["Other Ongoing Projects", generalInfo.Proj_ong || "0"],
                ["Other Completed Projects", generalInfo.Proj_completed || "0"],
            ];

            generalInfoDetails.forEach(([label, value]) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(`${label}`, marginLeft, y);

                doc.setFont("helvetica", "normal");
                doc.text(`:  ${value || "N/A"}`, 100, y, { align: "left" });

                y += lineSpacing;
            });
            y += sectionSpacing;
        }

        const renderPIMembers = (members, title) => {
            if (members?.length > 0) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.text(title, marginLeft, y);
                y += sectionSpacing;

                const tableBody = members.map((member) => [
                    member.Name || "N/A",
                    member.email || "N/A",
                    member.address || "N/A",
                    member.Mobile || "N/A",
                    member.Institute || "N/A",
                    member.Dept || "N/A",
                    member.DOB || "N/A",
                    member.Gender || "N/A",
                ]);

                autoTable(doc, {
                    startY: y,
                    head: [[
                        "Name",
                        "Email",
                        "Address",
                        "Mobile No",
                        "Institute",
                        "Department",
                        "Date of Birth",
                        "Gender"
                    ]],
                    body: tableBody,
                    margin: { left: marginLeft },
                    styles: { fontSize: 10, cellPadding: 2 },
                    theme: 'grid',
                    headStyles: { fillColor: [64, 64, 64] }, // Dark grey color
                    didDrawPage: (data) => {
                        y = data.cursor.y + sectionSpacing;
                    },
                });
            }
        };

        // PI & Co-PI
        if (PIdetails) {
            renderPIMembers(PIdetails.piList, "Principal Investigator(s)");
            renderPIMembers(PIdetails.coPiList, "Co-Principal Investigator(s)");
        }

  // Technical Details
if (researchDetails && Object.keys(researchDetails).length > 0) {
    // Iterate over the research details and print them, excluding _id and __v
    Object.entries(researchDetails).forEach(([label, value]) => {
        // Skip _id and __v fields
        if (label === "_id" || label === "__v"||label==="proposalId") return;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`${label}`, marginLeft, y);

        doc.setFont("helvetica", "normal");
        // Wrap the text of the value to avoid overflow
        const valueText = `${value || "N/A"}`;
        const wrappedValue = doc.splitTextToSize(valueText, maxWidth - 100);
        
        wrappedValue.forEach(line => {
            if (y + lineSpacing > 270) { // Check if the current y exceeds the page height
                doc.addPage();
                y = 20;
            }
            doc.text(line, 100, y);
            y += lineSpacing;
        });

    });

    y += sectionSpacing; // Add space before the objectives section if available

    if (researchDetails.objectives?.length > 0) {
        // Print the objectives section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Objectives:", marginLeft, y);
        y += sectionSpacing;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        // Iterate over the objectives and wrap text if necessary
        researchDetails.objectives.forEach((objective, index) => {
            const wrappedObjective = doc.splitTextToSize(`${index + 1}. ${objective}`, maxWidth);
            
            wrappedObjective.forEach(line => {
                if (y + lineSpacing > 270) { // Check if the current y exceeds the page height
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, marginLeft, y);
                y += lineSpacing;
            });
        });

        y += sectionSpacing; // Add space after objectives
    }
}


        // Budget Summary
        if (budgetSummary && Object.keys(budgetSummary).length > 0) {
            const budgetDetails = [
                `Non-Recurring Cost: ₹${budgetSummary.non_recurring_total || "0"}`,
                `Recurring Cost: ₹${budgetSummary.recurring_total || "0"}`,
                `Total Cost: ₹${budgetSummary.total || "0"}`,
            ];
            renderSection("Budget Summary", budgetDetails);
        }

        // Bank Details
        if (bankDetails && Object.keys(bankDetails).length > 0) {
            const bankDetailsContent = [
                ["Name", bankDetails.name],
                ["Account Number", bankDetails.accountNumber],
                ["Account Type", bankDetails.accountType],
                ["Bank Name", bankDetails.bankName],
                ["IFSC Code", bankDetails.ifscCode],
            ];

            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("Bank Details", marginLeft, y);
            y += sectionSpacing;

            bankDetailsContent.forEach(([label, value]) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text(`${label}`, marginLeft, y);

                doc.setFont("helvetica", "normal");
                doc.text(`:  ${value || "N/A"}`, 100, y, { align: "left" });

                y += lineSpacing;
            });
            y += sectionSpacing;
        }

        // Timestamp & Signature
        const currentDate = new Date().toLocaleString();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Generated on: ${currentDate}`, marginLeft, y);
        y += sectionSpacing;
        y += 20;

        // Page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Page ${i} of ${pageCount}`, 200, 290, { align: "right" });
        }

        // Save
        doc.save("ResearchX_Acknowledgement.pdf");
    };
};


    return (
        <div>
            <div className="w-auto min-w-[300px] max-w-3xl mx-auto bg-gray-50 overflow-x-auto">
                <div className="w-auto min-w-[300px] mx-auto p-6 bg-white rounded-lg shadow-lg border mt-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Review and Submit</h2>

                    {(
                        <>
                            {!submitted ? (
                                <form onSubmit={(e) => {
          e.preventDefault(); 
          setShowModal(true); 
        }} className="space-y-8">
                                    {generalInfo && (
                                        <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">

                                            <div className="flex justify-between items-center mb-6 pb-2 border-b-2">
                                                <h3 className="text-2xl font-bold text-gray-800">
                                                    General Information
                                                </h3>
                                                <button
                                                    onClick={() => EditDetails("generalInfo")}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                            <ul className="space-y-3">
                                                {Object.keys(generalInfo).length > 0 ? (
                                                    <>
                                                        {[
                                                            ["Name", generalInfo.name],
                                                            ["Email", generalInfo.email],
                                                            ["Address", generalInfo.address],
                                                            ["Mobile No", generalInfo.mobileNo],
                                                            ["Institute", generalInfo.instituteName],
                                                            ["Department", generalInfo.areaOfSpecialization],
                                                            ["Ongoing DBT Projects", generalInfo.DBTproj_ong || "0"],
                                                            ["Completed DBT Projects", generalInfo.DBTproj_completed || "0"],
                                                            ["Other Ongoing Projects", generalInfo.Proj_ong || "0"],
                                                            ["Other Completed Projects", generalInfo.Proj_completed || "0"],
                                                        ].map(([label, value], index) => (
                                                            <li key={index} className="flex">
                                                                <span className="w-1/3 font-semibold text-gray-700">{label}:</span>
                                                                <span className="w-2/3 text-gray-900">{value || "N/A"}</span>
                                                            </li>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <li className="text-gray-500 text-center">No data entered</li>
                                                )}
                                            </ul>

                                        </div>
                                    )}

                                    {PIdetails && (PIdetails.piList?.length > 0 || PIdetails.coPiList?.length > 0) ? (
                                        <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                            {[
                                                ["Principal Investigator(s)", PIdetails.piList],
                                                ["Co-Principal Investigator(s)", PIdetails.coPiList]
                                            ].map(([title, list]) =>
                                                list?.length > 0 && (
                                                    <div key={title} className="mb-6">
                                                        <div className="flex justify-between items-center mb-6 pb-2 border-b-2">
                                                            <h3 className="text-2xl font-bold text-gray-800">
                                                                {title}
                                                            </h3>
                                                            <button
                                                                onClick={() => EditDetails("PIdetails")}
                                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                        <div className="overflow-x-auto mt-4">
                                                            <table className="min-w-full bg-white border border-blue-300 rounded-lg shadow-sm">
                                                                <thead>
                                                                    <tr className="bg-blue-100 text-gray-800">
                                                                        <th className="p-3 border border-gray-300 ">Name</th>
                                                                        <th className="p-3 border border-gray-300">Email</th>
                                                                        <th className="p-3 border border-gray-300">Address</th>
                                                                        <th className="p-3 border border-gray-300">Mobile No</th>
                                                                        <th className="p-3 border border-gray-300">Institute Name</th>
                                                                        <th className="p-3 border border-gray-300">Department</th>
                                                                        <th className="p-3 border border-gray-300">Date of Birth</th>
                                                                        <th className="p-3 border border-gray-300">Gender</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {list.map((pi, index) => (
                                                                        <tr key={index} className="border-b border-blue-200 hover:bg-blue-50 transition">
                                                                            <td className="p-3 border border-gray-200">{pi.Name || "N/A"}</td>
                                                                            <td className="p-3 border border-gray-200">{pi.email || "N/A"}</td>
                                                                            <td className="p-3 border border-gray-200">{pi.address || "N/A"}</td>
                                                                            <td className="p-3 border border-gray-200">{pi.Mobile || "N/A"}</td>
                                                                            <td className="p-3 border border-gray-200">{pi.Institute || "N/A"}</td>
                                                                            <td className="p-3 border border-gray-200">{pi.Dept || "N/A"}</td>
                                                                            <td className="p-3 border border-gray-200">{pi.DOB || "N/A"}</td>
                                                                            <td className="p-3 border border-gray-200">{pi.Gender || "N/A"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 text-center">No Principal Investigator details entered.</p>
                                    )}

                                    {researchDetails && (
                                        <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center mb-6 pb-2 border-b-2">
                                                <h3 className="text-2xl font-bold text-gray-800">
                                                    Technical Details
                                                </h3>
                                                <button
                                                    onClick={() => EditDetails("researchDetails")}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                                >
                                                    Edit
                                                </button>
                                            </div>                                         <h3 className="text-2xl font-bold text-gray-900 mb-4">{researchDetails.Title}</h3>

                                            <p className="text-gray-700 text-base mb-3">
                                                <span className="text-lg font-semibold text-gray-900">Duration:</span> {researchDetails.Duration} months
                                            </p>

                                            <p className="text-gray-700 text-base mb-4">
                                                <span className="text-lg font-semibold text-gray-900">Summary:</span> {researchDetails.Summary}
                                            </p>

                                            <div className="text-gray-700 text-base mb-4">
                                                <p className="text-lg font-semibold text-gray-900">Objectives</p>
                                                {researchDetails?.objectives?.length > 0 ? (
                                                    <ul className="list-disc list-inside text-gray-700 text-base space-y-1">
                                                        {researchDetails.objectives.map((obj, index) => (
                                                            <p key={index}> {obj}</p>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-400 italic">No objectives listed.</p>
                                                )}
                                            </div>

                                            <p className="text-gray-700 text-base mt-4">
                                                <span className="text-lg font-semibold text-gray-900">Output:</span> {researchDetails.Output}
                                            </p>

                                            <p className="text-gray-700 text-base mt-4">
                                                <span className="text-lg font-semibold text-gray-900">Other:</span> {researchDetails.other}
                                            </p>

                                            <p className="text-gray-700 text-base mt-4">
                                                <span className="text-lg font-semibold text-gray-900">Proposal ID:</span> {researchDetails.proposalId}
                                            </p>
                                        </div>
                                    )}

                                    {budgetSummary && (
                                        <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center mb-6 pb-2 border-b-2">
                                                <h3 className="text-2xl font-bold text-gray-800">
                                                    Budget Summary
                                                </h3>
                                                <button
                                                    onClick={() => EditDetails("budgetSummary")}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                            <div className="flex justify-between mb-4">
                                                <span className="text-gray-700 text-lg font-medium">Overhead:</span>
                                                <span className="font-bold text-blue-800">₹{budgetSummary.overhead}</span>
                                            </div>
                                            <div className="flex justify-between mb-4">
                                                <span className="text-gray-700 text-lg font-medium">Non-Recurring Cost:</span>
                                                <span className="font-bold text-blue-800">₹{budgetSummary.non_recurring_total}</span>
                                            </div>

                                            <div className="flex justify-between mb-4">
                                                <span className="text-gray-700 text-lg font-medium">Recurring Cost:</span>
                                                <span className="font-bold text-blue-800">₹{budgetSummary.recurring_total}</span>
                                            </div>

                                            <div className="flex justify-between mt-2 border-t pt-4">
                                                <span className="text-gray-900 font-semibold text-lg">Total Cost:</span>
                                                <span className="font-bold text-green-700">₹{budgetSummary.total}</span>
                                            </div>
                                        </div>
                                    )}

                                    {bankDetails && (
                                        <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-center mb-6 pb-2 border-b-2">
                                                <h3 className="text-2xl font-bold text-gray-800">
                                                    Bank Details             </h3>
                                                <button
                                                    onClick={() => EditDetails("bankDetails")}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                            {Object.keys(bankDetails).length > 0 ? (
                                                <>
                                                    {[
                                                        ["Name", bankDetails.name],
                                                        ["Account Number", bankDetails.accountNumber],
                                                        ["Account Type", bankDetails.accountType],
                                                        ["Bank Name", bankDetails.bankName],
                                                        ["IFSC Code", bankDetails.ifscCode],
                                                    ].map(([label, value], index) => (
                                                        <li key={index} className="flex">
                                                            <span className="w-1/3 font-semibold text-gray-700">{label}:</span>
                                                            <span className="w-2/3 text-gray-900">{value || "N/A"}</span>
                                                        </li>
                                                    ))}
                                                </>
                                            ) : (
                                                <li className="text-gray-500 text-center">No data entered</li>
                                            )}
                                        </div>
                                    )}
                                     {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 p-5 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="mb-10">Are you sure you want to submit?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleSubmit}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
                                    <div className="flex items-center justify-center space-x-4 bg-gray-100 p-4 rounded-lg border border-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                            className="w-6 h-6 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-800 font-semibold">
                                            I carefully reviewed and confirm the details are accurate.
                                        </span>
                                    </div>

                                   <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 uppercase tracking-wider disabled:opacity-50"
                                        disabled={!isChecked}
                                    >
                                        Submit 
                                    </button>
                                </form>
                                
                            ) : (
                                <div className="text-center bg-green-50 border border-green-200 p-8 rounded-xl">
                                    <p className="text-2xl font-bold text-green-800 mb-4">
                                        Proposal Submitted Successfully!
                                    </p>
                                    <p className="text-green-600">
                                        Your proposal has been received and will be reviewed shortly.
                                    </p>
                                </div>
                            )}
                            
                            <div className="mt-8 flex justify-center space-x-6">
                                <button
                                    onClick={exportAsPDF}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 flex items-center space-x-2"
                                >
                                    <span>Export as PDF</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
ReviewAndSubmit.propTypes = {
    generalInfo: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        address: PropTypes.string,
        mobileNo: PropTypes.string,
        instituteName: PropTypes.string,
        areaOfSpecialization: PropTypes.string,
        DBTproj_ong: PropTypes.string,
        DBTproj_completed: PropTypes.string,
        Proj_ong: PropTypes.string,
        Proj_completed: PropTypes.string,
        proposalId: PropTypes.string,
    }),
    PIdetails: PropTypes.shape({
        piList: PropTypes.arrayOf(
            PropTypes.shape({
                Name: PropTypes.string,
                email: PropTypes.string,
                address: PropTypes.string,
                Mobile: PropTypes.string,
                Institute: PropTypes.string,
                Dept: PropTypes.string,
                DOB: PropTypes.string,
                Gender: PropTypes.string,
            })
        ),
        coPiList: PropTypes.arrayOf(
            PropTypes.shape({
                Name: PropTypes.string,
                email: PropTypes.string,
                address: PropTypes.string,
                Mobile: PropTypes.string,
                Institute: PropTypes.string,
                Dept: PropTypes.string,
                DOB: PropTypes.string,
                Gender: PropTypes.string,
            })
        ),
    }),
    researchDetails: PropTypes.shape({
        Title: PropTypes.string,
        Duration: PropTypes.string,
        Summary: PropTypes.string,
        objectives: PropTypes.arrayOf(PropTypes.string),
        Output: PropTypes.string,
        other: PropTypes.string,
        proposalId: PropTypes.string,
    }),
    budgetSummary: PropTypes.shape({
        non_recurring_total: PropTypes.string,
        recurring_total: PropTypes.string,
        objectives: PropTypes.arrayOf(PropTypes.string),
        forEach: PropTypes.func, // Added to validate forEach usage
    }),
    bankDetails: PropTypes.shape({
        name: PropTypes.string,
        accountNumber: PropTypes.string,
        accountType: PropTypes.string,
        bankName: PropTypes.string,
        ifscCode: PropTypes.string,
    }),
    onEditDetails: PropTypes.func.isRequired,
};

