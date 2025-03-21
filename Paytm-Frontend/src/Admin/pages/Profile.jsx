"use client";

import { useState, useEffect } from "react";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    "/https://paytm-backend-neod.onrender.com/api/v1/admin/signin/UserOperation/user_list"
                );
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Admin Profile</h1>
                <p className="text-gray-500">
                    View and manage your admin profile.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <i className="fas fa-user text-2xl text-gray-600"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {profile?.name}
                                </h2>
                                <p className="text-gray-500">{profile?.role}</p>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Email
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {profile?.email}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Join Date
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {profile?.joinDate}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Last Login
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {profile?.lastLogin}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="mt-6 flex">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Update Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
