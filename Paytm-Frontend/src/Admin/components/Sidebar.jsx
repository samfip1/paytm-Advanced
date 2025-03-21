"use client";

import { NavLink } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
    const [isOpen, setIsOpen] = useState(true);

    const navItems = [
        { title: "Dashboard", path: "/admin", icon: "home" },
        { title: "User List", path: "/admin/user-list", icon: "users" },
        {
            title: "Transactions",
            path: "/admin/transactions",
            icon: "credit-card",
        },
        { title: "Donations", path: "/admin/donations", icon: "heart" },
        { title: "Profile", path: "/admin/profile", icon: "user" },
    ];

    return (
        <>
            <aside
                className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-white transition-transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } md:relative md:translate-x-0`}
            >
                <div className="border-b p-4">
                    <div className="flex items-center justify-between">
                        <NavLink
                            to="/admin"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <span className="text-xl">Admin Panel</span>
                        </NavLink>
                        <button
                            className="md:hidden"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                                            isActive
                                                ? "bg-gray-200 text-gray-900"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        }`
                                    }
                                >
                                    <i className={`fas fa-${item.icon}`}></i>
                                    {item.title}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            {!isOpen && (
                <div
                    className="fixed inset-0 z-10 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(true)}
                />
            )}
        </>
    );
}

export default Sidebar;
