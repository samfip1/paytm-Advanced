import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from 'jwt-decode';

function Profile() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let token = localStorage.getItem("authToken");
                const decoded=jwtDecode(token);
                const username=decoded.username;
                console.log(username);
                const cookie = document.cookie.split('; ').find(row => row.startsWith('authCookie='))?.split('=')[1]; //Get cookie

                //Prioritize token, if not found use cookie
                if (!token && !cookie) {
                    console.warn("No token or cookie found. Redirecting to login.");
                    navigate("/login");
                    return;
                }

                let headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                } else if (cookie) {
                    headers['Authorization'] = `Bearer ${cookie}`; 
                    
                    console.log("Using cookie for authorization")
                }

                const response = await axios.get(
                    `https://paytm-backend-neod.onrender.com/api/v1/user/signin/profile/${username}`,
                    { headers }
                );

                setUserData(response.data);

            } catch (error) {
                console.error("Error fetching profile:", error);

                if (error.response && error.response.status === 401) {
                    console.log("Token/Cookie invalid or expired. Redirecting to login.");
                    localStorage.removeItem("authToken"); // Clear local storage
                    document.cookie = "authCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Clear cookie
                    navigate("/login");
                } else {
                    console.error("Failed to load profile data.");
                }
            }
        };
        console.log(userData);

        fetchData();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    User Profile
                </h1>
                {userData ? (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
                        <p className="text-lg font-semibold">User ID:</p>
                        <p className="text-w">{userData.user.userid || "oiasefg"} </p>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Loading...</p>
                )}

                <div className="space-y-3">
                    <button
                        className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                        onClick={() => navigate("/user/balance")}
                    >
                        Check Balance
                    </button>
                    <button
                        className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                        onClick={() => navigate("/user/betgames")}
                    >
                        Bet on Games
                    </button>
                    <button
                        className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                        onClick={() => navigate("/user/donation")}
                    >
                        Make a Donation
                    </button>
                    <button
                        className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        onClick={() => navigate("/user/transfer")}
                    >
                        Transfer Money
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;