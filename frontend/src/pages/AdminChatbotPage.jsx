// /frontend/src/pages/AdminChatbotPage.jsx

import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/chatbot`;

// Reusable Modal for editing/creating nodes
const EditModal = ({ node, onSave, onCancel }) => {
    const [content, setContent] = useState(node?.content || '');
    const isQuestion = node?.type === 'question';

    const handleSave = () => {
        onSave({ ...node, content });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{node?.id ? 'Խմբագրել' : 'Ավելացնել'} {isQuestion ? 'հարց' : 'պատասխան'}</h2>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="4"
                    placeholder={isQuestion ? 'Սպարկիի հարցը...' : 'Օգտատիրոջ պատասխանի տարբերակը...'}
                />
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Չեղարկել</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Պահպանել</button>
                </div>
            </div>
        </div>
    );
};

// Recursive component to render the editable tree
const EditableNode = ({ node, onEdit, onDelete, onAddChild }) => (
    <div className="my-2 p-3 rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
            <p className={`font-medium ${node.node_type === 'question' ? 'text-indigo-700' : 'text-gray-700'}`}>
                {node.content}
            </p>
            <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onEdit(node)} className="text-sm text-blue-600 font-semibold">Edit</button>
                <button onClick={() => onDelete(node)} className="text-sm text-red-600 font-semibold">Delete</button>
            </div>
        </div>
        {node.node_type === 'question' && (
            <div className="pl-6 border-l-2 mt-2">
                {node.children && node.children.map(child => (
                    <EditableNode key={child.id} node={child} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />
                ))}
                <button onClick={() => onAddChild(node.id, 'answer')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-2">+ Add Answer Option</button>
            </div>
        )}
    </div>
);

const AdminChatbotPage = () => {
    const [tree, setTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingNode, setEditingNode] = useState(null); // Node being edited/created
    const { user } = useContext(AuthContext);

    const fetchTree = useCallback(async () => {
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            setTree(res.data);
        } catch (error) {
            console.error("Failed to fetch chatbot tree", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if(user) fetchTree();
    }, [user, fetchTree]);

    const handleSaveNode = async (node) => {
        const token = localStorage.getItem('cyberstorm_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        if (node.id) { // Update existing node
            await axios.put(`${API_URL}/${node.id}`, { content: node.content }, config);
        } else { // Create new node
            await axios.post(API_URL, node, config);
        }
        setEditingNode(null);
        fetchTree();
    };

    const handleDeleteNode = async (node) => {
        if (window.confirm(`Are you sure you want to delete this ${node.node_type}?`)) {
            const token = localStorage.getItem('cyberstorm_token');
            await axios.delete(`${API_URL}/${node.id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchTree();
        }
    };

    const handleAddChild = (parentId, type) => {
        setEditingNode({ parent_id: parentId, node_type: type, content: '', order_index: 0 });
    };

    if (loading) return <p className="p-10">Բեռնվում է...</p>;

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">"Ask Sparky" Chatbot Editor</h1>
            <div className="bg-gray-50 p-8 rounded-xl shadow-inner">
                {tree.map(node => (
                    <EditableNode key={node.id} node={node} onEdit={setEditingNode} onDelete={handleDeleteNode} onAddChild={handleAddChild} />
                ))}
                <div className="mt-6 border-t pt-4">
                    <button onClick={() => handleAddChild(null, 'question')} className="text-sm bg-indigo-600 text-white px-3 py-2 rounded">
                        + Ավելացնել նոր զրույցի սկիզբ
                    </button>
                </div>
            </div>
            {editingNode && <EditModal node={editingNode} onSave={handleSaveNode} onCancel={() => setEditingNode(null)} />}
        </div>
    );
};

export default AdminChatbotPage;
