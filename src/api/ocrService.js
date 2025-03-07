import { createWorker } from 'tesseract.js';

export const processReceipt = async (imageFile) => {
  try {
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();

    // Extract relevant information from the OCR text
    const amount = extractAmount(text);
    const date = extractDate(text);
    const transportType = identifyTransportType(text);

    return {
      success: true,
      data: { text, amount, date, transportType }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const extractAmount = (text) => {
  const amountRegex = /\$\d+(\.\d{2})?/;
  const match = text.match(amountRegex);
  return match ? match[0] : null;
};

const extractDate = (text) => {
  const dateRegex = /\d{2}[/-]\d{2}[/-]\d{4}/;
  const match = text.match(dateRegex);
  return match ? match[0] : null;
};

const identifyTransportType = (text) => {
  const transportTypes = ['bus', 'train', 'metro', 'subway', 'tram'];
  const lowercaseText = text.toLowerCase();
  return transportTypes.find(type => lowercaseText.includes(type)) || 'unknown';
};