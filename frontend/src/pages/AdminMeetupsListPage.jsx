// /frontend/src/pages/AdminMeetupsListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/meetups`;

const AdminMeetupsListPage = () => {
    const [meetups, setMeetups] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMeetups = async () => {
        try {
            const res = await axios.get(API_URL);
            setMeetups(res.data);
        } catch (error) {
            alert('Meetup-ները բեռնել չհաջողվեց։');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetups();
    }, []);

    const handleDelete = async (meetupId) => {
        if (window.confirm('Վստա՞հ եք, որ ուզում եք ջնջել այս meetup-ը։')) {
            try {
                await axios.delete(`${API_URL}/${meetupId}`);
                fetchMeetups(); // Refresh the list
            } catch (error) {
                alert('Meetup-ը ջնջել չհաջողվեց։');
            }
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
                                    <button onClick={() => handleDelete(meetup.id)} className="text-red-600 hover:text-red-900">Ջնջել</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMeetupsListPage;
