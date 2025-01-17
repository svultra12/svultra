document.addEventListener('DOMContentLoaded', () => {
    // 导航栏菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 轮播图功能
    const carousel = document.querySelector('.carousel');
    carousel.classList.add('loading'); // 添加加载状态

    // 聊天功能
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // 联系方式切换
    const contactLink = document.querySelector('a[href="#contact"]');
    const contactContainer = document.getElementById('contact');
    
    // 初始化所有动画观察器
    initializeObservers();
    // 初始化所有事件监听器
    initializeEventListeners();
    // 初始化图片加载
    initializeImageLoading();
    initializeImageViewer();

    function initializeObservers() {
        // 滚动显示动画
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        // 技能条动画
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progress = entry.target.getAttribute('data-progress');
                    entry.target.style.width = progress;
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5, rootMargin: '0px' });

        // 添加观察目标
        document.querySelectorAll('.about-section, .chat-container, .social-links').forEach(el => {
            el.classList.add('fade-in');
            fadeObserver.observe(el);
        });

        document.querySelectorAll('.skill-progress').forEach(bar => {
            skillObserver.observe(bar);
        });
    }

    function initializeEventListeners() {
        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // 联系方式显示/隐藏
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            contactContainer.style.display = 
                contactContainer.style.display === 'none' ? 'block' : 'none';
        });

        // 聊天功能
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // 轮播图控制
        initializeCarousel();
    }

    function initializeImageLoading() {
        const images = document.querySelectorAll('img');
        let loadedCount = 0;

        images.forEach(img => {
            // 添加默认图片
            const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjYWFhIiBmb250LWZhbWlseT0iQXJpYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';

            if (img.complete) {
                imageLoaded();
            } else {
                img.addEventListener('load', imageLoaded);
                img.addEventListener('error', (e) => {
                    console.error('Image load error:', e.target.src);
                    e.target.src = defaultImage;
                    imageLoaded();
                });
            }
        });

        function imageLoaded() {
            loadedCount++;
            if (loadedCount === images.length) {
                carousel.classList.remove('loading');
            }
        }
    }

    async function sendMessage(retryCount = 3) {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';
        
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message ai-message';
        loadingMessage.textContent = '正在思考...';
        chatMessages.appendChild(loadingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer sk-ijvlalsaguexevmessiyvbfefwaitfefbeaywipgkdbumqfm'
                },
                body: JSON.stringify({
                    model: 'deepseek-ai/DeepSeek-V2.5',
                    messages: [{ role: 'user', content: message }],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                if (retryCount > 0) {
                    setTimeout(() => sendMessage(retryCount - 1), 1000);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            chatMessages.removeChild(loadingMessage);
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                addMessage(data.choices[0].message.content);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(loadingMessage);
            addMessage('抱歉，发生了错误，请稍后重试。');
        }
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestamp);
        chatMessages.appendChild(messageDiv);
        
        if (!isUser) {
            // 添加打字机效果
            let i = 0;
            const typeWriter = () => {
                if (i < content.length) {
                    contentDiv.textContent += content.charAt(i);
                    i++;
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    setTimeout(typeWriter, 20);
                }
            };
            typeWriter();
        } else {
            contentDiv.textContent = content;
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function initializeCarousel() {
        const carousel = document.querySelector('.carousel');
        const images = carousel.querySelectorAll('img');
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        const dots = carousel.querySelector('.carousel-dots');
        let currentIndex = 0;

        // 创建轮播点
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dots.appendChild(dot);
        });

        // 切换到指定幻灯片
        function goToSlide(index) {
            images[currentIndex].classList.remove('active');
            dots.children[currentIndex].classList.remove('active');
            currentIndex = index;
            images[currentIndex].classList.add('active');
            dots.children[currentIndex].classList.add('active');
        }

        // 下一张
        function nextSlide() {
            goToSlide((currentIndex + 1) % images.length);
        }

        // 上一张
        function prevSlide() {
            goToSlide((currentIndex - 1 + images.length) % images.length);
        }

        // 添加按钮事件
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // 自动播放
        setInterval(nextSlide, 5000);
    }

    function initializeImageViewer() {
        const carousel = document.querySelector('.carousel');
        const imageViewer = document.getElementById('imageViewer');
        const viewerImage = imageViewer.querySelector('img');
        const closeBtn = imageViewer.querySelector('.close-btn');
        const allImages = Array.from(carousel.querySelectorAll('img'));
        let currentImageIndex = 0;

        // 创建导航区域
        const navPrev = document.createElement('div');
        navPrev.className = 'nav-area nav-prev';
        navPrev.innerHTML = '‹';
        
        const navNext = document.createElement('div');
        navNext.className = 'nav-area nav-next';
        navNext.innerHTML = '›';
        
        imageViewer.appendChild(navPrev);
        imageViewer.appendChild(navNext);

        // 为轮播图中的所有图片添加点击事件
        allImages.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImageIndex = index;
                showImage(currentImageIndex);
                imageViewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        function showImage(index) {
            currentImageIndex = index;
            viewerImage.src = allImages[currentImageIndex].src;
        }

        function nextImage() {
            currentImageIndex = (currentImageIndex + 1) % allImages.length;
            showImage(currentImageIndex);
        }

        function prevImage() {
            currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
            showImage(currentImageIndex);
        }

        // 导航事件监听
        navPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevImage();
        });

        navNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextImage();
        });

        // 关闭查看器
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            imageViewer.classList.remove('active');
            document.body.style.overflow = '';
            // 重置图片查看器状态
            currentImageIndex = 0;
            viewerImage.src = '';
        });

        // 添加背景点击关闭
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer) {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                currentImageIndex = 0;
                viewerImage.src = '';
            }
        });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!imageViewer.classList.contains('active')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    prevImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
                case 'Escape':
                    imageViewer.classList.remove('active');
                    document.body.style.overflow = '';
                    break;
            }
        });

        // 触摸滑动支持
        let touchStartX = 0;
        let touchEndX = 0;

        imageViewer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        imageViewer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const swipeLength = touchEndX - touchStartX;
            
            if (Math.abs(swipeLength) > swipeThreshold) {
                if (swipeLength > 0) {
                    prevImage();
                } else {
                    nextImage();
                }
            }
        }
    }

    // 音乐轮播图功能
    function initMusicCarousel() {
        const container = document.querySelector('.music-carousel-container');
        const images = container.querySelectorAll('img');
        let currentIndex = 0;

        function showImage(index) {
            images.forEach(img => img.classList.remove('active'));
            images[index].classList.add('active');
        }

        document.querySelector('.music-carousel-btn.prev').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });

        document.querySelector('.music-carousel-btn.next').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });

        // 自动轮播
        setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }, 5000);
    }

    // 视频工具功能
    function initVideoTool() {
        const statusMessage = document.getElementById('status-message');
        const runBtn = document.querySelector('.run-btn');

        if (!runBtn) return;

        runBtn.addEventListener('click', async function() {
            if (this.disabled) return;

            try {
                this.disabled = true;
                this.textContent = '正在启动...';
                statusMessage.textContent = '正在启动工具...';
                statusMessage.className = 'status-message info';

                // 使用Node.js的child_process执行Python脚本
                const { exec } = require('child_process');
                const pythonScriptPath = 'video/video_parser.py';
                
                exec(`start python ${pythonScriptPath}`, { shell: true }, (error, stdout, stderr) => {
                    if (error) {
                        throw new Error(`执行错误: ${error.message}`);
                    }
                    if (stderr) {
                        throw new Error(`脚本错误: ${stderr}`);
                    }

                    statusMessage.textContent = '工具已启动！';
                    statusMessage.className = 'status-message success';
                    setTimeout(() => {
                        this.textContent = '运行工具';
                        this.disabled = false;
                        statusMessage.style.display = 'none';
                    }, 2000);
                });
            } catch (error) {
                console.error('Error:', error);
                statusMessage.textContent = '启动失败，请检查系统设置';
                statusMessage.className = 'status-message error';
                this.textContent = '运行工具';
                this.disabled = false;
            }
        });
    }

    // 页面加载完成后初始化所有功能
    document.addEventListener('DOMContentLoaded', function() {
        initMusicCarousel();
        initVideoTool();
    });
});

function runVideoTool() {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '正在启动视频解析工具...';

    // 使用fetch调用后端接口来执行Python脚本
    fetch('/run-video-tool', {
        method: 'POST'
    })
    .then(response => response.json())  
    .then(data => {
        if(data.success) {
            statusMessage.textContent = '视频解析工具已启动';
        } else {
            statusMessage.textContent = '启动失败: ' + data.error;
        }
    })
    .catch(error => {
        statusMessage.textContent = '启动失败,请确保已安装Python环境';
        console.error('Error:', error);
    });
}
