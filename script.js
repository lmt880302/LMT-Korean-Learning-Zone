<script>
    // 獲取所有文法項目
    const grammarItems = document.querySelectorAll('.grammar-item');
    const searchInput = document.querySelector('.search-box input');
    const categoryCards = document.querySelectorAll('.category-card');
    const searchResultsInfo = document.createElement('div'); // 建立一個用於顯示搜尋結果資訊的元素
    searchResultsInfo.id = 'search-results-info';
    searchInput.parentNode.insertBefore(searchResultsInfo, searchInput.nextSibling); // 插入到搜尋框下方

    // 語音播放功能 (使用 Web Speech API - SpeechSynthesis)
    function speakKorean(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR'; // 設定韓語
            utterance.rate = 0.9; // 稍微放慢語速，讓發音更清晰
            utterance.pitch = 1; // 語調
            speechSynthesis.speak(utterance);
        } else {
            alert('您的瀏覽器不支援語音播放功能。請嘗試使用 Chrome 或 Edge 瀏覽器。');
        }
    }

    // 初始化：將所有文法內容包裹在 .grammar-content 裡，並預設隱藏
    grammarItems.forEach(item => {
        // 將 .explanation, .example, .vocabulary, .mnemonic 包裹起來
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('grammar-content');

        // 將子元素移動到 contentDiv 中
        const children = Array.from(item.children); // 獲取所有子元素
        let foundTitle = false;
        children.forEach(child => {
            if (child.classList.contains('grammar-title')) {
                foundTitle = true; // 找到標題，從此開始將後續元素移入 contentDiv
            } else if (foundTitle) {
                contentDiv.appendChild(child);
            }
        });
        item.appendChild(contentDiv); // 將 contentDiv 加回 grammar-item

        // 添加點擊標題展開/收合功能
        const title = item.querySelector('.grammar-title');
        if (title) {
            title.addEventListener('click', () => {
                item.classList.toggle('active'); // 切換 'active' class
            });
        }

        // 為韓文例句和單字添加語音播放圖示
        item.querySelectorAll('.example .korean, .vocab-item').forEach(el => {
            const audioIcon = document.createElement('span');
            audioIcon.classList.add('audio-icon');
            audioIcon.innerHTML = '&#128266;'; // 喇叭圖示 &#128266;
            audioIcon.title = '點擊播放韓語';
            audioIcon.addEventListener('click', (event) => {
                event.stopPropagation(); // 阻止事件冒泡到 .grammar-title
                speakKorean(el.textContent.trim());
            });
            el.appendChild(audioIcon);
        });
    });


    // 搜尋功能
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        let matchCount = 0;
        let visibleCategories = 0;

        categoryCards.forEach(categoryCard => {
            let categoryMatchCount = 0;
            const grammarItemsInCategory = categoryCard.querySelectorAll('.grammar-item');
            const categoryTitle = categoryCard.querySelector('.category-title');

            grammarItemsInCategory.forEach(item => {
                const textContent = item.textContent.toLowerCase();
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
                visibleCategories++;
                matchCount += categoryMatchCount;
            } else {
                categoryCard.style.display = 'none';
            }
        });

        // 顯示搜尋結果資訊
        if (searchTerm === '') {
            searchResultsInfo.textContent = ''; // 沒有搜尋詞時清空
            // 當搜尋框清空時，所有項目預設為收合
            grammarItems.forEach(item => {
                item.style.display = 'block'; // 確保所有項目都顯示
                item.classList.remove('active'); // 收合
            });
            categoryCards.forEach(card => card.style.display = 'block'); // 顯示所有類別
        } else {
            searchResultsInfo.textContent = `找到 ${matchCount} 個相關文法點。`;
        }
    });
</script>