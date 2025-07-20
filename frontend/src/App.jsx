// /frontend/src/App.jsx

import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext.jsx";

// Layouts
import AdminLayout from "./layouts/AdminLayout.jsx";
import UserLayout from "./layouts/UserLayout.jsx";

// Pages
import AuthenticationPage from "./pages/AuthenticationPage";
import LearnPage from "./pages/LearnPage";
import CoursePage from "./pages/CoursePage";
import AskAiPage from "./pages/AskAiPage";
import ProfilePage from "./pages/ProfilePage";
import MeetupsListPage from "./pages/MeetupsListPage";
import MeetupDetailPage from "./pages/MeetupDetailPage";
import TeacherGuidePage from "./pages/TeacherGuidePage"; // New
import AdminCoursesListPage from "./pages/AdminCoursesListPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminCourseEditorPage from "./pages/AdminCourseEditorPage";
import AdminMeetupsListPage from "./pages/AdminMeetupsListPage";
import AdminMeetupEditorPage from "./pages/AdminMeetupEditorPage";
import AdminTeacherGuidePage from "./pages/AdminTeacherGuidePage"; // New

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/authentication" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen text-gray-800">
          <Routes>
            {/* --- Standalone Routes --- */}
            <Route path="/authentication" element={<AuthenticationPage />} />
            
            {/* --- User Routes using the UserLayout --- */}
            <Route path="/" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/learn" replace />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="learn/course/:courseIdString" element={<CoursePage />} />
              <Route path="meetups" element={<MeetupsListPage />} />
              <Route path="meetups/:meetupIdString" element={<MeetupDetailPage />} />
              <Route path="ask-ai" element={<AskAiPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="teacher-guide" element={<TeacherGuidePage />} />
            </Route>

            {/* --- Admin Routes using the AdminLayout --- */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="courses" replace />} />
              <Route path="courses" element={<AdminCoursesListPage />} />
              <Route path="courses/:courseIdString" element={<AdminCourseEditorPage />} />
              <Route path="meetups" element={<AdminMeetupsListPage />} />
              <Route path="meetups/new" element={<AdminMeetupEditorPage />} />
              <Route path="meetups/:meetupIdString" element={<AdminMeetupEditorPage />} />
              <Route path="teacher-guide" element={<AdminTeacherGuidePage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;