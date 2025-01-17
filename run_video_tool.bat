@echo off
echo 正在安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败，请检查 Node.js 是否正确安装
    pause
    exit /b 1
)

echo 正在启动服务器...
:: 使用特定浏览器（取消注释你想使用的浏览器）
:: start chrome http://localhost:3000
:: start firefox http://localhost:3000
:: start msedge http://localhost:3000
start http://localhost:3000

call npm start
if %errorlevel% neq 0 (
    echo 服务器启动失败
    pause
    exit /b 1
) 