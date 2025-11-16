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
            `${SEMANTIC_SCHOLAR_API}?query=${encodeURIComponent(query)}&limit=10&fields=title,authors,year,venue,publicationVenue,externalIds,citationCount,paperId,url`
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

// 判断是否为arXiv发表（没有正式期刊/会议）
function isArXivOnly(paper) {
    const venue = getVenueInfo(paper);
    // 如果没有venue，或者venue是arXiv相关，且没有DOI，则认为是仅arXiv
    if (!venue) {
        return true;
    }
    // 如果venue名称包含arXiv，且没有DOI，认为是仅arXiv
    const venueLower = venue.toLowerCase();
    if ((venueLower.includes('arxiv') || venueLower.includes('preprint')) && 
        (!paper.externalIds || !paper.externalIds.DOI)) {
        return true;
    }
    return false;
}

// 判断是否有正式发表位置
function hasFormalPublication(paper) {
    const venue = getVenueInfo(paper);
    if (!venue) return false;
    
    const venueLower = venue.toLowerCase();
    
    // 如果有DOI，通常说明已正式发表（即使venue是arXiv）
    if (paper.externalIds && paper.externalIds.DOI) {
        // 但如果venue明确是arXiv且没有其他信息，仍视为预印本
        if (venueLower.includes('arxiv') && !venueLower.includes('journal') && 
            !venueLower.includes('conference') && !venueLower.includes('proceedings')) {
            return false;
        }
        return true;
    }
    
    // 排除arXiv和preprint（没有DOI的情况）
    if (venueLower.includes('arxiv') || venueLower.includes('preprint')) {
        return false;
    }
    
    // 其他情况视为正式发表
    return true;
}

// 显示搜索结果
function displayResults(papers, query) {
    resultsList.innerHTML = '';
    
    // 对结果进行排序：有正式发表的排在前面
    const sortedPapers = papers.sort((a, b) => {
        const aHasFormal = hasFormalPublication(a);
        const bHasFormal = hasFormalPublication(b);
        
        if (aHasFormal && !bHasFormal) return -1;
        if (!aHasFormal && bHasFormal) return 1;
        
        // 如果都有或都没有，按引用数排序
        const aCitations = a.citationCount || 0;
        const bCitations = b.citationCount || 0;
        return bCitations - aCitations;
    });
    
    sortedPapers.forEach((paper, index) => {
        const card = createPaperCard(paper, query);
        // 添加延迟动画
        card.style.animationDelay = `${index * 0.1}s`;
        resultsList.appendChild(card);
    });
    
    showResults();
}

// 获取论文链接
function getPaperUrl(paper) {
    // 优先使用API返回的url
    if (paper.url) {
        return paper.url;
    }
    // 如果有paperId，构建Semantic Scholar链接
    if (paper.paperId) {
        return `https://www.semanticscholar.org/paper/${paper.paperId}`;
    }
    // 如果有arXiv ID，构建arXiv链接
    if (paper.externalIds && paper.externalIds.ArXiv) {
        return `https://arxiv.org/abs/${paper.externalIds.ArXiv}`;
    }
    // 如果有DOI，构建DOI链接
    if (paper.externalIds && paper.externalIds.DOI) {
        return `https://doi.org/${paper.externalIds.DOI}`;
    }
    return null;
}

// 创建论文卡片
function createPaperCard(paper, query) {
    const card = document.createElement('div');
    card.className = 'paper-card';
    
    // 判断是否有正式发表
    const hasFormal = hasFormalPublication(paper);
    const isArXiv = isArXivOnly(paper);
    
    // 获取论文链接
    const paperUrl = getPaperUrl(paper);
    
    // 如果有链接，添加点击跳转功能
    if (paperUrl) {
        card.style.cursor = 'pointer';
        card.title = '点击查看论文详情';
        card.setAttribute('data-clickable', 'true');
        card.addEventListener('click', (e) => {
            // 如果点击的是按钮或链接，不触发卡片跳转
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            window.open(paperUrl, '_blank');
        });
        card.classList.add('clickable');
    }
    
    // 如果有正式发表，添加特殊样式
    if (hasFormal) {
        card.classList.add('has-formal-publication');
    } else if (isArXiv) {
        card.classList.add('arxiv-only');
    }
    
    const titleRow = document.createElement('div');
    titleRow.style.display = 'flex';
    titleRow.style.alignItems = 'flex-start';
    titleRow.style.gap = '10px';
    titleRow.style.marginBottom = '12px';
    
    const title = document.createElement('div');
    title.className = 'paper-title';
    title.style.flex = '1';
    title.textContent = paper.title || '未知标题';
    titleRow.appendChild(title);
    
    // 添加含金量标签
    if (hasFormal) {
        const badge = document.createElement('span');
        badge.className = 'publication-badge formal';
        badge.textContent = '✓ 正式发表';
        badge.title = '该论文已正式发表在期刊或会议上';
        titleRow.appendChild(badge);
    } else if (isArXiv) {
        const badge = document.createElement('span');
        badge.className = 'publication-badge arxiv';
        badge.textContent = '⚠ 仅arXiv';
        badge.title = '该论文仅在arXiv发表，未找到正式发表位置';
        titleRow.appendChild(badge);
    }
    
    card.appendChild(titleRow);
    
    const info = document.createElement('div');
    info.className = 'paper-info';
    
    // 期刊/会议信息（优先显示正式发表位置）
    const venue = getVenueInfo(paper);
    if (venue) {
        let venueLabel = '📖 发表位置';
        let venueValue = venue;
        
        // 如果是arXiv，明确标注
        if (isArXiv && !hasFormal) {
            venueLabel = '📄 预印本';
            venueValue = venue + ' (预印本)';
        }
        
        const venueItem = createInfoItem(venueLabel, venueValue);
        info.appendChild(venueItem);
    } else {
        // 如果没有venue信息，显示提示
        const venueItem = createInfoItem('📄 发表状态', '未找到发表信息');
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
        const arxivLink = `https://arxiv.org/abs/${paper.externalIds.ArXiv}`;
        const arxivItem = createLinkItem('🔗 arXiv', `arXiv:${paper.externalIds.ArXiv}`, arxivLink);
        info.appendChild(arxivItem);
    }
    
    // DOI（如果有）
    if (paper.externalIds && paper.externalIds.DOI) {
        const doiLink = `https://doi.org/${paper.externalIds.DOI}`;
        const doiItem = createLinkItem('🔗 DOI', paper.externalIds.DOI, doiLink);
        info.appendChild(doiItem);
    }
    
    // 添加查看详情按钮
    if (paperUrl) {
        const viewButton = document.createElement('button');
        viewButton.className = 'view-button';
        viewButton.innerHTML = '<span>🔗</span> 查看详情';
        viewButton.onclick = (e) => {
            e.stopPropagation();
            window.open(paperUrl, '_blank');
        };
        info.appendChild(viewButton);
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

// 创建链接信息项
function createLinkItem(label, value, url) {
    const item = document.createElement('div');
    item.className = 'info-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'info-label';
    labelSpan.textContent = label;
    
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'info-link';
    link.textContent = value;
    link.onclick = (e) => e.stopPropagation();
    
    item.appendChild(labelSpan);
    item.appendChild(link);
    
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

