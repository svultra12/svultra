#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import ttk, messagebox
import webbrowser
from urllib.parse import urlparse

class VideoParser:
    def __init__(self):
        self.window = tk.Tk()
        self.window.title("视频解析工具")
        self.window.geometry("600x400")
        
        # 设置窗口居中
        screen_width = self.window.winfo_screenwidth()
        screen_height = self.window.winfo_screenheight()
        x = (screen_width - 600) // 2
        y = (screen_height - 400) // 2
        self.window.geometry(f"600x400+{x}+{y}")
        
        # 创建主框架
        self.main_frame = ttk.Frame(self.window, padding="20")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 标题
        title_label = ttk.Label(self.main_frame, text="视频解析工具", font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))
        
        # 创建输入框和按钮
        ttk.Label(self.main_frame, text="请输入视频链接:").grid(row=1, column=0, sticky=tk.W)
        
        # URL输入框
        self.url_entry = ttk.Entry(self.main_frame, width=50)
        self.url_entry.grid(row=2, column=0, columnspan=2, pady=(5, 10), sticky=(tk.W, tk.E))
        
        # 按钮框架
        btn_frame = ttk.Frame(self.main_frame)
        btn_frame.grid(row=3, column=0, columnspan=2, pady=10)
        
        # 快捷按钮
        ttk.Button(btn_frame, text="爱奇艺", command=lambda: self.open_site("iqiyi.com")).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="腾讯视频", command=lambda: self.open_site("qq.com")).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="优酷", command=lambda: self.open_site("youku.com")).pack(side=tk.LEFT, padx=5)
        
        # 解析按钮
        ttk.Button(btn_frame, text="解析视频", command=self.parse_video).pack(side=tk.LEFT, padx=5)
        
        # 状态标签
        self.status_label = ttk.Label(self.main_frame, text="")
        self.status_label.grid(row=4, column=0, columnspan=2, pady=10)
        
        # 提示信息
        tip_label = ttk.Label(self.main_frame, text="支持: 爱奇艺、腾讯视频、优酷等主流视频网站", foreground="gray")
        tip_label.grid(row=5, column=0, columnspan=2, pady=(20, 0))

    def open_site(self, domain):
        """打开视频网站"""
        sites = {
            "iqiyi.com": "https://www.iqiyi.com",
            "qq.com": "https://v.qq.com",
            "youku.com": "https://www.youku.com"
        }
        if domain in sites:
            webbrowser.open(sites[domain])

    def validate_url(self, url):
        """验证URL"""
        try:
            parsed = urlparse(url)
            return parsed.scheme and parsed.netloc
        except:
            return False

    def parse_video(self):
        """解析视频"""
        url = self.url_entry.get().strip()
        
        if not url:
            messagebox.showwarning("警告", "请输入视频链接")
            return
            
        if not self.validate_url(url):
            messagebox.showerror("错误", "请输入有效的视频链接")
            return
            
        try:
            self.status_label.config(text="正在解析...")
            # 使用通用解析接口
            parse_url = f"https://jx.xmflv.cc/?url={url}"
            webbrowser.open(parse_url)
            self.status_label.config(text="解析成功，请在浏览器中查看")
        except Exception as e:
            self.status_label.config(text="解析失败，请检查链接是否正确")
            messagebox.showerror("错误", f"解析失败: {str(e)}")
        
    def run(self):
        self.window.mainloop()

def main():
    try:
        app = VideoParser()
        app.run()
    except Exception as e:
        print(f"启动失败: {str(e)}")
        input("按回车键退出...")

if __name__ == "__main__":
    main()