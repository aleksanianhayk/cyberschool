// /frontend/src/pages/MeetupsListPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_URL}/api/meetups`;

const MeetupsListPage = () => {
    const [meetups, setMeetups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetups = async () => {
            try {
                const res = await axios.get(API_URL);
                setMeetups(res.data);
            } catch (error) {
                console.error("Failed to fetch meetups", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetups();
    }, []);

    const upcomingMeetups = meetups.filter(m => new Date(m.meetup_datetime) >= new Date());
    const pastMeetups = meetups.filter(m => new Date(m.meetup_datetime) < new Date());

    if (loading) return <p className="p-10">Բեռնվում է...</p>;

    return (
        <div className="p-6 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Meetups</h1>
            
            {/* Upcoming Meetups Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-700 mb-4 pb-2 border-b-2">Առաջիկա հանդիպումներ</h2>
                {upcomingMeetups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingMeetups.map(meetup => <MeetupCard key={meetup.id} meetup={meetup} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">Առաջիկա հանդիպումներ չկան։</p>
                )}
            </div>

            {/* Past Meetups (Library) Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-700 mb-4 pb-2 border-b-2">Նախորդ հանդիպումների տեսադարան</h2>
                {pastMeetups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pastMeetups.map(meetup => <MeetupCard key={meetup.id} meetup={meetup} />)}
                    </div>
                ) : (
                    <p className="text-gray-500">Նախորդ հանդիպումների տեսանյութեր դեռ չկան։</p>
                )}
            </div>
        </div>
    );
};

const MeetupCard = ({ meetup }) => (
    <Link to={`/meetups/${meetup.meetup_id_string}`}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
            <div className="h-48 bg-gray-200">
                <img src={meetup.image_url || 'https://i.imgur.com/O1w6o3g.png'} alt={meetup.title} className="h-full w-full object-cover"/>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <p className="text-sm font-semibold text-indigo-600 mb-1">
                    {new Date(meetup.meetup_datetime).toLocaleDateString('hy-AM', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{meetup.title}</h3>
                <p className="text-gray-600 flex-grow text-sm line-clamp-3">{meetup.description}</p>
            </div>
        </div>
    </Link>
);

export default MeetupsListPage;
