#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import webbrowser
from subprocess import Popen
import time

def run_server():
    try:
        # 获取当前目录
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 检查服务器是否已经运行
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 3000))
        sock.close()
        
        if result == 0:
            print("服务器已在运行")
            return None
            
        # 安装依赖
        os.system('npm install')
        
        # 启动服务器
        server_process = Popen(['node', 'server.js'], cwd=current_dir)
        print("服务器启动成功")
        
        return server_process
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    server_process = run_server()
    if server_process:
        try:
            server_process.wait()
        except KeyboardInterrupt:
            server_process.terminate() 