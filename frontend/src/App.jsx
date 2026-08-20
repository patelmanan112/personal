import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Gallery from './gallery/pages/Gallery.jsx';
import Registration from './pages/Registration.jsx';
import RegistrationSuccess from './pages/RegistrationSuccess.jsx';
import VerifyID from './pages/VerifyID.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminRegistrationDetails from './pages/AdminRegistrationDetails.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Gallery (Primary Landing Page) */}
        <Route path="/" element={<Gallery />} />

        {/* Member Registration */}
        <Route path="/register" element={<Registration />} />
        <Route path="/registration" element={<Navigate to="/register" replace />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/id/:uniqueId" element={<VerifyID />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registration/:uniqueId"
          element={
            <ProtectedRoute>
              <AdminRegistrationDetails />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-black text-ualg-navy mb-4">404</h1>
                <p className="text-gray-500 mb-6">Page not found.</p>
                <a href="/" className="btn-primary inline-block">Go to Gallery</a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
