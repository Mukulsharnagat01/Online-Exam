import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            // ignore
        }
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">College Exam System</h1>
                <div className="flex space-x-4">
                    <Link to="/home" className="text-sm hover:underline">Home</Link>
                    <Link to="/exam-selection" className="text-sm hover:underline">Exam</Link>
                    <Link to="/results" className="text-sm hover:underline">Results</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin-dashboard" className="text-sm hover:underline">Admin</Link>
                    )}
                    <button onClick={handleLogout} className="text-sm hover:underline bg-transparent border-none p-0">Logout</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;