// js/main.js
// 韓語學習網 全域 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log("main.js loaded and DOM fully parsed - 韓語學習網");

    // --- 1. 導覽列目前頁面高亮 ---
    const navLinks = document.querySelectorAll('header nav a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // Get current page file name

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop() || 'index.html';
        if (linkPath === currentPath) {
            link.classList.add('text-white', 'bg-gray-700'); // Active styles
            link.classList.remove('text-gray-300', 'hover:text-white');
        } else {
            link.classList.add('text-gray-300', 'hover:text-white');
            link.classList.remove('text-white', 'bg-gray-700');
        }
    });

    // --- 2. 全域平滑捲動 ---
    // (此功能已部分存在於 grammar/index.html，這裡提供一個更通用的版本)
    // 如果 grammar/index.html 中的版本已滿足需求，可以選擇性移除或調整此部分
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            // 確保 href 不是只有 "#" (通常用於空連結或觸發 JS)
            if (hrefAttribute.length > 1 && hrefAttribute.startsWith('#')) {
                const targetElement = document.querySelector(hrefAttribute);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- 3. 回到頂部按鈕 ---
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
        </svg>
    `;
    backToTopButton.className = 'fixed bottom-8 right-8 bg-teal-500 hover:bg-teal-600 text-white p-3 rounded-full shadow-lg transition-opacity duration-300 opacity-0 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75';
    backToTopButton.style.zIndex = "1000"; // Ensure it's above other content
    backToTopButton.setAttribute('aria-label', '回到頂部');
    document.body.appendChild(backToTopButton);

    // 顯示/隱藏 回到頂部按鈕
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // 捲動超過 300px 時顯示
            backToTopButton.classList.remove('opacity-0');
            backToTopButton.classList.add('opacity-100');
        } else {
            backToTopButton.classList.remove('opacity-100');
            backToTopButton.classList.add('opacity-0');
        }
    });

    // 回到頂部按鈕點擊事件
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- 未來可能添加的功能 ---
    // 4. 主題切換功能 (例如：從 localStorage 讀取偏好)
    // 5. 使用者偏好設定 (例如：字體大小)
    // 6. 更複雜的導覽列互動 (例如：手機版的漢堡選單)
    // 7. 圖片懶載入 (Lazy loading for images)
    // 8. 頁面載入動畫或進度條

    console.log("韓語學習網 main.js 功能初始化完畢。");
});
