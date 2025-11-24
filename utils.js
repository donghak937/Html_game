// localStorage 키
const STORAGE_KEYS = {
    COLLECTION: 'mushroomCollection',
    STATS: 'mushroomStats'
};

// 도감 데이터 가져오기
function getCollection() {
    const data = localStorage.getItem(STORAGE_KEYS.COLLECTION);
    return data ? JSON.parse(data) : {};
}

// 도감 데이터 저장
function saveCollection(collection) {
    localStorage.setItem(STORAGE_KEYS.COLLECTION, JSON.stringify(collection));
}

// 통계 데이터 가져오기
function getStats() {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data ? JSON.parse(data) : {
        totalGold: 0,
        totalHarvested: 0,
        totalValue: 0
    };
}

// 통계 데이터 저장
function saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

// 버섯 수확 기록 추가
function recordHarvest(mushroomEmoji, value) {
    // 도감 업데이트
    const collection = getCollection();
    if (!collection[mushroomEmoji]) {
        collection[mushroomEmoji] = {
            count: 0,
            discovered: false,
            firstDiscoveredAt: null
        };
    }
    
    if (!collection[mushroomEmoji].discovered) {
        collection[mushroomEmoji].discovered = true;
        collection[mushroomEmoji].firstDiscoveredAt = new Date().toISOString();
    }
    
    collection[mushroomEmoji].count++;
    saveCollection(collection);
    
    // 통계 업데이트
    const stats = getStats();
    stats.totalHarvested++;
    stats.totalValue += value;
    saveStats(stats);
}

// 골드 업데이트
function updateGold(gold) {
    const stats = getStats();
    stats.totalGold = gold;
    saveStats(stats);
}

// 도감 완성도 계산
function getCollectionCompletion(totalMushrooms) {
    const collection = getCollection();
    const discovered = Object.values(collection).filter(item => item.discovered).length;
    const percentage = totalMushrooms > 0 ? (discovered / totalMushrooms * 100).toFixed(1) : 0;
    return {
        discovered,
        total: totalMushrooms,
        percentage
    };
}

// 희귀도별 한글 이름
function getRarityName(rarity) {
    const names = {
        'common': '일반',
        'rare': '레어',
        'epic': '에픽',
        'legendary': '레전더리'
    };
    return names[rarity] || rarity;
}

// 희귀도별 색상
function getRarityColor(rarity) {
    const colors = {
        'common': '#95a5a6',
        'rare': '#3498db',
        'epic': '#9b59b6',
        'legendary': '#f39c12'
    };
    return colors[rarity] || '#95a5a6';
}
