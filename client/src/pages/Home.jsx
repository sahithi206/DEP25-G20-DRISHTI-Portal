import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LatestNews from "../components/LatestNews";
import Hero from "../components/Hero";

const Home = () => {
    return (
        <div>
            <Navbar />
            <LatestNews />
            <Hero />

            <div className="flex justify-center py-10">
                <Link
                    to="/login"
                    className="px-8 py-4 text-xl font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition"
                >
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Home;
