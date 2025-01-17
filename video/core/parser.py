#!/usr/bin/env python
# -*- coding: utf-8 -*-

from urllib.parse import urlparse
import webbrowser
import logging

class VideoParser:
    """视频解析核心类"""
    
    def __init__(self):
        self.allowed_domains = {
            'iqiyi.com': 'https://www.iqiyi.com',
            'qq.com': 'https://v.qq.com',
            'youku.com': 'https://www.youku.com'
        }
        self.parse_api = 'https://jx.xmflv.cc/?url='

    def validate_url(self, url):
        """验证URL安全性"""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            return any(domain.endswith(d) for d in self.allowed_domains)
        except Exception as e:
            logging.error(f"URL验证失败: {str(e)}")
            return False

    def parse_video(self, url):
        """解析视频URL"""
        if not url or not self.validate_url(url):
            return False, "不支持的视频链接"
            
        try:
            parse_url = self.parse_api + url
            webbrowser.open(parse_url)
            return True, "解析成功"
        except Exception as e:
            logging.error(f"视频解析失败: {str(e)}")
            return False, f"解析失败: {str(e)}" 