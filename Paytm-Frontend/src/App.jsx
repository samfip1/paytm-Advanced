import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserSignIn from "./Users/Controllers/UserSignIn";
import UserSignUp from "./Users/Controllers/UserSignup";
import UserRoutes from "./Users/UserRoutes/UserRoutes";
import AdminSignup from "./Admin/AdminSignup";
import AdminSignin from "./Admin/AdminSignin";
import Dashboard from "./Admin/Dashboard";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/signin" element={<AdminSignin />} />
                <Route path="/admin" element={<AdminSignup />} />       
                <Route path="/" element={<UserSignIn />} />

                <Route path="/signup" element={<UserSignUp />} />

                <Route path="/user/*" element={<UserRoutes />} />
            </Routes>
        </Router>
    );
}

export default App;