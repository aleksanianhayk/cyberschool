// /frontend/src/pages/AdminCoursesListPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CreateCourseModal from '../components/CreateCourseModal';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

// --- Reusable Confirmation Modal ---
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm text-center">
            <p className="text-gray-800 text-lg mb-6">{message}</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Չեղարկել</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">Հաստատել</button>
            </div>
        </div>
    </div>
);

const AdminCoursesListPage = () => {
    const [data, setData] = useState({ sections: [], uncategorized: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [editingSection, setEditingSection] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null); // Can be { type: 'section', item: section } or { type: 'course', item: course }
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('cyberstorm_token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.get(`${API_URL}/sections-with-courses`, config);
            setData(res.data);
        } catch (err) {
            setError('Տվյալները բեռնել չհաջողվեց։');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleCreateSection = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.post(`${API_URL}/sections`, { title: newSectionTitle }, { headers: { Authorization: `Bearer ${token}` } });
            setNewSectionTitle('');
            fetchData();
        } catch (error) {
            setError('Բաժինը ստեղծել չհաջողվեց։');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const { type, item } = deleteTarget;
        const url = type === 'section' ? `${API_URL}/sections/${item.id}` : `${API_URL}/courses/${item.id}`;
        
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Ջնջել չհաջողվեց։');
        } finally {
            setDeleteTarget(null);
        }
    };

    const handleUpdateSection = async (sectionId) => {
        setError('');
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.put(`${API_URL}/sections/${sectionId}`, { title: editingSection.title }, { headers: { Authorization: `Bearer ${token}` } });
            setEditingSection(null);
            fetchData();
        } catch (error) {
            setError('Բաժինը թարմացնել չհաջողվեց։');
        }
    };
    
    const handleCourseCreated = (newCourse) => {
        setIsModalOpen(false);
        navigate(`/admin/courses/${newCourse.course_id_string}`);
    };

    if (loading) return <p className="p-10">Բեռնվում է...</p>;

    return (
        <div className="container mx-auto p-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Դասընթացների կառավարում</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                    + Ստեղծել նոր դասընթաց
                </button>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            <form onSubmit={handleCreateSection} className="mb-8 p-4 bg-white rounded-lg shadow-md flex gap-4">
                <input type="text" value={newSectionTitle} onChange={(e) => setNewSectionTitle(e.target.value)} placeholder="Նոր բաժնի անվանումը" className="flex-grow p-2 border rounded-md" required />
                <button type="submit" className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">+ Ավելացնել բաժին</button>
            </form>

            <div className="space-y-8">
                {data.sections.map(section => (
                    <SectionGroup key={section.id} section={section} onEdit={setEditingSection} onDelete={(item) => setDeleteTarget({ type: 'section', item })} onUpdate={handleUpdateSection} editingSection={editingSection} onDeleteCourse={(item) => setDeleteTarget({ type: 'course', item })} />
                ))}
                {data.uncategorized.length > 0 && (
                    <SectionGroup section={{ title: 'Առանց բաժնի', courses: data.uncategorized }} onDeleteCourse={(item) => setDeleteTarget({ type: 'course', item })} />
                )}
            </div>

            {isModalOpen && <CreateCourseModal onClose={() => setIsModalOpen(false)} onCourseCreated={handleCourseCreated} />}
            {deleteTarget && (
                <ConfirmationModal 
                    message={`Վստա՞հ եք, որ ուզում եք ջնջել "${deleteTarget.item.title}"։`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

const SectionGroup = ({ section, onEdit, onDelete, onUpdate, editingSection, onDeleteCourse }) => (
    <div>
        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-t-lg border-b-2 border-indigo-500">
            {editingSection && editingSection.id === section.id ? (
                <input type="text" value={editingSection.title} onChange={(e) => onEdit({ ...editingSection, title: e.target.value })} className="p-1 border rounded-md text-xl font-bold"/>
            ) : (
                <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
            )}
            {section.id && (
                <div className="flex gap-4">
                    {editingSection && editingSection.id === section.id ? (
                        <>
                            <button onClick={() => onUpdate(section.id)} className="text-sm font-semibold text-green-600">Պահպանել</button>
                            <button onClick={() => onEdit(null)} className="text-sm font-semibold text-gray-600">Չեղարկել</button>
                        </>
                    ) : (
                        <button onClick={() => onEdit({ id: section.id, title: section.title })} className="text-sm font-semibold text-indigo-600">Խմբագրել</button>
                    )}
                    <button onClick={() => onDelete(section)} className="text-sm font-semibold text-red-600">Ջնջել</button>
                </div>
            )}
        </div>
        
        <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
            <table className="min-w-full leading-normal">
                <tbody>
                    {section.courses.length > 0 ? section.courses.map(course => (
                        <tr key={course.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-5 py-3 text-sm font-medium">{course.title}</td>
                            <td className="px-5 py-3 text-sm font-mono">{course.course_id_string}</td>
                            <td className="px-5 py-3 text-sm">
                                <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${course.is_active ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>
                                    {course.is_active ? 'Ակտիվ' : 'Ոչ ակտիվ'}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-sm text-right">
                                <Link to={`/admin/courses/${course.course_id_string}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Խմբագրել</Link>
                                <button onClick={() => onDeleteCourse(course)} className="text-red-600 hover:text-red-900">Ջնջել</button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" className="text-center p-4 text-gray-500 italic">Այս բաժնում դասընթացներ չկան։</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default AdminCoursesListPage;
