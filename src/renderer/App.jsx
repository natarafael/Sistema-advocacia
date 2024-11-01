import React from 'react';
import {
  MemoryRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import theme from './utils/Theme';
import MenuAppBar from './components/AppBar';
import Login from './pages/Login';
import Home from './pages/Home';
import ClientForm from './pages/ClientRegistration';
import ClientInformation from './pages/ClientInformation';
import { AuthProvider, useAuth } from './services/Auth';
import './App.css';
import ProfilePage from './pages/ProfilePage';
import Signup from './pages/SignUp';
import ToastContainer from './components/ToastContainer';
import Calendar from './pages/Calendar';
import Settings from './pages/SettingsPage';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <>
      <MenuAppBar />
      <main className="flex-1 overflow-y-auto pt-28">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clientRegistration" element={<ClientForm />} />
          <Route path="/clientRegistration/:id" element={<ClientForm />} />
          <Route
            path="/clientInformation/:id"
            element={<ClientInformation />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </main>
    </>
  );
};

const AppRoutes = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AppContent />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
