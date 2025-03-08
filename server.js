import express from 'express';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON body

const csvFilePath = 'billNumbers.csv';

// Update the CSV Writer configuration to include proper headers
const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: [
        { id: 'billNumber', title: 'Bill Number' },
        { id: 'timestamp', title: 'Timestamp' }
    ],
    append: true
});

// Check if file exists, if not create with headers
if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, 'Bill Number,Timestamp\n');
}

// API to receive bill numbers from frontend
app.post('/add-bill', async (req, res) => {
    const { billNumber } = req.body;

    if (!billNumber || billNumber === 'Bill number not found') {
        return res.status(400).json({ error: 'Valid bill number is required' });
    }

    try {
        // Check if bill number already exists
        const existingData = fs.readFileSync(csvFilePath, 'utf-8');
        if (existingData.includes(billNumber)) {
            return res.status(409).json({ error: 'Bill number already exists' });
        }

        // Add new record
        await csvWriter.writeRecords([{
            billNumber: billNumber,
            timestamp: new Date().toISOString()
        }]);

        console.log(`Added Bill Number: ${billNumber} to CSV`);
        res.status(200).json({ success: true, message: 'Bill number added successfully' });
    } catch (error) {
        console.error('Error writing to CSV:', error);
        res.status(500).json({ error: 'Failed to write to CSV' });
    }
});

// API to download the CSV file
app.get('/download-csv', (req, res) => {
    res.download(csvFilePath, 'billNumbers.csv', (err) => {
        if (err) console.log('Error downloading CSV:', err);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
