import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link

const API_ENDPOINT = "https://paytm-backend-neod.onrender.com/api/v1/user/login"; // Example constant

const UserSignIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } // Consider adding username regex validation here

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
        } // Example minimum length

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setSuccessMessage("");

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                API_ENDPOINT,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                    }),
                }
            );


            if (!response.ok) {
                let errorMessage = "Something went wrong";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    console.error("Failed to parse error response:", parseError);
                }
                throw new Error(errorMessage);
            }


            const data = await response.json();

            localStorage.setItem('authToken', data.token);

            setSuccessMessage("Login successful! Redirecting...");

            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (error) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">
                    Create Your Account
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                    Join PayTM and start your financial journey
                </p>

                {apiError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-center">
                        {apiError}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-center">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.username
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                            />
                            {errors.username && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.username}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className={`w-full py-3 px-4 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            isLoading
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>



                <p className="mt-6 text-center text-sm text-gray-600">
                    New to Paytm?{" "}
                    <Link
                        to="/user/Signup"
                        className="text-blue-500 font-medium hover:underline"
                    >
                        Sign Ip
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default UserSignIn;