// /frontend/src/App.jsx

import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import TeacherGuidePage from "./pages/TeacherGuidePage";
import AdminCoursesListPage from "./pages/AdminCoursesListPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminCourseEditorPage from "./pages/AdminCourseEditorPage";
import AdminMeetupsListPage from "./pages/AdminMeetupsListPage";
import AdminMeetupEditorPage from "./pages/AdminMeetupEditorPage";
import AdminTeacherGuidePage from "./pages/AdminTeacherGuidePage";

// General protected route: checks if user is logged in
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // If not logged in, redirect to auth page, remembering where they came from
    return <Navigate to="/authentication" state={{ from: location }} replace />;
  }
  return children;
};

// Admin-specific protected route: checks if user has 'admin' or 'superadmin' role
const AdminProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
        // If logged in but not an admin of any kind, redirect to learn page
        return <Navigate to="/learn" replace />;
    }

    return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen text-gray-800">
          <Routes>
            <Route path="/authentication" element={<AuthenticationPage />} />
            
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

            {/* --- Admin Routes now have two layers of protection --- */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                </ProtectedRoute>
              }
            >
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
