let MUSHROOM_TYPES = [];
let SETTINGS = {};
let mushrooms = [];
let gold = 0;
let harvested = 0;
let upgradeLevel = 0;
let currentInterval = 0;
let growthTimer = null;
let totalSlots = 24;

// 먹이 시스템
let foodActive = false;
let foodEndTime = 0;
let foodGrowthMultiplier = 1.0;
let currentFoodType = null;
let foodGaugeInterval = null;

// 아이템
let hasGrowthBooster = false;  // 1회용 성장 가속

const mushroomField = document.getElementById('mushroomField');

// JSON 파일에서 버섯 데이터 로드
async function loadMushroomData() {
    try {
        const response = await fetch('mushroom_types.json');
        const data = await response.json();

        MUSHROOM_TYPES = data.mushrooms;
        SETTINGS = data.settings;
        totalSlots = SETTINGS.totalSlots;
        currentInterval = SETTINGS.baseGrowthInterval;

        mushrooms = new Array(totalSlots).fill(null);

        // 슬롯 초기화
        for (let i = 0; i < totalSlots; i++) {
            const slot = document.createElement('div');
            slot.className = 'mushroom-slot';
            slot.id = `slot-${i}`;
            mushroomField.appendChild(slot);
        }

        // 저장된 통계 불러오기
        loadGameData();
        initGame();
    } catch (error) {
        console.error('버섯 데이터 로드 실패:', error);
        alert('게임 데이터를 불러올 수 없습니다. mushroom_types.json 파일을 확인해주세요.');
    }
}

function loadGameData() {
    const stats = getStats();
    gold = stats.totalGold || 0;
    harvested = stats.totalHarvested || 0;
    upgradeLevel = parseInt(localStorage.getItem('upgradeLevel')) || 0;
    hasGrowthBooster = localStorage.getItem('hasGrowthBooster') === 'true';

    // 먹이 상태 복원
    loadFoodState();

    updateStats();
}

// 먹이 상태 저장
function saveFoodState() {
    const foodState = {
        foodActive,
        foodEndTime,
        foodGrowthMultiplier,
        currentFoodType
    };
    localStorage.setItem('foodState', JSON.stringify(foodState));
}

// 먹이 상태 복원
function loadFoodState() {
    const savedState = localStorage.getItem('foodState');
    if (!savedState) return;

    const state = JSON.parse(savedState);

    // 먹이가 아직 유효한지 확인
    if (state.foodActive && state.foodEndTime > Date.now()) {
        foodActive = state.foodActive;
        foodEndTime = state.foodEndTime;
        foodGrowthMultiplier = state.foodGrowthMultiplier;
        currentFoodType = state.currentFoodType;

        // UI 업데이트
        const foodTypes = {
            '1min': { name: '1분 먹이' },
            '5min': { name: '5분 먹이' },
            '10min': { name: '10분 먹이' }
        };

        document.getElementById('foodStatus').textContent = `활성: ${foodTypes[currentFoodType].name}`;
        document.getElementById('feedButtons').style.display = 'none';
        document.getElementById('foodGaugeContainer').style.display = 'block';

        // 먹이 게이지 업데이트 시작
        updateFoodGauge();
        if (foodGaugeInterval) clearInterval(foodGaugeInterval);
        foodGaugeInterval = setInterval(updateFoodGauge, 100);
    } else {
        // 먹이가 만료되었으면 초기화
        localStorage.removeItem('foodState');
    }
}

function initGame() {
    // 게임 루프 시작
    growthTimer = setInterval(growMushroom, currentInterval);

    // 초기 버섯 생성 (먹이 없이는 생성 안됨)
    updateStats();
    updateShopUI();
}

function getRandomMushroom() {
    const totalWeight = MUSHROOM_TYPES.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of MUSHROOM_TYPES) {
        random -= type.weight;
        if (random <= 0) {
            return { ...type };
        }
    }
    return { ...MUSHROOM_TYPES[0] };
}

function growMushroom() {
    // 먹이가 활성화되어 있지 않으면 성장하지 않음
    if (!foodActive) return;

    // 확률적으로 성장
    if (Math.random() > SETTINGS.growthProbability) return;

    const emptySlots = mushrooms
        .map((m, i) => m === null ? i : -1)
        .filter(i => i !== -1);

    if (emptySlots.length === 0) return;

    const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    const mushroom = getRandomMushroom();

    // 아기 버섯 단계로 시작
    mushroom.stage = 'baby';
    mushroom.growthStartTime = Date.now();
    // 먹이 성장 배율 + 부스터 적용
    const boosterMultiplier = hasGrowthBooster ? 0.5 : 1.0;  // 50% 빠르게
    mushroom.growthDuration = 5000 * boosterMultiplier / foodGrowthMultiplier;

    mushrooms[randomSlot] = mushroom;

    const slot = document.getElementById(`slot-${randomSlot}`);
    const mushroomEl = document.createElement('div');
    mushroomEl.className = 'mushroom mushroom-baby';
    mushroomEl.textContent = '🍄‍🟫'; // 아기 버섯 이모지
    mushroomEl.onclick = () => touchBabyMushroom(randomSlot);

    slot.appendChild(mushroomEl);

    // 성체로 성장
    setTimeout(() => upgradeToAdult(randomSlot), mushroom.growthDuration);

    // 부스터 사용 완료
    if (hasGrowthBooster) {
        hasGrowthBooster = false;
        localStorage.setItem('hasGrowthBooster', 'false');
        updateShopUI();
    }
}

