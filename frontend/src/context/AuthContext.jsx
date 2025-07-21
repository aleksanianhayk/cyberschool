// /frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            if (token) {
                const decodedUser = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedUser.exp < currentTime) {
                    localStorage.removeItem('cyberstorm_token');
                } else {
                    setUser(decodedUser);
                }
            }
        } catch (error) {
            console.error("Failed to decode token", error);
            localStorage.removeItem('cyberstorm_token');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('cyberstorm_token', token);
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
    };

    const logout = () => {
        localStorage.removeItem('cyberstorm_token');
        setUser(null);
    };

    // New function to update user state locally
    const updateUser = (newUserData) => {
        setUser(prevUser => ({ ...prevUser, ...newUserData }));
    };

    if (loading) {
        return <div>Բեռնվում է...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
