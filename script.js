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
        // 如果不支援，則彈出提示
        // 由於 Canvas 環境限制，避免使用 alert()
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

/**
 * 呼叫 Gemini API 生成內容
 * @param {string} promptText - 傳送給 Gemini API 的請求文字
 * @param {HTMLElement} outputElement - 顯示結果的 DOM 元素
 * @param {HTMLElement} loadingSpinner - 加載指示器 DOM 元素
 * @param {HTMLElement} errorElement - 錯誤訊息 DOM 元素
 */
async function callGeminiAPI(promptText, outputElement, loadingSpinner, errorElement) {
    loadingSpinner.style.display = 'block'; // 顯示加載旋轉器
    outputElement.innerHTML = ''; // 清空先前的輸出內容
    errorElement.style.display = 'none'; // 隱藏先前的錯誤訊息

    try {
        const chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: promptText }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // Canvas 環境會自動提供 API Key
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API 錯誤：${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            // 將換行符轉換為 <br> 標籤以便在 HTML 中正確顯示換行
            outputElement.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`; 
        } else {
            throw new Error("API 回應格式不正確或內容缺失。");
        }
    } catch (error) {
        console.error("生成 Gemini 回應時發生錯誤：", error);
        errorElement.textContent = `生成內容失敗：${error.message}。請稍後再試。`;
        errorElement.style.display = 'block';
    } finally {
        loadingSpinner.style.display = 'none'; // 隱藏加載旋轉器
    }
}

// 頁面載入時初始化文法項目：
// 1. 將文法內容包裹在 .grammar-content 裡，以便控制顯示/隱藏。
// 2. 為每個文法標題添加點擊事件，實現展開/收合。
// 3. 為韓文例句和單字添加語音播放圖示。
// 4. 為每個文法項目添加 Gemini API 相關按鈕和顯示區塊。
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

    // --- 新增 Gemini API 相關功能按鈕 ---
    // 創建 Gemini 功能按鈕容器
    const geminiFeaturesDiv = document.createElement('div');
    geminiFeaturesDiv.classList.add('gemini-features');

    // 創建 "擴展解釋" 按鈕
    const explainButton = document.createElement('button');
    explainButton.classList.add('gemini-button');
    explainButton.dataset.action = 'explain';
    explainButton.innerHTML = '✨ 擴展解釋';
    geminiFeaturesDiv.appendChild(explainButton);

    // 創建 "更多例句" 按鈕
    const examplesButton = document.createElement('button');
    examplesButton.classList.add('gemini-button');
    examplesButton.dataset.action = 'examples';
    examplesButton.innerHTML = '✨ 更多例句';
    geminiFeaturesDiv.appendChild(examplesButton);

    // 創建 "情境對話" 按鈕
    const conversationButton = document.createElement('button');
    conversationButton.classList.add('gemini-button');
    conversationButton.dataset.action = 'conversation';
    conversationButton.innerHTML = '💬 情境對話';
    geminiFeaturesDiv.appendChild(conversationButton);

    contentDiv.appendChild(geminiFeaturesDiv); // 將按鈕容器添加到文法內容區塊

    // 創建 Gemini 回應顯示區塊
    const geminiResponseArea = document.createElement('div');
    geminiResponseArea.classList.add('gemini-response-area');
    contentDiv.appendChild(geminiResponseArea);

    // 添加加載旋轉器
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    loadingSpinner.style.display = 'none'; // 預設隱藏
    geminiResponseArea.appendChild(loadingSpinner);

    // 添加輸出內容區塊
    const geminiOutput = document.createElement('div');
    geminiOutput.classList.add('gemini-output');
    geminiResponseArea.appendChild(geminiOutput);

    // 添加錯誤訊息區塊
    const geminiError = document.createElement('div');
    geminiError.classList.add('gemini-error');
    geminiError.style.display = 'none'; // 預設隱藏
    geminiResponseArea.appendChild(geminiError);

    // 從文法標題中提取韓文文法點作為 prompt 的輸入
    const grammarParticleSpan = title.querySelector('.particle');
    const grammarTextForPrompt = grammarParticleSpan ? grammarParticleSpan.textContent.trim() : title.textContent.trim().split(' ')[0];

    // 為 Gemini 按鈕添加事件監聽器
    explainButton.addEventListener('click', () => {
        const prompt = `請用繁體中文詳細解釋韓語文法 "${grammarTextForPrompt}" 的用法，並提供一個新的韓文例句及其繁體中文翻譯。請直接提供解釋和例句，不要包含任何開頭或結尾的寒暄。`;
        callGeminiAPI(prompt, geminiOutput, loadingSpinner, geminiError);
    });

    examplesButton.addEventListener('click', () => {
        const prompt = `請為韓語文法 "${grammarTextForPrompt}" 提供三個新的韓文例句及其繁體中文翻譯。每個例句請用換行符分隔，並在韓文例句後直接提供中文翻譯。請直接提供例句，不要包含任何開頭或結尾的寒暄。`;
        callGeminiAPI(prompt, geminiOutput, loadingSpinner, geminiError);
    });

    conversationButton.addEventListener('click', () => {
        const prompt = `請為韓語文法 "${grammarTextForPrompt}" 設計一個簡短的韓語情境對話或段落，並提供繁體中文翻譯。請直接提供對話或段落，不要包含任何開頭或結尾的寒暄。`;
        callGeminiAPI(prompt, geminiOutput, loadingSpinner, geminiError);
    });
});

// --- 新增全局的句子修正功能區塊 ---
const mainContainer = document.querySelector('.container');

// 創建句子修正區塊
const sentenceCorrectionSection = document.createElement('div');
sentenceCorrectionSection.classList.add('sentence-correction-section');
sentenceCorrectionSection.innerHTML = `
    <h3>✨ 韓語句子修正</h3>
    <div class="sentence-input-area">
        <textarea id="koreanSentenceInput" placeholder="請輸入您想修正的韓語句子..."></textarea>
        <button id="correctSentenceButton">檢查並修正</button>
    </div>
    <div class="gemini-response-area" id="sentenceCorrectionResponseArea">
        <div class="loading-spinner" style="display: none;"></div>
        <div class="gemini-output"></div>
        <div class="gemini-error" style="display: none;"></div>
    </div>
`;
mainContainer.appendChild(sentenceCorrectionSection);

// 獲取句子修正相關元素
const koreanSentenceInput = document.getElementById('koreanSentenceInput');
const correctSentenceButton = document.getElementById('correctSentenceButton');
const sentenceCorrectionResponseArea = document.getElementById('sentenceCorrectionResponseArea');
const sentenceCorrectionLoadingSpinner = sentenceCorrectionResponseArea.querySelector('.loading-spinner');
const sentenceCorrectionOutput = sentenceCorrectionResponseArea.querySelector('.gemini-output');
const sentenceCorrectionError = sentenceCorrectionResponseArea.querySelector('.gemini-error');

// 為句子修正按鈕添加事件監聽器
if (correctSentenceButton) {
    correctSentenceButton.addEventListener('click', () => {
        const sentence = koreanSentenceInput.value.trim();
        if (sentence) {
            const prompt = `請檢查並修正以下韓語句子，然後提供修正後的句子以及詳細的繁體中文解釋（說明哪裡有錯，為什麼錯，以及如何修正）。請直接提供修正內容和解釋，不要包含任何開頭或結尾的寒暄。\n\n句子："${sentence}"`;
            callGeminiAPI(prompt, sentenceCorrectionOutput, sentenceCorrectionLoadingSpinner, sentenceCorrectionError);
        } else {
            sentenceCorrectionOutput.innerHTML = '<p style="color: #ffc107;">請輸入要修正的韓語句子。</p>';
            sentenceCorrectionError.style.display = 'none';
        }
    });
}


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
                    categoryMatchCount++;
                } else {
                    item.style.display = 'none'; // 隱藏不匹配的文法項目
                    item.classList.remove('active'); // 收合不匹配的項目
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
            });
            categoryCards.forEach(card => card.style.display = 'block'); // 顯示所有類別
        } else {
            searchResultsInfo.textContent = `找到 ${matchCount} 個相關文法點。`;
        }
    });
}