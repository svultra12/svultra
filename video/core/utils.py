import os
import sys
import logging
import tkinter as tk
import traceback
from datetime import datetime

def setup_logging():
    """配置日志系统"""
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    log_file = os.path.join(log_dir, f'video_tool_{datetime.now().strftime("%Y%m%d")}.log')
    
    logging.basicConfig(
        filename=log_file,
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s',
        encoding='utf-8'
    )

def check_environment():
    """检查运行环境"""
    try:
        logging.info(f"操作系统: {os.name}")
        logging.info(f"Python版本: {sys.version}")
        logging.info(f"工作目录: {os.getcwd()}")
        
        import tkinter
        root = tkinter.Tk()
        root.withdraw()
        logging.info("环境检查通过")
        return True
    except Exception as e:
        logging.error(f"环境检查失败: {str(e)}\n{traceback.format_exc()}")
        return False

class RateLimiter:
    """访问频率限制器"""
    def __init__(self):
        self.last_access = {}
        
    def check(self, action, limit=3):
        """检查是否超过频率限制"""
        current = datetime.now().timestamp()
        if action in self.last_access:
            if current - self.last_access[action] < limit:
                return False
        self.last_access[action] = current
        return True 