document.addEventListener('DOMContentLoaded', () => {
    // 导航栏菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 轮播图功能
    const carousel = document.querySelector('.carousel');
    const images = carousel.querySelectorAll('img');
    const dots = document.querySelector('.carousel-dots');
    let currentIndex = 0;
    let loadedImages = 0;

    // 创建轮播点
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dots.appendChild(dot);
    });

    function goToSlide(index) {
        images[currentIndex].classList.remove('active');
        dots.children[currentIndex].classList.remove('active');
        currentIndex = index;
        images[currentIndex].classList.add('active');
        dots.children[currentIndex].classList.add('active');
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % images.length);
    }

    function prevSlide() {
        goToSlide((currentIndex - 1 + images.length) % images.length);
    }

    // 自动轮播
    setInterval(nextSlide, 5000);

    // 按钮事件
    document.querySelector('.next').addEventListener('click', nextSlide);
    document.querySelector('.prev').addEventListener('click', prevSlide);

    // 聊天功能
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, true);
        userInput.value = '';
        
        // 添加加载提示
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message ai-message';
        loadingMessage.textContent = '正在思考...';
        chatMessages.appendChild(loadingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer sk-ijvlalsaguexevmessiyvbfefwaitfefbeaywipgkdbumqfm',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek-ai/DeepSeek-V2.5',
                    messages: [{ role: 'user', content: message }],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // 移除加载提示
            chatMessages.removeChild(loadingMessage);
            
            // 添加AI响应
            if (data.choices && data.choices[0] && data.choices[0].message) {
                addMessage(data.choices[0].message.content);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error:', error);
            // 移除加载提示
            chatMessages.removeChild(loadingMessage);
            addMessage('抱歉，发生了错误，请稍后重试。');
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 处理图片加载
    images.forEach(img => {
        img.addEventListener('load', () => {
            loadedImages++;
            if (loadedImages === images.length) {
                carousel.classList.add('loaded');
            }
        });

        // 处理加载失败的情况
        img.addEventListener('error', () => {
            console.error(`Failed to load image: ${img.src}`);
            img.src = 'images/placeholder.jpg'; // 可以添加一个默认的占位图
        });
    });
});