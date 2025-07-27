// /frontend/src/components/CourseCompletion.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const CourseCompletion = ({ courseTitle }) => {
    const { width, height } = useWindowSize();

    // Emojis for the separate "rain" effect
    const emojiPieces = ['🎉', '✨', '🎓', '🚀', '👍', '✅', '🏆', '💯'];
    const drawEmoji = (ctx) => {
        const fontSize = Math.random() * 20 + 20; // Emojis between 20px and 40px
        ctx.font = `${fontSize}px serif`;
        ctx.fillText(emojiPieces[Math.floor(Math.random() * emojiPieces.length)], 0, 0);
    };

    // Custom drawing function for long, ribbon-like confetti
    const drawRibbon = (ctx) => {
        const a = Math.random() * 2 * Math.PI;
        const x = Math.cos(a);
        const y = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(x * -5, y * -2);
        ctx.lineTo(x * 5, y * 2);
        ctx.lineTo(x * 2, y * 5);
        ctx.lineTo(x * -2, y * -5);
        ctx.closePath();
        ctx.fill();
    };


    return (
        <div className="relative w-full">
            {/* === LAYER 1: A LOT of traditional, varied confetti === */}
            <Confetti
                width={width}
                height={height}
                numberOfPieces={800} // A lot of confetti for a big celebration
                recycle={false}
                gravity={0.1}
                wind={0.05}
                tweenDuration={12000} // Fall slowly for a longer effect
                drawShape={drawRibbon} // Use the custom ribbon shape
                colors={['#78C841', '#B4E50D', '#FF9B2F', '#FB4141', '#FFFFFF']}
            />
            
            {/* === LAYER 2: Emoji Rain (Unchanged) === */}
            <Confetti
                width={width}
                height={height}
                numberOfPieces={70}
                recycle={false}
                gravity={0.25}
                angle={90}
                spread={80}
                initialVelocityX={0}
                drawShape={drawEmoji}
                tweenDuration={8000}
            />
            
            <div className="bg-white p-10 rounded-xl shadow-2xl z-10 text-center">
                <h1 className="text-4xl font-bold text-green-500 mb-4">Շնորհավորում ենք։</h1>
                <p className="text-xl text-gray-700 mb-2">Դուք հաջողությամբ ավարտեցիք դասընթացը՝</p>
                <h2 className="text-3xl font-bold text-indigo-600 mb-8">"{courseTitle}"</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Շարունակեք նույն ոգով։ Յուրաքանչյուր նոր գիտելիք ձեզ դարձնում է ավելի ուժեղ և ավելի պաշտպանված թվային աշխարհում։
                </p>
                <Link
                    to="/learn"
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg text-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
                >
                    Վերադառնալ բոլոր դասընթացներին
                </Link>
            </div>
        </div>
    );
};

export default CourseCompletion;
