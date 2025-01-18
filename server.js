const express = require('express');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Claude API路由
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229',
                max_tokens: 1000,
                messages: [{ role: 'user', content: message }]
            })
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Server Error');
});

// 视频工具接口
app.post('/run-video-tool', (req, res) => {
    const pythonScript = path.join(__dirname, 'video', 'video_parser.py');
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    exec(`${pythonCommand} "${pythonScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行错误: ${error}`);
            res.json({ success: false, message: error.message });
            return;
        }
        res.json({ success: true });
    });
});

// 启动服务器
app.listen(port, '127.0.0.1', () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});

