// /frontend/src/components/CreateCourseModal.jsx

import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/courses`;

const CreateCourseModal = ({ onClose, onCourseCreated }) => {
  const [title, setTitle] = useState("");
  const [courseIdString, setCourseIdString] = useState("");
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("cyberstorm_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Use the config object with the request
      const res = await axios.post(
        API_URL,
        {
          title: title,
          course_id_string: courseIdString,
        },
        config
      );

      onCourseCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Սխալ՝ դասընթացը ստեղծելիս։");
    }
  };

  // Auto-generate course ID from title
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const newId = newTitle
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setCourseIdString(newId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Ստեղծել նոր դասընթաց</h2>
        {error && (
          <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Դասընթացի վերնագիր
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Course ID (auto-generated)
            </label>
            <input
              type="text"
              value={courseIdString}
              onChange={(e) => setCourseIdString(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Չեղարկել
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
            >
              Ստեղծել
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
