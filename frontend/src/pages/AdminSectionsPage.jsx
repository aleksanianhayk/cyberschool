// /frontend/src/pages/AdminSectionsPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/sections`;

// --- Reusable Confirmation Modal ---
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm text-center">
      <p className="text-gray-800 text-lg mb-6">{message}</p>
      <div className="flex justify-center gap-4">
        <button onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Չեղարկել</button>
        <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">Հաստատել</button>
      </div>
    </div>
  </div>
);

const AdminSectionsPage = () => {
    const [sections, setSections] = useState([]);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [editingSection, setEditingSection] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null); // For confirmation modal
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    const fetchSections = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            setSections(res.data);
        } catch (err) {
            setError('Բաժինները բեռնել չհաջողվեց։');
        }
    };

    useEffect(() => {
        if (user) {
            fetchSections();
        }
    }, [user]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.post(API_URL, { title: newSectionTitle }, { headers: { Authorization: `Bearer ${token}` } });
            setNewSectionTitle('');
            fetchSections();
        } catch (error) {
            setError('Բաժինը ստեղծել չհաջողվեց։');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.delete(`${API_URL}/${deleteTarget.id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchSections();
        } catch (error) {
            setError(error.response?.data?.message || 'Բաժինը ջնջել չհաջողվեց։');
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleUpdate = async (sectionId) => {
        setError('');
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.put(`${API_URL}/${sectionId}`, { title: editingSection.title }, { headers: { Authorization: `Bearer ${token}` } });
            setEditingSection(null);
            fetchSections();
        } catch (error) {
            setError('Բաժինը թարմացնել չհաջողվեց։');
        }
    };

    return (
        <div className="container mx-auto p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Բաժինների կառավարում</h1>
                <Link to="/admin/courses" className="text-indigo-600 hover:underline">← Վերադառնալ դասընթացներին</Link>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            <form onSubmit={handleCreate} className="mb-8 p-4 bg-white rounded-lg shadow-md flex gap-4">
                <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="Նոր բաժնի անվանումը"
                    className="flex-grow p-2 border rounded-md"
                    required
                />
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                    + Ստեղծել
                </button>
            </form>

            <div className="bg-white shadow-md rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {sections.map(section => (
                        <li key={section.id} className="p-4 flex justify-between items-center">
                            {editingSection?.id === section.id ? (
                                <input
                                    type="text"
                                    value={editingSection.title}
                                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                                    className="p-2 border rounded-md flex-grow"
                                />
                            ) : (
                                <span className="font-medium">{section.title}</span>
                            )}
                            <div className="flex gap-4">
                                {editingSection?.id === section.id ? (
                                    <>
                                        <button onClick={() => handleUpdate(section.id)} className="text-green-600 hover:text-green-900">Պահպանել</button>
                                        <button onClick={() => setEditingSection(null)} className="text-gray-600 hover:text-gray-900">Չեղարկել</button>
                                    </>
                                ) : (
                                    <button onClick={() => setEditingSection({ id: section.id, title: section.title })} className="text-indigo-600 hover:text-indigo-900">Խմբագրել</button>
                                )}
                                <button onClick={() => setDeleteTarget(section)} className="text-red-600 hover:text-red-900">Ջնջել</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {deleteTarget && (
                <ConfirmationModal 
                    message={`Վստա՞հ եք, որ ուզում եք ջնջել "${deleteTarget.title}" բաժինը։`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

export default AdminSectionsPage;