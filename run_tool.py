#!/usr/bin/env python
# -*- coding: utf-8 -*-

import subprocess
import sys
import os
import webbrowser
import time
from threading import Thread
import socket

def wait_for_server(port, timeout=30):
    """等待服务器启动"""
    start_time = time.time()
    while True:
        if time.time() - start_time > timeout:
            return False
        try:
            socket.create_connection(("localhost", port), timeout=1)
            return True
        except (socket.timeout, ConnectionRefusedError):
            time.sleep(0.5)

def check_dependencies():
    """检查依赖"""
    print("正在检查依赖...")
    try:
        # 检查 tkinter
        try:
            import tkinter
        except ImportError:
            print("请安装 Python tkinter 包")
            if sys.platform == 'win32':
                print("在 Windows 上可以重新安装 Python，并在安装时勾选 tcl/tk 选项")
            elif sys.platform == 'linux':
                print("在 Linux 上可以使用包管理器安装，例如：")
                print("Ubuntu/Debian: sudo apt-get install python3-tk")
                print("Fedora: sudo dnf install python3-tkinter")
            input("按回车键退出...")
            sys.exit(1)

        # 安装 Node.js 依赖
        subprocess.run('npm install', shell=True, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"安装依赖失败: {e}")
        input("按回车键退出...")
        sys.exit(1)

def start_server():
    """启动 Node.js 服务器"""
    try:
        if sys.platform == 'win32':
            return subprocess.Popen(['node', 'server.js'], 
                                 creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            return subprocess.Popen(['node', 'server.js'])
    except Exception as e:
        print(f"启动服务器失败: {e}")
        input("按回车键退出...")
        sys.exit(1)

def open_browser():
    """打开浏览器"""
    url = 'http://localhost:3000'
    print(f"正在等待服务器启动...")
    if wait_for_server(3000):
        print(f"正在打开浏览器: {url}")
        webbrowser.open(url)
    else:
        print("服务器启动超时")

def start_video_tool():
    """启动视频解析工具"""
    video_parser_path = os.path.join('video', 'video_parser.py')
    try:
        if sys.platform == 'win32':
            subprocess.Popen([sys.executable, video_parser_path],
                           creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            subprocess.Popen([sys.executable, video_parser_path],
                           stdout=subprocess.PIPE,
                           stderr=subprocess.PIPE)
    except Exception as e:
        print(f"启动视频工具失败: {e}")

def main():
    try:
        # 检查依赖
        check_dependencies()
        
        # 启动服务器
        print("正在启动服务器...")
        server_process = start_server()
        
        # 启动视频工具
        print("正在启动视频解析工具...")
        start_video_tool()
        
        # 打开浏览器
        Thread(target=open_browser).start()
        
        print("\n启动完成！")
        print("请不要关闭此窗口，关闭后服务将停止运行。")
        print("按 Ctrl+C 可以停止服务。")
        
        # 保持脚本运行并监控服务器进程
        while server_process.poll() is None:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n正在关闭服务...")
        if 'server_process' in locals():
            server_process.terminate()
    except Exception as e:
        print(f"发生错误: {e}")
        input("按回车键退出...")

if __name__ == "__main__":
    main() 