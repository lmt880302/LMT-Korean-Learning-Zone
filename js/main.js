// js/main.js
// 韓語學習網 全域 JavaScript - 高級版

/**
 * @file 全域 JavaScript 檔案，負責網站的通用互動功能。
 * @author Bard (重構者)
 * @version 2.2.0
 */

/**
 * 應用程式設定與常數
 * @namespace AppConfig
 */
const AppConfig = {
    HIGHLIGHT_ACTIVE_NAV: true,
    ENABLE_SMOOTH_SCROLL: true,
    ENABLE_BACK_TO_TOP: true,
    BACK_TO_TOP_DEFAULTS: {
        thresholdPx: 300, // 捲動超過多少 px 時顯示按鈕
        buttonClasses: 'fixed bottom-8 right-8 bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-full shadow-lg transition-opacity duration-300 opacity-0 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 print:hidden',
        svgIcon: `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
            <span class="sr-only">回到頂部</span>
        `,
        ariaLabel: '回到頂部',
        scrollThrottleLimit: 150, // for scroll listener fallback
    },
    ACTIVE_NAV_CLASSES: ['text-white', 'bg-gray-700'],
    INACTIVE_NAV_CLASSES: ['text-gray-300', 'hover:text-white', 'hover:bg-gray-700'],
};

/**
 * 函數節流 (Throttle)
 * 在指定的時間間隔內，最多只會執行一次回呼函式。
 * @param {Function} func - 要節流的函式。
 * @param {number} limit - 時間間隔 (毫秒)。
 * @returns {Function} - 經過節流處理的函式。
 */
function throttle(func, limit) {
    let inThrottle;
    let lastFunc;
    let lastRan;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            lastRan = Date.now();
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastFunc) {
                    lastFunc.apply(context, args);
                    lastFunc = null; // Clear lastFunc after executing
                }
            }, limit);
        } else {
            // Store the latest arguments and update lastFunc
            lastFunc = () => {
                // Check if enough time has passed since lastRan if we want to run immediately after throttle period ends
                if (Date.now() - lastRan >= limit) {
                     func.apply(context, args);
                     lastRan = Date.now();
                } else {
                    // Re-queue if not enough time passed (e.g., for trailing edge)
                    // This part can be complex depending on desired throttle behavior (leading/trailing edge)
                    // For simplicity, this version primarily focuses on not overcrowding calls.
                }
            };
        }
    };
}


/**
 * 回到頂部按鈕類別
 */
class BackToTopButton {
    /**
     * @param {object} [options={}] - 按鈕的設定選項。
     * @param {number} [options.thresholdPx] - 顯示按鈕的捲動閾值。
     * @param {string} [options.buttonClasses] - 按鈕的 CSS 類別。
     * @param {string} [options.svgIcon] - 按鈕的 SVG 圖示 HTML。
     * @param {string} [options.ariaLabel] - 按鈕的 aria-label。
     * @param {number} [options.scrollThrottleLimit] - 捲動監聽節流的間隔。
     */
    constructor(options = {}) {
        this.config = { ...AppConfig.BACK_TO_TOP_DEFAULTS, ...options };
        this.element = null;
        this.scrollTriggerElement = null; // 用於 IntersectionObserver 的觸發元素
        this.isIntersecting = true; // 初始狀態，假設觸發元素在視窗內 (頁面頂部)

        this._init();
    }

    _createButton() {
        const button = document.createElement('button');
        button.innerHTML = this.config.svgIcon;
        button.className = this.config.buttonClasses;
        button.style.zIndex = "1000";
        button.setAttribute('aria-label', this.config.ariaLabel);
        button.setAttribute('type', 'button');
        button.setAttribute('aria-hidden', 'true'); // 初始隱藏
        button.style.visibility = 'hidden'; // 初始隱藏
        return button;
    }

    _createScrollTrigger() {
        this.scrollTriggerElement = document.createElement('div');
        this.scrollTriggerElement.style.position = 'absolute';
        this.scrollTriggerElement.style.height = '1px';
        this.scrollTriggerElement.style.width = '1px';
        this.scrollTriggerElement.style.top = `${this.config.thresholdPx}px`;
        this.scrollTriggerElement.style.left = '0';
        this.scrollTriggerElement.style.pointerEvents = 'none';
        document.body.insertBefore(this.scrollTriggerElement, document.body.firstChild); // 插入到 body 開頭
    }

    _updateVisibility(isVisible) {
        this.element.classList.toggle('opacity-100', isVisible);
        this.element.classList.toggle('opacity-0', !isVisible);
        this.element.style.visibility = isVisible ? 'visible' : 'hidden';
        this.element.setAttribute('aria-hidden', String(!isVisible));
    }

