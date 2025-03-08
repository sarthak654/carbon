import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { User, Award, Clock, Settings, Leaf, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

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

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: ''
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchProfile();
    fetchTransactions();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('full_name, username, carbon_credits, total_co2_saved, is_premium')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        username: data.username || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, created_at, credit_amount, transaction_type, marketplace_items(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleUpgradeToPremium = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_premium: true })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Upgraded to premium successfully');
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      toast.error('Failed to upgrade to premium');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">Loading Profile...</p>
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
        className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent text-center"
      >
        Your Profile
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {profile?.full_name || 'Avi'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  @{profile?.username || 'user'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setEditing(!editing)}
              className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <Settings className="h-5 w-5" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>

          {editing ? (
            <motion.form 
              variants={cardVariants}
              onSubmit={handleUpdateProfile} 
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-4 bg-gray-100 dark:bg-gray-700 rounded-xl 
                  border-2 border-gray-300 dark:border-gray-600 
                  focus:ring-2 focus:ring-green-500 focus:border-transparent 
                  transition-all duration-200 text-gray-800 dark:text-white 
                  placeholder-gray-500 hover:border-gray-400"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="submit"
                className="w-full p-4 bg-gradient-to-r from-green-600 to-green-700 text-white 
                rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Save Changes
              </motion.button>
            </motion.form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                variants={cardVariants}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Carbon Credits</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profile?.carbon_credits || 0}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CO₂ Saved</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profile?.total_co2_saved || 0} kg
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {profile?.is_premium ? 'Premium' : 'Standard'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {!profile?.is_premium && !editing && (
            <motion.button
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              onClick={handleUpgradeToPremium}
              className="w-full mt-8 p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Award className="h-5 w-5" />
              Upgrade to Premium
            </motion.button>
          )}
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Transaction History
          </h2>
          
          {transactions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No transactions recorded.</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.01 }}
                  className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {transaction.marketplace_items?.name || 'Credit Transaction'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {transaction.credit_amount} Credits
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
