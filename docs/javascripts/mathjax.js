window.MathJax = {
    tex: {
        inlineMath: [["\\(", "\\)"], ['$', '$']],
        displayMath: [["\\[", "\\]"], ['$$', '$$']],
        processEscapes: true,
        processEnvironments: true,
        macros: {
            R: "\\mathbb{R}",
            N: "\\mathbb{N}",
            Z: "\\mathbb{Z}",
            Q: "\\mathbb{Q}",
            C: "\\mathbb{C}"
        }
    },
    options: {
        ignoreHtmlClass: ".*|",
        processHtmlClass: "arithmatex"
    },
    loader: {
        load: ['[tex]/ams', '[tex]/newcommand', '[tex]/mathtools']
    },
    startup: {
        pageReady: () => {
            return MathJax.startup.defaultPageReady().then(() => {
                console.log('MathJax initial typesetting complete');
            });
        }
    }
}; 