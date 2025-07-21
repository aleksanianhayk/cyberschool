// /frontend/src/pages/AdminMeetupsListPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/meetups`;

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

const AdminMeetupsListPage = () => {
    const [meetups, setMeetups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { user } = useContext(AuthContext);

    const fetchMeetups = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            setMeetups(res.data);
        } catch (err) {
            setError('Meetup-ները բեռնել չհաջողվեց։');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMeetups();
        }
    }, [user]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.delete(`${API_URL}/${deleteTarget.id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchMeetups(); // Refresh the list
        } catch (err) {
            setError('Meetup-ը ջնջել չհաջողվեց։');
        } finally {
            setDeleteTarget(null);
        }
    };

    if (loading) return <p className="p-10">Բեռնվում է...</p>;

    return (
        <div className="p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Meetup-ների կառավարում</h1>
                <Link to="/admin/meetups/new" className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                    + Ստեղծել նոր Meetup
                </Link>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                            <th className="px-5 py-3 border-b-2">Վերնագիր</th>
                            <th className="px-5 py-3 border-b-2">Ամսաթիվ</th>
                            <th className="px-5 py-3 border-b-2">Կարգավիճակ</th>
                            <th className="px-5 py-3 border-b-2">Գործողություններ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetups.map(meetup => (
                            <tr key={meetup.id} className="border-b hover:bg-gray-50">
                                <td className="px-5 py-4 font-medium">{meetup.title}</td>
                                <td className="px-5 py-4">{new Date(meetup.meetup_datetime).toLocaleString('hy-AM')}</td>
                                <td className="px-5 py-4">
                                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${meetup.is_active ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>
                                        {meetup.is_active ? 'Ակտիվ' : 'Ոչ ակտիվ'}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <Link to={`/admin/meetups/${meetup.meetup_id_string}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Խմբագրել</Link>
                                    <button onClick={() => setDeleteTarget(meetup)} className="text-red-600 hover:text-red-900">Ջնջել</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {deleteTarget && (
                <ConfirmationModal 
                    message={`Վստա՞հ եք, որ ուզում եք ջնջել "${deleteTarget.title}" meetup-ը։`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

export default AdminMeetupsListPage;
