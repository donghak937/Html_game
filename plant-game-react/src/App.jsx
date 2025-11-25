import React, { useState } from 'react';
import { useGame } from './hooks/useGame';
import { GameField } from './components/GameField';
import { Inventory } from './components/Inventory';
import { Shop } from './components/Shop';
import { Collection } from './components/Collection';
import { FoodControls } from './components/FoodControls';
import mushroomData from './data/mushroom_types.json';
import './styles/main.css';

function App() {
  const {
    gold,
    plants,
    inventory,
    collection,
    upgradeLevel,
    unlocks,
    rarityLevel,
    foodState,
    harvest,
    sell,
    sellAll,
    buyUpgrade,
    buyUnlock,
    buyRarityUpgrade,
    harvestAll,
    activateFood,
    cancelFood
  } = useGame();

  const [view, setView] = useState('game');

  const adultsCount = plants.filter(p => p && p.stage === 'adult').length;
  const inventoryCount = Object.values(inventory).reduce((sum, item) => sum + item.count, 0);

  // Calculate Statistics
  const getRarityProbabilities = () => {
    const weightedMushrooms = mushroomData.mushrooms.map(m => ({
      ...m,
      effectiveWeight: m.rarity === 'common'
        ? m.weight
        : m.weight * (1 + (rarityLevel - 1) * 0.5)
    }));
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

  return (
    <div className="game-container">
      <div className="header">
        <h1>🌱 Plant Tycoon</h1>
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

          <FoodControls
            gold={gold}
            foodState={foodState}
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

          <GameField plants={plants} onHarvest={harvest} />
        </>
      )}

      {view === 'inventory' && (
        <Inventory inventory={inventory} onSell={sell} onSellAll={sellAll} />
      )}

      {view === 'shop' && (
        <Shop
          gold={gold}
          upgradeLevel={upgradeLevel}
          unlocks={unlocks}
          rarityLevel={rarityLevel}
          onBuyUpgrade={buyUpgrade}
          onBuyUnlock={buyUnlock}
          onBuyRarityUpgrade={buyRarityUpgrade}
        />
      )}

      {view === 'collection' && (
        <Collection collection={collection} />
      )}

      <div className="controls">
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
      </div>

      <div className="info" style={{ marginTop: '20px', fontSize: '0.9em', color: '#8b4513' }}>
        {view === 'game' && '💡 먹이를 주면 식물이 자랍니다!'}
        {view === 'inventory' && '💡 아이템을 클릭하면 판매할 수 있습니다!'}
        {view === 'shop' && '💡 업그레이드를 구매하여 더 빠르게 성장시키세요!'}
        {view === 'collection' && '💡 수확하여 새로운 식물을 발견하세요!'}
      </div>

      <div style={{
        marginTop: '15px',
        fontSize: '0.7em',
        color: '#b2bec3',
        textAlign: 'center'
      }}>
        v1.0.2
      </div>
    </div>
  );
}

export default App;
