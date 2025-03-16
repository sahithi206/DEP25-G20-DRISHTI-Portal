import React, { useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import Sidebar from "../utils/Sidebar";
import HomeNavbar from "../utils/HomeNavbar";

const SelectDate = () => {
    const [date, setDate] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
     const {id}=useParams();
     const navigate=useNavigate();
    const handleChange = (e) => {
        setDate(e.target.value);
    };

    const handleSubmit = async() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("Use a valid Token");
            alert("Authentication required.");
            return;
        }
        console.log("Selected Date:", date);
        const formattedDate = new Date(date).toISOString().split('T')[0];
        try{
            const response= await fetch(`${import.meta.env.VITE_REACT_APP_URL}projects/createProject/${id}`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "accessToken": `${token}`,
                },
                body:JSON.stringify({startDate:formattedDate})
            })
            console.log(response);
            if (!response.ok) {
                throw new Error("Failed to update user details");
            }
            const json = await response.json();
            console.log("Created Proposal",json);

            alert(json.msg);
            if(json.success){
              navigate("/savedproposals")
            }
        }catch(e){
            console.error("Error Creating Project:",e);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64 w-[calc(100%-16rem)]" : "ml-16 w-[calc(100%-4rem)]"}`}>
                <HomeNavbar isSidebarOpen={isSidebarOpen} />

                <div className="p-8 space-y-6 mt-16 flex justify-center items-center min-h-[70vh]">
                    <div className="bg-white shadow-lg rounded-lg p-8 border-t-4 border-blue-800 w-full max-w-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Start Date</h2>
                        <input
                            type="date"
                            name="startDate"
                            value={date}
                            onChange={handleChange}
                            required
                            className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <label className="block text-gray-500 font-xxs mt-4 mb-2">* This request will be forwarded to institute</label>
                        <button
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-700 transition-all duration-200 shadow-md"
                            onClick={handleSubmit}
                        >
                            Confirm Date
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectDate;
