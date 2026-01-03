// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Auth from './components/Auth';
import Home from './components/Home';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import Connect from './components/Connect';
import Chat from './components/Chat';
import Requests from './components/Requests';
import Dashboard from './components/Dashboard';
import Connections from './components/Connections'; // ← Added (assuming it's a page for connections list)
import Admin from './components/Admin';
import AdminLogin from './components/AdminLogin';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Show loader while checking auth state
  if (loadingAuth) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '1.2rem',
        color: '#333'
      }}>
        Loading...
      </div>
    );
  }

  // Not logged in → only show Auth page on any route
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  // Logged in → protected routes
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Main app routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/edit-profile/:id" element={<EditProfile />} />
      <Route path="/connect/:userId" element={<Connect />} />
      <Route path="/chat/:userId" element={<Chat />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/connections" element={<Connections />} /> {/* ← New route for Connections page */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Fallback: redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default AppWrapper;