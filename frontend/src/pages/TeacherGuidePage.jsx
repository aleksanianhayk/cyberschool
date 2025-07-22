// /frontend/src/pages/TeacherGuidePage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/teacher-guide`;

// Recursive component with new visual hierarchy
const GuideItem = ({ item }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (item.content_type === 'dropdown') {
        return (
            <div className="my-4 rounded-lg bg-white shadow-sm border border-gray-200">
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center w-full text-left p-4">
                    <h3 className="font-bold text-gray-800 flex-grow text-2xl">{item.title}</h3>
                    <svg className={`w-5 h-5 ml-2 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <div className={`transition-all ease-in-out duration-500 overflow-hidden ${isOpen ? 'max-h-[5000px]' : 'max-h-0'}`}>
                    <div className="p-4 border-t border-gray-200 space-y-2">
                        {item.children && item.children.map(child => <GuideItem key={child.id} item={child} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (item.content_type === 'text') {
        return (
            <div className="p-4">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content_body }} />
            </div>
        );
    }

    return null;
};


const TeacherGuidePage = () => {
    const [guideContent, setGuideContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext); // Get the user from context

    useEffect(() => {
        const fetchGuide = async () => {
            if (!user) return; // Don't fetch if user is not logged in
            try {
                // Get the token from localStorage and create the authorization header
                const token = localStorage.getItem('cyberstorm_token');
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                
                // Use the config object with the request
                const res = await axios.get(API_URL, config);
                setGuideContent(res.data);
            } catch (error) {
                console.error("Failed to fetch teacher guide", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGuide();
    }, [user]); // Add user as a dependency

    if (loading) return <p className="p-10">Բեռնվում է...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Ուղեցույց ուսուցիչների համար</h1>
            <div className="space-y-4">
                {guideContent.length > 0 ? (
                    guideContent.map(item => <GuideItem key={item.id} item={item} />)
                ) : (
                    <p className="text-gray-500 bg-white p-8 rounded-xl shadow-md">Ուղեցույցի բովանդակությունը դեռ ավելացված չէ։</p>
                )}
            </div>
        </div>
    );
};

export default TeacherGuidePage;
