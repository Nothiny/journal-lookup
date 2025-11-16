// API配置
const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1/paper/search';

// DOM元素
const paperInput = document.getElementById('paperInput');
const searchBtn = document.getElementById('searchBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsContainer = document.getElementById('resultsContainer');
const resultsList = document.getElementById('resultsList');
const errorMessage = document.getElementById('errorMessage');

// 搜索功能
async function searchPaper(query) {
    if (!query || query.trim().length === 0) {
        showError('请输入论文标题');
        return;
    }

    // 显示加载状态
    showLoading();
    hideResults();
    hideError();

    try {
        // 使用Semantic Scholar API搜索
        const response = await fetch(
            `${SEMANTIC_SCHOLAR_API}?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,venue,publicationVenue,externalIds,citationCount`
        );

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            displayResults(data.data, query);
        } else {
            showNoResults();
        }
    } catch (error) {
        console.error('搜索错误:', error);
        let errorMsg = '搜索失败，请稍后重试。';
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMsg = '网络连接失败，请检查网络设置。';
        } else if (error.message.includes('429')) {
            errorMsg = '请求过于频繁，请稍后再试。';
        } else if (error.message) {
            errorMsg = `搜索失败: ${error.message}`;
        }
        
        showError(errorMsg);
    } finally {
        hideLoading();
    }
}

// 显示搜索结果
function displayResults(papers, query) {
    resultsList.innerHTML = '';
    
    papers.forEach(paper => {
        const card = createPaperCard(paper, query);
        resultsList.appendChild(card);
    });
    
    showResults();
}

// 创建论文卡片
function createPaperCard(paper, query) {
    const card = document.createElement('div');
    card.className = 'paper-card';
    
    const title = document.createElement('div');
    title.className = 'paper-title';
    title.textContent = paper.title || '未知标题';
    card.appendChild(title);
    
    const info = document.createElement('div');
    info.className = 'paper-info';
    
    // 期刊/会议信息
    const venue = getVenueInfo(paper);
    if (venue) {
        const venueItem = createInfoItem('📖 发表位置', venue);
        info.appendChild(venueItem);
    }
    
    // 年份
    if (paper.year) {
        const yearItem = createInfoItem('📅 年份', `${paper.year}`);
        info.appendChild(yearItem);
    }
    
    // 作者
    if (paper.authors && paper.authors.length > 0) {
        const authorsText = paper.authors
            .slice(0, 5)
            .map(a => a.name || '未知作者')
            .join(', ') + (paper.authors.length > 5 ? ' 等' : '');
        const authorsItem = createInfoItem('👥 作者', authorsText);
        info.appendChild(authorsItem);
    }
    
    // 引用数
    if (paper.citationCount !== undefined) {
        const citationItem = createInfoItem('📊 引用数', paper.citationCount.toLocaleString());
        info.appendChild(citationItem);
    }
    
    // arXiv ID（如果有）
    if (paper.externalIds && paper.externalIds.ArXiv) {
        const arxivItem = createInfoItem('🔗 arXiv', `arXiv:${paper.externalIds.ArXiv}`);
        info.appendChild(arxivItem);
    }
    
    // DOI（如果有）
    if (paper.externalIds && paper.externalIds.DOI) {
        const doiItem = createInfoItem('🔗 DOI', paper.externalIds.DOI);
        info.appendChild(doiItem);
    }
    
    card.appendChild(info);
    return card;
}

// 获取期刊/会议信息
function getVenueInfo(paper) {
    // 优先使用 publicationVenue（更准确）
    if (paper.publicationVenue) {
        if (paper.publicationVenue.name) {
            return paper.publicationVenue.name;
        }
    }
    
    // 其次使用 venue
    if (paper.venue) {
        return paper.venue;
    }
    
    return null;
}

// 创建信息项
function createInfoItem(label, value) {
    const item = document.createElement('div');
    item.className = 'info-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'info-label';
    labelSpan.textContent = label;
    
    const valueSpan = document.createElement('span');
    valueSpan.className = 'info-value';
    
    // 如果是期刊名称，添加特殊样式
    if (label.includes('发表位置')) {
        valueSpan.className += ' journal-name';
    }
    
    valueSpan.textContent = value;
    
    item.appendChild(labelSpan);
    item.appendChild(valueSpan);
    
    return item;
}

// 显示/隐藏函数
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showResults() {
    resultsContainer.classList.remove('hidden');
}

function hideResults() {
    resultsContainer.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showNoResults() {
    resultsList.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>未找到相关论文</h3>
            <p>请尝试使用不同的关键词或检查拼写</p>
        </div>
    `;
    showResults();
}

// 事件监听
searchBtn.addEventListener('click', () => {
    const query = paperInput.value.trim();
    searchPaper(query);
});

paperInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = paperInput.value.trim();
        searchPaper(query);
    }
});

// 输入时实时搜索（防抖）
let searchTimeout;
let lastSearchQuery = '';

paperInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    // 如果输入为空，隐藏结果
    if (query.length === 0) {
        hideResults();
        hideError();
        hideLoading();
        lastSearchQuery = '';
        return;
    }
    
    // 如果查询与上次相同，不重复搜索
    if (query === lastSearchQuery) {
        return;
    }
    
    // 延迟搜索（防抖，500ms）
    searchTimeout = setTimeout(() => {
        if (query.length >= 3) { // 至少3个字符才开始搜索
            lastSearchQuery = query;
            searchPaper(query);
        }
    }, 500);
});

