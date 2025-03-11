import { useState, useEffect, useContext } from "react";
import jsPDF from "jspdf";
import HomeNavbar from "../../utils/HomeNavbar";
import { AuthContext } from "../Context/Authcontext";

const ReviewAndSubmit = ({ formData = {} }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { submitAcknowledgement } = useContext(AuthContext);
    
    const [toggleDetails, setToggleDetails] = useState({});
    const toggleMemberDetails = (index) => {
        setToggleDetails((prev) => {
            const newState = { ...prev, [index]: !prev[index] };
            console.log("Updated State:", newState);
            return newState;
        });
    };
    

    useEffect(() => {
        console.log("Form Data Received:", formData);
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isChecked) {
            try {
                await submitAcknowledgement(isChecked);
                setSubmitted(true);
                console.log("Declaration submitted successfully!");
            } catch (error) {
                console.error("Error submitting declaration:", error.message);
                alert("Failed to submit declaration");
            }
        } else {
            alert("Please accept the declaration before submitting.");
        }
    };

    const exportAsJSON = () => {
        if (!formData || Object.keys(formData).length === 0) {
            alert("No data to export!");
            return;
        }
        const jsonData = JSON.stringify(formData, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "formData.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const formatMembersForPDF = (members) => {
        return members
            .map((member, index) => 
                `Member ${index + 1}:\nName: ${member.name}\nRole: ${member.role}\nEmail: ${member.email || "N/A"}\nAddress: ${member.address || "N/A"}\nMobile No: ${member.mobileNo || "N/A"}\nInstitute: ${member.instituteName || "N/A"}\nDepartment: ${member.Dept || "N/A"}\n`
            )
            .join("\n\n"); 
    };

    const exportAsPDF = () => {
        if (!formData || Object.keys(formData).length === 0) {
            alert("No data to export!");
            return;
        }
    
        const doc = new jsPDF();
        let y = 20;
        const marginLeft = 15;
        const maxWidth = 160;
        const sectionSpacing = 10;
        const lineSpacing = 7;
    
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Review and Submit Form", marginLeft + 30, y);
        y += 10;
    
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.line(marginLeft, y, 200, y);
        y += sectionSpacing;
    
        Object.entries(formData).forEach(([section, details]) => {
            if (!details || Object.keys(details).length === 0) return;
    
            if (y + sectionSpacing > 270) {
                doc.addPage();
                y = 20;
            }
    
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(section, marginLeft, y);
            doc.line(marginLeft, y + 2, 200, y + 2);
            y += sectionSpacing;
    
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
    
            if (section === "principalInvestigator" && details.members?.length > 0) {
                doc.setFont("helvetica", "bold");
                doc.text("Principal Investigator Members", marginLeft, y);
                y += sectionSpacing;
    
                details.members.forEach((member, index) => {
                    if (y + lineSpacing > 270) {
                        doc.addPage();
                        y = 20;
                    }
    
                    doc.setFont("helvetica", "normal");
                    doc.text(`Member ${index + 1}:`, marginLeft, y);
                    y += lineSpacing;
    
                    const memberDetails = [
                        `Name: ${member.name || "N/A"}`,
                        `Role: ${member.role || "N/A"}`,
                        `Email: ${member.email || "N/A"}`,
                        `Address: ${member.address || "N/A"}`,
                        `Mobile No: ${member.mobileNo || "N/A"}`,
                        `Institute: ${member.instituteName || "N/A"}`,
                        `Department: ${member.Dept || "N/A"}`,
                        `Ongoing DBT Projects: ${member.DBTproj_ong || "0"}`,
                        `Completed DBT Projects: ${member.DBTproj_completed || "0"}`,
                        `Other Ongoing Projects: ${member.Proj_ong || "0"}`,
                        `Other Completed Projects: ${member.Proj_completed || "0"}`,
                    ];
    
                    memberDetails.forEach((text) => {
                        doc.text(text, marginLeft + 10, y);
                        y += lineSpacing;
                    });
    
                    y += sectionSpacing;
                });
            }
            else if (section === "budgetDetails") {
                if (details.nonRecurring && details.nonRecurring.items.length > 0) {
                    doc.setFont("helvetica", "bold");
                    doc.text("Non-Recurring Items", marginLeft, y);
                    y += sectionSpacing;
    
                    details.nonRecurring.items.forEach((item) => {
                        if (y + lineSpacing > 270) {
                            doc.addPage();
                            y = 20;
                        }
                        doc.setFont("helvetica", "normal");
                        doc.text(
                            `${item.item}: ${item.quantity} units @ $${item.unitCost} each, Total: $${item.total}`,
                            marginLeft,
                            y
                        );
                        y += lineSpacing;
                    });
                    y += sectionSpacing;
                }
    
                if (details.recurring) {
                    Object.entries(details.recurring).forEach(([category, items]) => {
                        if (items.length > 0) {
                            doc.setFont("helvetica", "bold");
                            doc.text(category.charAt(0).toUpperCase() + category.slice(1), marginLeft, y);
                            y += sectionSpacing;
    
                            items.forEach((item) => {
                                if (y + lineSpacing > 270) {
                                    doc.addPage();
                                    y = 20;
                                }
                                doc.setFont("helvetica", "normal");
    
                                let text = "";
                                if (category === "manpower") {
                                    text = `${item.role}: ${item.numEmployees} employees @ $${item.salary} each, Total: $${item.total}`;
                                } else if (category === "material") {
                                    text = `${item.material}: ${item.quantity} units @ $${item.perUnitCost} each, Total: $${item.total}`;
                                } else if (category === "others") {
                                    text = `${item.expense}: $${item.amount}`;
                                }
    
                                doc.text(text, marginLeft, y);
                                y += lineSpacing;
                            });
    
                            y += sectionSpacing;
                        }
                    });
                }
            }
            else {
                Object.entries(details).forEach(([key, value]) => {
                    if (y + lineSpacing > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    const keyText = `${key}:`;
                    const valueText = value ? value.toString() : "N/A";
                    const wrappedText = doc.splitTextToSize(valueText, maxWidth - 50);
    
                    doc.text(keyText, marginLeft, y);
                    doc.text(wrappedText, marginLeft + 50, y);
    
                    y += wrappedText.length * 6 + 4;
                });
            }
    
            y += sectionSpacing;
        });
    
        doc.save("SubmissionForm.pdf");
    };
    

    return (
        <div>
        <div className="w-auto min-w-[300px] max-w-5xl mx-auto bg-gray-50 overflow-x-auto">
            <div className="w-auto min-w-[300px] mx-auto p-6 bg-white rounded-lg shadow-lg border mt-8 overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center"> Review and Submit</h2>

                {Object.keys(formData).length === 0 ? (
                    <p className="text-red-600 font-semibold text-center bg-red-50 p-6 rounded-lg border border-red-200">
                        No form data available. Please complete the previous sections.
                    </p>
                ) : (
                    <>
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {Object.entries(formData).map(([section, details]) => (
                                    section !== "budgetDetails"  && section !== "principalInvestigator"&& (
                                        <div
                                            key={section}
                                            className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2">
                                                {section}
                                            </h3>
                                            <ul className="space-y-3">
                                                {details && Object.keys(details).length > 0 ? (
                                                    Object.entries(details).map(([key, value]) => (
                                                        <li
                                                            key={key}
                                                            className="flex bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                                                        >
                                                            <div className="w-1/4 font-semibold text-gray-700 text-eft pr-4">{key}</div>
                                                            <div className="w-3/4 text-gray-900 font-medium">{value || "N/A"}</div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-gray-500 text-center">No data entered</li>
                                                )}
                                            </ul>
                                        </div>
                                    )
                                ))}

{formData.principalInvestigator && formData.principalInvestigator.members?.length > 0 ? (
                                        <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2">
                                                Principal Investigator Details
                                            </h3>
                                            <ul className="space-y-6">
                                                {formData.principalInvestigator.members.map((pi, index) => (
                                                    <li
                                                        key={index}
                                                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition flex flex-col"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                                                {pi.role}: {pi.name}
                                                            </h4>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleMemberDetails(index)}
                                                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                                            >
                                                                {toggleDetails[index] ? "Hide Details" : "Show Details"}
                                                            </button>
                                                        </div>
                                                        {toggleDetails[index] && (
                                                            <div className="mt-4">
                                                                <p><strong>Email:</strong> {pi.email || "N/A"}</p>
                                                                <p><strong>Address:</strong> {pi.address || "N/A"}</p>
                                                                <p><strong>Mobile No:</strong> {pi.mobileNo || "N/A"}</p>
                                                                <p><strong>Institute Name:</strong> {pi.instituteName || "N/A"}</p>
                                                                <p><strong>Department:</strong> {pi.Dept || "N/A"}</p>
                                                                <p><strong>No. of DBT Projects (Ongoing):</strong> {pi.DBTproj_ong || "0"}</p>
                                                                <p><strong>No. of DBT Projects (Completed):</strong> {pi.DBTproj_completed || "0"}</p>
                                                                <p><strong>No. of Other Projects (Ongoing):</strong> {pi.Proj_ong || "0"}</p>
                                                                <p><strong>No. of Other Projects (Completed):</strong> {pi.Proj_completed || "0"}</p>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center">No Principal Investigator details entered.</p>
                                    )}


                                {formData.budgetDetails && (
                                    <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2">
                                             Budget Breakdown
                                        </h3>

                                        {/* Non-Recurring Section */}
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-blue-800 mb-4 bg-blue-100 p-3 rounded-lg">
                                                Non-Recurring Items
                                            </h4>
                                            {formData.budgetDetails.nonRecurring.items.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {formData.budgetDetails.nonRecurring.items.map((item, index) => (
                                                        item.item && item.quantity && item.unitCost && item.total ? (
                                                            <li
                                                                key={index}
                                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold text-gray-800">{item.item}</span>
                                                                    <div className="text-right">
                                                                        <span className="text-gray-600 mr-2">
                                                                            {item.quantity} units @ ${item.unitCost} each
                                                                        </span>
                                                                        <span className="font-bold text-green-600">
                                                                            Total: ${item.total}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ) : null
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-center">No non-recurring items</p>
                                            )}
                                        </div>

                                        {/* Recurring Section */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-blue-800 mb-4 bg-blue-100 p-3 rounded-lg">
                                                Recurring Items
                                            </h4>
                                            {Object.entries(formData.budgetDetails.recurring).map(([category, items]) => (
                                                items.length > 0 && (
                                                    <div key={category} className="mb-6">
                                                        <h5 className="font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                                        </h5>
                                                        <ul className="space-y-3">
                                                            {items.map((item, index) => (
                                                                (category === 'manpower' && item.role && item.numEmployees && item.salary && item.total) ? (
                                                                    <li
                                                                        key={index}
                                                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="font-semibold text-gray-800">{item.role}</span>
                                                                            <div className="text-right">
                                                                                <span className="text-gray-600 mr-2">
                                                                                    {item.numEmployees} employees @ ${item.salary} each
                                                                                </span>
                                                                                <span className="font-bold text-green-600">
                                                                                    Total: ${item.total}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ) : (category === 'material' && item.material && item.quantity && item.perUnitCost && item.total) ? (
                                                                    <li
                                                                        key={index}
                                                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="font-semibold text-gray-800">{item.material}</span>
                                                                            <div className="text-right">
                                                                                <span className="text-gray-600 mr-2">
                                                                                    {item.quantity} units @ ${item.perUnitCost} each
                                                                                </span>
                                                                                <span className="font-bold text-green-600">
                                                                                    Total: ${item.total}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ) : (category === 'others' && item.expense && item.amount) ? (
                                                                    <li
                                                                        key={index}
                                                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="font-semibold text-gray-800">{item.expense}</span>
                                                                            <span className="font-bold text-green-600">
                                                                                Total: ${item.amount}
                                                                            </span>
                                                                        </div>
                                                                    </li>
                                                                ) : null
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )
                                            ))}
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
                                     Submit Proposal
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
                                onClick={exportAsJSON}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center space-x-2"
                            >
                                <span>Export as JSON</span>
                            </button>
                            <button
                                onClick={exportAsPDF}
                                className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 flex items-center space-x-2"
                            >
                                {/* <span>📝</span> */}
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

export default ReviewAndSubmit;
/*import { useState, useEffect, useContext } from "react";
import jsPDF from "jspdf";
import HomeNavbar from "../../utils/HomeNavbar";
import { AuthContext } from "../Context/Authcontext";

const ReviewAndSubmit = ({ formData = {} }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { submitAcknowledgement } = useContext(AuthContext);

    useEffect(() => {
        console.log("Form Data Received:", formData);
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isChecked) {
            try {
                await submitAcknowledgement(isChecked);
                setSubmitted(true);
                console.log("Declaration submitted successfully!");
            } catch (error) {
                console.error("Error submitting declaration:", error.message);
                alert("Failed to submit declaration");
            }
        } else {
            alert("Please accept the declaration before submitting.");
        }
    };

    const exportAsJSON = () => {
        if (!formData || Object.keys(formData).length === 0) {
            alert("No data to export!");
            return;
        }
        const jsonData = JSON.stringify(formData, null, 2);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "formData.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const exportAsPDF = () => {
        if (!formData || Object.keys(formData).length === 0) {
            alert("No data to export!");
            return;
        }

        const doc = new jsPDF();
        let y = 20;
        const marginLeft = 15;
        const maxWidth = 160;
        const sectionSpacing = 10;
        const lineSpacing = 7;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Review and Submit Form", marginLeft + 30, y);
        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.line(marginLeft, y, 200, y);
        y += sectionSpacing;

        Object.entries(formData).forEach(([section, details]) => {
            if (!details || Object.keys(details).length === 0) return;

            if (y + sectionSpacing > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(section, marginLeft, y);
            doc.line(marginLeft, y + 2, 200, y + 2);
            y += sectionSpacing;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);

            if (section === "budgetDetails") {
                if (details.nonRecurring && details.nonRecurring.items.length > 0) {
                    doc.setFont("helvetica", "bold");
                    doc.text("Non-Recurring Items", marginLeft, y);
                    y += sectionSpacing;

                    details.nonRecurring.items.forEach((item) => {
                        if (y + lineSpacing > 270) {
                            doc.addPage();
                            y = 20;
                        }
                        doc.setFont("helvetica", "normal");
                        doc.text(
                            `${item.item}: ${item.quantity} units @ $${item.unitCost} each, Total: $${item.total}`,
                            marginLeft,
                            y
                        );
                        y += lineSpacing;
                    });
                    y += sectionSpacing;
                }

                if (details.recurring) {
                    Object.entries(details.recurring).forEach(([category, items]) => {
                        if (items.length > 0) {
                            doc.setFont("helvetica", "bold");
                            doc.text(category.charAt(0).toUpperCase() + category.slice(1), marginLeft, y);
                            y += sectionSpacing;

                            items.forEach((item) => {
                                if (y + lineSpacing > 270) {
                                    doc.addPage();
                                    y = 20;
                                }
                                doc.setFont("helvetica", "normal");

                                let text = "";
                                if (category === "manpower") {
                                    text = `${item.role}: ${item.numEmployees} employees @ $${item.salary} each, Total: $${item.total}`;
                                } else if (category === "material") {
                                    text = `${item.material}: ${item.quantity} units @ $${item.perUnitCost} each, Total: $${item.total}`;
                                } else if (category === "others") {
                                    text = `${item.expense}: $${item.amount}`;
                                }

                                doc.text(text, marginLeft, y);
                                y += lineSpacing;
                            });

                            y += sectionSpacing;
                        }
                    });
                }
            } else {
                Object.entries(details).forEach(([key, value]) => {
                    if (y + lineSpacing > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    const keyText = `${key}:`;
                    const valueText = value ? value.toString() : "N/A";
                    const wrappedText = doc.splitTextToSize(valueText, maxWidth - 50);

                    doc.text(keyText, marginLeft, y);
                    doc.text(wrappedText, marginLeft + 50, y);

                    y += wrappedText.length * 6 + 4;
                });
            }

            y += sectionSpacing;
        });

        doc.save("SubmissionForm.pdf");
    };

    return (
        <div>
        <HomeNavbar />
        <div className="w-auto min-w-[300px] max-w-5xl mx-auto bg-gray-50 overflow-x-auto">
            <div className="w-auto min-w-[300px] mx-auto p-6 bg-white rounded-lg shadow-lg border mt-8 overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center"> Review and Submit</h2>

                {Object.keys(formData).length === 0 ? (
                    <p className="text-red-600 font-semibold text-center bg-red-50 p-6 rounded-lg border border-red-200">
                        No form data available. Please complete the previous sections.
                    </p>
                ) : (
                    <>
                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {Object.entries(formData).map(([section, details]) => (
                                    section !== "budgetDetails" && (
                                        <div
                                            key={section}
                                            className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2">
                                                {section}
                                            </h3>
                                            <ul className="space-y-3">
                                                {details && Object.keys(details).length > 0 ? (
                                                    Object.entries(details).map(([key, value]) => (
                                                        <li
                                                            key={key}
                                                            className="flex bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                                                        >
                                                            <div className="w-1/4 font-semibold text-gray-700 text-eft pr-4">{key}</div>
                                                            <div className="w-3/4 text-gray-900 font-medium">{value || "N/A"}</div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-gray-500 text-center">No data entered</li>
                                                )}
                                            </ul>
                                        </div>
                                    )
                                ))}

                                {formData.budgetDetails && (
                                    <div className="bg-blue-50 w-auto min-w-[300px] border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2">
                                             Budget Breakdown
                                        </h3>

                                    
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-blue-800 mb-4 bg-blue-100 p-3 rounded-lg">
                                                Non-Recurring Items
                                            </h4>
                                            {formData.budgetDetails.nonRecurring.items.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {formData.budgetDetails.nonRecurring.items.map((item, index) => (
                                                        item.item && item.quantity && item.unitCost && item.total ? (
                                                            <li
                                                                key={index}
                                                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-semibold text-gray-800">{item.item}</span>
                                                                    <div className="text-right">
                                                                        <span className="text-gray-600 mr-2">
                                                                            {item.quantity} units @ ${item.unitCost} each
                                                                        </span>
                                                                        <span className="font-bold text-green-600">
                                                                            Total: ${item.total}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ) : null
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-center">No non-recurring items</p>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-lg font-semibold text-blue-800 mb-4 bg-blue-100 p-3 rounded-lg">
                                                Recurring Items
                                            </h4>
                                            {Object.entries(formData.budgetDetails.recurring).map(([category, items]) => (
                                                items.length > 0 && (
                                                    <div key={category} className="mb-6">
                                                        <h5 className="font-bold text-gray-700 mb-3 uppercase tracking-wide">
                                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                                        </h5>
                                                        <ul className="space-y-3">
                                                            {items.map((item, index) => (
                                                                (category === 'manpower' && item.role && item.numEmployees && item.salary && item.total) ? (
                                                                    <li
                                                                        key={index}
                                                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="font-semibold text-gray-800">{item.role}</span>
                                                                            <div className="text-right">
                                                                                <span className="text-gray-600 mr-2">
                                                                                    {item.numEmployees} employees @ ${item.salary} each
                                                                                </span>
                                                                                <span className="font-bold text-green-600">
                                                                                    Total: ${item.total}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ) : (category === 'material' && item.material && item.quantity && item.perUnitCost && item.total) ? (
                                                                    <li
                                                                        key={index}
                                                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="font-semibold text-gray-800">{item.material}</span>
                                                                            <div className="text-right">
                                                                                <span className="text-gray-600 mr-2">
                                                                                    {item.quantity} units @ ${item.perUnitCost} each
                                                                                </span>
                                                                                <span className="font-bold text-green-600">
                                                                                    Total: ${item.total}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ) : (category === 'others' && item.expense && item.amount) ? (
                                                                    <li
                                                                        key={index}
                                                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition"
                                                                    >
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="font-semibold text-gray-800">{item.expense}</span>
                                                                            <span className="font-bold text-green-600">
                                                                                Total: ${item.amount}
                                                                            </span>
                                                                        </div>
                                                                    </li>
                                                                ) : null
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )
                                            ))}
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
                                     Submit Proposal
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
                                onClick={exportAsJSON}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex items-center space-x-2"
                            >
                                <span>Export as JSON</span>
                            </button>
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

export default ReviewAndSubmit;*/
