// /frontend/src/pages/AskAiPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import chatbotData from '../data/chatbotData.json';

const AskAiPage = () => {
    const [messages, setMessages] = useState([]);
    const [currentNodeId, setCurrentNodeId] = useState(chatbotData.startNodeId);
    const [isThinking, setIsThinking] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const currentNode = chatbotData.nodes[currentNodeId];
        if (currentNode && currentNode.type === 'question') {
            setIsThinking(true);
            setTimeout(() => {
                const sparkyMessage = {
                    sender: 'sparky',
                    content: currentNode.content,
                    options: currentNode.children.map(childId => ({ id: childId, ...chatbotData.nodes[childId] }))
                };
                setMessages(prev => [...prev, sparkyMessage]);
                setIsThinking(false);
            }, 1000);
        }
    }, [currentNodeId]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleAnswerClick = (option) => {
        if (!option.children || option.children.length === 0) return;

        const userMessage = { sender: 'user', content: option.content };
        setMessages(prev => [...prev, userMessage]);

        // === THE FIX IS HERE ===
        // The next node's ID is directly in the answer's 'children' array.
        const nextNodeId = option.children[0];
        setCurrentNodeId(nextNodeId);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-6 md:p-10">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Հարցրու Սպարկիին</h1>
            
            <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'sparky' && <img src="/dragon1.png" alt="Sparky" className="w-10 h-10 h-10 rounded-full"/>}
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p>{msg.content}</p>
                            {msg.sender === 'sparky' && msg.options && (
                                <div className="mt-4 space-y-2">
                                    {msg.options.map(option => (
                                        <button 
                                            key={option.id} 
                                            onClick={() => handleAnswerClick(option)}
                                            className="block w-full text-left p-2 bg-white rounded-md border border-indigo-300 text-indigo-700 font-semibold hover:bg-indigo-50"
                                        >
                                            {option.content}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isThinking && (
                    <div className="flex gap-3">
                        <img src="/dragon1.png" alt="Sparky" className="w-10 h-10 rounded-full"/>
                        <div className="p-3 rounded-lg bg-gray-200 text-gray-800 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default AskAiPage;
