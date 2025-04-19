import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="p-4 bg-white shadow flex justify-between">
      <Link to="/dashboard" className="font-bold text-lg">
        💸 Expense Tracker
      </Link>
      <div className="flex gap-4 items-center">
        {token ? (
          <button onClick={handleLogout} className="text-red-600 font-semibold">
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
