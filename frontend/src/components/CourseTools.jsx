// /frontend/src/components/CourseTools.jsx

import React, { useState, useContext, forwardRef, useImperativeHandle, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// --- Non-Interactive Tools (No changes) ---
export const PlainText = ({ text }) => <p className="text-lg text-gray-700 my-4 leading-relaxed">{text}</p>;
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
const InteractiveTool = forwardRef(({ children, checkLogic, onInteract }, ref) => {
    const [isCorrect, setIsCorrect] = useState(null);
    const [isAttempted, setIsAttempted] = useState(false);

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

    const handleInteraction = () => {
        if (!isAttempted) {
            onInteract();
        }
    };

    return (
        <div onClick={onInteract} className={`my-6 p-5 bg-white border rounded-lg shadow-sm transition-all ${isAttempted ? (isCorrect ? 'border-green-500 ring-2 ring-green-200' : 'border-red-500 ring-2 ring-red-200') : 'border-gray-200'}`}>
            {children}
            {isAttempted && (
                <p className={`mt-4 text-center font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {/* === UPDATED TEXT FOR INCORRECT ANSWER === */}
                    {isCorrect ? 'Ճիշտ է։' : 'Սխալ է, փորձիր կրկին։'}
                </p>
            )}
        </div>
    );
});


// --- Fully Functional Interactive Tools ---

export const MultipleChoice = forwardRef(({ question, options, answer, onInteract }, ref) => {
    const [selected, setSelected] = useState([]);
    const handleSelect = (optionText) => {
        const newSelected = selected.includes(optionText) ? selected.filter(item => item !== optionText) : [...selected, optionText];
        setSelected(newSelected);
    };
    const checkLogic = () => {
        if (selected.length !== answer.length) return false;
        return answer.every(val => selected.includes(val));
    };
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} checkLogic={checkLogic}>
            <p className="font-semibold text-lg mb-4">{question}</p>
            <div className="space-y-3">
                {options.map((option, index) => (
                    <label key={index} className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400">
                        <input type="checkbox" checked={selected.includes(option.text)} onChange={() => handleSelect(option.text)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="ml-3 text-gray-700">{option.text}</span>
                    </label>
                ))}
            </div>
        </InteractiveTool>
    );
});

export const TrueFalse = forwardRef(({ statement, answer, onInteract }, ref) => {
    const [selection, setSelection] = useState(null);
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} checkLogic={() => selection === answer}>
            <p className="font-semibold text-lg mb-4 text-center">{statement}</p>
            <div className="flex gap-4">
                <button onClick={() => setSelection('true')} className={`w-full py-2 px-4 font-bold rounded-lg transition ${selection === 'true' ? 'bg-green-600 text-white ring-2 ring-offset-2 ring-green-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>Ճիշտ է</button>
                <button onClick={() => setSelection('false')} className={`w-full py-2 px-4 font-bold rounded-lg transition ${selection === 'false' ? 'bg-red-600 text-white ring-2 ring-offset-2 ring-red-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>Սխալ է</button>
            </div>
        </InteractiveTool>
    );
});

export const ChooseOne = forwardRef(({ question, options, answer, onInteract }, ref) => {
    const [selected, setSelected] = useState('');
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} checkLogic={() => selected === answer}>
            <p className="font-semibold text-lg mb-4">{question}</p>
            <div className="space-y-3">
                {options.map((option, index) => (
                    <label key={index} className={`flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer ${selected === option.text ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200' : ''}`}>
                        <input type="radio" name={question} value={option.text} checked={selected === option.text} onChange={(e) => setSelected(e.target.value)} className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                        <span className="ml-3 text-gray-700">{option.text}</span>
                    </label>
                ))}
            </div>
        </InteractiveTool>
    );
});

export const SelectImage = forwardRef(({ question, images, answer, onInteract }, ref) => {
    const [selectedImg, setSelectedImg] = useState(null);
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} checkLogic={() => selectedImg === answer}>
            <p className="font-semibold text-lg mb-4">{question}</p>
            <div className="grid grid-cols-2 gap-4">
                {images.map((img, index) => (
                    <div key={index} onClick={() => setSelectedImg(img.src)} className={`rounded-lg p-1 cursor-pointer transition-all duration-200 ${selectedImg === img.src ? 'border-4 border-indigo-500 ring-4 ring-indigo-200' : 'border-2 border-transparent hover:border-indigo-400'}`}>
                        <img src={img.src} alt={img.alt} className="rounded-md w-full h-full object-cover"/>
                    </div>
                ))}
            </div>
        </InteractiveTool>
    );
});

export const FillInTheBlanks = forwardRef(({ text, answer, onInteract }, ref) => {
    const [userInput, setUserInput] = useState('');
    return (
        <InteractiveTool ref={ref} onInteract={onInteract} checkLogic={() => userInput.toLowerCase().trim() === answer.toLowerCase().trim()}>
            <div className="text-center">
                <p className="text-lg text-gray-700 leading-relaxed">
                    {text.split('___')[0]}
                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} className="mx-2 p-1 w-32 border-b-2 border-gray-400 focus:border-indigo-500 outline-none bg-transparent text-center font-semibold text-indigo-700"/>
                    {text.split('___')[1]}
                </p>
            </div>
        </InteractiveTool>
    );
});

export const Sequencing = forwardRef(({ title, items, answer, onInteract }, ref) => {
    const [currentItems, setCurrentItems] = useState(() => items.sort(() => Math.random() - 0.5));
    const dragItem = React.useRef(null);
    const dragOverItem = React.useRef(null);

    const handleSort = () => {
        let _items = [...currentItems];
        const draggedItemContent = _items.splice(dragItem.current, 1)[0];
        _items.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setCurrentItems(_items);
    };

    return (
        <InteractiveTool ref={ref} onInteract={onInteract} checkLogic={() => currentItems.every((item, i) => item.id === answer[i])}>
            <p className="font-semibold text-lg mb-4">{title}</p>
            <div className="space-y-2 mt-4">
                {currentItems.map((item, index) => (
                    <div key={index} draggable onDragStart={() => (dragItem.current = index)} onDragEnter={() => (dragOverItem.current = index)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()} className="p-3 bg-gray-100 border border-gray-300 rounded cursor-move text-center">
                        ☰ {item.text}
                    </div>
                ))}
            </div>
        </InteractiveTool>
    );
});

// === CORRECTED Matching Component ===
export const Matching = forwardRef(({ title, pairs, onInteract }, ref) => {
    // This component now correctly uses the 'pairs' prop from the database
    const terms = useMemo(() => pairs.map(p => ({ id: p.id, text: p.term })), [pairs]);
    const definitions = useMemo(() => pairs.map(p => ({ id: p.id, text: p.definition })).sort(() => Math.random() - 0.5), [pairs]);
    
    const [matches, setMatches] = useState({}); // { definitionId: termId }

    const handleDrop = (e, defId) => {
        e.preventDefault();
        const termId = e.dataTransfer.getData("termId");
        setMatches(prev => ({ ...prev, [defId]: termId }));
    };

    const checkLogic = () => {
        if (Object.keys(matches).length !== pairs.length) return false;
        // The correct answer is when the term's ID matches the definition's ID
        return Object.entries(matches).every(([defId, termId]) => defId === termId);
    };

    return (
        <InteractiveTool ref={ref} onInteract={onInteract} checkLogic={checkLogic}>
            <p className="font-semibold text-lg mb-4">{title}</p>
            <div className="flex flex-col md:flex-row justify-between mt-4 gap-8">
                <div className="w-full md:w-1/3 space-y-2">
                    <h3 className="font-bold text-center">Հասկացություններ</h3>
                    {terms.map(term => (
                        <div key={term.id} draggable onDragStart={(e) => e.dataTransfer.setData("termId", term.id)} className="p-3 bg-blue-100 border border-blue-300 rounded text-center cursor-grab">
                            {term.text}
                        </div>
                    ))}
                </div>
                <div className="w-full md:w-2/3 space-y-2">
                    <h3 className="font-bold text-center">Բացատրություններ</h3>
                    {definitions.map(def => (
                        <div key={def.id} onDrop={(e) => handleDrop(e, def.id)} onDragOver={(e) => e.preventDefault()} className="p-2 min-h-[4rem] bg-gray-200 border-dashed border-gray-400 rounded flex items-center justify-between">
                            <p>{def.text}</p>
                            {matches[def.id] && (
                                <span className="p-1 bg-blue-500 text-white text-xs font-bold rounded">
                                    {terms.find(t => t.id === matches[def.id])?.text}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </InteractiveTool>
    );
});
