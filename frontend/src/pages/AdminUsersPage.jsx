// /frontend/src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // To link back to the main app

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/users`;

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    // Function to fetch all users from the backend
    const fetchUsers = async () => {
        try {
            const res = await axios.get(API_URL);
            setUsers(res.data);
        } catch (err) {
            setError('Օգտատերերին բեռնել չհաջողվեց։');
            console.error(err);
        }
    };

    // useEffect hook to run fetchUsers() once when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    // Function to handle user deletion
    const handleDelete = async (userId) => {
        // Show a confirmation pop-up before deleting
        if (window.confirm('Վստա՞հ եք, որ ուզում եք ջնջել այս օգտատիրոջը։')) {
            try {
                await axios.delete(`${API_URL}/${userId}`);
                // After successful deletion, refresh the user list
                fetchUsers();
            } catch (err) {
                alert('Օգտատիրոջը ջնջել չհաջողվեց։');
                console.error(err);
            }
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Ադմին Վահանակ</h1>
                 <Link to="/learn" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                    Գնալ հարթակ
                </Link>
            </div>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {/* User Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                                <th className="px-5 py-3 border-b-2 border-gray-200">ID</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200">Անուն</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200">Էլ. փոստ</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200">Հեռախոս</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200">Դեր</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200">Դասարան</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-right">Գործողություններ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-5 py-4 text-sm text-gray-800">{user.id}</td>
                                    <td className="px-5 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                                    <td className="px-5 py-4 text-sm text-gray-800">{user.email}</td>
                                    <td className="px-5 py-4 text-sm text-gray-800">{user.phone}</td>
                                    <td className="px-5 py-4 text-sm text-gray-800 capitalize">{user.role}</td>
                                    <td className="px-5 py-4 text-sm text-gray-800">{user.grade || 'N/A'}</td>
                                    <td className="px-5 py-4 text-sm text-right">
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900 font-semibold"
                                        >
                                            Ջնջել
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;