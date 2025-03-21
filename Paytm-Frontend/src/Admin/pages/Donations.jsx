"use client";

import { useState, useEffect } from "react";

function Donations() {
    const [donations, setDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    
    useEffect(() => {
        
        const fetchDonations = async () => {
          try {
            setIsLoading(true);
            const response = await fetch('/https://paytm-backend-neod.onrender.com/api/v1/admin/signin/ControlPanel/donation_list');
            if (response.ok) {
              const data = await response.json();
              setDonations(data);
            }
          } catch (error) {
            console.error('Failed to fetch donations:', error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchDonations();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Donation List</h1>
                <p className="text-gray-500">View and manage all donations.</p>
            </div>

            <div className="rounded-md border border-gray-200 bg-white">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Donor
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Amount
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Cause
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {donations.map((donation) => (
                                <tr key={donation.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {donation.donor}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {donation.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {donation.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                donation.cause === "Education"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : donation.cause ===
                                                      "Healthcare"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {donation.cause}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Donations;
