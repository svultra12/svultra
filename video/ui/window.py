import tkinter as tk
from tkinter import messagebox
import logging
from ..core.utils import RateLimiter
from ..core.parser import VideoParser

class MainWindow:
    def __init__(self):
        self.setup_window()
        self.parser = VideoParser()
        self.rate_limiter = RateLimiter()
        self.create_ui()

    def setup_window(self):
        """设置主窗口"""
        self.root = tk.Tk()
        self.root.title('视频解析助手')
        self.root.geometry('480x200')
        self.center_window()
        self.configure_window()

    def center_window(self):
        """将窗口居中显示"""
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        x = (screen_width - 480) // 2
        y = (screen_height - 200) // 2
        self.root.geometry(f'480x200+{x}+{y}')

    def configure_window(self):
        """配置窗口属性"""
        self.root.lift()
        self.root.attributes('-topmost', True)
        if hasattr(self.root, 'attributes'):
            self.root.attributes('-toolwindow', 1)

    def create_ui(self):
        """创建用户界面"""
        self.create_input_area()
        self.create_buttons()
        self.create_tip_label()

    def create_input_area(self):
        """创建输入区域"""
        label = tk.Label(self.root, text='网页视频链接：')
        label.place(x=20, y=30, width=100, height=30)

        self.entry = tk.Entry(self.root)
        self.entry.place(x=125, y=30, width=260, height=30)

        clear_btn = tk.Button(self.root, text='清空', command=self.clear_input)
        clear_btn.place(x=400, y=30, width=50, height=30)

    def create_buttons(self):
        """创建按钮区域"""
        sites = [
            ('爱奇艺', 'iqiyi.com'),
            ('腾讯视频', 'qq.com'),
            ('优酷视频', 'youku.com')
        ]

        for i, (name, domain) in enumerate(sites):
            btn = tk.Button(
                self.root, 
                text=name, 
                command=lambda d=domain: self.open_site(d)
            )
            btn.place(x=25 + i * 100, y=80, width=80, height=40)

        parse_btn = tk.Button(self.root, text='解析视频', command=self.parse_video)
        parse_btn.place(x=325, y=80, width=125, height=40)

    def create_tip_label(self):
        """创建提示标签"""
        tip_label = tk.Label(
            self.root,
            text='提示：请输入正确的视频链接，建议使用正版视频',
            fg='gray'
        )
        tip_label.place(x=50, y=150, width=400, height=20)

    def clear_input(self):
        """清空输入框"""
        self.entry.delete(0, 'end')

    def open_site(self, domain):
        """打开视频网站"""
        if not self.rate_limiter.check('open_site'):
            messagebox.showwarning("提示", "请勿频繁操作")
            return

        url = self.parser.allowed_domains.get(domain)
        if url:
            self.parser.parse_video(url)

    def parse_video(self):
        """解析视频"""
        if not self.rate_limiter.check('parse_video', 5):
            messagebox.showwarning("提示", "请勿频繁操作")
            return

        url = self.entry.get().strip()
        success, message = self.parser.parse_video(url)
        
        if not success:
            messagebox.showerror("错误", message)

    def run(self):
        """运行主循环"""
        try:
            self.root.mainloop()
        except Exception as e:
            logging.error(f"主循环错误: {str(e)}")
            messagebox.showerror("错误", f"程序运行错误: {str(e)}") 