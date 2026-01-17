import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Teacher/Dashboard';
import CreateActivity from './components/Teacher/CreateActivity';
import ActivityView from './components/Teacher/ActivityView';
import JoinActivity from './components/Student/JoinActivity';
import FeedbackPanel from './components/Student/FeedbackPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/join" element={<JoinActivity />} />
            <Route path="/feedback/:activityId" element={<FeedbackPanel />} />

            {/* Protected Routes (Teacher) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="teacher">
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-activity"
              element={
                <ProtectedRoute role="teacher">
                  <MainLayout>
                    <CreateActivity />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/activity/:id"
              element={
                <ProtectedRoute role="teacher">
                  <MainLayout>
                    <ActivityView />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/join" replace />} />
            <Route path="*" element={<Navigate to="/join" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
