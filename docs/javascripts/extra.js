document.addEventListener('DOMContentLoaded', function() {
    // 代码块优化
    enhanceCodeBlocks();
    
    // 图片优化
    enhanceImages();
    
    // 添加返回顶部按钮
    addBackToTop();
    
    // 添加目录滚动监听
    addTocHighlight();
    
    // 添加外部链接图标
    markExternalLinks();
});

// 代码块优化
function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // 添加行号
        const lines = block.innerHTML.split('\n');
        const numberedLines = lines.map((line, index) => 
            `<span class="line-number">${index + 1}</span>${line}`
        ).join('\n');
        block.innerHTML = numberedLines;
        
        // 添加代码语言标签
        const language = block.className.split(' ')[0].replace('language-', '');
        if (language) {
            const label = document.createElement('div');
            label.className = 'code-label';
            label.textContent = language;
            block.parentElement.insertBefore(label, block);
        }
    });
}

// 图片优化
function enhanceImages() {
    const images = document.querySelectorAll('.md-content img');
    images.forEach(img => {
        // 添加点击放大功能
        img.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.className = 'image-overlay';
            const clone = img.cloneNode();
            overlay.appendChild(clone);
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                overlay.remove();
            });
        });
        
        // 添加加载动画
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
        
        // 添加懒加载
        img.loading = 'lazy';
    });
}

// 返回顶部按钮
function addBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '↑';
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 目录滚动监听
function addTocHighlight() {
    const headings = document.querySelectorAll('.md-content h1, .md-content h2, .md-content h3');
    const tocLinks = document.querySelectorAll('.md-nav__link');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.href.split('#')[1] === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 });
    
    headings.forEach(heading => observer.observe(heading));
}

// 标记外部链接
function markExternalLinks() {
    const links = document.querySelectorAll('.md-content a');
    const currentHost = window.location.hostname;
    
    links.forEach(link => {
        if (link.hostname !== currentHost && link.hostname !== '') {
            link.classList.add('external-link');
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

// 添加代码复制功能
function addCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach(block => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = '复制';
        
        copyButton.addEventListener('click', async () => {
            const code = block.querySelector('code').innerText;
            try {
                await navigator.clipboard.writeText(code);
                copyButton.textContent = '已复制!';
                setTimeout(() => {
                    copyButton.textContent = '复制';
                }, 2000);
            } catch (err) {
                copyButton.textContent = '复制失败';
            }
        });
        
        block.appendChild(copyButton);
    });
}

// 添加阅读进度条
function addReadingProgress() {
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    document.body.appendChild(progress);
    
    window.addEventListener('scroll', () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / docHeight) * 100;
        progress.style.width = scrolled + '%';
    });
}

// 添加暗色模式切换动画
function addThemeTransition() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-md-color-scheme') {
                document.documentElement.classList.add('theme-transition');
                setTimeout(() => {
                    document.documentElement.classList.remove('theme-transition');
                }, 1000);
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-md-color-scheme']
    });
} 