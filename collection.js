let allMushrooms = [];
let currentFilter = 'all';

// 페이지 로드 시 데이터 로드
async function initCollection() {
    try {
        const response = await fetch('mushroom_types.json');
        const data = await response.json();
        allMushrooms = data.mushrooms;

        updateCompletionStats();
        renderMushrooms();
    } catch (error) {
        console.error('버섯 데이터 로드 실패:', error);
        alert('데이터를 불러올 수 없습니다.');
    }
}

// 완성도 통계 업데이트
function updateCompletionStats() {
    const completion = getCollectionCompletion(allMushrooms.length);

    document.getElementById('discoveredCount').textContent = completion.discovered;
    document.getElementById('totalCount').textContent = completion.total;
    document.getElementById('completionPercent').textContent = completion.percentage + '%';

    const progressBar = document.getElementById('completionBar');
    progressBar.style.width = completion.percentage + '%';
}

// 버섯 카드 렌더링
function renderMushrooms() {
    const collection = getCollection();
    const grid = document.getElementById('mushroomGrid');
    grid.innerHTML = '';

    // 필터링
    let filtered = allMushrooms;
    if (currentFilter !== 'all') {
        if (currentFilter === 'discovered') {
            filtered = allMushrooms.filter(m => collection[m.emoji]?.discovered);
        } else if (currentFilter === 'undiscovered') {
            filtered = allMushrooms.filter(m => !collection[m.emoji]?.discovered);
        } else {
            filtered = allMushrooms.filter(m => m.rarity === currentFilter);
        }
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-mushrooms">
                <div class="no-mushrooms-icon">🔍</div>
                <div>이 카테고리에는 버섯이 없습니다</div>
            </div>
        `;
        return;
    }

    // 카드 생성
    filtered.forEach(mushroom => {
        const card = createMushroomCard(mushroom, collection[mushroom.emoji]);
        grid.appendChild(card);
    });
}

// 버섯 카드 생성
function createMushroomCard(mushroom, collectionData) {
    const card = document.createElement('div');
    const isDiscovered = collectionData?.discovered || false;
    const count = collectionData?.count || 0;

    card.className = `mushroom-card ${!isDiscovered ? 'undiscovered' : ''}`;

    // 발견한 버섯은 클릭 가능
    if (isDiscovered) {
        card.style.cursor = 'pointer';
        card.onclick = () => showMushroomDetail(mushroom, collectionData);
    }

    // 최근 발견 여부 (24시간 이내)
    const isNew = collectionData?.firstDiscoveredAt &&
        (Date.now() - new Date(collectionData.firstDiscoveredAt).getTime()) < 24 * 60 * 60 * 1000;

    const rarityColor = getRarityColor(mushroom.rarity);

    card.innerHTML = `
        ${isNew ? '<div class="new-badge">NEW!</div>' : ''}
        <div class="mushroom-icon ${isDiscovered ? 'rarity-' + mushroom.rarity : ''}">
            ${isDiscovered ? mushroom.emoji : '❓'}
        </div>
        <div class="mushroom-name">
            ${isDiscovered ? mushroom.description : '???'}
        </div>
        <div class="mushroom-rarity" style="background: ${rarityColor}">
            ${getRarityName(mushroom.rarity)}
        </div>
        ${isDiscovered ? `
            <div class="mushroom-stats">
                <div class="stat-row">
                    <span>골드 가치:</span>
                    <span class="stat-value">💰 ${mushroom.value}</span>
                </div>
                <div class="stat-row">
                    <span>수확 횟수:</span>
                    <span class="stat-value">🍄 ${count}</span>
                </div>
                <div class="stat-row">
                    <span>출현 확률:</span>
                    <span class="stat-value">${calculateProbability(mushroom.weight)}%</span>
                </div>
            </div>
        ` : `
            <div class="mushroom-stats">
                <div class="stat-row">
                    <span style="color: #95a5a6; font-style: italic;">아직 발견하지 못했습니다</span>
                </div>
            </div>
        `}
    `;

    return card;
}

// 버섯 상세 정보 모달 표시
function showMushroomDetail(mushroom, collectionData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const rarityColor = getRarityColor(mushroom.rarity);
    const totalValue = mushroom.value * collectionData.count;
    const firstFound = collectionData.firstDiscoveredAt ?
        new Date(collectionData.firstDiscoveredAt).toLocaleString('ko-KR') : '알 수 없음';

    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <div class="modal-header">
                <div class="modal-mushroom-icon rarity-${mushroom.rarity}">
                    ${mushroom.emoji}
                </div>
                <div class="modal-mushroom-name">${mushroom.description}</div>
                <div class="modal-rarity" style="background: ${rarityColor}">
                    ${getRarityName(mushroom.rarity)}
                </div>
            </div>
            <div class="modal-stats">
                <div class="modal-stat-row">
                    <span class="modal-stat-label">💰 골드 가치</span>
                    <span class="modal-stat-value">${mushroom.value}</span>
                </div>
                <div class="modal-stat-row">
                    <span class="modal-stat-label">🍄 수확 횟수</span>
                    <span class="modal-stat-value">${collectionData.count}</span>
                </div>
                <div class="modal-stat-row">
                    <span class="modal-stat-label">💎 총 획득 골드</span>
                    <span class="modal-stat-value">${totalValue}</span>
                </div>
                <div class="modal-stat-row">
                    <span class="modal-stat-label">📊 출현 확률</span>
                    <span class="modal-stat-value">${calculateProbability(mushroom.weight)}%</span>
                </div>
                <div class="modal-stat-row">
                    <span class="modal-stat-label">🎯 희귀도 가중치</span>
                    <span class="modal-stat-value">${mushroom.weight}</span>
                </div>
                <div class="modal-stat-row">
                    <span class="modal-stat-label">⏰ 첫 발견</span>
                    <span class="modal-stat-value" style="font-size: 0.9em;">${firstFound}</span>
                </div>
            </div>
            <div class="modal-description">
                ${getMushroomDescription(mushroom.rarity)}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 오버레이 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// 모달 닫기
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 희귀도별 설명
function getMushroomDescription(rarity) {
    const descriptions = {
        'common': '자주 볼 수 있는 평범한 버섯입니다. 하지만 그 가치는 결코 무시할 수 없죠!',
        'rare': '꽤 귀한 버섯입니다. 발견하면 행운이라고 할 수 있어요!',
        'epic': '매우 희귀한 버섯입니다. 만나기 어려운 만큼 가치도 높아요!',
        'legendary': '전설의 버섯! 극도로 희귀하며, 발견하는 것만으로도 영광입니다!'
    };
    return descriptions[rarity] || '신비로운 버섯입니다.';
}

// 확률 계산
function calculateProbability(weight) {
    const totalWeight = allMushrooms.reduce((sum, m) => sum + m.weight, 0);
    return ((weight / totalWeight) * 100).toFixed(1);
}

// 필터 설정
function setFilter(filter) {
    currentFilter = filter;

    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter-' + filter).classList.add('active');

    renderMushrooms();
}

// 데이터 초기화
function resetCollection() {
    if (confirm('정말로 도감 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        localStorage.clear();
        location.reload();
    }
}

// 페이지 로드 시 초기화
initCollection();
