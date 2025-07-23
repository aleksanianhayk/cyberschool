// /frontend/src/pages/AdminUsersPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/users`;

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const { user: adminUser } = useContext(AuthContext);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(API_URL, config);
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users.');
        }
    };

    useEffect(() => {
        if (adminUser) { // Only fetch if admin is logged in
            fetchUsers();
        }
    }, [adminUser]);

    const handleRoleUpdate = async (userId, newRole) => {
        const action = newRole === 'admin' ? 'make this user an admin' : 'remove admin privileges from this user';
        if (window.confirm(`Are you sure you want to ${action}?`)) {
            try {
                const token = localStorage.getItem('cyberstorm_token');
                await axios.put(`${API_URL}/${userId}/role`, 
                    { role: newRole, adminUserId: adminUser.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to update role.');
            }
        }
    };

    const handleDelete = async (userIdToDelete) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                const token = localStorage.getItem('cyberstorm_token');
                await axios.delete(`${API_URL}/${userIdToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { adminUserId: adminUser.id }
                });
                fetchUsers();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user.');
            }
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Օգտատերերի կառավարում</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                            <th className="px-5 py-3 border-b-2">Անուն</th>
                            <th className="px-5 py-3 border-b-2">Էլ. փոստ</th>
                            <th className="px-5 py-3 border-b-2">Դեր</th>
                            <th className="px-5 py-3 border-b-2 text-right">Գործողություններ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const isSuperAdmin = adminUser.role === 'superadmin';
                            const isAdmin = adminUser.role === 'admin';
                            const targetIsAdmin = user.role === 'admin';
                            const targetIsSuperAdmin = user.role === 'superadmin';

                            const canEditRole = isSuperAdmin && !targetIsSuperAdmin && user.id !== adminUser.id;
                            const canDelete = (isSuperAdmin && !targetIsSuperAdmin && user.id !== adminUser.id) || (isAdmin && !targetIsAdmin && !targetIsSuperAdmin);

                            return (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="px-5 py-4">{user.name}</td>
                                    <td className="px-5 py-4">{user.email}</td>
                                    <td className="px-5 py-4">
                                        <span className={`font-semibold capitalize ${(targetIsSuperAdmin || targetIsAdmin ? 'text-indigo-600' : 'text-gray-700')}`}>
                                            {targetIsSuperAdmin ? "Admin" : user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right space-x-4">
                                        {canEditRole && !targetIsAdmin && (
                                            <button onClick={() => handleRoleUpdate(user.id, 'admin')} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                                Դարձնել ադմին
                                            </button>
                                        )}
                                        {canEditRole && targetIsAdmin && (
                                            <button onClick={() => handleRoleUpdate(user.id, 'student')} className="text-yellow-600 hover:text-yellow-900 font-semibold">
                                                Հեռացնել ադմինի կարգավիճակը
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 font-semibold">
                                                Ջնջել
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage;
