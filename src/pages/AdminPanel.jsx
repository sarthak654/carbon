import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuth();
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email !== 'admin@carbon.com') {
      window.location.href = '/';
      return;
    }
    fetchPendingVerifications();
  }, [user]);

  const fetchPendingVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .select(`
          *,
          users (
            email,
            full_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingVerifications(data);
    } catch (error) {
      toast.error('Error fetching verifications');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (actionId, approved, userId, co2_saved) => {
    try {
      // Update action status
      const { error: actionError } = await supabase
        .from('actions')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', actionId);

      if (actionError) throw actionError;

      if (approved) {
        // Calculate credits (1 credit per kg of CO2 saved)
        const creditsEarned = parseFloat(co2_saved);

        // Update user's carbon credits
        const { error: userError } = await supabase.rpc('add_carbon_credits', {
          user_id: userId,
          amount: creditsEarned
        });

        if (userError) throw userError;
      }

      toast.success(`Action ${approved ? 'approved' : 'rejected'} successfully`);
      fetchPendingVerifications();
    } catch (error) {
      toast.error('Error processing verification');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Admin Panel
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Pending Verifications
        </h2>

        {pendingVerifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No pending verifications
          </p>
        ) : (
          <div className="space-y-4">
            {pendingVerifications.map((verification) => (
              <div
                key={verification.id}
                className="border dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {verification.action_type}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted by: {verification.users.full_name || verification.users.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      CO₂ Saved: {verification.co2_saved} kg
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerification(verification.id, true, verification.user_id, verification.co2_saved)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-full dark:hover:bg-green-900"
                    >
                      <CheckCircle className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleVerification(verification.id, false, verification.user_id, verification.co2_saved)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full dark:hover:bg-red-900"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {verification.evidence_url && (
                  <div className="mt-2">
                    <img
                      src={verification.evidence_url}
                      alt="Evidence"
                      className="max-w-md rounded-lg shadow-sm"
                    />
                  </div>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>{verification.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;