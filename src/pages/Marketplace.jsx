import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { ArrowRight, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Marketplace = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchMarketplaceItems();
    fetchUserCredits();
  }, [user]);

  const fetchMarketplaceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from('users')
        .select('carbon_credits')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserCredits(data?.carbon_credits || 0);
    } catch (err) {
      console.error('Error fetching user credits:', err);
      setError('Could not fetch user credits');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">Loading Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Marketplace</h1>
      <p className="text-green-600 dark:text-green-400">Your Credits: {userCredits}</p>
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">No items available.</p>
        ) : (
          items.map((item) => (
            <motion.div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold">{item.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              <p className="text-green-600 dark:text-green-400 font-semibold">{item.credit_cost} Credits</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Marketplace;
