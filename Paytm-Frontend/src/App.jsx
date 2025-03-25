import UserSignIn from "./Users/Controllers/UserSignIn";
import UserSignUp from "./Users/Controllers/UserSignup";
import UserRoutes from "./Users/UserRoutes/UserRoutes";
import AdminSignup from "./Admin/pages/AdminSignup";
import AdminSignin from "./Admin/pages/AdminSignin";
import AdminLayout from "./Admin/components/AdminLayout";
import Dashboard from "./Admin/pages/Dashboard";
import UserList from "./Admin/pages/UserList";
import Transactions from "./Admin/pages/Transactions";
import Donations from "./Admin/pages/Donations";
import AdminProfile from "./Admin/pages/Profile";
import Balance from "./Users/UserRoutes/Balance";
import Donation from "./Users/UserRoutes/Donation";
import Transfer from "./Users/UserRoutes/Transfer";
import UserProfile from "./Users/UserRoutes/Profile";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserSignIn />} />
                <Route path="/signup" element={<UserSignUp />} />

                <Route path="/user" element={<UserRoutes />}>
                    <Route path="balance" element={<Balance />} />
                    <Route path="donation" element={<Donation />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="transfer" element={<Transfer />} />
                </Route>

                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/admin/signin" element={<AdminSignin />} />
    
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="user-list" element={<UserList />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="donations" element={<Donations />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
