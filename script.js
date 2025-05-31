document.addEventListener('DOMContentLoaded', function() {
    // 選取所有分類標題元素
    const categoryTitles = document.querySelectorAll('.category-title');

    // 為每個分類標題添加點擊事件監聽器
    categoryTitles.forEach(title => {
        // 預設將所有內容區塊收起來，並給標題添加 'collapsed' 樣式
        const content = title.nextElementSibling; // 獲取標題後緊鄰的兄弟元素 (即 .category-content)
        if (content && content.classList.contains('category-content')) {
            content.style.maxHeight = null; // 清除內聯樣式，讓 CSS 控制
            content.classList.remove('open'); // 確保初始是關閉狀態
            title.classList.add('collapsed'); // 箭頭初始指向左邊 (收合)
        }

        title.addEventListener('click', function() {
            // 切換 'collapsed' class 來改變箭頭方向
            this.classList.toggle('collapsed');

            // 找到該標題對應的內容區塊
            const contentToToggle = this.nextElementSibling;

            if (contentToToggle && contentToToggle.classList.contains('category-content')) {
                // 切換 'open' class 來觸發 CSS 的展開/收合動畫
                contentToToggle.classList.toggle('open');

                // 如果內容區塊是展開的，則設定 max-height
                // 如果是收合的，則將 max-height 設為 null (或 0)，讓 CSS transition 生效
                if (contentToToggle.classList.contains('open')) {
                    // 確保動畫從 0 開始，並在展開後設為內容的實際高度，或一個足夠大的值
                    // 這裡我們直接依賴 CSS 中的 max-height: 5000px;
                } else {
                    // 收合時，依賴 CSS 的 max-height: 0;
                }
            }
        });
    });

    // (可選) 預設展開第一個分類
    const firstTitle = document.querySelector('.category-title');
    const firstContent = document.querySelector('.category-content');
    if (firstTitle && firstContent) {
        firstTitle.classList.remove('collapsed'); // 移除收合樣式，箭頭向下
        firstContent.classList.add('open'); // 打開內容
    }
});