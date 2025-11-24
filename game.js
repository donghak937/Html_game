let MUSHROOM_TYPES = [];
let SETTINGS = {};
let mushrooms = [];
let gold = 200;
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
    gold = stats.totalGold || 200;
    harvested = stats.totalHarvested || 0;
    upgradeLevel = parseInt(localStorage.getItem('upgradeLevel')) || 0;
    hasGrowthBooster = localStorage.getItem('hasGrowthBooster') === 'true';

    // 먹이 상태 복원
    loadFoodState();

    // 버섯 상태 복원
    loadMushrooms();

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

// 버섯 상태 저장
function saveMushrooms() {
    // DOM 요소가 아닌 순수 데이터만 저장
    const mushroomsData = mushrooms.map(m => {
        if (!m) return null;
        return {
            ...m,
            // DOM 요소 관련 정보는 제외하고 저장
            element: undefined
        };
    });
    localStorage.setItem('mushrooms', JSON.stringify(mushroomsData));
}

// 버섯 상태 복원
function loadMushrooms() {
    const saved = localStorage.getItem('mushrooms');
    if (saved) {
        const savedMushrooms = JSON.parse(saved);
        // 저장된 데이터가 현재 슬롯 크기와 맞는지 확인
        if (savedMushrooms.length === totalSlots) {
            mushrooms = savedMushrooms;

            // UI 복원
            mushrooms.forEach((m, i) => {
                if (m) {
                    const slot = document.getElementById(`slot-${i}`);
                    slot.innerHTML = ''; // 기존 내용 제거

                    const mushroomEl = document.createElement('div');

                    if (m.stage === 'baby') {
                        mushroomEl.className = 'mushroom mushroom-baby';
                        mushroomEl.textContent = '🌱';
                        mushroomEl.onclick = () => touchBabyMushroom(i);

                        // 성장 타이머 재설정 (남은 시간 계산 필요하지만, 단순화를 위해 다시 전체 시간 대기)
                        // 더 정확하게 하려면 남은 시간을 저장했어야 함. 
                        // 여기서는 이미 자라고 있던 중이라면 바로 성체로 만드는 것이 사용자 경험상 나을 수 있음
                        // 또는 남은 시간을 계산해서 setTimeout 설정
                        const elapsed = Date.now() - m.growthStartTime;
                        const remaining = Math.max(0, m.growthDuration - elapsed);

                        setTimeout(() => upgradeToAdult(i), remaining);
                    } else {
                        mushroomEl.className = `mushroom rarity-${m.rarity}`;
                        mushroomEl.textContent = m.emoji;
                        mushroomEl.onclick = () => harvestMushroom(i);
                    }

                    slot.appendChild(mushroomEl);
                }
            });
        }
    }
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
            '3min-free': { name: '3분 무료 먹이' },
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
    // 오프라인 성장 시뮬레이션
    processOfflineGrowth();

    // 게임 루프 시작
    growthTimer = setInterval(growMushroom, currentInterval);

    // 초기 버섯 생성 (먹이 없이는 생성 안됨)
    updateStats();
}

// 오프라인 성장 처리
function processOfflineGrowth() {
    const lastVisitTime = parseInt(localStorage.getItem('lastVisitTime')) || Date.now();
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastVisitTime;

    // 1초 이하면 오프라인 성장 처리 안함
    if (elapsedTime < 1000) return;

    // 먹이가 활성화되어 있지 않으면 성장 안함
    if (!foodActive) return;

    // 경과 시간 동안 몇 번 성장 시도가 있었을지 계산
    const growthAttempts = Math.floor(elapsedTime / currentInterval);

    // 최대 슬롯 수 만큼만 생성
    const emptySlots = mushrooms
        .map((m, i) => m === null ? i : -1)
        .filter(i => i !== -1);

    let mushroomsToCreate = 0;

    // 각 성장 시도마다 확률 계산
    for (let i = 0; i < growthAttempts && mushroomsToCreate < emptySlots.length; i++) {
        if (Math.random() <= SETTINGS.growthProbability) {
            mushroomsToCreate++;
        }
    }

    // 오프라인 동안 자란 버섯 생성
    for (let i = 0; i < mushroomsToCreate && i < emptySlots.length; i++) {
        const slotIndex = emptySlots[i];
        const mushroom = getRandomMushroom();

        // 바로 성체로 생성 (오프라인 성장이므로)
        mushroom.stage = 'adult';
        mushrooms[slotIndex] = mushroom;

        const slot = document.getElementById(`slot-${slotIndex}`);
        const mushroomEl = document.createElement('div');
        mushroomEl.className = `mushroom rarity-${mushroom.rarity}`;
        mushroomEl.textContent = mushroom.emoji;
        mushroomEl.onclick = () => harvestMushroom(slotIndex);

        slot.appendChild(mushroomEl);
    }

    if (mushroomsToCreate > 0) {
        saveMushrooms();
    }
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
    mushroomEl.textContent = '🌱'; // 아기 버섯 이모지 (새싹)
    mushroomEl.onclick = () => touchBabyMushroom(randomSlot);

    slot.appendChild(mushroomEl);

    // 성체로 성장
    setTimeout(() => upgradeToAdult(randomSlot), mushroom.growthDuration);

    saveMushrooms();

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
            saveMushrooms();
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

        setTimeout(() => {
            mushroomEl.remove();
        }, 500);
    }

    // 인벤토리에 추가 (골드 대신)
    addToInventory(mushroom.emoji, mushroom.value, mushroom.rarity, mushroom.description);
    harvested++;
    mushrooms[slotIndex] = null;
    saveMushrooms();

    //  도감에 기록
    recordHarvest(mushroom.emoji, mushroom.value);

    updateStats();

    // 인벤토리 추가 알림
    showNotification('인벤토리에 추가됨!');
}

function harvestAll() {
    for (let i = 0; i < totalSlots; i++) {
        if (mushrooms[i] && mushrooms[i].stage === 'adult') {
            setTimeout(() => harvestMushroom(i), i * 50);
        }
    }
}

function showNotification(message) {
    // 간단한 알림 토스트
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = '#6c5ce7';
    toast.style.color = 'white';
    toast.style.padding = '15px 20px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    toast.style.zIndex = '10000';
    toast.style.animation = 'fadeIn 0.3s';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function updateStats() {
    document.getElementById('gold').textContent = gold;
    document.getElementById('harvested').textContent = harvested;
    document.getElementById('upgradeLevel').textContent = upgradeLevel;
}

// 먹이 급여
function feedMushrooms(foodType) {
    const foodTypes = {
        '3min-free': { duration: 180000, growthSpeed: 0.5, cost: 0, name: '3분 무료 먹이' },
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
        '3min-free': 180000,
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

// 먹이 취소 (환불 없음)
function cancelFood() {
    if (!foodActive) return;

    // 먹이 비활성화
    foodActive = false;
    foodGrowthMultiplier = 1.0;
    currentFoodType = null;

    // 먹이 상태 제거
    localStorage.removeItem('foodState');

    // UI 업데이트
    clearInterval(foodGaugeInterval);
    document.getElementById('foodStatus').textContent = '먹이 없음';
    document.getElementById('feedButtons').style.display = 'flex';
    document.getElementById('foodGaugeContainer').style.display = 'none';

    alert('먹이를 취소했습니다 (환불 없음)');
}




// 페이지 로드 시 초기화
loadMushroomData();

// 페이지를 떠날 때 타임스탬프 저장
window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitTime', Date.now().toString());
});
