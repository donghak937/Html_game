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
        'legendary': '레전더리',
        'mythic': '신화'
    };
    return names[rarity] || rarity;
}

// 희귀도별 색상
function getRarityColor(rarity) {
    const colors = {
        'common': '#95a5a6',
        'rare': '#3498db',
        'epic': '#9b59b6',
        'legendary': '#f39c12',
        'mythic': '#e74c3c'
    };
    return colors[rarity] || '#95a5a6';
}

// ===== 인벤토리 시스템 =====

// 인벤토리 데이터 가져오기
function getInventory() {
    const data = localStorage.getItem('plantInventory');
    return data ? JSON.parse(data) : {};
}

// 인벤토리 데이터 저장
function saveInventory(inventory) {
    localStorage.setItem('plantInventory', JSON.stringify(inventory));
}

// 인벤토리에 식물 추가 (스택)
function addToInventory(emoji, value, rarity, description) {
    const inventory = getInventory();

    if (!inventory[emoji]) {
        inventory[emoji] = {
            emoji,
            value,
            rarity,
            description,
            count: 0
        };
    }
    inventory[emoji].count++;

    saveInventory(inventory);
}

// 인벤토리에서 식물 판매
function sellFromInventory(emoji, quantity) {
    const inventory = getInventory();

    if (!inventory[emoji] || inventory[emoji].count < quantity) {
        alert('판매할 수 있는 수량이 부족합니다!');
        return false;
    }

    const totalValue = inventory[emoji].value * quantity;

    // 인벤토리에서 차감
    inventory[emoji].count -= quantity;
    if (inventory[emoji].count === 0) {
        delete inventory[emoji];
    }

    saveInventory(inventory);

    // 골드 추가
    const stats = getStats();
    stats.totalGold += totalValue;
    saveStats(stats);

    return totalValue;
}
