import React from 'react';
import { motion } from 'framer-motion';

export function Shop({
    gold,
    upgradeLevel,
    unlocks,
    rarityLevel,
    fertilizerLevel,
    onBuyUpgrade,
    onBuyUnlock,
    onBuyRarityUpgrade,
    onBuyFertilizerUpgrade,
    onBuyConsumable
}) {
    const upgradeCost = 100 + (upgradeLevel * 50);
    // Fix: Match useGame.js formula: Math.floor(1000 * Math.pow(2, rarityLevel - 1))
    const rarityCost = Math.floor(1000 * Math.pow(2, rarityLevel - 1));
    const statsCost = 500;
    const harvestAllCost = 500;

    return (
        <div className="shop-container">
            <div className="shop-items" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Speed Upgrade */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>⚡</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>성장 속도 업그레이드</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>성장 속도가 10% 증가합니다 (영구)</div>
                        <div style={{ color: '#6c5ce7', fontWeight: 'bold', fontSize: '0.9em' }}>레벨: {upgradeLevel}</div>
                    </div>
                    <button
                        className="btn"
                        onClick={onBuyUpgrade}
                        disabled={gold < upgradeCost}
                        style={{ opacity: gold < upgradeCost ? 0.5 : 1 }}
                    >
                        💰 {upgradeCost}
                    </button>
                </motion.div>

                {/* Rarity Upgrade */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>💎</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>레어도 증가</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>희귀한 식물이 등장할 확률이 증가합니다</div>
                        <div style={{ color: '#6c5ce7', fontWeight: 'bold', fontSize: '0.9em' }}>레벨: {rarityLevel}</div>
                    </div>
                    <button
                        className="btn"
                        onClick={onBuyRarityUpgrade}
                        disabled={gold < rarityCost}
                        style={{ opacity: gold < rarityCost ? 0.5 : 1 }}
                    >
                        💰 {rarityCost}
                    </button>
                </motion.div>

                {/* Statistics Unlock */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>📊</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>통계 기능 해금</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>등급별 등장 확률을 확인할 수 있습니다</div>
                    </div>
                    <button
                        className="btn"
                        onClick={() => onBuyUnlock('statistics')}
                        disabled={unlocks.statistics || gold < statsCost}
                        style={{ opacity: (unlocks.statistics || gold < statsCost) ? 0.5 : 1 }}
                    >
                        {unlocks.statistics ? '✅ 보유중' : `💰 ${statsCost}`}
                    </button>
                </motion.div>

                {/* Harvest All Unlock */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>🚜</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>전체 수확 기능 해금</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>다 자란 식물을 한 번에 수확할 수 있습니다</div>
                    </div>
                    <button
                        className="btn"
                        onClick={() => onBuyUnlock('harvestAll')}
                        disabled={unlocks.harvestAll || gold < harvestAllCost}
                        style={{ opacity: (unlocks.harvestAll || gold < harvestAllCost) ? 0.5 : 1 }}
                    >
                        {unlocks.harvestAll ? '✅ 보유중' : `💰 ${harvestAllCost}`}
                    </button>
                </motion.div>

                {/* Fertilizer Efficiency Upgrade */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>🧪</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>비료 효율 연구</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>비료 지속시간이 10% 증가합니다</div>
                        <div style={{ color: '#6c5ce7', fontWeight: 'bold', fontSize: '0.9em' }}>레벨: {fertilizerLevel}</div>
                    </div>
                    <button
                        className="btn"
                        onClick={onBuyFertilizerUpgrade}
                        disabled={gold < 1000 + (fertilizerLevel * 500)}
                        style={{ opacity: gold < 1000 + (fertilizerLevel * 500) ? 0.5 : 1 }}
                    >
                        💰 {1000 + (fertilizerLevel * 500)}
                    </button>
                </motion.div>

                {/* Divider */}
                <div style={{
                    borderTop: '2px solid #dfe6e9',
                    margin: '10px 0',
                    paddingTop: '10px'
                }}>
                    <h3 style={{ color: '#2d3436', marginBottom: '15px' }}>🎒 소모품</h3>
                </div>

                {/* Seed Bomb */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '2px solid #e17055'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>💣</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>씨앗 폭탄</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>빈 땅에 다 자란 식물을 가득 채웁니다!</div>
                    </div>
                    <button
                        className="btn"
                        onClick={() => onBuyConsumable('seedBomb', 2000)}
                        disabled={gold < 2000}
                        style={{ opacity: gold < 2000 ? 0.5 : 1, background: '#e17055' }}
                    >
                        💰 2000
                    </button>
                </motion.div>

            </div>
        </div>
    );
}
