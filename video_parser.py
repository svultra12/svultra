#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tkinter as tk
from tkinter import messagebox
import webbrowser
from urllib.parse import urlparse
import time
import sys
from video.ui.window import MainWindow
from video.core.utils import RateLimiter

class VideoParser:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title('视频解析助手')
        self.root.geometry('480x200')
        
        # 确保窗口在前台显示
        self.root.lift()
        self.root.attributes('-topmost', True)

        # 存储上次访问时间
        self.last_access = {}

        # 允许的视频网站域名
        self.allowed_domains = {
            'iqiyi.com': 'https://www.iqiyi.com',
            'qq.com': 'https://v.qq.com',
            'youku.com': 'https://www.youku.com'
        }

        self.create_ui()

    def create_ui(self):
        """创建用户界面"""
        # 链接输入区域
        label = tk.Label(self.root, text='网页视频链接：')
        label.place(x=20, y=30, width=100, height=30)

        self.entry = tk.Entry(self.root)
        self.entry.place(x=125, y=30, width=260, height=30)

        # 清空按钮
        clear_btn = tk.Button(self.root, text='清空', command=self.clear_input)
        clear_btn.place(x=400, y=30, width=50, height=30)

        # 视频网站快捷按钮
        self.create_site_buttons()

        # 解析按钮
        parse_btn = tk.Button(self.root, text='解析视频', command=self.parse_video)
        parse_btn.place(x=325, y=80, width=125, height=40)

        # 提示信息
        tip_label = tk.Label(
            self.root,
            text='提示：请输入正确的视频链接，建议使用正版视频',
            fg='gray'
        )
        tip_label.place(x=50, y=150, width=400, height=20)

    def create_site_buttons(self):
        """创建视频网站按钮"""
        sites = [
            ('爱奇艺', self.open_iqy),
            ('腾讯视频', self.open_tx),
            ('优酷视频', self.open_yq)
        ]

        for i, (name, command) in enumerate(sites):
            btn = tk.Button(self.root, text=name, command=command)
            btn.place(x=25 + i * 100, y=80, width=80, height=40)

    def validate_url(self, url):
        """验证URL安全性"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            return any(domain.endswith(d) for d in self.allowed_domains)
        except:
            return False

    def rate_limit(self, action, limit=3):
        """访问频率限制"""
        current = time.time()
        if action in self.last_access:
            if current - self.last_access[action] < limit:
                return False
        self.last_access[action] = current
        return True

    def safe_open_url(self, url):
        """安全打开URL"""
        try:
            if not self.rate_limit('open_url'):
                messagebox.showwarning("提示", "请勿频繁操作")
                return

            if self.validate_url(url):
                webbrowser.open(url)
            else:
                messagebox.showerror("错误", "不支持的视频网站")
        except Exception as e:
            messagebox.showerror("错误", f"无法打开网站: {str(e)}")

    def open_iqy(self):
        """打开爱奇艺"""
        self.safe_open_url(self.allowed_domains['iqiyi.com'])

    def open_tx(self):
        """打开腾讯视频"""
        self.safe_open_url(self.allowed_domains['qq.com'])

    def open_yq(self):
        """打开优酷"""
        self.safe_open_url(self.allowed_domains['youku.com'])

    def parse_video(self):
        """解析视频"""
        url = self.entry.get().strip()
        if not url:
            messagebox.showwarning("提示", "请输入视频链接")
            return

        if not self.validate_url(url):
            messagebox.showerror("错误", "不支持的视频链接")
            return

        if not self.rate_limit('parse_video', 5):
            messagebox.showwarning("提示", "请勿频繁操作")
            return

        try:
            parse_url = 'https://jx.xmflv.cc/?url=' + url
            webbrowser.open(parse_url)
        except Exception as e:
            messagebox.showerror("错误", f"解析失败: {str(e)}")

    def clear_input(self):
        """清空输入框"""
        self.entry.delete(0, 'end')

    def run(self):
        """运行程序"""
        try:
            self.root.mainloop()
        except Exception as e:
            messagebox.showerror("错误", f"程序运行错误: {str(e)}")

if __name__ == '__main__':
    try:
        app = VideoParser()
        app.run()
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1) 