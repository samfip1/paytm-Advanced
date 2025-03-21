"use client";

import { useState, useEffect } from "react";

function UserList() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

   
    useEffect(() => {
    
       
        const fetchUsers = async () => {
          try {
            setIsLoading(true);
            const response = await fetch('/https://paytm-backend-neod.onrender.com/api/v1/admin/signin/UserOperation/user_list');
            if (response.ok) {
              const data = await response.json();
              setUsers(data);
            }
          } catch (error) {
            console.error('Failed to fetch users:', error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                
                const response = await fetch('/https://paytm-backend-neod.onrender.com/api/v1/admin/signin/ControlPanel/user_list/delete_user', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ userId }),
                });

                if (response.ok) {
                  setUsers(users.filter(user => user.id !== userId));
                }
                
            } catch (error) {
                console.error("Failed to delete user:", error);
            }
        }
    };

    const handleFreezeMoney = async (userId) => {
        try {
            
            const response = await fetch('/https://paytm-backend-neod.onrender.com/api/v1/admin/signin/ControlPanel/user_list/freeze_money', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            });

            if (response.ok) {
              
              setUsers(users.map(user =>
                user.id === userId
                  ? { ...user, status: user.status === 'Frozen' ? 'Active' : 'Frozen' }
                  : user
              ));
            }

            
        } catch (error) {
            console.error("Failed to freeze user funds:", error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="relative w-64">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : user.status ===
                                                          "Inactive"
                                                        ? "bg-gray-100 text-gray-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() =>
                                                        handleFreezeMoney(
                                                            user.id
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {user.status === "Frozen"
                                                        ? "Unfreeze"
                                                        : "Freeze"}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-4 text-center text-sm text-gray-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default UserList;