function touchBabyMushroom(slotIndex) {
    const mushroom = mushrooms[slotIndex];
    if (!mushroom || mushroom.stage !== 'baby') return;

    const slot = document.getElementById(`slot-${slotIndex}`);
    const mushroomEl = slot.querySelector('.mushroom');

    if (mushroomEl) {
        // 말랑말랑 효과
        mushroomEl.classList.add('wiggle');
        setTimeout(() => {
            mushroomEl.classList.remove('wiggle');
        }, 500);
    }
}

function upgradeToAdult(slotIndex) {
    const mushroom = mushrooms[slotIndex];
    if (!mushroom || mushroom.stage !== 'baby') return;

    // 성체로 업그레이드
    mushroom.stage = 'adult';

    const slot = document.getElementById(`slot-${slotIndex}`);
    const mushroomEl = slot.querySelector('.mushroom');

    if (mushroomEl) {
        // 성장 애니메이션
        mushroomEl.classList.add('grow-up-animation');

        setTimeout(() => {
            mushroomEl.classList.remove('mushroom-baby', 'grow-up-animation');
            mushroomEl.classList.add(`rarity-${mushroom.rarity}`);
            mushroomEl.textContent = mushroom.emoji;
            mushroomEl.onclick = () => harvestMushroom(slotIndex);
        }, 500);
    }
}

function harvestMushroom(slotIndex) {
    const mushroom = mushrooms[slotIndex];
    if (!mushroom || mushroom.stage !== 'adult') return;

    const slot = document.getElementById(`slot-${slotIndex}`);
    const mushroomEl = slot.querySelector('.mushroom');

    if (mushroomEl) {
        mushroomEl.classList.add('harvest-animation');

        // 포인트 팝업
        const popup = document.createElement('div');
        popup.className = 'points-popup';
        popup.textContent = `+${mushroom.value}`;
        popup.style.left = '50%';
        popup.style.top = '50%';
        slot.appendChild(popup);

        setTimeout(() => {
            mushroomEl.remove();
            popup.remove();
        }, 500);
    }

    gold += mushroom.value;
    harvested++;
    mushrooms[slotIndex] = null;

    // 도감에 기록
    recordHarvest(mushroom.emoji, mushroom.value);
    updateGold(gold);

    updateStats();
}

function harvestAll() {
    for (let i = 0; i < totalSlots; i++) {
        if (mushrooms[i] && mushrooms[i].stage === 'adult') {
            setTimeout(() => harvestMushroom(i), i * 50);
        }
    }
}

function updateStats() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('harvested').textContent = harvested;
    document.getElementById('upgradeLevel').textContent = upgradeLevel;
}

// 먹이 급여
function feedMushrooms(foodType) {
    const foodTypes = {
        '1min': { duration: 60000, growthSpeed: 2.0, cost: 50, name: '1분 먹이' },
        '5min': { duration: 300000, growthSpeed: 1.0, cost: 200, name: '5분 먹이' },
        '10min': { duration: 600000, growthSpeed: 0.7, cost: 350, name: '10분 먹이' }
    };

    const food = foodTypes[foodType];
    if (!food) return;

    if (gold < food.cost) {
        alert('골드가 부족합니다!');
        return;
    }

    gold -= food.cost;
    updateGold(gold);

    // 먹이 활성화
    foodActive = true;
    foodEndTime = Date.now() + food.duration;
    foodGrowthMultiplier = food.growthSpeed;
    currentFoodType = foodType;

    // 먹이 상태 저장
    saveFoodState();

    // 먹이 게이지 업데이트 시작
    updateFoodGauge();
    if (foodGaugeInterval) clearInterval(foodGaugeInterval);
    foodGaugeInterval = setInterval(updateFoodGauge, 100);

    // UI 업데이트
    document.getElementById('foodStatus').textContent = `활성: ${food.name}`;
    document.getElementById('feedButtons').style.display = 'none';
    document.getElementById('foodGaugeContainer').style.display = 'block';
}

// 먹이 게이지 업데이트
function updateFoodGauge() {
    const remaining = foodEndTime - Date.now();

    if (remaining <= 0) {
        // 먹이 소진
        foodActive = false;
        foodGrowthMultiplier = 1.0;
        currentFoodType = null;

        // 먹이 상태 제거
        localStorage.removeItem('foodState');

        clearInterval(foodGaugeInterval);
        document.getElementById('foodStatus').textContent = '먹이 없음';
        document.getElementById('feedButtons').style.display = 'flex';
        document.getElementById('foodGaugeContainer').style.display = 'none';
        return;
    }

    // 게이지 바 업데이트
    const foodTypes = {
        '1min': 60000,
        '5min': 300000,
        '10min': 600000
    };
    const totalDuration = foodTypes[currentFoodType];
    const percentage = (remaining / totalDuration) * 100;

    document.getElementById('foodGaugeBar').style.width = percentage + '%';

    // 남은 시간 표시
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    document.getElementById('foodTimeRemaining').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}



// 페이지 로드 시 초기화
loadMushroomData();
