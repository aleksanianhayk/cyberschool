// /frontend/src/components/CourseCompletion.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const CourseCompletion = ({ courseTitle }) => {
    const { width, height } = useWindowSize();

    // Emojis for the "rain" effect
    const emojiPieces = ['🎉', '✨', '🎓', '🚀', '👍', '✅', '🏆', '💯'];
    
    // Custom drawing function for emojis with random sizes
    const drawEmoji = (ctx) => {
        const fontSize = Math.random() * 20 + 20; // Emojis between 20px and 40px
        ctx.font = `${fontSize}px serif`;
        ctx.fillText(emojiPieces[Math.floor(Math.random() * emojiPieces.length)], 0, 0);
    };

    return (
        <div className="relative w-full">
            {/* === LAYER 1: A LOT of traditional confetti === */}
            {/* This layer creates a dense shower of colorful ribbons and shapes. */}
            <Confetti
                width={width}
                height={height}
                numberOfPieces={600} // A lot of confetti
                recycle={false}
                gravity={0.12}
                wind={0.01}
                tweenDuration={10000} // Fall slowly
            />
            
            {/* === LAYER 2: Emoji Rain === */}
            {/* This layer makes emojis fall straight down like rain, without spinning. */}
            <Confetti
                width={width}
                height={height}
                numberOfPieces={70} // A gentle rain of emojis
                recycle={false}
                gravity={0.25} // Emojis fall a bit faster
                angle={90} // Point them straight down
                spread={80} // Spread them out horizontally
                initialVelocityX={0} // No sideways initial push
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
