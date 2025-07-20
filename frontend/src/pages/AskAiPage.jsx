// /frontend/src/pages/AskAiPage.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const AskAiPage = () => {
    const { user } = useContext(AuthContext);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() || loading || !user) return;

        const userMessage = { sender: 'user', text: prompt };
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setPrompt('');

        try {
            const res = await axios.post(`${API_URL}/ask-ai`, { prompt, user });
            const aiText = res?.data?.response;
            if (aiText) {
                const aiMessage = { sender: 'ai', text: aiText };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            const errorMessageText = "Ներողություն, սխալ առաջացավ։ Խնդրում եմ փորձել մի փոքր ուշ։";
            const errorMessage = { sender: 'ai', text: errorMessageText };
            setMessages(prev => [...prev, errorMessage]);
            console.error("Failed to fetch AI response:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-6 md:p-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Հարցրու AI-ին</h2>
            
            {/* Chat History Area */}
            <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown children={msg.text || ""} />
                            </div>
                        </div>
                    </div>
                ))}
                {loading && <div className="text-center text-gray-500">AI-ն մտածում է...</div>}
                <div ref={chatEndRef} />
            </div>

            {/* Text Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Հարցրեք ինչ-որ բան..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loading}
                />
                <button type="submit" className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors" disabled={loading}>
                    Ուղարկել
                </button>
            </form>
        </div>
    );
};

export default AskAiPage;
