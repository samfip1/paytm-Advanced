import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function BetGames() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [betNumberChoice, setBetNumberChoice] = useState("");
    const [inputNumber, setInputNumber] = useState("");
    const [result, setResult] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isTokenVerified, setIsTokenVerified] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            let token = localStorage.getItem("authToken");

            if (!token) {
                console.warn("No token found. Redirecting to login.");
                navigate("/");
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const username = decoded.username;
                setUsername(username);
                setIsTokenVerified(true);
                console.log("Token verified successfully. Username:", username);
            } catch (err) {
                console.error("Error decoding or verifying token:", err);
                setError("Invalid token. Please login again.");
                localStorage.removeItem("authToken");
                navigate("/");
            }
        };

        verifyToken();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResult("");
        setLoading(true);

        try {
            let token = localStorage.getItem("authToken");

            const queryParams = {
                username: username,
                bet_number_choice: betNumberChoice.toString(),
                input_number: inputNumber.toString(),
            }

            const apiUrl = `https://paytm-backend-neod.onrender.com/api/v1/user/signin/BetGames/mini_games?/${queryParams}`;

            const response = await axios.post(
                apiUrl,
                null, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json", 
                    },
                }
            );


            console.log("API Response:", response.data);

            if (response.data.success) {
                setResult(`Congratulations! You won: ${response.data.prize}`);
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            console.error("API Error:", err);
            let errorMessage =
                "An error occurred while processing your request.";

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Response data:", err.response.data);
                console.error("Response status:", err.response.status);

                if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else if (err.response.status === 401) {
                    errorMessage = "Unauthorized access. Please login again.";
                    localStorage.removeItem("authToken");
                    navigate("/");
                    return;
                } else {
                    errorMessage = `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                // The request was made but no response was received
                console.error("No response received:", err.request);
                errorMessage =
                    "No response from server. Please try again later.";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage =
                    "An unexpected error occurred. Please check console.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return isTokenVerified ? (
        <div className="min-h-screen bg-gray-100 py-6 flex items-center justify-center">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
                <h2 className="text-center text-2xl font-bold text-gray-700 mb-4">
                    Bet Games
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="username"
                        >
                            Username:
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            readOnly // Make username read-only since it comes from the token
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="betNumberChoice"
                        >
                            Bet Number Choice:
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="betNumberChoice"
                            type="number"
                            placeholder="Enter bet number choice"
                            value={betNumberChoice}
                            onChange={(e) => setBetNumberChoice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            htmlFor="inputNumber"
                        >
                            Input Number:
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="inputNumber"
                            type="number"
                            placeholder="Enter input number"
                            value={inputNumber}
                            onChange={(e) => setInputNumber(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Play"}
                    </button>
                </form>

                {error && (
                    <div
                        className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {result && (
                    <div
                        className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline">{result}</span>
                    </div>
                )}
            </div>
        </div>
    ) : (
        <div className="flex justify-center items-center h-screen">
            <p className="text-lg font-semibold">Verifying token...</p>
        </div>
    );
}

export default BetGames;
