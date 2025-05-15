import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleStakeholderSelection = (type) => {
        setShowModal(false);

        // Navigate to the appropriate login page based on stakeholder type
        switch (type) {
            case "pi":
                navigate("/login");
                break;
            case "agency":
                navigate("/adminLogin");
                break;
            case "institute":
                navigate("/institute-login");
                break;
            default:
                navigate("/login");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <Hero />

            <div className="flex justify-center px-4 py-12">
                <div className="bg-white w-full max-w-6xl p-10 shadow-xl rounded-2xl border border-gray-200">
                    <h1 className="text-5xl font-extrabold text-center text-teal-800 mb-6 border-b-4 border-teal-600 pb-3">
                        DRISHTI: OneRND India
                    </h1>

                    <p className="text-gray-700 text-lg leading-8 text-center">
                        The <strong>DRISHTI: OneRND India </strong> was established through the
                        <strong> DRISHTI: OneRND India Act, 2023</strong> to provide high-level strategic direction for research, innovation,
                        and entrepreneurship in the fields of natural sciences, engineering and technology, environmental
                        and earth sciences, health and agriculture, and scientific and technological interfaces of
                        humanities and social sciences.
                    </p>

                    <p className="text-gray-700 text-lg leading-8 text-center mt-6">
                        DRISHTI: OneRND India fosters a culture of research and innovation across universities, colleges, research institutions, and R&D laboratories in India.
                        Acting as an apex body, DRISHTI: OneRND India directs scientific research aligned with the National Education Policy,
                        forging strong collaborations between industry, academia, and government sectors.
                    </p>

                    <div className="mt-8 p-6 bg-gray-100 rounded-xl border-l-4 border-teal-700">
                        <p className="italic font-semibold text-gray-800 text-lg text-center">
                            "DRISHTI: OneRND India strategies should align with the goals of <strong>Viksit Bharat 2047</strong>, implementing
                            global best practices adopted by research and development agencies worldwide."
                            <br /> — <span className="text-teal-700 font-bold">DRISHTI: OneRND India Governing Board</span>
                        </p>
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-teal-700 to-teal-600 text-white
                                      rounded-lg shadow-lg transform transition hover:scale-105 hover:shadow-2xl"
                        >
                            SignUp
                        </button>
                    </div>
                </div>
            </div>

            {/* Stakeholder Selection Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-teal-800 mb-2 text-center">
                            Welcome to DRISHTI: OneRND India
                        </h2>
                        <h3 className="text-xl font-bold text-teal-800 mb-4 text-center"> Sign in as:</h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleStakeholderSelection("pi")}
                                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
                            >
                                Principal Investigator (PI)
                            </button>

                            <button
                                onClick={() => handleStakeholderSelection("agency")}
                                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
                            >
                                Agency
                            </button>

                            <button
                                onClick={() => handleStakeholderSelection("institute")}
                                className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
                            >
                                Institute
                            </button>

                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;