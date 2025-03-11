import React, { useState } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

const DonationForm = () => {
    const [cookies, setCookie, removeCookie] = useCookies(["token", "userid"]); // Access cookies
    const [donatedMoney, setDonatedMoney] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setSuccessMessage("");
        setLoading(true);

        const donationdata = {
            userid: cookies.userid,
            DonatedMoney: donatedMoney,
            message: message,
        }

        try {
            const response = await axios.post(
                `https://paytm-backend-neod.onrender.com/api/v1/user/signin/Donation/Make_Donation/${donationdata}` ,// Backend endpoint
                {
                    headers: {
                        Authorization: `Bearer ${cookies.token}`, // Use token from cookie
                    },
                }
            );

            setSuccessMessage(response.data.message); // Display success message
            setDonatedMoney("");
            setMessage("");
        } catch (err) {
            console.error("Donation Error:", err);
            setError(
                err.response?.data?.error ||
                    "An error occurred during donation."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">
                                Make a Donation
                            </h1>
                        </div>
                        <div className="divide-y divide-gray-200">
                            <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                {error && (
                                    <div className="text-red-500">{error}</div>
                                )}
                                {successMessage && (
                                    <div className="text-green-500">
                                        {successMessage}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit}>
                                    <div className="relative">
                                        <input
                                            placeholder="Amount to Donate"
                                            type="number"
                                            className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                            id="donatedMoney"
                                            value={donatedMoney}
                                            onChange={(e) =>
                                                setDonatedMoney(e.target.value)
                                            }
                                            required
                                        />
                                        <label
                                            htmlFor="donatedMoney"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Amount to Donate
                                        </label>
                                    </div>
                                    <div className="relative mt-4">
                                        <textarea
                                            placeholder="Optional Message"
                                            className="peer placeholder-transparent h-20 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                            id="message"
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(e.target.value)
                                            }
                                        />
                                        <label
                                            htmlFor="message"
                                            className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                                        >
                                            Optional Message
                                        </label>
                                    </div>
                                    <div className="relative mt-6">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white rounded-md px-4 py-2 font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Donating..."
                                                : "Donate Now"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationForm;
