import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pest } from './Pest';

export function GameField({ plants, onHarvest, pests, onRemovePest, maxSlots }) {
    // Calculate grid size: 25=5x5, 36=6x6, 49=7x7, 64=8x8
    const gridSize = Math.sqrt(maxSlots || 25);

    return (
        <div className="log-container">
            <div className="mushroom-field" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {plants.map((plant, index) => {
                    // Add rarity class for rare+ plants
                    const rarityClass = plant && plant.stage === 'adult' &&
                        (plant.rarity === 'rare' || plant.rarity === 'epic' || plant.rarity === 'legendary' || plant.rarity === 'mythic')
                        ? `rarity-${plant.rarity}` : '';

                    return (
                        <div
                            key={index}
                            className={`mushroom-slot ${rarityClass}`}
                            onClick={() => plant && plant.stage === 'adult' && onHarvest(index)}
                        >
                            <AnimatePresence mode='wait'>
                                {plant && (
                                    <motion.div
                                        key={plant.id + plant.stage}
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, y: -20, opacity: 0 }}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`mushroom ${plant.stage === 'baby' ? 'mushroom-baby' : ''}`}
                                    >
                                        {plant.stage === 'baby' ? '🌱' : plant.emoji}
                                    </motion.div>
                                )}
                                {pests && pests[index] && (
                                    <Pest onClick={() => onRemovePest(index)} />
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
