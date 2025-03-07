import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  TrendingUp, 
  Award, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const actionVariants = {
  hidden: { 
    opacity: 0,
    x: -20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchUserData();
    fetchRecentActions();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, carbon_credits, total_co2_saved, is_premium')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserStats(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Could not load user data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActions = async () => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('id, action_type, created_at, co2_saved, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActions(data || []);
    } catch (err) {
      console.error('Error fetching recent actions:', err);
      setError('Could not load recent actions.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
          }
        }}
        className="text-4xl font-bold text-gray-800 dark:text-white mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
      >
        Welcome back, {userStats?.full_name || 'Eco Warrior'}!
      </motion.h1>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 17 }
          }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Carbon Credits</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {userStats?.carbon_credits ?? 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 17 }
          }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CO₂ Saved</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {userStats?.total_co2_saved ?? 0} kg
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ 
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 17 }
          }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {userStats?.is_premium ? 'Premium' : 'Standard'}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.4
          }
        }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Recent Actions
        </h2>

        {recentActions.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No recent actions recorded.</p>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {recentActions.map((action) => (
              <motion.div
                key={action.id}
                variants={actionVariants}
                whileHover={{ 
                  scale: 1.01,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-gray-400 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {action.action_type}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(action.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-4">
                    {action.co2_saved} kg CO₂
                  </p>
                  {action.status === 'approved' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : action.status === 'rejected' ? (
                    <XCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
