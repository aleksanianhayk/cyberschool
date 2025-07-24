// /frontend/src/pages/LearnPage.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const LearnPage = () => {
    const [sections, setSections] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [openSections, setOpenSections] = useState({});
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) return;
            try {
                // === THE FIX IS HERE ===
                // Get the token from localStorage
                const token = localStorage.getItem('cyberstorm_token');
                
                // Create the authorization header
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                // Fetch sections/courses and user progress at the same time, including the header
                const [sectionsRes, progressRes] = await Promise.all([
                    axios.get(`${API_URL}/sections-with-courses`, config),
                    axios.get(`${API_URL}/progress/${user.id}`, config)
                ]);
                
                setSections(sectionsRes.data);
                setProgress(progressRes.data);

                const initialOpenState = {};
                sectionsRes.data.forEach((section, index) => {
                    // Only the first section is open by default
                    initialOpenState[section.id] = index === 0;
                });
                setOpenSections(initialOpenState);

            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user]);

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    if (loading) return <p className="p-10">Դասընթացները բեռնվում են...</p>;

    return (
        <div className="p-6 md:p-10">
            <div className="space-y-8">
                {sections.length > 0 ? (
                    sections.map(section => (
                        <div key={section.id} className="bg-slate-100/60 p-6 rounded-xl shadow-sm">
                            <button onClick={() => toggleSection(section.id)} className="w-full flex justify-between items-center text-left">
                                <h2 className="text-3xl font-bold text-gray-800">{section.title}</h2>
                                <svg className={`w-6 h-6 text-indigo-500 transition-transform duration-500 ${openSections[section.id] ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            <div className={`transition-all ease-in-out duration-300 z-index-2 ${openSections[section.id] ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {section.courses.map(course => (
                                        <CourseCard 
                                            key={course.id} 
                                            course={course} 
                                            progress={progress[course.id]}
                                            userId={user.id}
                                            onRestart={() => setProgress(p => ({...p, [course.id]: undefined}))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 mt-10">Ակտիվ դասընթացներ դեռ չկան։</p>
                )}
            </div>
        </div>
    );
};

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Չեղարկել</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Հաստատել</button>
            </div>
        </div>
    </div>
);

const CourseCard = ({ course, progress, userId, onRestart }) => {
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const navigate = useNavigate();
    
    const totalPages = course.page_count || 1; 
    const hasStarted = progress !== undefined;
    const progressPercentage = hasStarted ? ((progress + 1) / totalPages) * 100 : 0;

    const handleCopyLink = () => {
        const link = `${window.location.origin}/learn/course/${course.course_id_string}`;
        navigator.clipboard.writeText(link).then(() => {
            setOptionsOpen(false);
        });
    };

    const handleRestart = async () => {
        setIsRestartModalOpen(false);
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.delete(`${API_URL}/progress/${userId}/${course.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onRestart(); 
        } catch (error) {
            console.error('Failed to restart progress', error);
        }
    };

    const handleStart = () => {
        navigate(`/learn/course/${course.course_id_string}`, { state: { restarted: true } });
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="relative h-48 bg-gray-200">
                    <img src={course.image_url || 'https://i.imgur.com/m4x2a4j.png'} alt={course.title} className="h-full w-full object-cover"/>
                    <div className="absolute top-2 right-2">
                        <button onClick={() => setOptionsOpen(prev => !prev)} className="p-2 bg-black bg-opacity-40 rounded-full text-white hover:bg-opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        </button>
                        {optionsOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10" onMouseLeave={() => setOptionsOpen(false)}>
                                <button onClick={handleCopyLink} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap">Պատճենել հղումը</button>
                                {hasStarted && (
                                    <button onClick={() => setIsRestartModalOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 whitespace-nowrap">Վերսկսել</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                    <Link to={`/learn/course/${course.course_id_string}`} className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{course.title}</h3>
                        <p className="text-gray-600 flex-grow text-sm">{course.description}</p>
                    </Link>
                    <div className="mt-4">
                        {hasStarted ? (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        ) : (
                             <button onClick={handleStart} className="inline-block px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition text-sm">
                                Սկսել դասընթացը
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isRestartModalOpen && (
                <ConfirmationModal 
                    title="Վերսկսե՞լ դասընթացը"
                    message="Ձեր ամբողջ առաջընթացը այս դասընթացի համար կջնջվի։"
                    onConfirm={handleRestart}
                    onCancel={() => setIsRestartModalOpen(false)}
                />
            )}
        </>
    );
};

export default LearnPage;
