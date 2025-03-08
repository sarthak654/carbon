import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../api/supabase';
import { Upload, Loader2, MapPin, Sparkles, Leaf, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Tesseract from 'tesseract.js';

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

const SubmitActions = () => {
  const { user } = useAuth();

  const [actionType, setActionType] = useState('transport');
  const [file, setFile] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [geoLocation, setGeoLocation] = useState(null);
  const [energySavingData, setEnergySavingData] = useState('');
  const [estimatedCredits, setEstimatedCredits] = useState(2.5);
  const [loading, setLoading] = useState(false); // Define the loading state

  const actionTypes = [
    { id: 'transport', label: 'Public Transport', co2: 2.5, icon: <Globe className="text-blue-500" /> },
    { id: 'recycling', label: 'Recycling', co2: 1.8, icon: <Leaf className="text-green-500" /> },
    { id: 'energy', label: 'Energy Saving', co2: 3.0, icon: <Sparkles className="text-yellow-500" /> },
    { id: 'geo_tracking', label: 'Walking / Cycling', co2: 4.0, icon: <MapPin className="text-red-500" /> },
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);

      // Perform OCR immediately after file is selected
      performOCR(selectedFile);
    }
  };

  const performOCR = (imageFile) => {
    setIsProcessing(true);
    Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: (m) => console.log(m),
      }
    )
      .then(async ({ data: { text } }) => {
        // Extract bill number using regex
        const billNoMatch = text.match(/Bill No:?\s*([^\n\r]*)/i);
        const billNumber = billNoMatch ? billNoMatch[1].trim() : 'Bill number not found';
        
        setOcrText(billNumber);

        // Only send to server if a valid bill number was found
        if (billNumber && billNumber !== 'Bill number not found') {
          try {
            const response = await fetch('http://localhost:3000/add-bill', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ billNumber }),
            });

            const data = await response.json();

            if (!response.ok) {
              if (response.status === 409) {
                toast('This bill number has already been recorded', {
                  icon: '⚠️',
                  duration: 4000,
                  style: {
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #F59E0B'
                  }
                });
              } else {
                throw new Error(data.error || 'Failed to save bill number');
              }
            } else {
              toast.success('Bill number saved successfully');
            }
          } catch (error) {
            console.error('Error saving bill number:', error);
            toast.error(error.message || 'Failed to save bill number');
          }
        } else {
          toast.error('No valid bill number found in the image');
        }

        setIsProcessing(false);
      })
      .catch((error) => {
        console.error('OCR error:', error);
        setIsProcessing(false);
        toast.error('Failed to extract bill number');
      });
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success('Location added successfully!');
      },
      () => {
        toast.error('Unable to retrieve location');
      }
    );
  };

  const handleEnergySavingChange = (e) => {
    setEnergySavingData(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file && actionType !== 'geo_tracking' && actionType !== 'energy') {
      toast.error('Please upload evidence');
      return;
    }

    setLoading(true); // Set loading to true when submitting
    try {
      let publicUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('evidence').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      let verificationResult = { success: true };

      // Different verification methods for each action type
      if (actionType === 'transport' && file) {
        verificationResult = await processReceipt(file); // OCR for transport receipts
      } else if (actionType === 'recycling' && preview) {
        verificationResult = await analyzeRecyclingImage(preview); // Image recognition for recycling items
      } else if (actionType === 'energy' && energySavingData) {
        verificationResult = await verifyEnergySaving(energySavingData); // Energy-saving verification
      } else if (actionType === 'geo_tracking' && geoLocation) {
        verificationResult = await validateGeoTracking(geoLocation); // Geo-location based verification
      }

      if (!verificationResult.success) {
        throw new Error('Verification failed');
      }

      const actionTypeData = actionTypes.find(t => t.id === actionType);
      const co2_saved = actionTypeData.co2;

      const { error: actionError } = await supabase.from('actions').insert({
        user_id: user.id,
        action_type: actionType,
        description,
        evidence_url: publicUrl,
        geo_location: geoLocation ? JSON.stringify(geoLocation) : null,
        co2_saved,
        status: 'pending',
      });

      if (actionError) throw actionError;

      toast.success('Action submitted successfully!');
      setFile(null);
      setPreview(null);
      setDescription('');
      setGeoLocation(null);
      setEnergySavingData('');
    } catch (error) {
      toast.error(`Error submitting action: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const verifyEnergySaving = async (data) => {
    if (data && data > 0) {
      return { success: true };
    } else {
      return { success: false };
    }
  };

  const validateGeoTracking = async (location) => {
    if (location.latitude && location.longitude) {
      return { success: true };
    } else {
      return { success: false };
    }
  };

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
        Submit Your Eco-Friendly Action
      </motion.h1>

      <motion.form 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit} 
        className="space-y-8"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Choose Action Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actionTypes.map((type) => (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => {
                  setActionType(type.id);
                  setEstimatedCredits(type.co2);
                }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                  actionType === type.id 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600'
                }`}
              >
                <div className={`text-2xl ${actionType === type.id ? 'text-white' : ''}`}>
                  {type.icon}
                </div>
                <span className="font-medium text-sm">{type.label}</span>
                <span className="text-xs opacity-75">{type.co2} kg CO₂</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Action Details
          </h2>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
              Upload Evidence (Image)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />
              {preview && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
              {isProcessing && (
                <p>Processing...</p>
              )}
              {ocrText && (
                <div>
                  <h3 className="text-xl font-semibold">OCR Output</h3>
                  <textarea value={ocrText} rows={10} readOnly className="w-full p-4 mt-2 bg-gray-50 dark:bg-gray-700 rounded-xl border-0 focus:ring-2 focus:ring-green-500"></textarea>
                </div>
              )}
            </div>
          </div>

        </motion.div>

        <motion.button
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          disabled={loading}
          type="submit"
          className="w-full p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto h-6 w-6" />
          ) : (
            'Submit Action'
          )}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default SubmitActions;


