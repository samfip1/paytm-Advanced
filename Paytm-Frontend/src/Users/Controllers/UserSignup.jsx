"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UserSignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
    transaction_Pin: "",
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
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    const phoneRegex = /^\d{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    const pinRegex = /^\d{4}$/;
    if (!formData.transaction_Pin.trim()) {
      newErrors.transaction_Pin = "Transaction PIN is required";
    } else if (!pinRegex.test(formData.transaction_Pin)) {
      newErrors.transaction_Pin = "Transaction PIN must be a 4-digit number";
    }

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
      const response = await fetch("https://paytm-backend-neod.onrender.com/api/v1/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          transaction_Pin: Number.parseInt(formData.transaction_Pin, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        const errorMessage = errorData.message || response.statusText;
        console.error(`API request failed with status ${response.status}: ${errorMessage}`);
        setApiError(errorMessage); // Display API error to user
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccessMessage("Account created successfully! Redirecting to login...");

      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        email: "",
        phone: "",
        transaction_Pin: "",
      });

      setTimeout(() => {
        navigate("/api/v1/user/Signin");
      }, 2000);
    } catch (error) {
      console.error("API Error:", error);
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">Create Your Account</h2>
        <p className="text-gray-600 mb-6 text-center">Join PayTM and start your financial journey</p>

        {apiError && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-center">{apiError}</div>}

        {successMessage && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 text-center">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
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
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="transaction_Pin" className="block text-sm font-medium text-gray-700">
              Transaction PIN (4 digits)
            </label>
            <input
              type="password"
              id="transaction_Pin"
              name="transaction_Pin"
              value={formData.transaction_Pin}
              onChange={handleChange}
              placeholder="Create a 4-digit PIN"
              maxLength="4"
              className={`w-full px-3 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.transaction_Pin ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.transaction_Pin && <p className="text-red-500 text-xs mt-1">{errors.transaction_Pin}</p>}
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/api/v1/user/Signin" className="text-blue-500 font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserSignUp;