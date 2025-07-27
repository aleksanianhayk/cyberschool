// /frontend/src/layouts/UserLayout.jsx

import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

// --- Icon Components ---
const CoursesIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-8.994l11.494 0M4.753 12l14.494 0" /></svg>;
const ChatbotIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ProfileIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CollapseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
const LogoutIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MeetupIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-3 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const GuideIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-8.994l11.494 0M4.753 12l14.494 0" /></svg>;


const UserLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    useEffect(() => {
        const openPages = ['/learn', '/ask-ai', '/profile', '/meetups', '/teacher-guide'];
        if (openPages.includes(location.pathname)) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className={`relative z-30 flex flex-col bg-white shadow-xl transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex items-center justify-between p-4 border-b h-16">
                    <h1 className={`text-xl font-bold text-indigo-600 whitespace-nowrap ${isSidebarOpen ? '' : 'hidden'}`}>CyberSchool</h1>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-200">
                        <CollapseIcon />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <UserNavLink to="/learn" icon={<CoursesIcon />} label="Դասընթացներ" isOpen={isSidebarOpen} />
                    <UserNavLink to="/meetups" icon={<MeetupIcon />} label="Meetups" isOpen={isSidebarOpen} />
                    <UserNavLink to="/ask-ai" icon={<ChatbotIcon />} label="Հարցրու AI-ին" isOpen={isSidebarOpen} />
                    {user?.role === 'teacher' && (
                        <UserNavLink to="/teacher-guide" icon={<GuideIcon />} label="Ուղեցույց" isOpen={isSidebarOpen} />
                    )}
                </nav>

                <div className="px-4 py-4 border-t">
                    <UserNavLink to="/profile" icon={<ProfileIcon />} label="Իմ էջը" isOpen={isSidebarOpen} />
                    <button onClick={logout} className="flex items-center p-3 my-2 rounded-lg font-medium transition-colors text-red-600 hover:bg-red-100 w-full">
                        <LogoutIcon className={!isSidebarOpen && 'text-red-600'} />
                        <span className={`ml-4 whitespace-nowrap ${isSidebarOpen ? '' : 'hidden'}`}>Ելք</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

const UserNavLink = ({ to, icon, label, isOpen }) => {
    const baseClasses = "flex items-center p-3 my-2 rounded-lg font-medium transition-colors";
    const activeClasses = "bg-indigo-100 text-indigo-600";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100";
    const iconWithColor = React.cloneElement(icon, { className: !isOpen && 'text-indigo-600' });

    return (
        <NavLink to={to} className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {iconWithColor}
            <span className={`ml-4 whitespace-nowrap ${isOpen ? '' : 'hidden'}`}>{label}</span>
        </NavLink>
    );
};

export default UserLayout;
