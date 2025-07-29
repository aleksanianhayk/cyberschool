// /frontend/src/pages/VerifyEmailPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Հաստատում ենք ձեր էլ. փոստը...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Հաստատման թոքենը բացակայում է։');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await axios.get(`${API_URL}/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.message || 'Ձեր էլ. փոստը հաջողությամբ հաստատվեց։');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Էլ. փոստի հաստատումը ձախողվեց։');
            }
        };

        verifyToken();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                {status === 'verifying' && <div className="loader mx-auto mb-4"></div>}
                {status === 'success' && <div className="text-green-500 mb-4">✅</div>}
                {status === 'error' && <div className="text-red-500 mb-4">❌</div>}
                
                <h1 className={`text-2xl font-bold mb-4 ${status === 'success' ? 'text-green-600' : (status === 'error' ? 'text-red-600' : 'text-gray-800')}`}>
                    {status === 'success' ? 'Հաստատված է' : (status === 'error' ? 'Սխալ' : 'Հաստատում')}
                </h1>
                <p className="text-gray-600 mb-6">{message}</p>
                
                {status !== 'verifying' && (
                    <Link to="/authentication" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                        Վերադառնալ մուտքի էջ
                    </Link>
                )}
            </div>
            <style>{`.loader { border: 4px solid #f3f3f3; border-top: 4px solid #4f46e5; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default VerifyEmailPage;