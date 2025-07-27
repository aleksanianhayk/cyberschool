// /frontend/src/components/CourseCompletion.jsx

import React from "react";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const CourseCompletion = ({ courseTitle }) => {
  const { width, height } = useWindowSize();

  return (
    <>
      <style>{`
      #root > div > div > main > div > main > div > div > canvas{z-index:100!important}
      `}</style>
      <div className="w-full">
        {/* === UPDATED: Single, powerful confetti effect === */}
        <Confetti
          width={width}
          height={height}
          numberOfPieces={8000} // A lot of confetti for a big celebration
          recycle={false}
          gravity={0.1} // Makes confetti fall slower
          wind={-0.05} // A gentle breeze
          initialVelocityX={{ min: -10, max: 10 }} // Spread out horizontally
          initialVelocityY={{ min: -15, max: 5 }} // Shoot upwards initially
          tweenDuration={10000} // Linger for a long time (15 seconds)
          colors={["#78C841", "#B4E50D", "#FF9B2F", "#FB4141", "#FFFFFF"]}
        />

        <div className="bg-white p-10 rounded-xl shadow-2xl z-10 text-center">
          <h1 className="text-4xl font-bold text-green-500 mb-4">
            Շնորհավորում ենք։
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            Դուք հաջողությամբ ավարտեցիք դասընթացը՝
          </p>
          <h2 className="text-3xl font-bold text-indigo-600 mb-8">
            "{courseTitle}"
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Շարունակեք նույն ոգով։ Յուրաքանչյուր նոր գիտելիք ձեզ դարձնում է
            ավելի ուժեղ և ավելի պաշտպանված թվային աշխարհում։
          </p>
          <Link
            to="/learn"
            className="px-8 py-3 bg-lime-600 text-white font-bold rounded-lg text-lg shadow-lg hover:bg-lime-700 transition-transform transform hover:scale-105"
          >
            Վերադառնալ բոլոր դասընթացներին
          </Link>
        </div>
      </div>
    </>
  );
};

export default CourseCompletion;
