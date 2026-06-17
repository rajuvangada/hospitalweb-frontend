import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MedicineDetails from './pages/MedicineDetails';

// Patient Panel Pages
import PatientDashboard from './pages/PatientDashboard';
import PatientProfile from './pages/PatientProfile';
import BookAppointment from './pages/BookAppointment';
import AppointmentHistory from './pages/AppointmentHistory';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';

// Doctor Panel Pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatients from './pages/DoctorPatients';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorAppointments from './pages/DoctorAppointments';
import WritePrescription from './pages/WritePrescription';

// Admin Panel Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminReports from './pages/AdminReports';
import AdminRevenue from './pages/AdminRevenue';

// Route Guards & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { AuthContext } from './context/AuthAppContext';

function App() {
  const { user } = useContext(AuthContext);

  const getDashboardRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? getDashboardRedirect() : <Login />} />
          <Route path="/register" element={user ? getDashboardRedirect() : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/medicine/:id" element={<MedicineDetails />} />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute roles={['patient']}>
                <DashboardLayout>
                  <PatientDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute roles={['patient']}>
                <DashboardLayout>
                  <PatientProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/book"
            element={
              <ProtectedRoute roles={['patient']}>
                <DashboardLayout>
                  <BookAppointment />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute roles={['patient']}>
                <DashboardLayout>
                  <AppointmentHistory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/records"
            element={
              <ProtectedRoute roles={['patient']}>
                <DashboardLayout>
                  <MedicalRecords />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute roles={['patient']}>
                <DashboardLayout>
                  <Prescriptions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <DoctorDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <DoctorPatients />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <DoctorSchedule />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <DoctorAppointments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/write-prescription"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <WritePrescription />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDoctors />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminPatients />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/revenue"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminRevenue />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Wildcard Fallback */}
          <Route path="*" element={getDashboardRedirect()} />
        </Routes>
      </div>
      
      {/* Toast notifications container */}
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  );
}

export default App;
