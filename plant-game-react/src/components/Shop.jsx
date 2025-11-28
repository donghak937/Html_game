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
    onBuyConsumable,
    onBuyLuckyBox,
    pets,
    onBuyPet,
    maxSlots,
    onBuyLandExpansion
}) {
    const upgradeCost = 100 + (upgradeLevel * 50);
    // Fix: Match useGame.js formula: Linear (500 * Level)
    const rarityCost = 500 * rarityLevel;
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

                {/* Land Expansion */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: maxSlots >= 64 ? '2px solid #b2bec3' : '2px solid #00b894'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>🏗️</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>토지 확장</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>
                            {maxSlots === 25 && '5×5 → 6×6 (11칸 추가)'}
                            {maxSlots === 36 && '6×6 → 7×7 (13칸 추가)'}
                            {maxSlots === 49 && '7×7 → 8×8 (15칸 추가)'}
                            {maxSlots >= 64 && '최대 확장 완료!'}
                        </div>
                        <div style={{ color: '#00b894', fontWeight: 'bold', fontSize: '0.9em' }}>현재: {maxSlots}칸</div>
                    </div>
                    <button
                        className="btn"
                        onClick={onBuyLandExpansion}
                        disabled={maxSlots >= 64 || gold < (maxSlots === 25 ? 5000 : maxSlots === 36 ? 15000 : 30000)}
                        style={{
                            opacity: (maxSlots >= 64 || gold < (maxSlots === 25 ? 5000 : maxSlots === 36 ? 15000 : 30000)) ? 0.5 : 1,
                            background: maxSlots >= 64 ? '#b2bec3' : '#00b894'
                        }}
                    >
                        {maxSlots >= 64 ? '최대' : `💰 ${maxSlots === 25 ? 5000 : maxSlots === 36 ? 15000 : 30000}`}
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
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>빈 땅에 다 자란 식물을 가득 채웁니다! ({maxSlots}칸)</div>
                    </div>
                    <button
                        className="btn"
                        onClick={() => onBuyConsumable('seedBomb', maxSlots === 25 ? 2000 : maxSlots === 36 ? 3000 : maxSlots === 49 ? 4500 : 6000)}
                        disabled={gold < (maxSlots === 25 ? 2000 : maxSlots === 36 ? 3000 : maxSlots === 49 ? 4500 : 6000)}
                        style={{
                            opacity: gold < (maxSlots === 25 ? 2000 : maxSlots === 36 ? 3000 : maxSlots === 49 ? 4500 : 6000) ? 0.5 : 1,
                            background: '#e17055'
                        }}
                    >
                        💰 {maxSlots === 25 ? 2000 : maxSlots === 36 ? 3000 : maxSlots === 49 ? 4500 : 6000}
                    </button>
                </motion.div>

                {/* Lucky Box */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '2px solid #a29bfe'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>🎁</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>럭키 박스</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>무엇이 나올지 모릅니다! (꽝 주의)</div>
                        <div style={{ fontSize: '0.75em', color: '#b2bec3', marginTop: '5px' }}>
                            확률: 잭팟(0.5%), 대박(5%), 소박(40%), 꽝(54.5%)
                        </div>
                    </div>
                    <button
                        className="btn"
                        onClick={onBuyLuckyBox}
                        disabled={gold < 250}
                        style={{ opacity: gold < 250 ? 0.5 : 1, background: '#a29bfe' }}
                    >
                        💰 250
                    </button>
                </motion.div>

                {/* Pet Dog - Phase 2 */}
                <motion.div
                    className="shop-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: pets && pets.dog ? '2px solid #b2bec3' : '2px solid #fdcb6e'
                    }}
                >
                    <div style={{ fontSize: '3em' }}>🐶</div>
                    <div style={{ flex: 1 }}>
                        <div className="text-black" style={{ fontSize: '1.2em', fontWeight: 'bold' }}>반려견 입양</div>
                        <div style={{ color: '#636e72', fontSize: '0.9em' }}>
                            귀여운 강아지가 화면을 걸어다니며<br />
                            15초마다 무작위로 식물을 자동 수확해줍니다!
                        </div>
                        <div style={{ color: '#fdcb6e', fontWeight: 'bold', fontSize: '0.9em', marginTop: '5px' }}>
                            {pets && pets.dog ? '✅ 입양완료' : '미입양'}
                        </div>
                    </div>
                    <button
                        className="btn"
                        onClick={() => onBuyPet('dog', 3000)}
                        disabled={gold < 3000 || (pets && pets.dog)}
                        style={{
                            opacity: (gold < 3000 || (pets && pets.dog)) ? 0.5 : 1,
                            background: (pets && pets.dog) ? '#b2bec3' : '#fdcb6e'
                        }}
                    >
                        {pets && pets.dog ? '입양완료' : '💰 3000'}
                    </button>
                </motion.div>

            </div>
        </div>
    );
}
