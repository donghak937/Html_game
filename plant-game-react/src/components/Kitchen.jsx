import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import recipeData from '../data/recipes.json';
import mushroomData from '../data/mushroom_types.json';

const getRarityColor = (rarity) => {
    const colors = {
        'common': '#95a5a6',
        'rare': '#3498db',
        'epic': '#9b59b6',
        'legendary': '#f39c12',
        'mythic': '#e74c3c'
    };
    return colors[rarity] || '#95a5a6';
};

export function Kitchen({ inventory, cookedItems, useCookedItem, cookingState, discoveredRecipes, startCooking, claimDish }) {
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [activeTab, setActiveTab] = useState('ingredients');
    const [timeLeft, setTimeLeft] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [completedDish, setCompletedDish] = useState(null);

    // Timer Effect
    useEffect(() => {
        if (cookingState.active) {
            const interval = setInterval(() => {
                const now = Date.now();
                const elapsed = now - cookingState.startTime;
                const remaining = Math.max(0, cookingState.duration - elapsed);
                setTimeLeft(remaining);
            }, 100);
            return () => clearInterval(interval);
        } else {
            setTimeLeft(0);
        }
    }, [cookingState]);

    const handleIngredientClick = (emoji) => {
        if (selectedIngredients.length < 3) {
            setSelectedIngredients([...selectedIngredients, emoji]);
        }
    };

    const handleSlotClick = (index) => {
        if (!cookingState.active) {
            const newIngredients = [...selectedIngredients];
            newIngredients.splice(index, 1);
            setSelectedIngredients(newIngredients);
        }
    };

    const handleCook = () => {
        if (selectedIngredients.length === 3) {
            startCooking(selectedIngredients);
            setSelectedIngredients([]);
        }
    };

    const handleClaim = () => {
        if (cookingState.result) {
            setCompletedDish(cookingState.result);
            setShowPopup(true);
            claimDish();
            // Auto hide popup after 3 seconds
            setTimeout(() => setShowPopup(false), 3000);
        }
    };

    const isCooking = cookingState.active && timeLeft > 0;
    const isDone = cookingState.active && timeLeft === 0;

    return (
        <div className="kitchen-container" style={{ paddingBottom: '80px', position: 'relative' }}>
            {/* Completion Popup Overlay */}
            <AnimatePresence>
                {showPopup && completedDish && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                        onClick={() => setShowPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'white',
                                padding: '30px',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                textAlign: 'center',
                                minWidth: '300px',
                                maxWidth: '90%',
                                border: `4px solid ${completedDish.effect ? '#fdcb6e' : '#b2bec3'}`
                            }}
                        >
                            <div style={{ fontSize: '5em', marginBottom: '10px' }}>
                                {completedDish.emoji}
                            </div>
                            <h2 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>
                                {completedDish.name} 완성!
                            </h2>
                            <p style={{ color: '#636e72', marginBottom: '20px' }}>
                                {completedDish.description}
                            </p>
                            <button
                                onClick={() => setShowPopup(false)}
                                style={{
                                    padding: '10px 30px',
                                    background: '#00b894',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '1.1em'
                                }}
                            >
                                확인
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Remove separate overlay div since it's integrated now */}

            {/* Cooking Pot Section */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                textAlign: 'center'
            }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#2d3436' }}>🥘 요리 냄비</h2>

                {/* Pot Visualization */}
                <div style={{
                    width: '120px',
                    height: '100px',
                    background: '#636e72',
                    borderRadius: '0 0 40px 40px',
                    margin: '0 auto 20px auto',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3em'
                }}>
                    {isCooking ? (
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            ♨️
                        </motion.div>
                    ) : isDone ? (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                            ✨
                        </motion.div>
                    ) : (
                        <span>🥣</span>
                    )}
                </div>

                {/* Slots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                    {[0, 1, 2].map(i => {
                        const ingredient = cookingState.active
                            ? cookingState.ingredients[i]
                            : selectedIngredients[i];

                        return (
                            <div
                                key={i}
                                onClick={() => handleSlotClick(i)}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: '#f1f2f6',
                                    border: '2px dashed #b2bec3',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2em',
                                    cursor: (!cookingState.active && ingredient) ? 'pointer' : 'default'
                                }}
                            >
                                {ingredient}
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                {isCooking ? (
                    <div>
                        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#e17055' }}>
                            요리 중... {(timeLeft / 1000).toFixed(1)}초
                        </div>
                        <div style={{
                            width: '100%',
                            height: '10px',
                            background: '#dfe6e9',
                            borderRadius: '5px',
                            overflow: 'hidden'
                        }}>
                            <motion.div
                                style={{
                                    height: '100%',
                                    background: '#e17055'
                                }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${((cookingState.duration - timeLeft) / cookingState.duration) * 100}%` }}
                            />
                        </div>
                    </div>
                ) : isDone ? (
                    <button
                        onClick={handleClaim}
                        style={{
                            padding: '12px 30px',
                            background: '#fdcb6e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 0 #e1b12c'
                        }}
                    >
                        🎁 완성! 수령하기
                    </button>
                ) : (
                    <button
                        onClick={handleCook}
                        disabled={selectedIngredients.length !== 3}
                        style={{
                            padding: '12px 30px',
                            background: selectedIngredients.length === 3 ? '#00b894' : '#b2bec3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '25px',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            cursor: selectedIngredients.length === 3 ? 'pointer' : 'not-allowed',
                            boxShadow: selectedIngredients.length === 3 ? '0 4px 0 #008c70' : 'none'
                        }}
                    >
                        👨‍🍳 요리 시작
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('ingredients')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'ingredients' ? '#6c5ce7' : '#dfe6e9',
                        color: activeTab === 'ingredients' ? 'white' : '#636e72',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    🥦 재료 선택
                </button>
                <button
                    onClick={() => setActiveTab('recipes')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'recipes' ? '#fdcb6e' : '#dfe6e9',
                        color: activeTab === 'recipes' ? 'white' : '#636e72',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    📖 레시피 북
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'ingredients' ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    {Object.values(inventory).map(item => (
                        <div
                            key={item.emoji}
                            onClick={() => handleIngredientClick(item.emoji)}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '10px',
                                textAlign: 'center',
                                border: `2px solid ${getRarityColor(mushroomData.mushrooms.find(m => m.emoji === item.emoji)?.rarity)}`,
                                cursor: 'pointer',
                                opacity: item.count > 0 ? 1 : 0.5
                            }}
                        >
                            <div style={{ fontSize: '2em' }}>{item.emoji}</div>
                            <div style={{ fontSize: '0.8em', fontWeight: 'bold', color: '#2d3436' }}>x{item.count}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {recipeData.recipes.map(recipe => {
                        const isDiscovered = discoveredRecipes.includes(recipe.id);

                        return (
                            <div
                                key={recipe.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    opacity: isDiscovered ? 1 : 0.8
                                }}
                            >
                                <div style={{ fontSize: '2.5em' }}>
                                    {isDiscovered ? recipe.emoji : '❓'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', color: '#2d3436', marginBottom: '5px' }}>
                                        {isDiscovered ? recipe.name : '???'}
                                    </div>
                                    {isDiscovered ? (
                                        <div style={{ fontSize: '0.9em', color: '#636e72' }}>{recipe.description}</div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {recipe.ingredients.map((ing, idx) => {
                                                // Find rarity of ingredient
                                                const itemData = mushroomData.mushrooms.find(m => m.emoji === ing);
                                                const color = getRarityColor(itemData?.rarity);
                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: `3px solid ${color}`,
                                                            background: '#f1f2f6'
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
