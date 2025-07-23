// /frontend/src/pages/AdminTeacherGuidePage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { AuthContext } from '../context/AuthContext.jsx'; // Import AuthContext to get user

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/teacher-guide`;
const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY;

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

// --- TinyMCE Rich Text Editor Component ---
const RichTextEditor = ({ initialValue, onSave, onCancel }) => {
    const [content, setContent] = useState(initialValue);

    return (
        <div className="my-4">
            <Editor
                apiKey={TINYMCE_API_KEY}
                value={content}
                onEditorChange={(newValue) => setContent(newValue)}
                init={{
                    height: 300,
                    menubar: false,
                    plugins: 'lists link image media table code help wordcount autoresize',
                    toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image media | table | code',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
                }}
            />
            <div className="p-2 border-t flex justify-end gap-2">
                <button onClick={onCancel} className="px-4 py-1 bg-gray-200 font-semibold rounded-md">Cancel</button>
                <button onClick={() => onSave(content)} className="px-4 py-1 bg-green-600 text-white font-semibold rounded-md">Save Text</button>
            </div>
        </div>
    );
};

// --- Recursive component with new visual hierarchy ---
const EditableGuideItem = ({ item, onUpdate, onDelete, onAddChild, newlyCreatedId, onSaveTitle }) => {
    const [isEditingText, setIsEditingText] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const titleInputRef = useRef(null);

    useEffect(() => {
        if (item.id === newlyCreatedId) {
            if (item.content_type === 'text') {
                setIsEditingText(true);
            } else if (item.content_type === 'dropdown') {
                setIsEditingTitle(true);
                setTimeout(() => titleInputRef.current?.focus(), 0);
            }
        }
    }, [newlyCreatedId, item.id, item.content_type]);

    const handleSaveText = async (updatedContent) => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.put(`${API_URL}/${item.id}`, 
                { title: item.title, content_body: updatedContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsEditingText(false);
            onUpdate(item.id, { ...item, content_body: updatedContent });
        } catch (error) {
            console.error('Failed to save content.', error);
        }
    };

    const handleSaveTitle = async () => {
        await onSaveTitle(item.id, item.title);
        setIsEditingTitle(false);
    };

    return (
        <div className="my-2 rounded-lg bg-white shadow-sm border border-gray-200">
            <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 flex-grow">
                    {item.content_type === 'dropdown' && (
                        <button onClick={() => setIsOpen(!isOpen)} className="p-1">
                            <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}
                    {item.content_type === 'dropdown' ? (
                        isEditingTitle ? (
                            <input ref={titleInputRef} type="text" value={item.title} onChange={(e) => onUpdate(item.id, { ...item, title: e.target.value })} onBlur={handleSaveTitle} onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()} className="font-bold text-xl bg-transparent border-b-2 border-indigo-500 outline-none w-full"/>
                        ) : (
                            <h3 className="font-bold text-xl text-gray-800">{item.title}</h3>
                        )
                    ) : (
                        <span className="text-gray-600 italic">Text Block</span>
                    )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    {item.content_type === 'dropdown' && !isEditingTitle && (<button onClick={() => setIsEditingTitle(true)} className="text-sm text-indigo-600 font-semibold">Խմբագրել</button>)}
                    {item.content_type === 'text' && !isEditingText && (<button onClick={() => setIsEditingText(true)} className="text-sm text-indigo-600 font-semibold">Խմբագրել</button>)}
                    <button onClick={() => onDelete(item)} className="text-sm text-red-600 font-semibold">Ջնջել</button>
                </div>
            </div>

            {item.content_type === 'text' && isEditingText && (
                <div className="p-3"><RichTextEditor initialValue={item.content_body} onSave={handleSaveText} onCancel={() => setIsEditingText(false)} /></div>
            )}
             {item.content_type === 'text' && !isEditingText && (
                <div className="prose max-w-none p-4" dangerouslySetInnerHTML={{ __html: item.content_body }} />
            )}

            {item.content_type === 'dropdown' && isOpen && (
                <div className="p-3 border-t">
                    {(item.children || []).map(child => (
                        <EditableGuideItem key={child.id} item={child} onUpdate={onUpdate} onDelete={onDelete} onAddChild={onAddChild} newlyCreatedId={newlyCreatedId} onSaveTitle={onSaveTitle} />
                    ))}
                    <div className="mt-2 ml-4">
                        <button onClick={() => onAddChild(item.id, 'dropdown')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2">+ Ավելացնել Dropdown</button>
                        <button onClick={() => onAddChild(item.id, 'text')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+ Ավելացնել Տեքստ</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminTeacherGuidePage = () => {
    const [guideContent, setGuideContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [newlyCreatedId, setNewlyCreatedId] = useState(null);

    const fetchGuide = useCallback(async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            setGuideContent(res.data);
        } catch (error) {
            console.error("Failed to fetch teacher guide", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGuide();
    }, [fetchGuide]);
    
    const handleUpdateItem = useCallback((id, updatedItem) => {
        const updateRecursively = (items) => {
            return items.map(item => {
                if (item.id === id) return { ...item, ...updatedItem };
                if (item.children) return { ...item, children: updateRecursively(item.children) };
                return item;
            });
        };
        setGuideContent(prevContent => updateRecursively(prevContent));
    }, []);

    const handleSaveTitle = async (id, title) => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.put(`${API_URL}/${id}`, { title }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error('Failed to save title.', error);
        }
    };

    const handleDeleteItem = useCallback(async () => {
        if (!deleteTarget) return;
        try {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.delete(`${API_URL}/${deleteTarget.id}`, { headers: { Authorization: `Bearer ${token}` } });
            const deleteRecursively = (items, id) => {
                return items.filter(item => {
                    if (item.id === id) return false;
                    if (item.children) item.children = deleteRecursively(item.children, id);
                    return true;
                });
            };
            setGuideContent(prevContent => deleteRecursively(prevContent, deleteTarget.id));
        } catch (error) {
            console.error('Failed to delete content.', error);
        } finally {
            setDeleteTarget(null);
        }
    }, [deleteTarget]);

    const handleAddItem = useCallback(async (parentId, type) => {
        const newItemData = {
            parent_id: parentId,
            content_type: type,
            title: type === 'dropdown' ? 'New Title' : null,
            content_body: type === 'text' ? '' : null,
            order_index: 0
        };
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.post(API_URL, newItemData, { headers: { Authorization: `Bearer ${token}` } });
            setNewlyCreatedId(res.data.id);
            fetchGuide();
        } catch (error) {
            console.error('Failed to add new content.', error);
        }
    }, [fetchGuide]);

    const buildTree = (list) => {
        const map = {};
        const roots = [];
        list.forEach((item, i) => {
            map[item.id] = i;
            item.children = [];
        });
        list.forEach(item => {
            if (item.parent_id !== null && list[map[item.parent_id]]) {
                list[map[item.parent_id]].children.push(item);
            } else {
                roots.push(item);
            }
        });
        return roots;
    };

    const nestedContent = buildTree(guideContent);

    if (loading) return <p className="p-10">Բեռնվում է...</p>;

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Խմբագրել Ուսուցիչների Ուղեցույցը</h1>
            <div className="bg-gray-50 p-8 rounded-xl shadow-inner">
                {nestedContent.map(item => (
                    <EditableGuideItem key={item.id} item={item} onUpdate={handleUpdateItem} onDelete={setDeleteTarget} onAddChild={handleAddItem} newlyCreatedId={newlyCreatedId} onSaveTitle={handleSaveTitle} />
                ))}
                <div className="mt-6 border-t pt-4">
                    <button onClick={() => handleAddItem(null, 'dropdown')} className="text-sm bg-indigo-600 text-white px-3 py-2 rounded">+ Ավելացնել գլխավոր բաժին</button>
                </div>
            </div>
            {deleteTarget && (
                <ConfirmationModal 
                    message={`Վստա՞հ եք, որ ուզում եք ջնջել "${deleteTarget.title || 'Text Block'}" բաժինը և դրա ամբողջ պարունակությունը։`}
                    onConfirm={handleDeleteItem}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

export default AdminTeacherGuidePage;
