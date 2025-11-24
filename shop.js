let SETTINGS = {};
let gold = 0;
let upgradeLevel = 0;
let hasGrowthBooster = false;

// JSON 파일에서 설정 로드
async function loadSettings() {
    try {
        const response = await fetch('mushroom_types.json');
        const data = await response.json();
        SETTINGS = data.settings;

        loadShopData();
        updateShopUI();
    } catch (error) {
        console.error('데이터 로드 실패:', error);
    }
}

function loadShopData() {
    const stats = getStats();
    gold = stats.totalGold || 0;
    upgradeLevel = parseInt(localStorage.getItem('upgradeLevel')) || 0;
    hasGrowthBooster = localStorage.getItem('hasGrowthBooster') === 'true';

    document.getElementById('gold').textContent = gold;
}

// 영구 속도 업그레이드
function buySpeedUpgrade() {
    const cost = 100 + (upgradeLevel * 50);

    if (gold < cost) {
        alert('골드가 부족합니다!');
        return;
    }

    gold -= cost;
    upgradeLevel++;

    localStorage.setItem('upgradeLevel', upgradeLevel);
    updateGold(gold);
    document.getElementById('gold').textContent = gold;
    updateShopUI();

    alert('속도 업그레이드를 구매했습니다! 레벨: ' + upgradeLevel);
}

// 1회용 성장 부스터 구매
function buyGrowthBooster() {
    const cost = 500;

    if (gold < cost) {
        alert('골드가 부족합니다!');
        return;
    }

    if (hasGrowthBooster) {
        alert('이미 보유하고 있습니다!');
        return;
    }

    gold -= cost;
    hasGrowthBooster = true;
    localStorage.setItem('hasGrowthBooster', 'true');

    updateGold(gold);
    document.getElementById('gold').textContent = gold;
    updateShopUI();
    alert('성장 부스터를 구매했습니다! 다음 버섯이 50% 빠르게 자랍니다.');
}

// 상점 UI 업데이트
function updateShopUI() {
    const speedCost = 100 + (upgradeLevel * 50);
    document.getElementById('speedUpgradeCost').textContent = speedCost;
    document.getElementById('speedUpgradeLevel').textContent = upgradeLevel;

    const boosterBtn = document.getElementById('boosterBtn');
    if (hasGrowthBooster) {
        boosterBtn.textContent = '✅ 보유중';
        boosterBtn.disabled = true;
        boosterBtn.style.opacity = '0.5';
    } else {
        boosterBtn.textContent = '💰 500 구매';
        boosterBtn.disabled = false;
        boosterBtn.style.opacity = '1';
    }
}

// 페이지 로드 시 초기화
loadSettings();
