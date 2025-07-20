// /frontend/src/pages/AdminMeetupEditorPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/meetups`;

const AdminMeetupEditorPage = () => {
    const { meetupIdString } = useParams();
    const navigate = useNavigate();
    const isNew = !meetupIdString;
    const [meetupId, setMeetupId] = useState(null); // To store the numeric ID for updates

    const [meetupData, setMeetupData] = useState({
        title: '',
        meetup_id_string: '',
        description: '',
        image_url: '',
        meetup_datetime: '',
        join_url: '',
        video_url: '',
        is_active: true
    });
    const [speakers, setSpeakers] = useState([{ name: '', title: '' }]);

    // Fetch existing meetup data if in edit mode
    useEffect(() => {
        if (!isNew) {
            const fetchMeetup = async () => {
                try {
                    const res = await axios.get(`${API_URL}/${meetupIdString}`);
                    const { speakers, ...data } = res.data;
                    
                    // Format datetime for the input field
                    if (data.meetup_datetime) {
                        const dt = new Date(data.meetup_datetime);
                        // Adjust for timezone offset before formatting
                        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                        data.meetup_datetime = dt.toISOString().slice(0, 16);
                    }

                    setMeetupData(data);
                    setSpeakers(speakers.length > 0 ? speakers : [{ name: '', title: '' }]);
                    setMeetupId(data.id);
                } catch (error) {
                    alert('Could not load meetup data.');
                }
            };
            fetchMeetup();
        }
    }, [meetupIdString, isNew]);


    const handleMeetupChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMeetupData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSpeakerChange = (index, e) => {
        const { name, value } = e.target;
        const newSpeakers = [...speakers];
        newSpeakers[index][name] = value;
        setSpeakers(newSpeakers);
    };

    const addSpeaker = () => {
        setSpeakers([...speakers, { name: '', title: '' }]);
    };
    
    const removeSpeaker = (index) => {
        setSpeakers(speakers.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalSpeakers = speakers.filter(s => s.name.trim() !== '');
            if (isNew) {
                await axios.post(API_URL, { meetupData, speakers: finalSpeakers });
                alert('Meetup-ը հաջողությամբ ստեղծվեց։');
            } else {
                await axios.put(`${API_URL}/${meetupId}`, { meetupData, speakers: finalSpeakers });
                alert('Meetup-ը հաջողությամբ թարմացվեց։');
            }
            navigate('/admin/meetups');
        } catch (error) {
            alert(error.response?.data?.message || 'Սխալ՝ պահպանելիս։');
        }
    };

    return (
        <div className="p-10">
            <Link to="/admin/meetups" className="text-indigo-600 hover:underline mb-6 block">&larr; Վերադառնալ բոլոր meetup-ներին</Link>
            <h1 className="text-3xl font-bold mb-6">{isNew ? 'Ստեղծել նոր Meetup' : 'Խմբագրել Meetup'}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                {/* Meetup Details */}
                <input name="title" value={meetupData.title} onChange={handleMeetupChange} placeholder="Վերնագիր" className="w-full p-2 border rounded"/>
                <input name="meetup_id_string" value={meetupData.meetup_id_string} onChange={handleMeetupChange} placeholder="Meetup ID (for URL)" className="w-full p-2 border rounded"/>
                <textarea name="description" value={meetupData.description} onChange={handleMeetupChange} placeholder="Նկարագրություն" className="w-full p-2 border rounded" rows="5"/>
                <input name="image_url" value={meetupData.image_url} onChange={handleMeetupChange} placeholder="Նկարի հղում (URL)" className="w-full p-2 border rounded"/>
                <input name="meetup_datetime" type="datetime-local" value={meetupData.meetup_datetime} onChange={handleMeetupChange} className="w-full p-2 border rounded"/>
                <input name="join_url" value={meetupData.join_url} onChange={handleMeetupChange} placeholder="Join Link (Zoom, Meet)" className="w-full p-2 border rounded"/>
                <input name="video_url" value={meetupData.video_url} onChange={handleMeetupChange} placeholder="YouTube Video ID (after event)" className="w-full p-2 border rounded"/>
                
                {/* Speakers */}
                <h2 className="text-xl font-bold border-t pt-6">Բանախոսներ</h2>
                {speakers.map((speaker, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <input name="name" value={speaker.name} onChange={(e) => handleSpeakerChange(index, e)} placeholder="Բանախոսի անունը" className="w-1/2 p-2 border rounded"/>
                        <input name="title" value={speaker.title} onChange={(e) => handleSpeakerChange(index, e)} placeholder="Բանախոսի պաշտոնը" className="w-1/2 p-2 border rounded"/>
                        <button type="button" onClick={() => removeSpeaker(index)} className="text-red-500 font-bold">X</button>
                    </div>
                ))}
                <button type="button" onClick={addSpeaker} className="text-indigo-600">+ Ավելացնել բանախոս</button>

                <div className="flex justify-between items-center border-t pt-6">
                    <label className="flex items-center gap-3"><input type="checkbox" name="is_active" checked={meetupData.is_active} onChange={handleMeetupChange} className="h-5 w-5"/> Ակտիվացնել</label>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg">Պահպանել</button>
                </div>
            </form>
        </div>
    );
};

export default AdminMeetupEditorPage;