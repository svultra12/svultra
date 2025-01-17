const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// 允许跨域请求
app.use(cors());
app.use(express.static('.'));

let serverRunning = false;

// 检查服务器状态的路由
app.get('/check-server', (req, res) => {
    res.json({ 
        success: true,
        running: serverRunning 
    });
});

// 运行视频工具的路由
app.post('/run-video-tool', (req, res) => {
    if (!serverRunning) {
        res.json({
            success: false,
            message: '请等待服务器启动完成'
        });
        return;
    }

    const pythonScript = path.join(__dirname, 'video', 'video_parser.py');
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    exec(`${pythonCommand} "${pythonScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行错误: ${error}`);
            res.json({ 
                success: false, 
                message: `启动失败: ${error.message}` 
            });
            return;
        }
        res.json({ success: true });
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    serverRunning = true;
});

