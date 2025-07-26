// /frontend/src/components/CourseTools.jsx

import React, { useState, useContext, forwardRef, useImperativeHandle, useMemo, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// --- Non-Interactive Tools ---
export const PlainText = ({ text }) => <p className="text-lg text-gray-700 my-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }}/>;
export const Image = ({ src, alt }) => <img src={src} alt={alt} className="my-6 rounded-lg shadow-md max-w-full mx-auto" />;
export const ParentTeacherTip = ({ tip }) => {
    const { user } = useContext(AuthContext);
    if (user?.role === 'teacher' || user?.role === 'parent') {
        return (
            <div className="my-6 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
                <p className="font-bold">💡 Ծնողի/Ուսուցչի խորհուրդ</p>
                <p>{tip}</p>
            </div>
        );
    }
    return null;
};
export const Divider = () => <hr className="my-8 border-t-2 border-gray-200" />;
export const Video = ({ videoId }) => (
    <div className="my-6 overflow-hidden rounded-lg shadow-lg">
        <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
    </div>
);


// --- Base Component for Interactive Tools ---
const InteractiveTool = forwardRef(({ children, checkLogic, onInteract, isCompleted }, ref) => {
    const [isCorrect, setIsCorrect] = useState(null);
    const [isAttempted, setIsAttempted] = useState(false);

    useEffect(() => {
        if (isCompleted) {
            setIsCorrect(true);
            setIsAttempted(true);
        } else {
            // Reset state if isCompleted changes back to false (e.g., on course restart)
            setIsCorrect(null);
            setIsAttempted(false);
        }
    }, [isCompleted]);

    useImperativeHandle(ref, () => ({
        check: () => {
            const correct = checkLogic();
            setIsCorrect(correct);
            setIsAttempted(true);
            return correct;
        },
        reset: () => {
            setIsCorrect(null);
            setIsAttempted(false);
        }
    }));

    // Add onKeyUp to the wrapper to catch keyboard interactions
    return (
        <div onKeyUp={onInteract} onClick={onInteract} className={`my-6 p-5 bg-white border rounded-lg shadow-sm transition-all ${isAttempted ? (isCorrect ? 'border-green-500 ring-2 ring-green-200' : 'border-red-500 ring-2 ring-red-200') : 'border-gray-200'}`}>
            {children}
            {isAttempted && (
                <p className={`mt-4 text-center font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Ճիշտ է։' : 'Սխալ է, փորձիր կրկին։'}
                </p>
            )}
        </div>
    );
});


// --- Fully Functional Interactive Tools with Completed State ---

export const MultipleChoice = forwardRef(({ question, options, answer, onInteract, isCompleted }, ref) => {
    const [selected, setSelected] = useState([]);
    const handleSelect = (optionText) => {
        if (isCompleted) return;
        const newSelected = selected.includes(optionText) ? selected.filter(item => item !== optionText) : [...selected, optionText];
        setSelected(newSelected);
    };
    const checkLogic = () => {
        if (selected.length !== answer.length) return false;
        return answer.every(val => selected.includes(val));
    };
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} isCompleted={isCompleted} checkLogic={checkLogic}>
            <p className="font-semibold text-lg mb-4">{question}</p>
            <div className="space-y-3">
                {options.map((option, index) => (
                    <label key={index} className={`flex items-center p-3 border rounded-md ${isCompleted ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'} ${isCompleted && answer.includes(option.text) ? 'bg-indigo-50 border-indigo-400' : ''}`}>
                        <input type="checkbox" disabled={isCompleted} checked={isCompleted ? answer.includes(option.text) : selected.includes(option.text)} onChange={() => handleSelect(option.text)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                        <span className="ml-3 text-gray-700">{option.text}</span>
                    </label>
                ))}
            </div>
        </InteractiveTool>
    );
});

export const TrueFalse = forwardRef(({ statement, answer, onInteract, isCompleted }, ref) => {
    const [selection, setSelection] = useState(null);
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} isCompleted={isCompleted} checkLogic={() => selection === answer}>
            <p className="font-semibold text-lg mb-4 text-center">{statement}</p>
            <div className="flex gap-4">
                <button onClick={() => !isCompleted && setSelection('true')} disabled={isCompleted} className={`w-full py-2 px-4 font-bold rounded-lg transition ${(isCompleted && answer === 'true')||(selection === 'true') ? 'bg-green-600 text-white ring-2 ring-offset-2 ring-green-600' : 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300'}`}>Ճիշտ է</button>
                <button onClick={() => !isCompleted && setSelection('false')} disabled={isCompleted} className={`w-full py-2 px-4 font-bold rounded-lg transition ${(isCompleted && answer === 'false')||(selection === 'false') ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-red-600' : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300'}`}>Սխալ է</button>
            </div>
        </InteractiveTool>
    );
});

export const ChooseOne = forwardRef(({ question, options, answer, onInteract, isCompleted }, ref) => {
    const [selected, setSelected] = useState('');
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} isCompleted={isCompleted} checkLogic={() => selected === answer}>
            <p className="font-semibold text-lg mb-4">{question}</p>
            <div className="space-y-3">
                {options.map((option, index) => (
                    <label key={index} className={`flex items-center p-3 border rounded-md ${isCompleted ? 'cursor-default' : 'hover:bg-gray-50 cursor-pointer'} ${isCompleted && answer === option.text ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' : ''}`}>
                        <input type="radio" name={question} value={option.text} disabled={isCompleted} checked={isCompleted ? answer === option.text : selected === option.text} onChange={(e) => !isCompleted && setSelected(e.target.value)} className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 disabled:opacity-50" />
                        <span className="ml-3 text-gray-700">{option.text}</span>
                    </label>
                ))}
            </div>
        </InteractiveTool>
    );
});

