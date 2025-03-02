const express = require('express');
const axios = require('axios');
const cors = require('cors');
const portfinder = require('portfinder');
require('dotenv').config();

const app = express();


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Example route to fetch nutrition data (replace with real API later)
app.post('/get-nutrition', async (req, res) => {
    const { ingredient } = req.body;

    if (!ingredient) {
        return res.status(400).json({ error: 'Ingredient is required' });
    }

    try {
        const response = await axios.post(
            'https://trackapi.nutritionix.com/v2/natural/nutrients',
            { query: ingredient },
            {
                headers: {
                    'x-app-id': process.env.NUTRITIONIX_API_ID,
                    'x-app-key': process.env.NUTRITIONIX_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );


        res.json(response.data);
    } catch (error) {
        console.error('Error fetching nutrition data:', error);
        res.status(500).json({ error: 'Failed to fetch nutrition data' });
    }
});

portfinder.getPort((err, port) => {
    if (err) {
        console.error('Error finding a free port:', err);
        return;
    }

    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
});
