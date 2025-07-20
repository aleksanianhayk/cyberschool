// /frontend/src/pages/AdminCourseEditorPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AdminComponentEditor from '../components/AdminComponentEditor';

const AdminCourseEditorPage = () => {
    const { courseIdString } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState({ type: 'course_details' });

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/courses/${courseIdString}`);
            setCourse(res.data);
        } catch (err) {
            setError('Could not load course data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseData();
    }, [courseIdString]);

    const handleAddNewPage = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/pages`, { course_id: course.id });
            const newPage = res.data;
            setCourse(prevCourse => ({
                ...prevCourse,
                pages: [...prevCourse.pages, newPage]
            }));
            setActiveView({ type: 'page', id: newPage.id });
        } catch (err) {
            alert('Failed to create a new page.');
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

    if (loading) return <div className="p-10">Բեռնվում է...</div>;
    if (error) return <div className="p-10 text-red-500">{error}</div>;
    if (!course) return <div className="p-10">Դասընթացը չի գտնվել։</div>

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
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

            {/* Main Content Area */}
            <main className="flex-1 p-10 overflow-y-auto bg-gray-200">
                {activeView.type === 'course_details' && <CourseDetailsView course={course} onUpdate={updateCourseDetails} />}
                {activeView.type === 'page' && <PageView page={course.pages.find(p => p.id === activeView.id)} onUpdate={updatePageComponent} />}
            </main>
        </div>
    );
};

const CourseDetailsView = ({ course, onUpdate }) => {
    const [details, setDetails] = useState(course);
    const [sections, setSections] = useState([]);

    useEffect(() => {
        setDetails(course);
    }, [course]);
    
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/sections`);
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

    const handleSave = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/courses/${details.id}`, details);
            alert('Դասընթացի մանրամասները հաջողությամբ պահպանվեցին։');
        } catch (err) {
            alert(err.response?.data?.message || 'Դասընթացը պահպանել չհաջողվեց։');
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
                    <div className="w-1/2 flex items-end pb-1">
                         <label className="flex items-center gap-3">
                            <input type="checkbox" name="is_active" checked={!!details.is_active} onChange={handleChange} className="h-5 w-5"/>
                            <span className="font-medium">Ակտիվացնել դասընթացը</span>
                        </label>
                    </div>
                </div>
                <div className="flex justify-end border-t pt-6">
                    <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">Պահպանել փոփոխությունները</button>
                </div>
            </div>
        </div>
    );
};

const PageView = ({ page, onUpdate }) => {
    if (!page) return null;

    const handleAddComponent = (componentType) => {
        const newComponent = {
            id: `temp-${Date.now()}`, 
            component_type: componentType,
            props: {}
        };
        // === FIX #1: Add a safeguard to ensure page.components is an array ===
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
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/pages/${page.id}/components`, {
                components: page.components || [] // Ensure we send an array
            });
            alert('Էջը հաջողությամբ պահպանվեց։');
        } catch (err) {
            alert('Էջը պահպանել չհաջողվեց։');
        }
    };

      // === NEW FUNCTION TO HANDLE DELETING THE PAGE ===
    const handleDeletePage = async () => {
        if (window.confirm(`Վստա՞հ եք, որ ուզում եք ջնջել Էջ ${page.page_number}-ը։`)) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/pages/${page.id}`);
                alert('Էջը հաջողությամբ ջնջվեց։');
                onPageDeleted(page.id);
            } catch (err) {
                alert('Էջը ջնջել չհաջողվեց։');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md sticky top-10 z-20">
                <h1 className="text-2xl font-bold">Էջ {page.page_number} - ի խմբագրում</h1>
                <div>
                    <button onClick={handleSavePage} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 mr-4">Պահպանել էջը</button>
                    <button onClick={handleDeletePage} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700">Ջնջել էջը</button>
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
