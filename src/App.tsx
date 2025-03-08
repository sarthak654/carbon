import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SubmitActions from './pages/SubmitActions';
import Marketplace from './pages/Marketplace';
import Learn from './pages/Learn';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <Router>
      <AuthProvider> 
        <ThemeProvider>
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/submit" element={<SubmitActions />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </div>
            <ChatBot />
          </div>
          <Toaster position="top-right" />
        </ThemeProvider>
      </AuthProvider> 
    </Router>
  );
}

export default App;