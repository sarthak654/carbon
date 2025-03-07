import * as tf from '@tensorflow/tfjs';
import * as ml5 from 'ml5';

let classifier;

export const initializeImageRecognition = async () => {
  classifier = await ml5.imageClassifier('MobileNet');
};

export const analyzeRecyclingImage = async (imageElement) => {
  try {
    if (!classifier) {
      await initializeImageRecognition();
    }

    const results = await classifier.classify(imageElement);
    return {
      success: true,
      predictions: results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const validateRecyclingItem = (predictions) => {
  const recyclableItems = [
    'bottle', 'can', 'paper', 'cardboard', 'plastic',
    'glass', 'newspaper', 'magazine', 'container'
  ];

  return predictions.some(prediction => 
    recyclableItems.some(item => 
      prediction.label.toLowerCase().includes(item)
    )
  );
};