import React from "react";
import { Link } from "react-router-dom";
function UserLogin( ) {

    return (
        <div className="relative w-full aspect-w-16 aspect-h-9">
            <div className="absolute inset-0 flex justify-end items-start">
                <Link 
                    to={"/"}>
                <button
                    type="button"
                    className="text-white bg-gradient-to-r from-gray-950 to-gray-800 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-full text-sm p-3 text-center m-4"
                >
                    User Login
                </button>
                </Link>
            </div>
        </div>
    );
}
export default UserLogin;
