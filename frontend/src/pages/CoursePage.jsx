// /frontend/src/pages/CoursePage.jsx

import React, { useState, useRef, useEffect, forwardRef, useContext } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import * as CourseTools from '../components/CourseTools.jsx';
import CourseCompletion from '../components/CourseCompletion.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const interactiveToolTypes = ['MultipleChoice', 'TrueFalse', 'ChooseOne', 'SelectImage', 'FillInTheBlanks', 'Sequencing', 'Matching'];

const ComponentRenderer = forwardRef(({ componentData, onInteract, isCompleted }, ref) => {
    const Component = CourseTools[componentData.component_type];
    if (!Component) return <p>Error: Component type "{componentData.component_type}" not found.</p>;
    
    const isInteractive = interactiveToolTypes.includes(componentData.component_type);
    
    return <Component ref={isInteractive ? ref : null} {...componentData.props} onInteract={onInteract} isCompleted={isCompleted} />;
});

const CoursePage = () => {
    const { courseIdString } = useParams();
    const { user } = useContext(AuthContext);
    const location = useLocation();
    
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(0);
    const [highestPageIndex, setHighestPageIndex] = useState(-1);
    const [isCourseComplete, setIsCourseComplete] = useState(false);
    const [isCheckActive, setIsCheckActive] = useState(false);
    const [isNextButtonActive, setIsNextButtonActive] = useState(false);
    const interactiveComponentRefs = useRef([]);

    const saveProgress = (pageIndex) => {
        if (!user || !course || pageIndex <= highestPageIndex) return;
        
        const token = localStorage.getItem('cyberstorm_token');
        axios.post(`${API_URL}/progress`, 
            { userId: user.id, courseId: course.id, pageIndex: pageIndex },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setHighestPageIndex(pageIndex);
    };

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            if (!user) return;
            try {
                setLoading(true);
                const token = localStorage.getItem('cyberstorm_token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const courseRes = await axios.get(`${API_URL}/courses/${courseIdString}`, config);
                const courseData = courseRes.data;
                setCourse(courseData);

                const progressRes = await axios.get(`${API_URL}/progress/${user.id}/${courseData.id}`, config);
                const fetchedIndex = progressRes.data.highestPageIndex;
                setHighestPageIndex(fetchedIndex);

                if (location.state?.restarted) {
                    setCurrentPage(0);
                } else if (fetchedIndex > -1) {
                    if (fetchedIndex === courseData.pages.length - 1) {
                        setIsCourseComplete(true);
                        setCurrentPage(fetchedIndex);
                    } else {
                        const startPage = Math.min(fetchedIndex + 1, courseData.pages.length - 1);
                        setCurrentPage(startPage);
                    }
                }

            } catch (err) {
                setError("Could not load course data.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourseAndProgress();
    }, [courseIdString, user]);

    useEffect(() => {
        if (!course) return;

        const pageContent = course.pages[currentPage];
        if (!pageContent) return;

        const hasInteractiveTools = pageContent.components.some(c => interactiveToolTypes.includes(c.component_type));
        const isPageCompleted = currentPage <= highestPageIndex;

        setIsNextButtonActive(!hasInteractiveTools || isPageCompleted);
        interactiveComponentRefs.current = [];

        if (!hasInteractiveTools && currentPage > highestPageIndex) {
            saveProgress(currentPage);
        }

    }, [currentPage, course, highestPageIndex]);

    const goToNext = () => {
        const totalPages = course.pages.length;
        if (currentPage === totalPages - 1) {
            setIsCourseComplete(true);
        } else if (currentPage < totalPages - 1) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };
    
    const goToPrev = () => {
        if (isCourseComplete) {
            setIsCourseComplete(false);
            setCurrentPage(course.pages.length - 1);
        } else if (currentPage > 0) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    const handleInteraction = () => {
        const isPageCompleted = currentPage <= highestPageIndex;
        if (!isPageCompleted) {
            setIsCheckActive(true);
            interactiveComponentRefs.current.forEach(ref => ref?.reset());
        }
    };

    const handleCheck = () => {
        let allCorrect = true;
        interactiveComponentRefs.current.forEach(ref => {
            if (ref) {
                const isCorrect = ref.check();
                if (!isCorrect) allCorrect = false;
            }
        });
        
        if (allCorrect) {
            setIsNextButtonActive(true);
            saveProgress(currentPage);
        }
    };

    if (loading) return <div className="text-center p-10">Դասընթացը բեռնվում է...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!course) return <div className="text-center p-10">Դասընթացը չի գտնվել։</div>;

    if (isCourseComplete) {
        return <CourseCompletion courseTitle={course.title} />;
    }

    const totalPages = course.pages.length;
    const progressPercentage = totalPages > 0 ? ((highestPageIndex + 1) / totalPages) * 100 : 0;
    const currentPagePercentage = isCourseComplete ? 100 : (totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0);
    const pageContent = course.pages[currentPage];
    const hasInteractiveTools = pageContent?.components.some(c => interactiveToolTypes.includes(c.component_type));
    const isPageCompleted = currentPage <= highestPageIndex;

    return (
        <div className="w-full min-h-screen flex flex-col bg-gray-100">
            <header className="w-full bg-white shadow-md sticky top-0 z-10 p-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center">
                         <Link to="/learn" className="text-sm text-green-600 hover:underline">← Վերադառնալ</Link>
                         <h2 className="text-xl font-bold text-center">{course.title}</h2>
                         <div className="w-1/4"></div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <button onClick={goToPrev} className="px-4 py-2 bg-gray-200 rounded">Նախորդ</button>
                        <div className="relative w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-green-300 h-4 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                            <div className="absolute top-0 left-0 bg-indigo-600 h-4 rounded-full transition-all duration-300" style={{ width: `${currentPagePercentage}%` }}></div>
                        </div>
                        <button onClick={goToNext} disabled={!isNextButtonActive} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 disabled:bg-gray-400">
                            {currentPage === totalPages - 1 ? 'Ավարտել' : 'Հաջորդ'}
                        </button>
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-600">
                        {isCourseComplete ? 'Դասընթացն ավարտված է' : `Էջ ${currentPage + 1} / ${totalPages}`}
                    </div>
                </div>
            </header>

            <main className="flex-grow flex items-start justify-center p-4 sm:p-8">
                <div className="w-full max-w-4xl mx-auto">
                    <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
                        {pageContent ? (
                            pageContent.components.map((component, index) => (
                                <ComponentRenderer 
                                    key={component.id || index} 
                                    componentData={component} 
                                    onInteract={handleInteraction}
                                    isCompleted={isPageCompleted}
                                    ref={el => interactiveComponentRefs.current[index] = el}
                                />
                            ))
                        ) : (
                            <CourseTools.PlainText text="Այս դասընթացում դեռ էջեր չկան։" />
                        )}
                    </div>

                    {hasInteractiveTools && (
                         <div className="mt-6 p-4 h-24 flex items-center justify-center">
                            {isPageCompleted ? (
                                <button onClick={goToNext} className="px-10 py-4 text-xl font-bold bg-lime-600 text-white rounded-lg shadow-lg hover:bg-lime-700 transition-all transform hover:scale-105">
                                    Շարունակել →
                                </button>
                            ) : (
                                <button onClick={handleCheck} disabled={!isCheckActive} className="px-10 py-4 text-xl font-bold bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed">
                                    Ստուգել
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CoursePage;
