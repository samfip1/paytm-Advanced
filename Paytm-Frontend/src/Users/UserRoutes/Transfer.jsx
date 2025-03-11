import React, { useState } from 'react';
import axios from 'axios';

const TransferForm = () => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionPin, setTransactionPin] = useState('');
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsSubmitting(true);

        // Validate inputs
        if (!from || !to || !amount || !transactionPin) {
            setError('All fields are required.');
            setIsSubmitting(false);
            return;
        }

        if (isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Amount must be a positive number.');
            setIsSubmitting(false);
            return;
        }

        if (isNaN(transactionPin)) {
          setError('Transaction Pin must be a number.');
          setIsSubmitting(false);
          return;
        }


        const transferData = {
            from: from,
            to: to,
            amount: parseFloat(amount), // Ensure amount is a number
            transaction_pin: Number(transactionPin), // Ensure transaction_pin is a number
            comment: comment,
        };

        try {
            const token = localStorage.getItem('authToken'); // Using authToken consistently

            if (!token) {
                setError('Authentication token not found. Please log in.');
                setIsSubmitting(false);
                return;
            }

            //  Ensure the API endpoint starts with /api, otherwise the React proxy setting would not work
            const response = await axios.post(`/api/v1/user/signin/transfer/${transferdata1}`, transferData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage(response.data.message);

            // Clear form fields on successful transfer
            setFrom('');
            setTo('');
            setAmount('');
            setTransactionPin('');
            setComment('');

        } catch (err) {
            console.error("Transfer failed:", err.response?.data?.error || err.message);
            setError(err.response?.data?.error || 'Transfer failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Transfer Funds</h2>

            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline">{message}</span>
            </div>}

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">{error}</span>
            </div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="from" className="block text-gray-700 text-sm font-bold mb-2">From Username:</label>
                    <input
                        type="text"
                        id="from"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="to" className="block text-gray-700 text-sm font-bold mb-2">To Username:</label>
                    <input
                        type="text"
                        id="to"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        step="0.01" // Allow decimal values
                    />
                </div>
                <div>
                    <label htmlFor="transactionPin" className="block text-gray-700 text-sm font-bold mb-2">Transaction Pin:</label>
                    <input
                        type="password"
                        id="transactionPin"
                        value={transactionPin}
                        onChange={(e) => setTransactionPin(e.target.value)}
                        required
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div>
                    <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">Comment (Optional):</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button
                    type="submit"
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                >
                    Transfer
                </button>
            </form>
        </div>
    );
};

export default TransferForm;