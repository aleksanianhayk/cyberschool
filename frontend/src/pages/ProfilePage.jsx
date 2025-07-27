// /frontend/src/pages/ProfilePage.jsx

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';

const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

const ProfilePage = () => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [is2faModalOpen, setIs2faModalOpen] = useState(false);

    if (!user) {
        return <div className="p-10">Օգտատերը չի գտնվել։</div>;
    }

    const handle2faStatusChange = async () => {
        if (user.is_two_factor_enabled) {
            if (window.confirm('Վստա՞հ եք, որ ուզում եք անջատել 2FA-ն։')) {
                try {
                    const token = localStorage.getItem('cyberstorm_token');
                    await axios.post(`${API_URL}/2fa/disable`, { userId: user.id }, { headers: { Authorization: `Bearer ${token}` } });
                    updateUser({ is_two_factor_enabled: 0 });
                } catch (error) {
                    console.error('Failed to disable 2FA', error);
                }
            }
        } else {
            setIs2faModalOpen(true);
        }
    };

    const on2faEnabled = () => {
        updateUser({ is_two_factor_enabled: 1 });
        setIs2faModalOpen(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Իմ էջը</h1>

            <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
                <div>
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4">Անձնական տվյալներ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoField label="Անուն" value={user.name} />
                        <InfoField label="Էլ. փոստ" value={user.email} />
                        <InfoField label="Հեռախոս" value={user.phone} />
                        <InfoField label="Դպրոց" value={user.school_name} />
                        <InfoField label="Դեր" value={user.role} />
                        {user.grade && <InfoField label="Դասարան" value={user.grade} />}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4">Անվտանգություն</h2>
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <button onClick={() => setIsPasswordModalOpen(true)} className="w-full md:w-auto px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                            Փոխել գաղտնաբառը
                        </button>
                        <div className="flex items-center gap-4">
                             <label className="font-medium">2FA</label>
                             <button onClick={handle2faStatusChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${user.is_two_factor_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${user.is_two_factor_enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                     <button onClick={logout} className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition">
                        Դուրս գալ հաշվից
                    </button>
                </div>
            </div>

            {isPasswordModalOpen && <ChangePasswordModal user={user} onClose={() => setIsPasswordModalOpen(false)} />}
            {is2faModalOpen && <TwoFactorAuthModal user={user} onClose={() => setIs2faModalOpen(false)} onEnabled={on2faEnabled} />}
        </div>
    );
};

const InfoField = ({ label, value }) => (
    <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg text-gray-800">{value || '-'}</p>
    </div>
);

const ChangePasswordModal = ({ user, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            const token = localStorage.getItem('cyberstorm_token');
            const res = await axios.post(`${API_URL}/change-password`, 
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ text: res.data.message, type: 'success' });
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Internal server error', type: 'error' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Փոխել գաղտնաբառը</h2>
                {message.text && <p className={`p-2 rounded-md mb-4 text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Հին գաղտնաբառ" required className="w-full p-2 border rounded-md"/>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Նոր գաղտնաբառ" required className="w-full p-2 border rounded-md"/>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Փակել</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Պահպանել</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TwoFactorAuthModal = ({ user, onClose, onEnabled }) => {
    const [step, setStep] = useState(1);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [token, setToken] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleGenerate = async () => {
        try {
            const authToken = localStorage.getItem('cyberstorm_token');
            const res = await axios.post(`${API_URL}/2fa/generate`, {}, { headers: { Authorization: `Bearer ${authToken}` } });
            setQrCodeUrl(res.data.qrCodeUrl);
            setStep(2);
        } catch (error) {
            setMessage({ text: 'Failed to generate QR code.', type: 'error' });
        }
    };

    const handleVerify = async () => {
        try {
            const authToken = localStorage.getItem('cyberstorm_token');
            const res = await axios.post(`${API_URL}/2fa/verify`, { token }, { headers: { Authorization: `Bearer ${authToken}` } });
            setMessage({ text: res.data.message, type: 'success' });
            setTimeout(() => {
                onEnabled();
            }, 1500);
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Verification failed.', type: 'error' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">Երկգործոն նույնականացում (2FA)</h2>
                <p className="text-gray-600 mb-6">Ավելացրեք անվտանգության լրացուցիչ շերտ ձեր հաշվի համար։</p>
                {message.text && <p className={`p-2 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{message.text}</p>}
                
                {step === 1 && (
                    <button onClick={handleGenerate} className="w-full px-5 py-2 bg-green-600 text-white font-semibold rounded-lg">Ակտիվացնել 2FA</button>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <p>1. Սքանավորեք այս QR կոդը ձեր Authenticator հավելվածով։</p>
                        <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto border p-2"/>
                        <p>2. Մուտքագրեք հավելվածի 6-նիշանոց կոդը՝ հաստատելու համար։</p>
                        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456" maxLength="6" className="w-full p-2 text-center text-2xl tracking-widest border rounded-md"/>
                        <button onClick={handleVerify} className="w-full px-5 py-2 bg-green-600 text-white font-semibold rounded-lg">Հաստատել և ակտիվացնել</button>
                    </div>
                )}
                
                <button type="button" onClick={onClose} className="mt-6 text-sm text-gray-500 hover:underline">Փակել</button>
            </div>
        </div>
    );
};

export default ProfilePage;
