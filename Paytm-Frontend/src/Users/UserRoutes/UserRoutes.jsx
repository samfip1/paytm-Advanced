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
            <h1>fgeassggr</h1>
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
