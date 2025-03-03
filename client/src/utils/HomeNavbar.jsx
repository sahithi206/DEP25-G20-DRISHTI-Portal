import React from "react";

const Navbar = ({ user }) => {
    return (
        <nav className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center fixed top-0 left-64 w-[calc(100%-16rem)] shadow-md z-50">
            {/* Logo / Title */}
            <h1 className="text-lg font-bold tracking-wide">
                अनुसंधान नेशनल रिसर्च फाउंडेशन
            </h1>

            {/* Right-side Buttons & User Info */}
            <div className="flex items-center gap-4">
                <button className="bg-blue-700 hover:bg-blue-600 transition px-4 py-2 rounded-lg shadow-md">
                    Tweet
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 transition px-4 py-2 rounded-lg shadow-md">
                    Share
                </button>

                {/* Show user details only if logged in */}
                {user && (
                    <span className="text-sm font-medium">
                        👤 Welcome, {user.name}
                    </span>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
