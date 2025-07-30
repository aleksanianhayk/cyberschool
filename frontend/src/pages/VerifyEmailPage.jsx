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
                setMessage(res.data.message || 'Ձեր էլ. փոստը հաջողությամբ հաստատվեց։ Այժմ կարող եք մուտք գործել։');
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
                {status === 'success' && (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
                {status === 'error' && (
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}
                
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