export const SelectImage = forwardRef(({ question, images, answer, onInteract, isCompleted }, ref) => {
    const [selectedImg, setSelectedImg] = useState(null);
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} isCompleted={isCompleted} checkLogic={() => selectedImg === answer}>
            <p className="font-semibold text-lg mb-4">{question}</p>
            <div className="grid grid-cols-2 gap-4">
                {images.map((img, index) => (
                    <div key={index} onClick={() => !isCompleted && setSelectedImg(img.src)} className={`rounded-lg p-1 transition-all duration-200 ${isCompleted ? 'cursor-default' : 'cursor-pointer'} ${(isCompleted && answer === img.src)||(selectedImg === img.src) ? 'border-4 border-indigo-500 ring-4 ring-indigo-200' : 'border-2 border-transparent hover:border-indigo-400'}`}>
                        <img src={img.src} alt={img.alt} className="rounded-md w-full h-full object-cover"/>
                    </div>
                ))}
            </div>
        </InteractiveTool>
    );
});

export const FillInTheBlanks = forwardRef(({ text, answer, onInteract, isCompleted }, ref) => {
    const [userInput, setUserInput] = useState('');
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} isCompleted={isCompleted} checkLogic={() => userInput.toLowerCase().trim() === answer.toLowerCase().trim()}>
            <div className="text-center">
                <p className="text-lg text-gray-700 leading-relaxed">
                    {text.split('___')[0]}
                    <input type="text" value={isCompleted ? answer : userInput} disabled={isCompleted} onChange={(e) => setUserInput(e.target.value)} onKeyUp={onInteract} className="mx-2 p-1 w-32 border-b-2 border-gray-400 focus:border-indigo-500 outline-none bg-transparent text-center font-semibold text-indigo-700 disabled:bg-gray-100"/>
                    {text.split('___')[1]}
                </p>
            </div>
        </InteractiveTool>
    );
});

export const Sequencing = forwardRef(({ title, items, answer, onInteract, isCompleted }, ref) => {
    // Use useMemo to ensure shuffling only happens once on mount
    const shuffledItems = useMemo(() => isCompleted ? [...items].sort((a, b) => answer.indexOf(a.id) - answer.indexOf(b.id)) : [...items].sort(() => Math.random() - 0.5), [items, answer, isCompleted]);
    const [currentItems, setCurrentItems] = useState(shuffledItems);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleSort = () => {
        if (isCompleted) return;
        let _items = [...currentItems];
        const draggedItemContent = _items.splice(dragItem.current, 1)[0];
        _items.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setCurrentItems(_items);
        onInteract(); // Trigger interaction to enable check button
    };

    return (
        <InteractiveTool ref={ref} onInteract={() => {}} isCompleted={isCompleted} checkLogic={() => currentItems.every((item, i) => item.id === answer[i])}>
            <p className="font-semibold text-lg mb-4">{title}</p>
            <div className="space-y-2 mt-4">
                {currentItems.map((item, index) => (
                    <div key={index} draggable={!isCompleted} onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()} className={`p-3 bg-gray-100 border border-gray-300 rounded text-center ${isCompleted ? 'cursor-default' : 'cursor-move'}`}>
                        ☰ {item.text}
                    </div>
                ))}
            </div>
        </InteractiveTool>
    );
});

export const Matching = forwardRef(({ title, pairs, onInteract, isCompleted }, ref) => {
    const terms = useMemo(() => pairs.map(p => ({ id: p.id, text: p.term })), [pairs]);
    const definitions = useMemo(() => pairs.map(p => ({ id: p.id, text: p.definition })).sort(() => Math.random() - 0.5), [pairs]);
    const [matches, setMatches] = useState({});

    const handleDrop = (e, defId) => {
        if (isCompleted) return;
        e.preventDefault();
        const termId = e.dataTransfer.getData("termId");
        setMatches(prev => ({ ...prev, [defId]: termId }));
        onInteract(); // Trigger interaction to enable check button
    };

    const checkLogic = () => {
        if (Object.keys(matches).length !== pairs.length) return false;
        return Object.entries(matches).every(([defId, termId]) => defId === termId);
    };

    return (
        <InteractiveTool ref={ref} onInteract={() => {}} isCompleted={isCompleted} checkLogic={checkLogic}>
            <p className="font-semibold text-lg mb-4">{title}</p>
            <div className="flex flex-col md:flex-row justify-between mt-4 gap-8">
                <div className="w-full md:w-1/3 space-y-2">
                    <h3 className="font-bold text-center">Հասկացություններ</h3>
                    {terms.map(term => (
                        <div key={term.id} draggable={!isCompleted} onDragStart={(e) => e.dataTransfer.setData("termId", term.id)} className={`p-3 bg-blue-100 border border-blue-300 rounded text-center ${isCompleted ? 'cursor-default' : 'cursor-grab'}`}>
                            {term.text}
                        </div>
                    ))}
                </div>
                <div className="w-full md:w-2/3 space-y-2">
                    <h3 className="font-bold text-center">Բացատրություններ</h3>
                    {definitions.map(def => (
                        <div key={def.id} onDrop={(e) => handleDrop(e, def.id)} onDragOver={(e) => e.preventDefault()} className="p-2 min-h-[4rem] bg-gray-200 border-dashed border-gray-400 rounded flex items-center justify-between">
                            <p>{def.text}</p>
                            {isCompleted ? (
                                <span className="p-1 bg-blue-500 text-white text-xs font-bold rounded">{terms.find(t => t.id === def.id)?.text}</span>
                            ) : (
                                matches[def.id] && (
                                    <span className="p-1 bg-blue-500 text-white text-xs font-bold rounded">{terms.find(t => t.id === matches[def.id])?.text}</span>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </InteractiveTool>
    );
});
