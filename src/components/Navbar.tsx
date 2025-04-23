import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {

    const { isAuthenticated, logout } = useAuth();



    return (
        <nav className="bg-blue-600 text-white px-4 py-4 shadow-md">
            <div className="container mx-auto flex justify-beetween items-center px-4">
                {
                    isAuthenticated && (

                        <ul className="flex space-x-4">
                            <li>
                                <Link to="/dashboard" className="text-white hover:text-blue-200">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/users" className="text-white hover:text-blue-200">
                                    Users
                                </Link>
                            </li>
                            <li>
                                <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
                                    Logout
                                </button>
                            </li>

                        </ul>
                    )
                }
            </div>

        </nav>
    );

};

export default Navbar;