    _setupVisibilityObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn("BackToTopButton: IntersectionObserver not supported. Falling back to scroll listener.");
            this._setupLegacyScrollListener();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                // isIntersecting is true if the trigger element is in view.
                // We want to show the button when the trigger IS NOT in view AND we've scrolled past it.
                this.isIntersecting = entry.isIntersecting;
                const scrolledPastThreshold = window.pageYOffset > this.config.thresholdPx;

                // Show if trigger is not visible (scrolled past) OR if it's visible but we are below its initial position (edge case for refresh)
                // A simpler logic: show button if `window.pageYOffset` is greater than threshold.
                // IntersectionObserver tells us *when the trigger's visibility changes*.
                // If trigger element is at 300px, and it's NOT intersecting, means we scrolled below 300px.
                this._updateVisibility(!entry.isIntersecting && entry.boundingClientRect.top < 0);

            },
            {
                root: null, // viewport
                rootMargin: '0px',
                threshold: 0, // Trigger as soon as it (partially) enters/leaves viewport
            }
        );
        observer.observe(this.scrollTriggerElement);
    }

    _setupLegacyScrollListener() {
        const throttledScrollHandler = throttle(() => {
            const isVisible = window.pageYOffset > this.config.thresholdPx;
            this._updateVisibility(isVisible);
        }, this.config.scrollThrottleLimit);

        window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    }

    _scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        this.element.blur(); // Remove focus after click
    }

    _init() {
        this.element = this._createButton();
        document.body.appendChild(this.element);

        // Only create trigger and observe if threshold is positive
        if (this.config.thresholdPx > 0) {
            this._createScrollTrigger();
            this._setupVisibilityObserver();
        } else { // If threshold is 0 or less, always show (or handle as per requirement)
            this._updateVisibility(true); // Or never show if that's the intent for threshold <= 0
        }


        this.element.addEventListener('click', () => this._scrollToTop());
    }
}

/**
 * DOMContentLoaded 事件觸發後執行的主函數
 */
function initializeGlobalScripts() {
    console.log(`main.js v${AppConfig.version || '2.2.0'} loaded - 韓語學習網初始化開始`); // Added version to log

    if (AppConfig.HIGHLIGHT_ACTIVE_NAV) {
        highlightActiveNavLink();
    }

    if (AppConfig.ENABLE_SMOOTH_SCROLL) {
        setupSmoothScrolling();
    }

    if (AppConfig.ENABLE_BACK_TO_TOP) {
        new BackToTopButton({ thresholdPx: AppConfig.BACK_TO_TOP_DEFAULTS.thresholdPx });
    }

    console.log("韓語學習網 main.js 功能初始化完畢。");
}
AppConfig.version = '2.2.0'; // Define version for logging

/**
 * @function normalizePathForComparison
 * (與前版相同)
 */
function normalizePathForComparison(path) {
    if (path.endsWith('/')) {
        return path + 'index.html';
    }
    return path;
}

/**
 * @function highlightActiveNavLink
 * 高亮目前頁面對應的導覽列連結。
 */
function highlightActiveNavLink() {
    const navLinks = document.querySelectorAll('header nav a[href]');
    if (!navLinks.length) {
        console.warn("導覽列高亮：未找到任何帶 href 的導覽列連結。");
        return;
    }

    const currentLocation = new URL(window.location.href);
    const currentPathname = normalizePathForComparison(currentLocation.pathname);

    navLinks.forEach(link => {
        const linkUrl = new URL(link.href); // link.href is absolute
        const linkPathname = normalizePathForComparison(linkUrl.pathname);
        const isActive = linkPathname === currentPathname;

        if (isActive) {
            link.classList.remove(...AppConfig.INACTIVE_NAV_CLASSES);
            link.classList.add(...AppConfig.ACTIVE_NAV_CLASSES);
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove(...AppConfig.ACTIVE_NAV_CLASSES);
            link.classList.add(...AppConfig.INACTIVE_NAV_CLASSES);
            link.removeAttribute('aria-current');
        }
    });
}

/**
 * @function setupSmoothScrolling
 * (與前版相同)
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            if (hrefAttribute && hrefAttribute.length > 1 && hrefAttribute.startsWith('#')) {
                try {
                    const targetElement = document.querySelector(hrefAttribute);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    } else {
                        console.warn(`平滑捲動警告：找不到目標元素 ${hrefAttribute}`);
                    }
                } catch (error) {
                    console.warn(`平滑捲動警告：無效的選擇器 ${hrefAttribute}`, error);
                }
            }
        });
    });
}

// --- 初始化 ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGlobalScripts);
} else {
    initializeGlobalScripts();
}