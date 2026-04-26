// src/App.jsx
// Main application router — defines all routes and layout

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Animals from './pages/Animals';
import AddAnimal from './pages/AddAnimal';
import EditAnimal from './pages/EditAnimal';
import AnimalDetail from './pages/AnimalDetail';
import Adoptions from './pages/Adoptions';
import Blockchain from './pages/Blockchain';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2530',
              color: '#e6edf3',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#00d4aa', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ff4757', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public Routes — no auth needed */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes — require login */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/**
 * Layout wrapper for authenticated pages
 * Includes Navbar on top of all protected content
 */
function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/animals" element={<Animals />} />
        {/* Staff/Admin only — add/edit animal */}
        <Route
          path="/animals/add"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <AddAnimal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/animals/edit/:id"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <EditAnimal />
            </ProtectedRoute>
          }
        />

        <Route path="/animals/:id" element={<AnimalDetail />} />

        <Route path="/adoptions" element={<Adoptions />} />

        {/* Admin/Staff only — blockchain ledger */}
        <Route
          path="/blockchain"
          element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <Blockchain />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
