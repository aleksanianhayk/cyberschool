// /frontend/src/pages/AdminSectionsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/sections`;

const AdminSectionsPage = () => {
    const [sections, setSections] = useState([]);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [editingSection, setEditingSection] = useState(null); // { id, title }

    const fetchSections = async () => {
        try {
            const res = await axios.get(API_URL);
            setSections(res.data);
        } catch (error) {
            alert('Բաժինները բեռնել չհաջողվեց։');
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, { title: newSectionTitle });
            setNewSectionTitle('');
            fetchSections(); // Refresh list
        } catch (error) {
            alert('Բաժինը ստեղծել չհաջողվեց։');
        }
    };

    const handleDelete = async (sectionId) => {
        if (window.confirm('Վստա՞հ եք, որ ուզում եք ջնջել այս բաժինը։ Դասընթացները չեն ջնջվի։')) {
            try {
                await axios.delete(`${API_URL}/${sectionId}`);
                fetchSections(); // Refresh list
            } catch (error) {
                alert('Բաժինը ջնջել չհաջողվեց։');
            }
        }
    };

    const handleUpdate = async (sectionId) => {
        try {
            await axios.put(`${API_URL}/${sectionId}`, { title: editingSection.title });
            setEditingSection(null); // Exit editing mode
            fetchSections(); // Refresh list
        } catch (error) {
            alert('Բաժինը թարմացնել չհաջողվեց։');
        }
    };

    return (
        <div className="container mx-auto p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Բաժինների կառավարում</h1>
                <Link to="/admin/courses" className="text-indigo-600 hover:underline">← Վերադառնալ դասընթացներին</Link>
            </div>

            {/* Create Section Form */}
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

            {/* Sections List */}
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
                                <button onClick={() => handleDelete(section.id)} className="text-red-600 hover:text-red-900">Ջնջել</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminSectionsPage;
