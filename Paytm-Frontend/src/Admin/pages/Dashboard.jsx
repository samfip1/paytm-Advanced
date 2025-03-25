"use client";

import { useState, useEffect } from "react";
import { Users, CreditCard, Heart, UserPlus, DollarSign } from "lucide-react";

function Dashboard() {
    
    const API_BASE_URL = "https://paytm-backend-neod.onrender.com/api/v1/admin/signin"
    const [userData, setUserData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({ apiUrl: API_BASE_URL });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setDebugInfo((prev) => ({
                ...prev,
                apiUrl: API_BASE_URL,
                authToken: token ? `${token.substring(0, 5)}...` : "Not found",
            }));

            
            const token = localStorage.getItem("authToken");

            if (!token) {
                throw new Error("Authentication token not found");
            }

            
            const headers = {
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json",
            };

            
            const [userResponse, transactionResponse, donationResponse] =
                await Promise.all([
                    fetch(`${API_BASE_URL}/UserOperation/user_list`, { headers }),
                    fetch(`${API_BASE_URL}/UserOperation/user_transaction`, { headers }),
                    fetch(`${API_BASE_URL}/ControlPanel/donation_list`, { headers }),
                ]);

            
            const checkAndParseResponse = async (response, name) => {
                if (!response.ok) {
                    
                    const errorText = await response.text();
                    console.error(`${name} response:`, errorText);

                    
                    setDebugInfo((prev) => ({
                        ...prev,
                        [`${name}Error`]: {
                            status: response.status,
                            statusText: response.statusText,
                            errorText: errorText.substring(0, 200), 
                        },
                    }));

                    throw new Error(
                        `${name} request failed with status ${response.status}`
                    );
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await response.text();
                    console.error(
                        `${name} returned non-JSON response:`,
                        text.substring(0, 100)
                    );

                    
                    setDebugInfo((prev) => ({
                        ...prev,
                        [`${name}Error`]: {
                            contentType,
                            responsePreview: text.substring(0, 200),
                        },
                    }));

                    throw new Error(`${name} returned non-JSON response`);
                }

                const data = await response.json();

                
                setDebugInfo((prev) => ({
                    ...prev,
                    [`${name}Success`]: true,
                    [`${name}DataSample`]:
                        JSON.stringify(data).substring(0, 100) + "...",
                }));

                return data;
            };

            const userData = await checkAndParseResponse(
                userResponse,
                "User list"
            );
            const transactionData = await checkAndParseResponse(
                transactionResponse,
                "Transactions"
            );
            const donationData = await checkAndParseResponse(
                donationResponse,
                "Donations"
            );

            setUserData(userData.total_user_list || []);
            setTransactions(
                Array.isArray(transactionData) ? transactionData : []
            );
            setDonations(donationData.donations || []);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [API_BASE_URL]);

    
    const refreshData = () => {
        setLoading(true);
        setError(null);
        fetchDashboardData();
    };

    
    const totalUsers = userData.length;

    const totalTransactions = transactions.reduce((sum, transaction) => {
        
        const amount = Number.parseFloat(
            transaction.amount || transaction.transactionAmount || 0
        );
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const totalDonations = donations
        ? donations.reduce((sum, donation) => {
              
              const amount = Number.parseFloat(donation.DonatedMoney || 0);
              return sum + (isNaN(amount) ? 0 : amount);
          }, 0)
        : 0;

    
    const getRecentActivities = () => {
        const activities = [];

        
        transactions.slice(0, 5).forEach((transaction) => {
            activities.push({
                type: "transaction",
                message: "New transaction completed",
                time: new Date(
                    transaction.createdAt ||
                        transaction.transactionDate ||
                        Date.now()
                ),
                icon: <DollarSign className="text-gray-600" size={16} />,
            });
        });

        
        if (donations) {
            donations.slice(0, 5).forEach((donation) => {
                activities.push({
                    type: "donation",
                    message: `New donation received from ${donation.senderUsername}`,
                    time: new Date(donation.donatedAt || Date.now()),
                    icon: <Heart className="text-gray-600" size={16} />,
                });
            });
        }

       
        userData.slice(0, 5).forEach((user) => {
            activities.push({
                type: "user",
                message: `New user registered: ${user.username}`,
                time: new Date(user.createdAt || Date.now()),
                icon: <UserPlus className="text-gray-600" size={16} />,
            });
        });

        
        return activities.sort((a, b) => b.time - a.time).slice(0, 5);
    };

    const recentActivities = getRecentActivities();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading dashboard data...</div>
            </div>
        );
    }

    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4">
                <div className="text-xl text-red-500 mb-4">Error: {error}</div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-w-lg">
                    <h3 className="font-bold mb-2">Troubleshooting Tips:</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>Check that your API server is running</li>
                        <li>
                            Verify the API URL is correct:{" "}
                            <code className="bg-red-100 px-1">
                                {API_BASE_URL}
                            </code>
                        </li>
                        <li>Ensure your authentication token is valid</li>
                        <li>
                            Check browser console for detailed error messages
                        </li>
                    </ul>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    
    const formatRelativeTime = (date) => {
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInHours < 48) return "Yesterday";
        return `${Math.floor(diffInHours / 24)} days ago`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={refreshData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? "Refreshing..." : "Refresh Data"}
                </button>
            </div>
            <div>
                <p className="text-gray-500">
                    Manage users, view transactions, and monitor donations.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Users className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium">Total Users</h3>
                            <p className="text-2xl font-bold">{totalUsers}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="rounded-full bg-green-100 p-3">
                            <CreditCard className="text-green-600" size={20} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium">
                                Transactions
                            </h3>
                            <p className="text-2xl font-bold">
                                {formatCurrency(totalTransactions)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="rounded-full bg-purple-100 p-3">
                            <Heart className="text-purple-600" size={20} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium">Donations</h3>
                            <p className="text-2xl font-bold">
                                {formatCurrency(totalDonations)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Recent Activity</h2>
                <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <div
                                key={index}
                                className={`flex items-center ${
                                    index < recentActivities.length - 1
                                        ? "border-b border-gray-100 pb-4"
                                        : ""
                                }`}
                            >
                                <div className="rounded-full bg-gray-100 p-2">
                                    {activity.icon}
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatRelativeTime(activity.time)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500">No recent activity</div>
                    )}
                </div>
            </div>
            {process.env.NODE_ENV === "development" && (
                <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                    <h3 className="font-bold mb-2">
                        Debug Info (only visible in development)
                    </h3>
                    <pre className="text-xs overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
