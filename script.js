// 獲取所有文法項目元素
const grammarItems = document.querySelectorAll('.grammar-item');
// 獲取搜尋輸入框元素
const searchInput = document.getElementById('searchInput');
// 獲取所有類別卡片元素
const categoryCards = document.querySelectorAll('.category-card');

// 建立一個用於顯示搜尋結果資訊的元素，並插入到搜尋框下方
const searchResultsInfo = document.createElement('div');
searchResultsInfo.id = 'search-results-info';
// 檢查 searchInput 是否為 null，如果為 null 則不執行後續操作，避免錯誤
if (searchInput) {
    searchInput.parentNode.insertBefore(searchResultsInfo, searchInput.nextSibling);
} else {
    console.error("錯誤：找不到 ID 為 'searchInput' 的元素。");
}


/**
 * 語音播放功能
 * 使用 Web Speech API (SpeechSynthesis) 將韓文文字轉換為語音。
 * @param {string} text - 要播放的韓文文字。
 */
function speakKorean(text) {
    // 檢查瀏覽器是否支援 SpeechSynthesis API
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR'; // 設定語言為韓語
        utterance.rate = 0.9; // 稍微放慢語速，讓發音更清晰
        utterance.pitch = 1; // 語調，1為正常語調
        speechSynthesis.speak(utterance); // 播放語音
    } else {
        // 如果不支援，則顯示自定義提示訊息
        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #333;
            color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            text-align: center;
            font-size: 1rem;
        `;
        messageBox.innerHTML = `
            <p>您的瀏覽器不支援語音播放功能。</p>
            <p>建議使用 Chrome 或 Edge 瀏覽器以獲得完整體驗。</p>
            <button style="margin-top: 15px; padding: 8px 15px; background-color: var(--primary-color); color: #fff; border: none; border-radius: 5px; cursor: pointer;">確定</button>
        `;
        document.body.appendChild(messageBox);
        messageBox.querySelector('button').addEventListener('click', () => {
            document.body.removeChild(messageBox);
        });
    }
}

// 頁面載入時初始化文法項目：
// 1. 將文法內容包裹在 .grammar-content 裡，以便控制顯示/隱藏。
// 2. 為每個文法標題添加點擊事件，實現展開/收合。
// 3. 為韓文例句和單字添加語音播放圖示。
grammarItems.forEach(item => {
    const title = item.querySelector('.grammar-title'); // 獲取文法標題
    if (!title) return; // 如果沒有標題，則跳過

    // 建立一個 div 來包裹文法內容，以便控制其顯示/隱藏
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('grammar-content');

    // 將標題之後的所有子元素移動到 contentDiv 中
    let foundTitle = false;
    const childrenToMove = Array.from(item.children).filter(child => {
        if (child === title) {
            foundTitle = true;
            return false; // 不移動標題本身
        }
        return foundTitle; // 移動標題之後的所有元素
    });
    childrenToMove.forEach(child => contentDiv.appendChild(child));
    item.appendChild(contentDiv); // 將包裹後的內容 div 加回文法項目中

    // 添加點擊標題展開/收合功能
    title.addEventListener('click', () => {
        item.classList.toggle('active'); // 切換 'active' class 來控制顯示/隱藏
    });

    // 為韓文例句和單字添加語音播放圖示
    item.querySelectorAll('.example .korean, .vocab-item').forEach(el => {
        const audioIcon = document.createElement('span');
        audioIcon.classList.add('audio-icon');
        audioIcon.innerHTML = '&#128266;'; // 喇叭圖示的 Unicode 字符
        audioIcon.title = '點擊播放韓語'; // 滑鼠懸停提示
        audioIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // 阻止事件冒泡到 .grammar-title，避免點擊喇叭時同時展開/收合
            let textToSpeak = el.textContent.trim();
            // 如果是 vocab-item，只發音韓文部分 (括號前的內容)
            if (el.classList.contains('vocab-item')) {
                const match = textToSpeak.match(/^([^(]+)/); // 匹配到第一個左括號前的所有內容
                if (match && match[1]) {
                    textToSpeak = match[1].trim();
                }
            }
            speakKorean(textToSpeak); // 播放該元素的文本內容
        });
        el.appendChild(audioIcon); // 將喇叭圖示添加到元素內部
    });
});

/**
 * 搜尋功能的核心邏輯
 * 根據搜尋詞過濾顯示文法項目和類別。
 */
// 只有當 searchInput 元素存在時才添加事件監聽器
if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim(); // 獲取搜尋詞並轉為小寫
        let matchCount = 0; // 記錄匹配到的文法點數量

        categoryCards.forEach(categoryCard => {
            let categoryMatchCount = 0; // 記錄當前類別下匹配到的文法點數量
            const grammarItemsInCategory = categoryCard.querySelectorAll('.grammar-item');

            grammarItemsInCategory.forEach(item => {
                const textContent = item.textContent.toLowerCase(); // 獲取文法項目的所有文本內容
                if (searchTerm === '' || textContent.includes(searchTerm)) {
                    item.style.display = 'block'; // 顯示匹配的文法項目
                    item.classList.add('active'); // 展開匹配的項目
                    // 當搜尋時，自動展開所有匹配的文法內容
                    item.querySelector('.grammar-content').style.display = 'block'; 
                } else {
                    item.style.display = 'none'; // 隱藏不匹配的文法項目
                    item.classList.remove('active'); // 收合不匹配的項目
                    item.querySelector('.grammar-content').style.display = 'none'; // 隱藏內容
                }
            });

            // 如果該類別下有任何匹配的文法項目，就顯示該類別卡片
            if (categoryMatchCount > 0) {
                categoryCard.style.display = 'block';
                matchCount += categoryMatchCount; // 累加總匹配數
            } else {
                categoryCard.style.display = 'none'; // 隱藏沒有匹配項目的類別卡片
            }
        });

        // 顯示搜尋結果資訊
        if (searchTerm === '') {
            searchResultsInfo.textContent = ''; // 沒有搜尋詞時清空提示
            // 當搜尋框清空時，所有項目預設為收合並顯示
            grammarItems.forEach(item => {
                item.style.display = 'block'; // 確保所有項目都顯示
                item.classList.remove('active'); // 收合所有項目
                // 確保搜尋框清空時，內容區塊預設為隱藏 (收合)
                const contentDiv = item.querySelector('.grammar-content');
                if (contentDiv) {
                    contentDiv.style.display = 'none'; 
                }
            });
            categoryCards.forEach(card => card.style.display = 'block'); // 顯示所有類別
        } else {
            searchResultsInfo.textContent = `找到 ${matchCount} 個相關文法點。`;
        }
    });
}