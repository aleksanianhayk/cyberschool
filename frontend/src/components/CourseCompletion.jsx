// /frontend/src/components/CourseCompletion.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // A helper to get the screen size

const CourseCompletion = ({ courseTitle }) => {
    const { width, height } = useWindowSize();

    // Custom emoji "pieces" for the emoji rain effect
    const emojiPieces = ['🎉', '✨', '🎓', '🚀', '👍', '✅'];
    const drawShape = (ctx) => {
        ctx.font = '30px serif'; // Larger emojis
        ctx.fillText(emojiPieces[Math.floor(Math.random() * emojiPieces.length)], 0, 0);
    };

    return (
        <div className="relative w-full">
            {/* Layer 1: Traditional Ribbon Confetti */}
            <Confetti
                width={width}
                height={height}
                numberOfPieces={200} // A good amount of ribbons
                recycle={false}
                gravity={0.15}
                wind={0.01}
                tweenDuration={10000} // Slower fall
            />
            {/* Layer 2: Emoji Rain */}
            <Confetti
                width={width}
                height={height}
                numberOfPieces={50} // Fewer emojis
                recycle={false}
                gravity={0.2} // Emojis fall a bit faster
                drawShape={drawShape}
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
