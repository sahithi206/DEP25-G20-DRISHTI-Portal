import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LatestNews from "../components/LatestNews";
import Hero from "../components/Hero";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Import icons

const programs = [
    { id: 1, name: "J. C. Bose Grant (JBG)", path: "/jcbose" },
    { id: 2, name: "Partnerships for Accelerated Innovation and Research (PAIR)", path: "/pair" },
    { id: 3, name: "Prime Minister Early Career Research Grant (PM ECRG)", path: "/pmecrg" },
    { id: 4, name: "Mission for Advancement in High-impact Areas (EV-Mission)", path: "/evmission" },
    { id: 5, name: "AI for Scientific Discovery", path: "/ai-discovery" },
    { id: 6, name: "Quantum Technologies Initiative", path: "/quantum" },
    { id: 7, name: "Green Energy Innovation", path: "/green-energy" },
];

const itemsPerPage = 4;
const totalPages = Math.ceil(programs.length / itemsPerPage);

const Home = () => {
    const [pageIndex, setPageIndex] = useState(0);

    const goToPage = (index) => {
        if (index >= 0 && index < totalPages) {
            setPageIndex(index);
        }
    };

    return (
        <div>
            <Navbar />
            <LatestNews />
            <Hero />

            {/* ANRF Programs Section */}
            <div className="flex flex-col items-center justify-center py-10">
                <h2 className="text-3xl font-bold mb-6">ANRF PROGRAMS</h2>

                <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
                    {/* Display 4 programs per page */}
                    {programs.slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage).map((program) => (
                        <Link
                            key={program.id}
                            to={program.path}
                            className="flex items-center space-x-4 p-4 border-b last:border-b-0 hover:bg-gray-100 transition"
                        >
                            <div className="w-10 h-10 bg-teal-600 text-white flex items-center justify-center rounded-full text-lg font-bold">
                                {program.id}
                            </div>
                            <span className="text-lg font-semibold">{program.name}</span>
                        </Link>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center space-x-2">
                    {/* Left Arrow */}
                    <button
                        onClick={() => goToPage(pageIndex - 1)}
                        disabled={pageIndex === 0}
                        className={`px-3 py-2 rounded-lg ${
                            pageIndex === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                        <FaChevronLeft />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToPage(index)}
                            className={`px-4 py-2 rounded-lg border ${
                                index === pageIndex ? "bg-teal-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    {/* Right Arrow */}
                    <button
                        onClick={() => goToPage(pageIndex + 1)}
                        disabled={pageIndex === totalPages - 1}
                        className={`px-3 py-2 rounded-lg ${
                            pageIndex === totalPages - 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
