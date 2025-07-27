// /frontend/src/pages/MeetupDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/meetups`;

const MeetupDetailPage = () => {
    const { meetupIdString } = useParams();
    const { user } = useContext(AuthContext);
    const [meetup, setMeetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');

    const fetchMeetup = async () => {
        if (!user) return;
        try {
            // === THE FIX IS HERE ===
            // Get the token from localStorage and create the authorization header
            const token = localStorage.getItem('cyberstorm_token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { userId: user.id }
            };

            // Use the config object with the request
            const res = await axios.get(`${API_URL}/${meetupIdString}`, config);
            setMeetup(res.data);
        } catch (error) {
            console.error("Failed to fetch meetup", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetup();
    }, [meetupIdString, user]);

    const handleRegister = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.post(`${API_URL}/register`, 
                { userId: user.id, meetupId: meetup.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMeetup(); // Re-fetch to update registration status
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed.");
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.post(`${API_URL}/${meetup.id}/comments`, 
                { userId: user.id, comment_text: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMeetup(prev => ({ ...prev, comments: [res.data, ...prev.comments] }));
            setNewComment('');
        } catch (error) {
            alert("Failed to post comment.");
        }
    };

    if (loading) return <p className="p-10">Բեռնվում է...</p>;
    if (!meetup) return <p className="p-10">Meetup-ը չի գտնվել։</p>;

    const isUpcoming = new Date(meetup.meetup_datetime) >= new Date();

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800">{meetup.title}</h1>
            <p className="text-lg text-gray-500 mt-2">
                {new Date(meetup.meetup_datetime).toLocaleString('hy-AM', { dateStyle: 'full', timeStyle: 'short' })}
            </p>

            <div className="my-8">
                {meetup.video_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                        <iframe src={`https://www.youtube.com/embed/${meetup.video_url}`} title="YouTube video player" allowFullScreen className="w-full h-full"></iframe>
                    </div>
                ) : (
                    <img src={meetup.image_url || 'https://i.imgur.com/O1w6o3g.png'} alt={meetup.title} className="w-full rounded-lg shadow-lg"/>
                )}
            </div>

            {isUpcoming && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    {meetup.isRegistered ? (
                        <a href={meetup.join_url} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-6 py-3 bg-green-600 text-white font-bold rounded-lg text-xl hover:bg-green-700">
                            Միանալ հանդիպմանը
                        </a>
                    ) : (
                        <button onClick={handleRegister} className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg text-xl hover:bg-indigo-700">
                            Գրանցվել
                        </button>
                    )}
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">Նկարագրություն</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{meetup.description}</p>
                <hr className="my-6"/>
                <h2 className="text-2xl font-bold mb-4">Բանախոս(ներ)</h2>
                <div className="space-y-4">
                    {meetup.speakers.map(speaker => (
                        <div key={speaker.id}>
                            <p className="font-semibold text-lg">{speaker.name}</p>
                            <p className="text-gray-600">{speaker.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Մեկնաբանություններ</h2>
                <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Թողնել մեկնաբանություն..." className="flex-grow p-3 border rounded-lg"/>
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg">Ուղարկել</button>
                </form>
                <div className="space-y-6">
                    {meetup.comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div>
                                <p className="font-bold">{comment.author_name}</p>
                                <p className="text-gray-700">{comment.comment_text}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString('hy-AM')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MeetupDetailPage;