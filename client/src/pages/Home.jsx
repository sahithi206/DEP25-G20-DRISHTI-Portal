import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <Hero />

            <div className="flex justify-center">
                <div className="bg-white w-[100%] md:w-[100%] max-w-7xl p-8 shadow-lg rounded-lg">
                    <h1 className="text-4xl font-bold text-center text-teal-700 mb-4 border-b-2 border-gray-300 pb-2">
                        ANRF
                    </h1>

                    <p className="text-gray-700 text-lg leading-relaxed text-center">
                        The <strong>Anusandhan National Research Foundation (ANRF)</strong> was established through the 
                        <strong> ANRF Act, 2023</strong> to provide high-level strategic directions for research, innovation, 
                        and entrepreneurship in the fields of natural sciences, engineering and technology, environmental 
                        and earth sciences, health and agriculture, and scientific and technological interfaces of 
                        humanities and social sciences.
                    </p>
                    
                    <p className="text-gray-700 text-lg leading-relaxed text-center mt-4">
                        ANRF has been established to promote research and development and foster a culture of research
                        and innovation throughout India’s Universities, Colleges, Research Institutions, and R&D laboratories.
                        ANRF acts as an apex body to provide high-level strategic direction of scientific research in the
                        country as per recommendations of the National Education Policy. ANRF forges collaborations among
                        the industry, academia, and government departments and research institutions.
                    </p>

                    <p className="italic font-semibold mt-6 text-gray-700 text-center">
                        “ANRF strategies should align with the goals of <strong>Viksit Bharat 2047</strong> and implementation 
                        should follow global best practices adopted by research and development agencies across the world.” 
                        <br /> — <span className="text-teal-600">ANRF Governing Board</span>
                    </p>

                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={() => navigate("/login")} 
                            className="px-6 py-3 bg-teal-700 text-white rounded-md text-lg font-semibold 
                                       hover:bg-teal-800 transition duration-300 ease-in-out shadow-md"
                        >
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
