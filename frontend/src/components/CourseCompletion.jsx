// /frontend/src/components/CourseCompletion.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // A helper to get the screen size

const CourseCompletion = ({ courseTitle }) => {
    const { width, height } = useWindowSize();

    // Custom emoji "pieces" for the confetti
    const emojiPieces = ['🎉', '✨', '🎓', '🚀', '👍'];
    const drawShape = (ctx) => {
        ctx.font = '24px serif';
        ctx.strokeText(emojiPieces[Math.floor(Math.random() * emojiPieces.length)], 0, 0);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
            <Confetti
                width={width}
                height={height}
                numberOfPieces={400}
                recycle={false}
                gravity={0.1}
                drawShape={drawShape}
            />
            <div className="bg-white p-10 rounded-xl shadow-2xl z-10">
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
                    Վերադառնալ դասընթացներին
                </Link>
            </div>
        </div>
    );
};

export default CourseCompletion;
