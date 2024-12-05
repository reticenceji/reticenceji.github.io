document.addEventListener('DOMContentLoaded', function () {
    // 代码块优化
    enhanceCodeBlocks();

    // 图片优化
    enhanceImages();

    // 添加目录滚动监听
    addTocHighlight();

    // 添加外部链接图标
    markExternalLinks();

    // 查找所有 h2 标题
    const headers = document.querySelectorAll('h2');

    headers.forEach(header => {
        console.log(header.textContent.trim());
        if (header.textContent.trim() === '参考链接') {
            // 创建新的 div 元素
            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'references';

            // 将标题元素包在新的 div 中
            header.parentNode.insertBefore(wrapperDiv, header);
            wrapperDiv.appendChild(header);

            // 将后续的元素（直到下一个标题）也移到这个 div 中
            let nextElement = wrapperDiv.nextElementSibling;
            while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
                const currentElement = nextElement;
                nextElement = nextElement.nextElementSibling;
                wrapperDiv.appendChild(currentElement);
            }
        }
    });
});

// 代码块优化
function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {

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

// 目录滚动监听
function addTocHighlight() {
    const headings = document.querySelectorAll('.md-content h1, .md-content h2, .md-content h3');
    const tocLinks = document.querySelectorAll('.md-nav__link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.href && link.href.split('#')[1] === entry.target.id) {
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

// 渲染[!NOTE]/[!WARN]/[!ERROR]块
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('blockquote p').forEach(function (p) {
        if (p.textContent.startsWith('[!NOTE]')) {
            const blockquote = p.parentNode;
            blockquote.classList.add('note');
            p.innerHTML = p.innerHTML.replace('[!NOTE]', '');
        } else if (p.textContent.startsWith('[!WARN]')) {
            const blockquote = p.parentNode;
            blockquote.classList.add('warn');
            p.innerHTML = p.innerHTML.replace('[!WARNING]', '');
        } else if (p.textContent.startsWith('[!ERROR]')) {
            const blockquote = p.parentNode;
            blockquote.classList.add('error');
            p.innerHTML = p.innerHTML.replace('[!ERROR]', '');
        }
    });
});