// /frontend/src/layouts/UserLayout.jsx

import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

// --- Icon Components ---
const CoursesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-8.994l11.494 0M4.753 12l14.494 0" /></svg>;
const ChatbotIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MeetupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-3 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const GuideIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-8.994l11.494 0M4.753 12l14.494 0" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;


const UserLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`}>
                <div className="flex items-center justify-between p-4 border-b h-16">
                    <h1 className="text-xl font-bold text-green-600 whitespace-nowrap">CyberSchool</h1>
                    {/* This button is only visible on desktop now, but we hide it to prevent confusion */}
                    <button className="p-2 rounded-lg hover:bg-gray-200 hidden">
                        <MenuIcon />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <UserNavLink to="/learn" icon={<CoursesIcon />} label="Դասընթացներ" />
                    <UserNavLink to="/meetups" icon={<MeetupIcon />} label="Meetups" />
                    <UserNavLink to="/ask-sparky" icon={<ChatbotIcon />} label="Հարցրու Սպարկիին" />
                    {user?.role === 'teacher' && (
                        <UserNavLink to="/teacher-guide" icon={<GuideIcon />} label="Ուղեցույց" />
                    )}
                </nav>

                <div className="px-4 py-4 border-t">
                    <UserNavLink to="/profile" icon={<ProfileIcon />} label="Իմ էջը" />
                    <button onClick={logout} className="flex items-center p-3 my-2 rounded-lg font-medium transition-colors text-red-600 hover:bg-red-100 w-full">
                        <LogoutIcon />
                        <span className="ml-4 whitespace-nowrap">Ելք</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Top bar for mobile view with hamburger menu */}
                <div className="md:hidden flex justify-between items-center bg-white p-4 shadow-md sticky top-0 z-20">
                    <h1 className="text-xl font-bold text-green-600">CyberSchool</h1>
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <MenuIcon />
                    </button>
                </div>
                <div className="flex-grow">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const UserNavLink = ({ to, icon, label }) => {
    const baseClasses = "flex items-center p-3 my-2 rounded-lg font-medium transition-colors";
    const activeClasses = "bg-green-100 text-green-600";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100";

    return (
        <NavLink to={to} className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {icon}
            <span className="ml-4 whitespace-nowrap">{label}</span>
        </NavLink>
    );
};

export default UserLayout;