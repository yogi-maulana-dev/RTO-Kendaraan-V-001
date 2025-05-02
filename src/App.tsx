import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Users from './components/Users/Users';
import SIMManagement from "./components/SIM/SIMManagement";
import Navbar from './components/Navbar';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ResetPasswordNew from './components/ResetPasswordNew';
import Register from './components/Register';
import VerifyToken from './components/VerifyToken';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          {/* Tambahkan 2 rute baru ini */}
          <Route path="/verify-token" element={<VerifyToken />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-new" element={<ResetPasswordNew />} />
          // Di dalam komponen App
          <Route path="/register" element={<Register />} />


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sim-management"
            element={
              <ProtectedRoute>
                <SIMManagement />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
