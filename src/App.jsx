import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

/* استيراد الصفحات */
import LanguageSelect from './pages/LanguageSelect';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AuthCallback from './pages/auth/AuthCallback';
import RoleSelection from './pages/auth/RoleSelection';
import Home from './pages/Home';
import Explore from './pages/Explore';
import MyPlan from './pages/MyPlan';
import Budget from './pages/Budget';
import Chat from './pages/Chat';
import ActivityDetails from './pages/ActivityDetails';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import FounderDashboard from './pages/founder/FounderDashboard';
import FounderPosts from './pages/founder/FounderPosts';
import FounderHome from './pages/founder/FounderHome';
import FounderPostDetails from './pages/founder/FounderPostDetails';

/* استيراد المكونات */
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

/* Layout الرئيسي يحتوي على Sidebar و Navbar */
const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <div className="app-content">
          <div key={location.pathname} className="page-transition">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/* تعريف كل المسارات */
const App = () => {
  return (
    <Router>
      <Routes>
        {/* المسارات العامة */}
        <Route path="/" element={<LanguageSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* ---------------- User Routes (Protected) ---------------- */}
        <Route path="/user/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
        <Route path="/user/explore" element={<ProtectedRoute><Layout><Explore /></Layout></ProtectedRoute>} />
        <Route path="/user/plan" element={<ProtectedRoute><Layout><MyPlan /></Layout></ProtectedRoute>} />
        <Route path="/user/budget" element={<ProtectedRoute><Layout><Budget /></Layout></ProtectedRoute>} />
        <Route path="/user/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
        <Route path="/user/activity/:id" element={<ProtectedRoute><Layout><ActivityDetails /></Layout></ProtectedRoute>} />
        <Route path="/user/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

        {/* ---------------- Founder Routes (Protected) ---------------- */}
        <Route path="/founder/dashboard" element={<ProtectedRoute><Layout><FounderDashboard /></Layout></ProtectedRoute>} />
        <Route path="/founder/home" element={<ProtectedRoute><Layout><FounderHome /></Layout></ProtectedRoute>} />
        <Route path="/founder/posts" element={<ProtectedRoute><Layout><FounderPosts /></Layout></ProtectedRoute>} />
        <Route path="/founder/post/:id" element={<ProtectedRoute><Layout><FounderPostDetails /></Layout></ProtectedRoute>} />
        <Route path="/founder/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

        {/* BUG-001: Catch-all — 404 Not Found Page */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
};

export default App;
