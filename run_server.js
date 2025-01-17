(async function startServer() {
    try {
        // 使用 Python 启动服务器
        const process = await window.require('child_process').spawn('python', ['run_tool.py'], {
            detached: true,
            stdio: 'ignore'
        });
        process.unref();

        // 等待服务器启动
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 重定向到本地服务器
        window.location.href = 'http://localhost:3000';
    } catch (error) {
        console.error('Failed to start server:', error);
        alert('启动服务器失败，请确保已安装 Python 和 Node.js');
    }
})(); 