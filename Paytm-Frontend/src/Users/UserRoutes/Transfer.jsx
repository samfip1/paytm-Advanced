import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

function Transfer() {
    const [toUsername, setToUsername] = useState("");
    const [amount, setAmount] = useState("");
    const [transactionPin, setTransactionPin] = useState("");
    const [comment, setComment] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [cookies] = useCookies(["token", "username"]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!toUsername || !amount || !transactionPin) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            const response = await axios.post(
                "https://paytm-backend-neod.onrender.com/api/v1/user/signin/transfer",
                {
                    from: cookies.username,
                    to: toUsername,
                    amount: parseFloat(amount),
                    transaction_pin: parseInt(transactionPin, 10),
                    comment: comment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${cookies.token}`, 
                    },
                }
            );

            setMessage(response.data.message);
            setToUsername("");
            setAmount("");
            setTransactionPin("");
            setComment("");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "An error occurred during the transfer."
            );
        }
    };

    return (
        <div className="container mx-auto mt-8 p-4">
            <h2 className="text-2xl font-bold mb-4">Transfer Funds</h2>

            {message && (
                <div className="bg-green-200 text-green-800 p-3 rounded mb-4">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-200 text-red-800 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="mb-4">
                    <label
                        htmlFor="toUsername"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Recipient Username:
                    </label>
                    <input
                        type="text"
                        id="toUsername"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter recipient username"
                        value={toUsername}
                        onChange={(e) => setToUsername(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="amount"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Amount:
                    </label>
                    <input
                        type="number"
                        id="amount"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter amount to transfer"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="transactionPin"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Transaction PIN:
                    </label>
                    <input
                        type="password"
                        id="transactionPin"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Enter your transaction PIN"
                        value={transactionPin}
                        onChange={(e) => setTransactionPin(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="comment"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Comment (Optional):
                    </label>
                    <textarea
                        id="comment"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Add a comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Transfer
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Transfer;
