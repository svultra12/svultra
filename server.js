const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Server Error');
});

// 静态文件服务
app.use(express.static(path.join(__dirname)));

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

