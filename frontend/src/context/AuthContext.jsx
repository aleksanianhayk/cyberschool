// /frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On initial load, check if a user session exists in localStorage
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('cyberstorm_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('cyberstorm_user');
        } finally {
            // Set loading to false once user status is determined
            setLoading(false);
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('cyberstorm_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('cyberstorm_user');
        setUser(null);
    };

    // Display a loading message while we check for a user session
    if (loading) {
        return <div>Բեռնվում է...</div>; // "Loading..." in Armenian
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};