// /frontend/src/pages/AuthenticationPage.jsx

import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';


const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const AuthenticationPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 py-4 text-center font-semibold transition-colors duration-300 ${
              activeTab === "login"
                ? "text-lime-600 border-b-2 border-lime-600"
                : "text-gray-500 hover:text-lime-500"
            }`}
          >
            Մուտք
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`w-1/2 py-4 text-center font-semibold transition-colors duration-300 ${
              activeTab === "register"
                ? "text-lime-600 border-b-2 border-lime-600"
                : "text-gray-500 hover:text-lime-500"
            }`}
          >
            Գրանցում
          </button>
        </div>
        {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
};

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [userIdFor2fa, setUserIdFor2fa] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (token) => {
    const user = jwtDecode(token);
    login(token);

    if (user.role === "admin" || user.role === "superadmin") {
      navigate("/admin");
    } else {
      navigate("/learn");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_URL}/login`, formData);
      if (res.data.twoFactorRequired) {
        setUserIdFor2fa(res.data.userId);
        setIs2faModalOpen(true);
      } else {
        handleLoginSuccess(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Մուտքի տվյալները սխալ են։");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Էլ. փոստ / Հեռախոս
          </label>
          <input
            type="text"
            name="identifier"
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Գաղտնաբառ
          </label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-lime-500 focus:border-lime-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
        >
          Մուտք
        </button>
      </form>
      {is2faModalOpen && (
        <Login2faModal
          userId={userIdFor2fa}
          onSuccess={handleLoginSuccess}
          onClose={() => setIs2faModalOpen(false)}
        />
      )}
    </>
  );
};

const Login2faModal = ({ userId, onSuccess, onClose }) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_URL}/login/2fa/verify`, { userId, token });
      onSuccess(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Հաստատեք ձեր մուտքը</h2>
        <p className="text-gray-600 mb-6">
          Մուտքագրեք ձեր Authenticator հավելվածի 6-նիշանոց կոդը։
        </p>
        {error && (
          <p className="p-2 rounded-md mb-4 bg-red-100 text-red-800">{error}</p>
        )}
        <form onSubmit={handleVerify}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456"
            maxLength="6"
            className="w-full p-2 text-center text-2xl tracking-widest border rounded-md mb-4"
          />
          <button
            type="submit"
            className="w-full px-5 py-2 bg-green-600 text-white font-semibold rounded-lg"
          >
            Հաստատել
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:underline"
          >
            Չեղարկել
          </button>
        </form>
      </div>
    </div>
  );
};

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",
    school_name: "",
    role: "student",
    grade: "2",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, phone: numericValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
        setError("Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։");
        return;
    }

    const submissionData = {
      ...formData,
      phone: `+374${formData.phone}`,
      grade: formData.role === "student" ? formData.grade : null,
    };

    try {
      await axios.post(`${API_URL}/register`, submissionData);
      setSuccess("Գրանցումը հաջողվեց։ Խնդրում ենք մուտք գործել։");
        setFormData({ name: "", email: "", password: "", phone: "", gender: "male", school_name: "", role: "student", grade: "2" });
        setPrivacyAccepted(false); // Reset checkbox
    } catch (err) {
      setError(err.response?.data?.message || "Գրանցման սխալ։ Խնդրում ենք փորձել կրկին։");
    }
  };

  const gradeOptions = Array.from({ length: 11 }, (_, i) => i + 2);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-500 text-sm text-center bg-green-100 p-2 rounded-md">
          {success}
        </p>
      )}

      <input name="name" placeholder="Անուն" onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500"/>
      <input name="email" type="email" placeholder="Էլ. փոստ" onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500"/>
      <input name="password" type="password" placeholder="Գաղտնաբառ" onChange={handleChange} required minLength="8" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500"/>
      
      {/* Phone Input with Flag */}
      <div>
          <label className="block text-sm font-medium text-gray-700">Հեռախոս</label>
          <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  🇦🇲 +374
              </span>
              <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} required className="flex-1 block w-full rounded-none rounded-r-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-lime-500 focus:border-lime-500" placeholder="XX XXXXXX"/>
          </div>
      </div>

      <input name="school_name" placeholder="Դպրոցի անվանումը" onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500"/>

      <div className="flex flex-col sm:flex-row gap-4">
        <select name="gender" onChange={handleChange} value={formData.gender} className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500">
          <option value="male">Արական</option>
          <option value="female">Իգական</option>
        </select>
        <select name="role" onChange={handleChange} value={formData.role} className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500">
          <option value="student">Աշակերտ</option>
          <option value="teacher">Ուսուցիչ</option>
          <option value="parent">Ծնող</option>
        </select>
      </div>

      {formData.role === "student" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Դասարան</label>
          <select name="grade" onChange={handleChange} value={formData.grade} required className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500">
            {gradeOptions.map((grade) => (<option key={grade} value={grade}>{grade}</option>))}
          </select>
        </div>
      )}
<div className="flex items-center gap-2">
        <input
            type="checkbox"
            id="privacy"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            className="h-4 w-4 rounded"
            required
        />
        <label htmlFor="privacy" className="text-sm text-gray-600">
            Ես կարդացել եմ և համաձայն եմ{" "}
            <a 
                href={`${import.meta.env.VITE_API_URL}/static/PrivacyPolicy.pdf`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-lime-600 hover:underline"
            >
                Գաղտնիության քաղաքականությանը
            </a>.
        </label>
      </div>
      <button
        type="submit"
        disabled={!privacyAccepted} // Button is disabled until checkbox is checked
        className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:bg-gray-400"
      >
        Գրանցվել
      </button>
    </form>
  );
};

export default AuthenticationPage;
