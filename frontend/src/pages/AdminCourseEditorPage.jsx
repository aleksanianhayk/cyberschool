// /frontend/src/pages/AdminCourseEditorPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminComponentEditor from '../components/AdminComponentEditor';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin`;

// --- Reusable Modals ---
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

const Notification = ({ message, type, onDismiss }) => (
    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
        {message}
        <button onClick={onDismiss} className="ml-4 font-bold">X</button>
    </div>
);


const AdminCourseEditorPage = () => {
    const { courseIdString } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState({ type: 'course_details' });
    const { user } = useContext(AuthContext);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.get(`${API_URL}/courses/${courseIdString}`, { headers: { Authorization: `Bearer ${token}` } });
            setCourse(res.data);
        } catch (err) {
            setError('Could not load course data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCourseData();
        }
    }, [courseIdString, user]);

    const handleAddNewPage = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.post(`${API_URL}/pages`, { course_id: course.id }, { headers: { Authorization: `Bearer ${token}` } });
            const newPage = res.data;
            setCourse(prevCourse => ({
                ...prevCourse,
                pages: [...prevCourse.pages, newPage]
            }));
            setActiveView({ type: 'page', id: newPage.id });
        } catch (err) {
            setError('Failed to create a new page.');
        }
    };

    const updatePageComponent = (pageId, updatedComponents) => {
        setCourse(prevCourse => ({
            ...prevCourse,
            pages: prevCourse.pages.map(page => 
                page.id === pageId ? { ...page, components: updatedComponents } : page
            )
        }));
    };
    
    const updateCourseDetails = (updatedDetails) => {
        setCourse(prevCourse => ({
            ...prevCourse,
            ...updatedDetails
        }));
    };

    const handlePageDeleted = (deletedPageId) => {
        setCourse(prevCourse => ({
            ...prevCourse,
            pages: prevCourse.pages.filter(page => page.id !== deletedPageId)
        }));
        setActiveView({ type: 'course_details' });
    };

    if (loading) return <div className="p-10">Բեռնվում է...</div>;
    if (error) return <div className="p-10 text-red-500">{error}</div>;
    if (!course) return <div className="p-10">Դասընթացը չի գտնվել։</div>;

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-80 bg-white shadow-lg flex flex-col h-full">
                <div className="p-4 border-b">
                    <Link to="/admin/courses" className="text-sm text-indigo-600 hover:underline">← Բոլոր դասընթացները</Link>
                    <h2 className="text-xl font-bold mt-2 truncate">{course.title}</h2>
                    <p className="text-sm text-gray-500 font-mono">{course.course_id_string}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button onClick={() => setActiveView({ type: 'course_details' })} className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors ${activeView.type === 'course_details' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Դասընթացի մանրամասներ
                    </button>
                    <hr className="my-4"/>
                    {course.pages.map(page => (
                        <button key={page.id} onClick={() => setActiveView({ type: 'page', id: page.id })} className={`w-full text-left px-4 py-2 rounded-md transition-colors ${activeView.type === 'page' && activeView.id === page.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                            Էջ {page.page_number}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleAddNewPage} className="w-full py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600">
                        + Ավելացնել նոր էջ
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-10 overflow-y-auto bg-gray-200">
                {activeView.type === 'course_details' && <CourseDetailsView course={course} onUpdate={updateCourseDetails} />}
                {activeView.type === 'page' && <PageView page={course.pages.find(p => p.id === activeView.id)} onUpdate={updatePageComponent} onPageDeleted={handlePageDeleted} />}
            </main>
        </div>
    );
};

const CourseDetailsView = ({ course, onUpdate }) => {
    const [details, setDetails] = useState(course);
    const [sections, setSections] = useState([]);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        setDetails({ ...course, allowed_roles: Array.isArray(course.allowed_roles) ? course.allowed_roles : [] });
    }, [course]);
    
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const token = localStorage.getItem('cyberstorm_token');
                const res = await axios.get(`${API_URL}/sections`, { headers: { Authorization: `Bearer ${token}` } });
                setSections(res.data);
            } catch (err) {
                console.error("Could not fetch sections for editor");
            }
        };
        fetchSections();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        onUpdate({
            ...details,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        });
    };

    const handleRoleChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        onUpdate({ ...details, allowed_roles: selectedOptions });
    };
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.put(`${API_URL}/courses/${details.id}`, details, { headers: { Authorization: `Bearer ${token}` } });
            setNotification({ type: 'success', message: 'Դասընթացի մանրամասները հաջողությամբ պահպանվեցին։' });
        } catch (err) {
            setNotification({ type: 'error', message: err.response?.data?.message || 'Դասընթացը պահպանել չհաջողվեց։' });
        }
    };
    

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Դասընթացի մանրամասների խմբագրում</h1>
            <div className="space-y-6">
                <div>
                    <label className="block font-medium">Վերնագիր</label>
                    <input type="text" name="title" value={details.title || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block font-medium">Course ID</label>
                    <input type="text" name="course_id_string" value={details.course_id_string || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md font-mono bg-gray-100"/>
                </div>
                <div>
                    <label className="block font-medium">Նկարի հղում (URL)</label>
                    <input type="text" name="image_url" value={details.image_url || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block font-medium">Նկարագրություն</label>
                    <textarea name="description" value={details.description || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md" rows="4"></textarea>
                </div>
                <div className="flex gap-8">
                    <div className="w-1/2">
                        <label className="block font-medium">Բաժին</label>
                        <select name="section_id" value={details.section_id || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md">
                            <option value="">-- Չի պատկանում բաժնի --</option>
                            {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>
                    {/* === NEW: Allowed Roles Multi-Select === */}
                    <div className="w-1/2">
                        <label className="block font-medium">Թույլատրված դերեր (թողնել դատարկ բոլորի համար)</label>
                        <select 
                            multiple 
                            name="allowed_roles" 
                            value={details.allowed_roles} 
                            onChange={handleRoleChange} 
                            className="w-full mt-1 p-2 border rounded-md h-24"
                        >
                            {availableRoles.map(role => (
                                <option key={role} value={role} className="capitalize p-1">{role}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t pt-6">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" name="is_active" checked={!!details.is_active} onChange={handleChange} className="h-5 w-5"/>
                        <span className="font-medium">Ակտիվացնել դասընթացը</span>
                    </label>
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Պահպանել փոփոխությունները</button>
                </div>
                <div className="flex justify-end border-t pt-6">
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Պահպանել փոփոխությունները</button>
                </div>
            </div>
            {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
        </div>
    );
};

const PageView = ({ page, onUpdate, onPageDeleted }) => {
    if (!page) return null;
    const [notification, setNotification] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleAddComponent = (componentType) => {
        const newComponent = { id: `temp-${Date.now()}`, component_type: componentType, props: {} };
        onUpdate(page.id, [...(page.components || []), newComponent]);
    };

    const handleUpdateComponent = (index, newProps) => {
        const updatedComponents = page.components.map((c, i) => i === index ? { ...c, props: newProps } : c);
        onUpdate(page.id, updatedComponents);
    };

    const handleDeleteComponent = (index) => {
        const updatedComponents = page.components.filter((_, i) => i !== index);
        onUpdate(page.id, updatedComponents);
    };

    const handleSavePage = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.put(`${API_URL}/pages/${page.id}/components`, { components: page.components || [] }, { headers: { Authorization: `Bearer ${token}` } });
            setNotification({ type: 'success', message: 'Էջը հաջողությամբ պահպանվեց։' });
        } catch (err) {
            setNotification({ type: 'error', message: 'Էջը պահպանել չհաջողվեց։' });
        }
    };

    const handleDeletePage = async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.delete(`${API_URL}/pages/${page.id}`, { headers: { Authorization: `Bearer ${token}` } });
            onPageDeleted(page.id);
        } catch (err) {
            setNotification({ type: 'error', message: 'Էջը ջնջել չհաջողվեց։' });
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md sticky top-10 z-20">
                <h1 className="text-2xl font-bold">Էջ {page.page_number} - ի խմբագրում</h1>
                <div>
                    <button onClick={handleSavePage} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 mr-4">Պահպանել էջը</button>
                    <button onClick={() => setDeleteTarget(page)} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">Ջնջել էջը</button>
                </div>
            </div>

            <div className="space-y-4">
                {(page.components || []).map((component, index) => (
                    <AdminComponentEditor
                        key={component.id || index}
                        component={component}
                        onUpdate={(newProps) => handleUpdateComponent(index, newProps)}
                        onDelete={() => handleDeleteComponent(index)}
                    />
                ))}
            </div>

            <div className="mt-6 border-t-2 border-dashed pt-6">
                <AddComponentMenu onSelect={handleAddComponent} />
            </div>

            {notification && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification(null)} />}
            {deleteTarget && (
                <ConfirmationModal 
                    message={`Վստա՞հ եք, որ ուզում եք ջնջել Էջ ${deleteTarget.page_number}-ը։`}
                    onConfirm={handleDeletePage}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

const AddComponentMenu = ({ onSelect }) => {
    const componentTypes = ['PlainText', 'Image', 'Video', 'ParentTeacherTip', 'Divider', 'MultipleChoice', 'TrueFalse', 'ChooseOne', 'SelectImage', 'Matching', 'FillInTheBlanks', 'Sequencing'];
    return (
        <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <h3 className="font-bold mb-4">Ավելացնել նոր բաղադրիչ</h3>
            <div className="flex flex-wrap justify-center gap-2">
                {componentTypes.map(type => (
                    <button key={type} onClick={() => onSelect(type)} className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminCourseEditorPage;