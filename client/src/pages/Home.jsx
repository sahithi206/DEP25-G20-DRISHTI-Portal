import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <Hero />

            <div className="flex justify-center px-4 py-12">
                <div className="bg-white w-full max-w-6xl p-10 shadow-xl rounded-2xl border border-gray-200">
                    <h1 className="text-5xl font-extrabold text-center text-teal-800 mb-6 border-b-4 border-teal-600 pb-3">
                        ResearchX 
                    </h1>

                    <p className="text-gray-700 text-lg leading-8 text-center">
                        The <strong>ResearchX </strong> was established through the 
                        <strong> ResearchX Act, 2023</strong> to provide high-level strategic direction for research, innovation, 
                        and entrepreneurship in the fields of natural sciences, engineering and technology, environmental 
                        and earth sciences, health and agriculture, and scientific and technological interfaces of 
                        humanities and social sciences.
                    </p>
                    
                    <p className="text-gray-700 text-lg leading-8 text-center mt-6">
                        ResearchX fosters a culture of research and innovation across universities, colleges, research institutions, and R&D laboratories in India. 
                        Acting as an apex body, ResearchX directs scientific research aligned with the National Education Policy, 
                        forging strong collaborations between industry, academia, and government sectors.
                    </p>

                    <div className="mt-8 p-6 bg-gray-100 rounded-xl border-l-4 border-teal-700">
                        <p className="italic font-semibold text-gray-800 text-lg text-center">
                            “ANRF strategies should align with the goals of <strong>Viksit Bharat 2047</strong>, implementing 
                            global best practices adopted by research and development agencies worldwide.” 
                            <br /> — <span className="text-teal-700 font-bold">ResearchX Governing Board</span>
                        </p>
                    </div>

                    <div className="flex justify-center mt-8">
                        <button 
                            onClick={() => navigate("/login")} 
                            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-teal-700 to-teal-600 text-white 
                                       rounded-lg shadow-lg transform transition hover:scale-105 hover:shadow-2xl"
                        >
                            SignUp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
