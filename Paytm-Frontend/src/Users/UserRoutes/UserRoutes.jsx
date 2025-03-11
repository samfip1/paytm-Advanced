import React from "react";
import { Routes, Route } from "react-router-dom";
import Balance from "./Balance";
import BetGames from "./BetGames";
import Donation from "./Donation";
import Profile from "./Profile";
import Transfer from "./Transfer";

function UserRoutes() {
    return (
        <div>
            <h1 class="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-5 mt-3 text-center">
    PayClone
</h1>
            <Routes>
                <Route path="/balance" element={<Balance />} />
                <Route path="/betgames" element={<BetGames />} />
                <Route path="/donation" element={<Donation />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/transfer" element={<Transfer />} />
            </Routes>
        </div>
    );
}

export default UserRoutes;
