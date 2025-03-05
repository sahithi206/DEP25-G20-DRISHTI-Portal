import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaPowerOff } from "react-icons/fa";
import Sidebar from "../utils/Sidebar";

const MenuPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar Component */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64 w-[calc(100%-16rem)]' : 'ml-16 w-[calc(100%-4rem)]'}`}>
                <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Anusandhan National Research Foundation</h2>
                    <div className="flex items-center space-x-4">
                        <FaUserCircle className="text-2xl" />
                        <span>Welcome, Ms. Varsha</span>
                        <FaPowerOff className="text-xl cursor-pointer text-red-500" />
                    </div>
                </header>

                {/* Dashboard Content */}
<<<<<<< HEAD
                <div className="p-6 mt-16">

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            अनुसंधान नेशनल रिसर्च फाउंडेशन
                        </h1>
                        <h2 className="text-lg font-semibold text-gray-700">
                            Anusandhan National Research Foundation
                        </h2>
                        <h3 className="mt-3 text-xl font-semibold text-gray-900 border-t-2 pt-2">
                            Change Of Institute
                        </h3>
=======
                <div className="p-6 space-y-6">
                    <div className="bg-white shadow-md rounded-xl p-6 text-center border-l-8 border-blue-700 hover:shadow-xl transition-shadow">
                        <h1 className="text-3xl font-black text-gray-900 mb-2">अनुसंधान नेशनल रिसर्च फाउंडेशन</h1>
                        <h2 className="text-xl font-semibold text-gray-700">Anusandhan National Research Foundation</h2>
>>>>>>> c73d78bfb7f2ea9c2cb516f82a6ef76b1848f755
                    </div>
                    <section className="mt-6 bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-lg font-semibold">User Guidelines</h3>
                        <p className="text-blue-600"><Link to="/guidelines">Principal Investigator Guidelines</Link></p>
                    </section>

                    <section className="mt-6 bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-lg font-semibold">User Profile</h3>
                        <p className="text-gray-700">Your Profile is not completed for proposal submission. Please complete the following:</p>
                        <p className="text-green-600 font-bold">Pin Code, Address, Biodata, Photo</p>
                        <p className="text-pink-600"><Link to="/update-profile">Update Profile</Link></p>
                    </section>

                    <section className="mt-6 bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-lg font-semibold">Additional Requests</h3>
                        <p className="text-gray-700">Most recent: <span className="text-blue-600">No Request has been submitted</span></p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;
