import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function GameField({ plants, onHarvest }) {
    return (
        <div className="log-container">
            <div className="mushroom-field">
                {plants.map((plant, index) => {
                    // Add rarity class for epic+ plants
                    const rarityClass = plant && plant.stage === 'adult' &&
                        (plant.rarity === 'epic' || plant.rarity === 'legendary' || plant.rarity === 'mythic')
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
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
