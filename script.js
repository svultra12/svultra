document.addEventListener('DOMContentLoaded', () => {
    // 初始化主题和运动设置
    initTheme();
    initMotion();

    // 导航栏菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', 
            navLinks.classList.contains('active'));
    });

    // 主题切换功能
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

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

    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        document.querySelector('.theme-toggle i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark-theme', savedTheme === 'dark');
        document.querySelector('.theme-toggle i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    function initMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.documentElement.classList.toggle('reduced-motion', prefersReducedMotion);
    }

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
        let autoplayInterval;
        const autoplayDelay = 3000;
        let isTransitioning = false;

        // 清空并重新创建轮播点
        dots.innerHTML = '';
        images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                if (!isTransitioning && currentIndex !== index) {
                    goToSlide(index);
                    resetAutoplay();
                }
            });
            dots.appendChild(dot);
        });

        // 初始化第一张图片
        images[0].classList.add('active');

        // 切换到指定幻灯片
        function goToSlide(index, direction = '') {
            if (isTransitioning) return;
            isTransitioning = true;

            // 移除所有方向类
            images.forEach(img => {
                img.classList.remove('next', 'prev');
            });

            // 准备新图片的位置
            if (direction === 'next' || (direction === '' && index > currentIndex)) {
                images[index].classList.add('next');
            } else if (direction === 'prev' || (direction === '' && index < currentIndex)) {
                images[index].classList.add('prev');
            }

            // 强制重排以确保过渡效果
            carousel.offsetHeight;

            // 移除当前活动状态
            images[currentIndex].classList.remove('active');
            dots.children[currentIndex].classList.remove('active');

            // 设置新的活动状态
            currentIndex = index;
            images[currentIndex].classList.remove('next', 'prev');
            images[currentIndex].classList.add('active');
            dots.children[currentIndex].classList.add('active');

            // 过渡结束后重置状态
            setTimeout(() => {
                isTransitioning = false;
            }, 800); // 匹配 CSS 过渡时间
        }

        // 下一张
        function nextSlide() {
            if (isTransitioning) return;
            const nextIndex = (currentIndex + 1) % images.length;
            goToSlide(nextIndex, 'next');
        }

        // 上一张
        function prevSlide() {
            if (isTransitioning) return;
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            goToSlide(prevIndex, 'prev');
        }

        // 重置自动播放计时器
        function resetAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
            if (!carousel.matches(':hover')) {
                startAutoplay();
            }
        }

        // 开始自动播放
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }

        // 停止自动播放
        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }

        // 添加按钮事件
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
            resetAutoplay();
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
            resetAutoplay();
        });

        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                resetAutoplay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                resetAutoplay();
            }
        });

        // 鼠标悬停控制
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        // 触摸事件控制
        let touchStartX = 0;
        let touchStartTime = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartTime = Date.now();
            stopAutoplay();
        });

        carousel.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            const diff = touchEndX - touchStartX;
            
            // 根据滑动速度和距离判断是否切换
            const velocity = Math.abs(diff) / touchDuration;
            if (Math.abs(diff) > 50 || velocity > 0.5) {
                if (diff > 0) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            }
            resetAutoplay();
        });

        // 初始启动自动播放
        startAutoplay();
    }

    function initializeImageViewer() {
        const carousel = document.querySelector('.carousel');
        const imageViewer = document.getElementById('imageViewer');
        const viewerImage = imageViewer.querySelector('.viewer-image');
        const prevSection = imageViewer.querySelector('.prev-section');
        const centerSection = imageViewer.querySelector('.center-section');
        const nextSection = imageViewer.querySelector('.next-section');
        const allImages = Array.from(carousel.querySelectorAll('img'));
        let currentImageIndex = 0;
        let isAnimating = false;

        // 为轮播图中的所有图片添加点击事件
        allImages.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isAnimating) return;
                currentImageIndex = index;
                openViewer(currentImageIndex);
            });
        });

        function openViewer(index) {
            isAnimating = true;
            currentImageIndex = index;
            const targetImage = allImages[currentImageIndex];
            
            // 预加载图片
            const tempImage = new Image();
            tempImage.onload = () => {
                viewerImage.classList.add('transitioning');
                viewerImage.src = tempImage.src;
                viewerImage.alt = targetImage.alt;
                
                imageViewer.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                requestAnimationFrame(() => {
                    viewerImage.classList.remove('transitioning');
                    setTimeout(() => {
                        isAnimating = false;
                    }, 300);
                });
            };
            tempImage.src = targetImage.src;
        }

        function showImage(index, direction = 'none') {
            if (isAnimating) return;
            isAnimating = true;

            const targetImage = allImages[index];
            const tempImage = new Image();
            
            tempImage.onload = () => {
                viewerImage.classList.add('transitioning');
                
                setTimeout(() => {
                    viewerImage.src = tempImage.src;
                    viewerImage.alt = targetImage.alt;
                    
                    requestAnimationFrame(() => {
                        viewerImage.classList.remove('transitioning');
                        
                        setTimeout(() => {
                            isAnimating = false;
                        }, 300);
                    });
                }, 300);
            };
            tempImage.src = targetImage.src;
        }

        function nextImage() {
            if (isAnimating) return;
            currentImageIndex = (currentImageIndex + 1) % allImages.length;
            showImage(currentImageIndex, 'next');
        }

        function prevImage() {
            if (isAnimating) return;
            currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
            showImage(currentImageIndex, 'prev');
        }

        // 区域点击事件
        prevSection.addEventListener('click', (e) => {
            e.stopPropagation();
            prevImage();
        });

        nextSection.addEventListener('click', (e) => {
            e.stopPropagation();
            nextImage();
        });

        centerSection.addEventListener('click', (e) => {
            e.stopPropagation();
            closeViewer();
        });

        // 区域悬停效果
        [prevSection, centerSection, nextSection].forEach(section => {
            section.addEventListener('mouseenter', () => {
                section.classList.add('hover');
            });
            
            section.addEventListener('mouseleave', () => {
                section.classList.remove('hover');
            });
        });

        function closeViewer() {
            if (isAnimating) return;
            isAnimating = true;
            
            viewerImage.classList.add('transitioning');
            
            setTimeout(() => {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    viewerImage.src = '';
                    viewerImage.classList.remove('transitioning');
                    isAnimating = false;
                }, 300);
            }, 300);
        }

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
                    closeViewer();
                    break;
            }
        });

        // 触摸滑动支持
        let touchStartX = 0;
        let touchStartY = 0;

        imageViewer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        imageViewer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // 确保横向滑动距离大于纵向滑动距离
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    prevImage();
                } else {
                    nextImage();
                }
            } else if (Math.abs(deltaY) > 100) {
                // 垂直滑动超过阈值时关闭查看器
                closeViewer();
            }
        });
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
    function runVideoTool() {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = '正在启动视频解析工具...';
        statusMessage.style.display = 'block';
        statusMessage.className = 'status-message info';

        // 使用Node.js的child_process模块执行Python脚本
        const { exec } = require('child_process');
        const pythonProcess = exec('python video/video_parser.py', (error, stdout, stderr) => {
            if (error) {
                console.error('Error:', error);
                statusMessage.textContent = `错误: ${error.message}`;
                statusMessage.className = 'status-message error';
                return;
            }
            
            if (stderr) {
                console.error('Stderr:', stderr);
                statusMessage.textContent = `错误: ${stderr}`;
                statusMessage.className = 'status-message error';
                return;
            }

            statusMessage.textContent = '工具已成功启动';
            statusMessage.className = 'status-message success';
            console.log('Stdout:', stdout);
        });

        // 处理进程退出
        pythonProcess.on('exit', (code) => {
            if (code !== 0) {
                statusMessage.textContent = `工具异常退出，代码: ${code}`;
                statusMessage.className = 'status-message error';
            }
        });
    }

    // 初始化所有功能
    initializeCarousel();
    initializeImageViewer();
    initMusicCarousel();
    runVideoTool(); // 直接在这里调用，而不是在另一个 DOMContentLoaded 事件中
});
