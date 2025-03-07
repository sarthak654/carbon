import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  ShoppingBag,
  BookOpen,
  User,
  Settings,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { signOut } from '../api/supabase';

const Sidebar = () => {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.email === 'admin@carbon.com';

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/submit', icon: Upload, label: 'Submit Actions' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { path: '/learn', icon: BookOpen, label: 'Learn' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (isAdmin) {
    menuItems.push({ path: '/admin', icon: Settings, label: 'Admin Panel' });
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            EcoCredits
          </h1>
        </div>

        <nav className="flex-1 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={`relative flex items-center px-4 py-3 my-1 rounded-xl transition-colors duration-200
                    ${isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                    }
                  `}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 mr-3 z-10 transition-colors duration-200
                    ${isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400'
                    }
                  `} />
                  <span className="relative z-10 font-medium">
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleDarkMode}
            className="flex items-center px-4 py-3 w-full text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 mr-3" />
            ) : (
              <Moon className="w-5 h-5 mr-3" />
            )}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center px-4 py-3 mt-2 w-full text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;