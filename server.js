const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const API_KEY = process.env.SILICON_API_KEY;
const BASE_URL = 'https://api.siliconflow.cn/v1';

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await axios.post(`${BASE_URL}/chat/completions`, {
            model: 'deepseek-ai/DeepSeek-V2.5',
            messages: [
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 1000
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({ 
            error: '服务器错误',
            details: error.response?.data || error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});