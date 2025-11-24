let currentSellItem = null;

// 페이지 로드 시 초기화
function initInventory() {
    updateStats();
    renderInventory();
}

// 통계 업데이트
function updateStats() {
    const stats = getStats();
    const inventory = getInventory();

    document.getElementById('gold').textContent = stats.totalGold || 0;

    const itemTypes = Object.keys(inventory).length;
    const totalCount = Object.values(inventory).reduce((sum, item) => sum + item.count, 0);

    document.getElementById('itemTypes').textContent = itemTypes;
    document.getElementById('totalCount').textContent = totalCount;
}

// 인벤토리 렌더링
function renderInventory() {
    const inventory = getInventory();
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';

    const items = Object.values(inventory);

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-inventory">
                <div class="empty-icon">🌱</div>
                <div>인벤토리가 비어있습니다</div>
                <div style="font-size: 0.9em; color: #7f8c8d; margin-top: 10px;">식물을 수확하면 여기에 추가됩니다!</div>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const card = createInventoryCard(item);
        grid.appendChild(card);
    });
}

// 인벤토리 카드 생성
function createInventoryCard(item) {
    const card = document.createElement('div');
    card.className = `inventory-item rarity-${item.rarity}`;
    card.onclick = () => showSellModal(item);

    card.innerHTML = `
        <div class="item-icon">${item.emoji}</div>
        <div class="item-count">x${item.count}</div>
        <div class="item-name">${item.description}</div>
        <div class="item-value">💰 ${item.value}</div>
    `;

    return card;
}

// 판매 모달 표시
function showSellModal(item) {
    currentSellItem = item;

    document.getElementById('sellItemIcon').textContent = item.emoji;
    document.getElementById('sellItemIcon').className = `sell-item-icon rarity-${item.rarity}`;
    document.getElementById('sellItemName').textContent = item.description;
    document.getElementById('sellItemValue').textContent = item.value;
    document.getElementById('sellItemStock').textContent = item.count;

    const quantityInput = document.getElementById('sellQuantity');
    quantityInput.value = 1;
    quantityInput.max = item.count;

    updateSellTotal();

    document.getElementById('sellModal').style.display = 'flex';
}

// 판매 모달 닫기
function closeSellModal() {
    document.getElementById('sellModal').style.display = 'none';
    currentSellItem = null;
}

// 수량 변경
function changeQuantity(delta) {
    const input = document.getElementById('sellQuantity');
    const newValue = parseInt(input.value) + delta;
    const max = parseInt(input.max);

    if (newValue >= 1 && newValue <= max) {
        input.value = newValue;
        updateSellTotal();
    }
}

// 총 판매가 업데이트
function updateSellTotal() {
    if (!currentSellItem) return;

    const quantity = parseInt(document.getElementById('sellQuantity').value);
    const total = currentSellItem.value * quantity;

    document.getElementById('sellTotalValue').textContent = total;
}

// 판매 수량 입력 시 업데이트
document.addEventListener('DOMContentLoaded', () => {
    const quantityInput = document.getElementById('sellQuantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateSellTotal);
    }
});

// 판매 확인
function confirmSell() {
    if (!currentSellItem) return;

    const quantity = parseInt(document.getElementById('sellQuantity').value);
    const totalValue = sellFromInventory(currentSellItem.emoji, quantity);

    if (totalValue !== false) {
        alert(`${currentSellItem.description} x${quantity}을(를) ${totalValue}골드에 판매했습니다!`);
        closeSellModal();
        updateStats();
        renderInventory();

        // 게임 페이지의 골드도 업데이트 (리로드 시 반영됨)
    }
}

// 전부 판매
function sellAll() {
    const inventory = getInventory();
    const items = Object.values(inventory);

    if (items.length === 0) {
        alert('판매할 식물이 없습니다!');
        return;
    }

    let totalValue = 0;
    let totalItems = 0;

    items.forEach(item => {
        const value = sellFromInventory(item.emoji, item.count);
        if (value !== false) {
            totalValue += value;
            totalItems += item.count;
        }
    });

    alert(`모든 식물 (${totalItems}개)을(를) ${totalValue}골드에 판매했습니다!`);
    updateStats();
    renderInventory();
}

// 초기화
initInventory();
