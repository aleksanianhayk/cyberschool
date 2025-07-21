// /frontend/src/pages/AdminPage.jsx

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/users`;

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const { user: adminUser } = useContext(AuthContext); // Get the currently logged-in admin

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMakeAdmin = async (userId) => {
    if (window.confirm("Are you sure you want to make this user an admin?")) {
      try {
        await axios.put(`${API_URL}/${userId}/role`, {
          role: "admin",
          adminUserId: adminUser.id, // Send admin's ID for verification on the backend
        });
        fetchUsers(); // Refresh the list to show the new role
      } catch (err) {
        alert(err.response?.data?.message || "Failed to update role.");
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
              <th className="px-5 py-3 border-b-2">Գործողություններ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-5 py-4">{user.name}</td>
                <td className="px-5 py-4">{user.email}</td>
                <td className="px-5 py-4">
                  <span
                    className={`font-semibold ${
                      user.role === "admin"
                        ? "text-indigo-600"
                        : "text-gray-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleMakeAdmin(user.id)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    >
                      Դարձնել ադմին
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
