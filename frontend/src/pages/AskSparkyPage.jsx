// /frontend/src/pages/AskSparkyPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import chatbotData from '../data/chatbotData.json';

const AskSparkyPage = () => {
    const [messages, setMessages] = useState([]);
    const [currentNodeKey, setCurrentNodeKey] = useState('start');
    const [isThinking, setIsThinking] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // This effect orchestrates the entire conversation flow
    useEffect(() => {
        const currentNode = chatbotData[currentNodeKey];
        if (currentNode) {
            // Start with a "thinking" animation
            setIsThinking(true);

            // After a short delay, show Sparky's answer (if one exists)
            setTimeout(() => {
                if (currentNode.answer) {
                    const sparkyAnswer = { sender: 'sparky', content: currentNode.answer };
                    setMessages(prev => [...prev, sparkyAnswer]);
                }

                // After another delay, show the next question and options
                setTimeout(() => {
                    const sparkyQuestion = {
                        sender: 'sparky',
                        content: currentNode.question,
                        options: currentNode.options
                    };
                    setMessages(prev => [...prev, sparkyQuestion]);
                    setIsThinking(false); // Stop thinking only after the question is shown
                }, 1200); // 1.2 second delay for the question

            }, 800); // 0.8 second delay for the answer
        }
    }, [currentNodeKey]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleOptionClick = (option) => {
        // First, add the user's choice to the message history
        const userMessage = { sender: 'user', content: option.text };
        setMessages(prev => [...prev, userMessage]);
        
        // Then, update the current node key to trigger the useEffect for Sparky's response
        setCurrentNodeKey(option.next);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-6 md:p-10">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Հարցրու Սպարկիին</h1>
            
            <div className="flex-1 bg-white rounded-lg shadow p-4 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'sparky' && <img src="/sparky_bot.png" alt="Sparky" className="w-20 h-20 rounded-full self-start"/>}
                        <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.sender === 'sparky' && msg.options && (
                                <div className="mt-4 space-y-2">
                                    {msg.options.map((option, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleOptionClick(option)}
                                            className="block w-full text-left p-2 bg-white rounded-md border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-50"
                                        >
                                            {option.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isThinking && (
                    <div className="flex gap-3">
                        <img src="/sparky_bot_thinking.png" alt="Sparky" className="w-20 h-20 rounded-full"/>
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

export default AskSparkyPage;
