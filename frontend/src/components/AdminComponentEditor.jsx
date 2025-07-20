// /frontend/src/components/AdminComponentEditor.jsx

import React from 'react';

// --- Helper for unique IDs ---
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// --- Individual Editor Forms ---

const PlainTextEditor = ({ props, onUpdate }) => (
    <textarea value={props.text || ''} onChange={(e) => onUpdate({ ...props, text: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Գրեք ձեր տեքստը այստեղ..." rows="4"/>
);

const ImageEditor = ({ props, onUpdate }) => (
    <input type="text" value={props.src || ''} onChange={(e) => onUpdate({ ...props, src: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Նկարի հղում (URL)..."/>
);

const VideoEditor = ({ props, onUpdate }) => (
    <input type="text" value={props.videoId || ''} onChange={(e) => onUpdate({ ...props, videoId: e.target.value })} className="w-full p-2 border rounded-md" placeholder="YouTube Video ID (e.g., p2ERd_aP9_E)"/>
);

const ParentTeacherTipEditor = ({ props, onUpdate }) => (
     <textarea value={props.tip || ''} onChange={(e) => onUpdate({ ...props, tip: e.target.value })} className="w-full p-2 border rounded-md bg-yellow-50" placeholder="Գրեք ձեր խորհուրդը ծնողների/ուսուցիչների համար..." rows="3"/>
);

const TrueFalseEditor = ({ props, onUpdate }) => (
    <div className="space-y-2">
        <input type="text" value={props.statement || ''} onChange={(e) => onUpdate({ ...props, statement: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Գրեք պնդումը..."/>
        <div className="flex items-center gap-4 p-2">
            <label className="font-bold">Ճիշտ պատասխանը:</label>
            <label className="flex items-center gap-2"><input type="radio" name={`answer-${props.statement}`} checked={props.answer === 'true'} onChange={() => onUpdate({ ...props, answer: 'true' })}/> Ճիշտ է</label>
            <label className="flex items-center gap-2"><input type="radio" name={`answer-${props.statement}`} checked={props.answer === 'false'} onChange={() => onUpdate({ ...props, answer: 'false' })}/> Սխալ է</label>
        </div>
    </div>
);

const OptionsBasedEditor = ({ props, onUpdate, isMultipleChoice }) => {
    const options = props.options || [];
    const answer = props.answer || (isMultipleChoice ? [] : '');

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], text: value };
        onUpdate({ ...props, options: newOptions });
    };

    const handleAnswerChange = (optionText) => {
        if (isMultipleChoice) {
            const newAnswer = answer.includes(optionText) ? answer.filter(a => a !== optionText) : [...answer, optionText];
            onUpdate({ ...props, answer: newAnswer });
        } else {
            onUpdate({ ...props, answer: optionText });
        }
    };

    const addOption = () => onUpdate({ ...props, options: [...options, { text: '' }] });
    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);
        onUpdate({ ...props, options: newOptions });
    };

    return (
        <div className="space-y-3">
            <input type="text" value={props.question || ''} onChange={(e) => onUpdate({ ...props, question: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Ձեր հարցը..."/>
            {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                    {/* === THE FIX IS HERE === */}
                    <input type={isMultipleChoice ? 'checkbox' : 'radio'} name={`answer-${props.question}`} checked={isMultipleChoice ? answer.includes(opt.text) : answer === opt.text} onChange={() => handleAnswerChange(opt.text)} className="h-5 w-5 text-indigo-600 flex-shrink-0"/>
                    <input type="text" value={opt.text} onChange={(e) => handleOptionChange(index, e.target.value)} className="w-full p-2 border rounded-md" placeholder={`Տարբերակ ${index + 1}`}/>
                    <button onClick={() => removeOption(index)} className="text-red-500 font-bold">X</button>
                </div>
            ))}
            <button onClick={addOption} className="text-sm text-indigo-600">+ Ավելացնել տարբերակ</button>
        </div>
    );
};

const SelectImageEditor = ({ props, onUpdate }) => {
    const images = props.images || [];
    const addImage = () => onUpdate({ ...props, images: [...images, { src: '', alt: '' }] });
    const updateImage = (index, value) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], src: value };
        onUpdate({ ...props, images: newImages });
    };
    return (
        <div className="space-y-3">
            <input type="text" value={props.question || ''} onChange={(e) => onUpdate({ ...props, question: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Ձեր հարցը..."/>
            <p className="text-sm font-medium">Նշեք ճիշտ պատասխանի հղումը:</p>
            <input type="text" value={props.answer || ''} onChange={(e) => onUpdate({ ...props, answer: e.target.value })} className="w-full p-2 border rounded-md bg-green-50" placeholder="Ճիշտ պատասխանի հղումը..."/>
            <hr/>
            {images.map((img, index) => (
                <input key={index} type="text" value={img.src} onChange={(e) => updateImage(index, e.target.value)} className="w-full p-2 border rounded-md" placeholder={`Նկարի հղում ${index + 1}`}/>
            ))}
            <button onClick={addImage} className="text-sm text-indigo-600">+ Ավելացնել նկար</button>
        </div>
    );
};

const FillInTheBlanksEditor = ({ props, onUpdate }) => (
    <div className="space-y-2">
        <p className="text-sm font-medium">Գրեք նախադասությունը՝ բաց թողնված բառի փոխարեն օգտագործելով ___ (3 ընդգծում)։</p>
        <input type="text" value={props.text || ''} onChange={(e) => onUpdate({ ...props, text: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Օրինակ՝ Իմ անունն է ___։"/>
        <input type="text" value={props.answer || ''} onChange={(e) => onUpdate({ ...props, answer: e.target.value })} className="w-full p-2 border rounded-md bg-green-50" placeholder="Ճիշտ պատասխանը (բաց թողնված բառը)"/>
    </div>
);

const MatchingEditor = ({ props, onUpdate }) => {
    const pairs = props.pairs || [];

    const updatePair = (index, key, value) => {
        const newPairs = [...pairs];
        newPairs[index][key] = value;
        onUpdate({ ...props, pairs: newPairs });
    };

    const addPair = () => {
        const newPairs = [...pairs, { id: generateId(), term: '', definition: '' }];
        onUpdate({ ...props, pairs: newPairs });
    };

    const removePair = (index) => {
        const newPairs = pairs.filter((_, i) => i !== index);
        onUpdate({ ...props, pairs: newPairs });
    };

    return (
        <div className="space-y-3">
            <input type="text" value={props.title || ''} onChange={(e) => onUpdate({ ...props, title: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Առաջադրանքի վերնագիրը..."/>
            <div className="flex items-center gap-4 font-bold text-sm">
                <div className="w-1/2">Հասկացություն</div>
                <div className="w-1/2">Բացատրություն</div>
            </div>
            {pairs.map((pair, index) => (
                <div key={pair.id} className="flex items-center gap-4">
                    <input type="text" value={pair.term} onChange={(e) => updatePair(index, 'term', e.target.value)} className="w-1/2 p-2 border rounded-md"/>
                    <input type="text" value={pair.definition} onChange={(e) => updatePair(index, 'definition', e.target.value)} className="w-1/2 p-2 border rounded-md"/>
                    <button onClick={() => removePair(index)} className="text-red-500 font-bold">X</button>
                </div>
            ))}
            <button onClick={addPair} className="text-sm text-indigo-600">+ Ավելացնել զույգ</button>
        </div>
    );
};

const SequencingEditor = ({ props, onUpdate }) => {
    const items = props.items || [];
    const updateItem = (index, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], text: value };
        onUpdate({ ...props, items: newItems, answer: newItems.map(i => i.id) });
    };
    const addItem = () => onUpdate({ ...props, items: [...items, { id: generateId(), text: '' }] });
    return (
        <div className="space-y-2">
            <input type="text" value={props.title || ''} onChange={(e) => onUpdate({ ...props, title: e.target.value })} className="w-full p-2 border rounded-md" placeholder="Առաջադրանքի վերնագիրը..."/>
            <p className="text-sm font-medium">Մուտքագրեք տարբերակները ճիշտ հերթականությամբ։</p>
            {items.map((item, index) => <input key={item.id} type="text" value={item.text} onChange={(e) => updateItem(index, e.target.value)} className="w-full p-2 border rounded-md" placeholder={`Քայլ ${index + 1}`}/>)}
            <button onClick={addItem} className="text-sm text-indigo-600">+ Ավելացնել քայլ</button>
        </div>
    );
};


// --- Master Editor Component ---
const AdminComponentEditor = ({ component, onUpdate, onDelete }) => {
    const renderEditor = () => {
        switch (component.component_type) {
            case 'PlainText': return <PlainTextEditor props={component.props} onUpdate={onUpdate} />;
            case 'Image': return <ImageEditor props={component.props} onUpdate={onUpdate} />;
            case 'Video': return <VideoEditor props={component.props} onUpdate={onUpdate} />;
            case 'ParentTeacherTip': return <ParentTeacherTipEditor props={component.props} onUpdate={onUpdate} />;
            case 'Divider': return <p className="text-center text-gray-500 italic">- Բաժանարար գիծ -</p>;
            case 'TrueFalse': return <TrueFalseEditor props={component.props} onUpdate={onUpdate} />;
            case 'ChooseOne': return <OptionsBasedEditor props={component.props} onUpdate={onUpdate} isMultipleChoice={false} />;
            case 'MultipleChoice': return <OptionsBasedEditor props={component.props} onUpdate={onUpdate} isMultipleChoice={true} />;
            case 'SelectImage': return <SelectImageEditor props={component.props} onUpdate={onUpdate} />;
            case 'FillInTheBlanks': return <FillInTheBlanksEditor props={component.props} onUpdate={onUpdate} />;
            case 'Sequencing': return <SequencingEditor props={component.props} onUpdate={onUpdate} />;
            case 'Matching': return <MatchingEditor props={component.props} onUpdate={onUpdate} />;
            default: return <p className="text-sm text-gray-500">Այս տեսակի համար խմբագրիչ չկա։</p>;
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <p className="font-bold text-gray-700">{component.component_type}</p>
                <button onClick={onDelete} className="text-red-500 hover:text-red-700 font-bold text-sm">Ջնջել</button>
            </div>
            {renderEditor()}
        </div>
    );
};

export default AdminComponentEditor;
