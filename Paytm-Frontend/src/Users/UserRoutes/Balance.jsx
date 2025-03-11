import React, { useState, useEffect } from "react";
import axios from "axios";

const Balance = () => {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBalance = async () => {
        try {
            setRefreshing(true);

            const username = localStorage.getItem("username")?.trim();
            const token = localStorage.getItem("authToken")?.trim(); // Use 'authToken'

            console.log("Token from localStorage:", token); // DEBUG
            console.log("Username from localStorage:", username);

            if (!token) {
                setError("Authentication token is missing. Please log in.");
                setLoading(false);
                setRefreshing(false);
                navigate("/signin"); 
                return;
            }

            const response = await axios.get(
                `https://paytm-backend-neod.onrender.com/api/v1/user/signin/Balance`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: requestBody, 
                }
            );

            setBalance(response.data.Money);
            setLoading(false);
            setRefreshing(false);
            setError(null);
        } catch (err) {
            console.error("Error fetching balance:", err);
            setError(err.response?.data?.error || "Failed to fetch balance");
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    useEffect(() => {
        if (localStorage.getItem("token")) {
            fetchBalance();
        }
    }, [localStorage.getItem("token")]);

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Your Balance
                </h2>
                <button
                    onClick={fetchBalance}
                    disabled={refreshing}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none flex items-center text-sm"
                >
                    <svg
                        className={`w-4 h-4 mr-1 ${
                            refreshing ? "animate-spin" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    {refreshing ? "Updating..." : "Refresh"}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error fetching balance
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={fetchBalance}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-2">
                    <div className="bg-gray-50 rounded-lg p-6 flex justify-center">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">
                                Available Balance
                            </p>
                            <div className="flex items-center justify-center">
                                <span className="text-gray-800 text-3xl font-bold">
                                    ₹{" "}
                                    {balance?.toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center space-x-4">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300">
                            Add Money
                        </button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300">
                            Send Money
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Balance;