import React from "react";
import { Routes, Route } from "react-router-dom";
import Balance from "./Balance";
import Donation from "./Donation";
import Profile from "./Profile";
import Transfer from "./Transfer";
function UserRoutes() {
    return (
        <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-900  p-10  text-center shadow-xl">
    Paytm
</h1>
            <Routes>
                <Route path="/balance" element={<Balance />} />
                <Route path="/donation" element={<Donation />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/transfer" element={<Transfer />} />
            </Routes>
        </div>
    );
}
export default UserRoutes;