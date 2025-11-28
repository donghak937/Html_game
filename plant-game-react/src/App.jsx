import React, { useState, useEffect } from 'react';
import { BuffTimer } from './components/BuffTimer';
import { useGame } from './hooks/useGame';
import { GameField } from './components/GameField';
import { Inventory } from './components/Inventory';
import { Shop } from './components/Shop';
import { Collection } from './components/Collection';
import { FoodControls } from './components/FoodControls';
import { Kitchen } from './components/Kitchen';
import { Settings } from './components/Settings';
import { Achievements } from './components/Achievements';
import { Quests } from './components/Quests';
import { DailyReward } from './components/DailyReward';
import { LuckyBoxPopup } from './components/LuckyBoxPopup';
import { Pet } from './components/Pet';
import DiscoveryPopup from './components/DiscoveryPopup';
import mushroomData from './data/mushroom_types.json';
import './styles/main.css';

function App() {
  const {
    // Auth & Cloud Save
    user,
    handleLogin,
    handleLogout,
    handleSaveGame,
    handleLoadGame,
    isSaving,
    lastSaved,

    // Daily Reward
    dailyReward,
    claimDailyReward,

    // Game State
    gold,
    plants,
    inventory,
    collection,
    upgradeLevel,
    unlocks,
    rarityLevel,
    fertilizerLevel,
    consumables,
    foodState,
    pityCounter,
    harvest,
    sell,
    sellAll,
    buyUpgrade,
    buyUnlock,
    buyRarityUpgrade,
    buyFertilizerUpgrade,
    buyConsumable,
    useConsumable,
    harvestAll,
    activateFood,
    cancelFood,
    cookItem,
    cookedItems,
    useCookedItem,
    activeBuffs,
    cookingState,
    discoveredRecipes,
    startCooking,
    claimDish,
    sellCookedItem,
    resetGame,

    activateGodMode,
    stats,
    achievements,
    claimAchievement,
    buyLuckyBox,
    pests,
    removePest,
    activeQuests,
    questTimer,
    refreshQuests,
    rerollQuest,
    completeQuest,
    pets,
    buyPet,
    discoveredPlant,
    setDiscoveredPlant,
    maxSlots,
    buyLandExpansion
  } = useGame();

  const [view, setView] = useState('game');
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [luckyBoxResult, setLuckyBoxResult] = useState(null);

  const handleBuyLuckyBox = () => {
    const result = buyLuckyBox();
    if (result && result.success) {
      setLuckyBoxResult(result.result);
    } else if (result && !result.success) {
      alert(result.message);
    }
  };

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Check Daily Reward on Mount
  useEffect(() => {
    if (dailyReward.lastClaimed) {
      const lastDate = new Date(dailyReward.lastClaimed);
      const now = new Date();
      const isSameDay = lastDate.getFullYear() === now.getFullYear() &&
        lastDate.getMonth() === now.getMonth() &&
        lastDate.getDate() === now.getDate();
      if (!isSameDay) {
        setShowDailyReward(true);
      }
    } else {
      // First time
      setShowDailyReward(true);
    }
  }, []); // Run once

  const handleClaimReward = () => {
    const result = claimDailyReward();
    if (result.success) {
      // Optional: Show confetti or toast
    }
    return result;
  };

  const adultsCount = plants.filter(p => p && p.stage === 'adult').length;
  const inventoryCount = Object.values(inventory).reduce((sum, item) => sum + item.count, 0);

  // Calculate Statistics
  const getRarityProbabilities = () => {
    const rarityBuffs = activeBuffs.filter(b => b.type === 'rarity_boost');

    const weightedMushrooms = mushroomData.mushrooms
      .filter(m => {
        if (m.rarity === 'epic' && rarityLevel < 5) return false;
        if (m.rarity === 'legendary' && rarityLevel < 10) return false;
        if (m.rarity === 'mythic' && rarityLevel < 15) return false;
        return true;
      })
      .map(m => {
        let weightMultiplier = 1;

        // Apply Rarity Buffs
        rarityBuffs.forEach(buff => {
          if (buff.target === 'all' && m.rarity !== 'common') {
            weightMultiplier *= buff.value;
          } else if (buff.target === m.rarity) {
            weightMultiplier *= buff.value;
          }
        });

        return {
          ...m,
          effectiveWeight: m.rarity === 'common'
            ? m.weight / (1 + rarityLevel * 0.15)
            : m.weight * (1 + (rarityLevel - 1) * 0.8) * weightMultiplier
        };
      });

    const totalWeight = weightedMushrooms.reduce((sum, m) => sum + m.effectiveWeight, 0);

    const rarityGroups = {};
    weightedMushrooms.forEach(m => {
      if (!rarityGroups[m.rarity]) rarityGroups[m.rarity] = 0;
      rarityGroups[m.rarity] += m.effectiveWeight;
    });

    return Object.entries(rarityGroups).map(([rarity, weight]) => ({
      rarity,
      probability: ((weight / totalWeight) * 100).toFixed(2)
    }));
  };

  const getSpawnProbability = () => {
    if (!foodState.active) return '0% (비활성)';

    // Calculate Spawn Multiplier from Buffs
    const spawnBuffValue = activeBuffs
      .filter(b => b.type === 'spawn_rate')
      .reduce((sum, b) => sum + b.value, 0);
    const spawnMultiplier = 1 + spawnBuffValue;

    const baseChance = 0.01 * foodState.multiplier * spawnMultiplier;
    const pityBonus = (pityCounter || 0) * 0.01;
    const totalChance = Math.min(baseChance + pityBonus, 1.0);

    // Show 1 decimal place if < 10%, else 0
    return `${(totalChance * 100).toFixed(totalChance < 0.1 ? 1 : 0)}%`;
  };

  const getGrowthTime = () => {
    const baseTime = Math.max(60000 - (upgradeLevel * 3000), 5000);

    // Calculate total multiplier including food and buffs
    const speedBuffValue = activeBuffs
      .filter(b => b.type === 'speed')
      .reduce((sum, b) => sum + b.value, 0);

    // Total Speed = Food Multiplier * (1 + Buff %)
    // Example: Free Food (0.5) * Red Stew (1.5) = 0.75x Speed
    const totalMultiplier = (foodState.multiplier || 1) * (1 + speedBuffValue);

    // Effective Time = Base Time / Total Multiplier
    const effectiveTime = baseTime / totalMultiplier;

    const seconds = (effectiveTime / 1000).toFixed(1);
    return `${seconds}초`;
  };

  return (
    <div className="game-container">
      {showDailyReward && (
        <DailyReward
          dailyReward={dailyReward}
          onClaim={handleClaimReward}
          onClose={() => setShowDailyReward(false)}
        />
      )}

      <LuckyBoxPopup
        result={luckyBoxResult}
        onClose={() => setLuckyBoxResult(null)}
      />

      <DiscoveryPopup
        plant={discoveredPlant}
        onClose={() => setDiscoveredPlant(null)}
      />

      <div className="header">
        <h1>🌱 Plant Tycoon</h1>
      </div>

      <div className="controls" style={{ marginBottom: '20px' }}>
        <button
          className={`btn ${view === 'game' ? '' : 'btn-secondary'}`}
          onClick={() => setView('game')}
        >
          🏠 홈
        </button>
        <button
          className={`btn ${view === 'inventory' ? '' : 'btn-secondary'}`}
          onClick={() => setView('inventory')}
        >
          🎒 인벤토리
        </button>
        <button
          className={`btn ${view === 'shop' ? '' : 'btn-secondary'}`}
          onClick={() => setView('shop')}
        >
          🏪 상점
        </button>
        <button
          className={`btn ${view === 'collection' ? '' : 'btn-secondary'}`}
          onClick={() => setView('collection')}
        >
          📚 도감
        </button>
        <button
          className={`btn ${view === 'achievements' ? '' : 'btn-secondary'}`}
          onClick={() => setView('achievements')}
        >
          🏆 업적
        </button>
        <button
          className={`btn ${view === 'quests' ? '' : 'btn-secondary'}`}
          onClick={() => setView('quests')}
        >
          📜 퀘스트
        </button>
        <button
          className={`btn ${view === 'kitchen' ? '' : 'btn-secondary'}`}
          onClick={() => setView('kitchen')}
        >
          🍳 요리
        </button>
        <button
          className={`btn ${view === 'settings' ? '' : 'btn-secondary'}`}
          onClick={() => setView('settings')}
        >
          ⚙️ 설정
        </button>
      </div>

      <div className="stats">
        <div className="stat-box">
          <div className="stat-label">골드</div>
          <div className="stat-value">💰 {gold}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">식물</div>
          <div className="stat-value">🌱 {adultsCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">아이템</div>
          <div className="stat-value">📦 {inventoryCount}</div>
        </div>
      </div>

      {/* Buff List - Moved inside flow to avoid overlap */}
      {Array.isArray(activeBuffs) && activeBuffs.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '15px',
          justifyContent: 'center'
        }}>
          {activeBuffs.map((buff, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 12px',
              borderRadius: '12px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderLeft: '4px solid #00b894',
              fontSize: '0.9em'
            }}>
              <div style={{ fontSize: '1.2em' }}>
                {buff.type === 'speed' ? '⚡' : buff.type === 'gold' ? '💰' : '🎲'}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#2d3436' }}>
                  {buff.name}
                </div>
                <div style={{ fontSize: '0.8em', color: '#636e72' }}>
                  <BuffTimer endTime={buff.endTime} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'game' && (
        <>
          {/* Statistics Panel */}
          {unlocks.statistics && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '10px',
              borderRadius: '10px',
              marginBottom: '10px',
              fontSize: '0.8em',
              display: 'flex',
              justifyContent: 'space-around',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              {getRarityProbabilities().map(({ rarity, probability }) => (
                <div key={rarity} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', textTransform: 'capitalize', color: '#2d3436' }}>{rarity}</div>
                  <div style={{ color: '#2d3436' }}>{probability}%</div>
                </div>
              ))}
            </div>
          )}

          {/* Time Statistics */}
          {unlocks.statistics && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '10px',
              borderRadius: '10px',
              marginBottom: '10px',
              fontSize: '0.85em',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <div style={{ marginBottom: '5px', color: '#2d3436' }}>
                🎲 현재 스폰 확률: <strong style={{ color: Array.isArray(activeBuffs) && activeBuffs.some(b => b.type === 'spawn_rate') ? '#2ecc71' : 'inherit' }}>
                  {getSpawnProbability()}
                  {Array.isArray(activeBuffs) && activeBuffs.some(b => b.type === 'spawn_rate') && (
                    <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                      (+{(activeBuffs.filter(b => b.type === 'spawn_rate').reduce((sum, b) => sum + b.value, 0) * 100).toFixed(0)}%)
                    </span>
                  )}
                </strong>
              </div>
              <div style={{ color: '#2d3436' }}>
                🌱 성장 시간: <strong style={{ color: Array.isArray(activeBuffs) && activeBuffs.some(b => b.type === 'speed') ? '#2ecc71' : 'inherit' }}>
                  {getGrowthTime()}
                  {Array.isArray(activeBuffs) && activeBuffs.some(b => b.type === 'speed') && (
                    <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>
                      (+{(activeBuffs.filter(b => b.type === 'speed').reduce((sum, b) => sum + b.value, 0) * 100).toFixed(0)}%)
                    </span>
                  )}
                </strong>
              </div>
              <div style={{ marginTop: '5px', color: '#636e72', fontSize: '0.9em' }}>
                ⚡ 현재 속도: <strong>
                  {((foodState.active ? foodState.multiplier : 0) * (1 + (Array.isArray(activeBuffs) ? activeBuffs.filter(b => b.type === 'speed').reduce((sum, b) => sum + b.value, 0) : 0))).toFixed(1)}x
                </strong>
              </div>
              {Array.isArray(activeBuffs) && activeBuffs.some(b => b.type === 'rarity_boost') && (
                <div style={{ marginTop: '5px', color: '#9b59b6', fontSize: '0.9em' }}>
                  ✨ 레어도 보정:
                  {activeBuffs.filter(b => b.type === 'rarity_boost').map((b, i) => (
                    <span key={i} style={{ marginLeft: '5px', fontWeight: 'bold' }}>
                      [{b.target === 'all' ? '전체' : b.target} x{b.value}]
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <FoodControls
            gold={gold}
            foodState={foodState}
            fertilizerLevel={fertilizerLevel}
            onActivateFood={activateFood}
            onCancelFood={cancelFood}
          />

          {/* Harvest All Button */}
          {unlocks.harvestAll && adultsCount > 0 && (
            <button
              onClick={harvestAll}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: '#fdcb6e',
                border: 'none',
                borderRadius: '10px',
                color: '#d35400',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 0 #e17055'
              }}
            >
              🚜 전체 수확하기 ({adultsCount})
            </button>
          )}

          <GameField
            plants={plants}
            onHarvest={harvest}
            pests={pests}
            onRemovePest={removePest}
            maxSlots={maxSlots}
          />
        </>
      )
      }

      {
        view === 'inventory' && (
          <Inventory
            inventory={inventory}
            consumables={consumables}
            onSell={sell}
            onSellAll={sellAll}
            onUseConsumable={useConsumable}
            cookedItems={cookedItems}
            useCookedItem={useCookedItem}
            onSellCookedItem={sellCookedItem}
          />
        )
      }

      {
        view === 'shop' && (
          <Shop
            gold={gold}
            upgradeLevel={upgradeLevel}
            unlocks={unlocks}
            rarityLevel={rarityLevel}
            fertilizerLevel={fertilizerLevel}
            onBuyUpgrade={buyUpgrade}
            onBuyUnlock={buyUnlock}
            onBuyRarityUpgrade={buyRarityUpgrade}
            onBuyFertilizerUpgrade={buyFertilizerUpgrade}
            onBuyConsumable={buyConsumable}
            onBuyLuckyBox={handleBuyLuckyBox}
            pets={pets}
            onBuyPet={buyPet}
            maxSlots={maxSlots}
            onBuyLandExpansion={buyLandExpansion}
          />
        )
      }

      {/* Pet - Phase 3: Render only when owned */}
      {/* Pet - Phase 3: Render only when owned AND in game view */}
      {pets && pets.dog && view === 'game' && <Pet type="dog" />}

      {
        view === 'collection' && (
          <Collection
            collection={collection}
            mushroomData={mushroomData}
          />
        )
      }

      {
        view === 'achievements' && (
          <Achievements
            stats={stats}
            achievements={achievements}
            onClaim={claimAchievement}
          />
        )
      }

      {
        view === 'quests' && (
          <Quests
            activeQuests={activeQuests}
            questTimer={questTimer}
            onRefresh={refreshQuests}
            onReroll={rerollQuest}
            onComplete={completeQuest}
            inventory={inventory}
            cookedItems={cookedItems}
          />
        )
      }

      {
        view === 'kitchen' && (
          <Kitchen
            inventory={inventory}
            cookedItems={cookedItems}
            useCookedItem={useCookedItem}
            cookingState={cookingState}
            discoveredRecipes={discoveredRecipes}
            startCooking={startCooking}
            claimDish={claimDish}
          />
        )
      }

      {
        view === 'settings' && (
          <Settings
            resetGame={resetGame}
            activateGodMode={activateGodMode}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSave={handleSaveGame}
            onLoad={handleLoadGame}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        )
      }

      <div className="info" style={{ marginTop: '20px', fontSize: '0.9em', color: '#8b4513' }}>
        {view === 'game' && '💡 먹이를 주면 식물이 자랍니다!'}
        {view === 'inventory' && '💡 아이템을 클릭하면 판매할 수 있습니다!'}
        {view === 'shop' && '💡 업그레이드를 구매하여 더 빠르게 성장시키세요!'}
        {view === 'collection' && '💡 수확하여 새로운 식물을 발견하세요!'}
        {view === 'achievements' && '💡 목표를 달성하고 보상을 획득하세요!'}
        {view === 'quests' && '💡 NPC의 부탁을 들어주고 보상을 받으세요!'}
        {view === 'kitchen' && '💡 재료를 모아 특별한 요리를 만들어보세요!'}
        {view === 'settings' && '💡 게임 설정을 변경할 수 있습니다.'}
      </div>

      <div style={{
        marginTop: '15px',
        fontSize: '0.7em',
        color: '#b2bec3',
        textAlign: 'center'
      }}>
        v2.1.0
      </div>
    </div >
  );
}

export default App;
