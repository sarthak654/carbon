import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { ArrowRight, Gift, Tag, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Marketplace = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const handleRedeem = async (item) => {
    if (!user) {
      toast.error('Please login to redeem items');
      return;
    }

    if (userCredits < item.credit_cost) {
      toast.error('Insufficient credits');
      return;
    }

    try {
      const { error } = await supabase.rpc('redeem_item', {
        item_id: item.id,
        user_id: user.id,
        credits_cost: item.credit_cost
      });

      if (error) throw error;

      toast.success('Item redeemed successfully!');
      fetchUserCredits(); // Refresh user credits
    } catch (err) {
      console.error('Error redeeming item:', err);
      toast.error('Failed to redeem item');
    }
  };

  const marketplaceItems = [
    // Merchandise
    {
      id: 1,
      name: "Eco-Friendly T-Shirt",
      description: "100% organic cotton t-shirt with our logo",
      credit_cost: 500,
      category: "merchandise",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format",
      stock: 50
    },
    {
      id: 2,
      name: "Reusable Water Bottle",
      description: "Stainless steel bottle with carbon footprint tracker",
      credit_cost: 300,
      category: "merchandise",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format",
      stock: 100
    },
    {
      id: 3,
      name: "Sustainable Backpack",
      description: "Made from recycled materials",
      credit_cost: 800,
      category: "merchandise",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format",
      stock: 30
    },
    // Vouchers
    {
      id: 4,
      name: "20% Off at EcoStore",
      description: "Valid for all eco-friendly products",
      credit_cost: 400,
      category: "voucher",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&auto=format",
      expiry: "2024-12-31"
    },
    {
      id: 5,
      name: "15% Off Electric Car Charging",
      description: "Valid at all partner charging stations",
      credit_cost: 600,
      category: "voucher",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&auto=format",
      expiry: "2024-12-31"
    },
    {
      id: 6,
      name: "30% Off Solar Panel Installation",
      description: "Partner: SolarTech Solutions",
      credit_cost: 1000,
      category: "voucher",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&auto=format",
      expiry: "2024-12-31"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">Loading Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Marketplace</h1>
          <p className="text-green-600 dark:text-green-400 text-xl mt-2">
            Your Credits: {userCredits || 150}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('merchandise')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedCategory === 'merchandise'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            <ShoppingBag className="inline-block mr-2" size={16} />
            Merchandise
          </button>
          <button
            onClick={() => setSelectedCategory('voucher')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedCategory === 'voucher'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            <Tag className="inline-block mr-2" size={16} />
            Vouchers
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceItems
          .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
          .map((item) => (
            <motion.div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {item.category}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    {item.credit_cost} Credits
                  </p>
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={userCredits < item.credit_cost}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      userCredits >= item.credit_cost
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                    <ArrowRight size={16} />
                  </button>
                </div>
                {item.category === 'merchandise' && (
                  <p className="text-sm text-gray-500 mt-2">Stock: {item.stock} left</p>
                )}
                {item.category === 'voucher' && (
                  <p className="text-sm text-gray-500 mt-2">Expires: {item.expiry}</p>
                )}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default Marketplace;
