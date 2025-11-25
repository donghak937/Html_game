import { useState, useEffect, useCallback, useRef } from 'react';
import mushroomData from '../data/mushroom_types.json';

const TOTAL_SLOTS = 25;
const GROWTH_PROBABILITY = 0.05;

export function useGame() {
  // --- State ---
  const [gold, setGold] = useState(() => {
    const saved = localStorage.getItem('plant_game_gold');
    return saved ? parseInt(saved) : 50;
  });

  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem('plant_game_plants');
    return saved ? JSON.parse(saved) : Array(TOTAL_SLOTS).fill(null);
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('plant_game_inventory');
    return saved ? JSON.parse(saved) : {};
  });

  const [collection, setCollection] = useState(() => {
    const saved = localStorage.getItem('plant_game_collection');
    return saved ? JSON.parse(saved) : {};
  });

  const [upgradeLevel, setUpgradeLevel] = useState(() => {
    const saved = localStorage.getItem('plant_game_upgradeLevel');
    return saved ? parseInt(saved) : 0;
  });

  const [unlocks, setUnlocks] = useState(() => {
    const saved = localStorage.getItem('plant_game_unlocks');
    return saved ? JSON.parse(saved) : { statistics: false, harvestAll: false };
  });

  const [rarityLevel, setRarityLevel] = useState(() => {
    const saved = localStorage.getItem('plant_game_rarityLevel');
    return saved ? parseInt(saved) : 1;
  });

  const [foodState, setFoodState] = useState(() => {
    const saved = localStorage.getItem('plant_game_foodState');
    return saved ? JSON.parse(saved) : { active: false, endTime: 0, type: null, multiplier: 1 };
  });

  const [pityCounter, setPityCounter] = useState(() => {
    const saved = localStorage.getItem('plant_game_pityCounter');
    return saved ? parseInt(saved) : 0;
  });

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('plant_game_gold', gold);
    localStorage.setItem('plant_game_plants', JSON.stringify(plants));
    localStorage.setItem('plant_game_inventory', JSON.stringify(inventory));
    localStorage.setItem('plant_game_collection', JSON.stringify(collection));
    localStorage.setItem('plant_game_upgradeLevel', upgradeLevel);
    localStorage.setItem('plant_game_unlocks', JSON.stringify(unlocks));
    localStorage.setItem('plant_game_rarityLevel', rarityLevel);
    localStorage.setItem('plant_game_foodState', JSON.stringify(foodState));
    localStorage.setItem('plant_game_pityCounter', pityCounter);
  }, [gold, plants, inventory, collection, upgradeLevel, unlocks, rarityLevel, foodState, pityCounter]);

  // --- Refs for Loop ---
  const stateRef = useRef({
    plants,
    foodState,
    upgradeLevel,
    rarityLevel,
    pityCounter
  });

  useEffect(() => {
    stateRef.current = { plants, foodState, upgradeLevel, rarityLevel, pityCounter };
  }, [plants, foodState, upgradeLevel, rarityLevel, pityCounter]);

  // --- Game Loop ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      const { plants: currentPlants, foodState: currentFood, upgradeLevel: currentLevel, rarityLevel: currentRarity, pityCounter: currentPity } = stateRef.current;

      // Check food expiration
      if (currentFood.active && Date.now() > currentFood.endTime) {
        setFoodState({ active: false, endTime: 0, type: null, multiplier: 1 });
        return; // Skip this tick to update state
      }

      // Calculate Growth Interval
      // Base: 3000ms. Upgrade: -10% per level (max 50%). Food: / multiplier.
      let baseInterval = 3000 * Math.pow(0.95, currentLevel);
      if (baseInterval < 1000) baseInterval = 1000; // Cap speed

      setPlants(prevPlants => {
        let newPlants = [...prevPlants];
        let changed = false;

        // 1. Spawning
        const emptyIndices = newPlants.map((p, i) => p === null ? i : -1).filter(i => i !== -1);

        // Only spawn if food is active
        if (!currentFood.active) return prevPlants;

        // Pity System: increase spawn chance with each failure
        const baseChance = GROWTH_PROBABILITY * currentFood.multiplier;
        const pityBonus = currentPity * 0.05; // +5% per failure
        const totalChance = Math.min(baseChance + pityBonus, 1.0); // Cap at 100%

        if (emptyIndices.length > 0 && Math.random() < totalChance) {
          // Spawn success - reset pity counter
          setPityCounter(0);
          const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

          // Random Type with Rarity Logic
          // Increase weight of non-common items based on rarityLevel
          // Formula: weight * (1 + (rarityLevel - 1) * 0.1) for non-common
          // Epic+ only appears at certain rarity levels
          const weightedMushrooms = mushroomData.mushrooms
            .filter(m => {
              // Filter out Epic+ if rarity level is too low
              if (m.rarity === 'epic' && currentRarity < 5) return false;
              if (m.rarity === 'legendary' && currentRarity < 10) return false;
              if (m.rarity === 'mythic' && currentRarity < 15) return false;
              return true;
            })
            .map(m => ({
              ...m,
              effectiveWeight: m.rarity === 'common'
                ? m.weight
                : m.weight * (1 + (currentRarity - 1) * 0.1) // 10% increase per level for rare+
            }));

          const totalWeight = weightedMushrooms.reduce((sum, type) => sum + type.effectiveWeight, 0);
          let random = Math.random() * totalWeight;
          let selectedType = weightedMushrooms[0];

          for (const type of weightedMushrooms) {
            random -= type.effectiveWeight;
            if (random <= 0) {
              selectedType = type;
              break;
            }
          }

          // Growth Duration Calculation
          let duration = 8000; // Base 8s to grow
          if (currentFood.active) duration /= currentFood.multiplier;

          newPlants[randomIndex] = {
            ...selectedType,
            id: Date.now() + Math.random(),
            stage: 'baby',
            plantedAt: Date.now(),
            growthDuration: duration
          };

          changed = true;
        } else if (emptyIndices.length > 0) {
          // Spawn failure - increment pity counter
          setPityCounter(prev => prev + 1);
        }

        // 2. Growing
        newPlants = newPlants.map(plant => {
          if (plant && plant.stage === 'baby') {
            const elapsed = Date.now() - plant.plantedAt;
            if (elapsed >= plant.growthDuration) {
              changed = true;
              return { ...plant, stage: 'adult' };
            }
          }
          return plant;
        });

        return changed ? newPlants : prevPlants;
      });

    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // --- Actions ---

  const harvest = useCallback((index) => {
    const plant = plants[index];
    if (!plant || plant.stage !== 'adult') return;

    setPlants(current => {
      const newPlants = [...current];
      newPlants[index] = null;
      return newPlants;
    });

    // Add to Inventory
    setInventory(currInv => {
      const newInv = { ...currInv };
      if (!newInv[plant.emoji]) {
        newInv[plant.emoji] = { ...plant, count: 0 };
      } else {
        newInv[plant.emoji] = { ...newInv[plant.emoji] }; // Deep copy
      }
      newInv[plant.emoji].count += 1;
      return newInv;
    });

    // Add to Collection
    setCollection(currCol => {
      const newCol = { ...currCol };
      if (!newCol[plant.emoji]) {
        newCol[plant.emoji] = {
          discovered: true,
          count: 0,
          firstDiscoveredAt: new Date().toISOString()
        };
      } else {
        newCol[plant.emoji] = { ...newCol[plant.emoji] }; // Deep copy
      }
      newCol[plant.emoji].count += 1;
      return newCol;
    });
  }, [plants]);

  const sell = useCallback((emoji, amount = 1) => {
    const item = inventory[emoji];
    if (!item || item.count < amount) return;

    setInventory(currInv => {
      const newInv = { ...currInv };
      if (newInv[emoji]) {
        newInv[emoji] = { ...newInv[emoji] }; // Deep copy the item
        newInv[emoji].count -= amount;
        if (newInv[emoji].count <= 0) delete newInv[emoji];
      }
      return newInv;
    });

    setGold(g => g + (item.value * amount));
  }, [inventory]);

  const sellAll = useCallback(() => {
    let totalValue = 0;
    Object.values(inventory).forEach(item => {
      totalValue += item.value * item.count;
    });

    if (totalValue > 0) {
      setInventory({});
      setGold(g => g + totalValue);
    }
  }, [inventory]);

  const buyUpgrade = useCallback(() => {
    const cost = 50 + (upgradeLevel * 30);
    if (gold >= cost) {
      setGold(g => g - cost);
      setUpgradeLevel(l => l + 1);
      return true;
    }
    return false;
  }, [gold, upgradeLevel]);

  const buyUnlock = useCallback((type) => {
    const cost = 500;
    if (gold >= cost && !unlocks[type]) {
      setGold(g => g - cost);
      setUnlocks(u => ({ ...u, [type]: true }));
      return true;
    }
    return false;
  }, [gold, unlocks]);

  const buyRarityUpgrade = useCallback(() => {
    const cost = Math.floor(100 * (1 + rarityLevel * 0.5));
    if (gold >= cost) {
      setGold(g => g - cost);
      setRarityLevel(l => l + 1);
      return true;
    }
    return false;
  }, [gold, rarityLevel]);

  const harvestAll = useCallback(() => {
    if (!unlocks.harvestAll) return;

    setPlants(current => {
      const newPlants = [...current];
      let harvestedCount = 0;
      const harvestedItems = {};

      newPlants.forEach((plant, index) => {
        if (plant && plant.stage === 'adult') {
          newPlants[index] = null;
          harvestedCount++;

          // Count for inventory/collection
          if (!harvestedItems[plant.emoji]) {
            harvestedItems[plant.emoji] = { ...plant, count: 0 };
          }
          harvestedItems[plant.emoji].count++;
        }
      });

      if (harvestedCount === 0) return current;

      // Update Inventory
      setInventory(currInv => {
        const newInv = { ...currInv };
        Object.values(harvestedItems).forEach(item => {
          if (!newInv[item.emoji]) {
            newInv[item.emoji] = { ...item, count: 0 };
          } else {
            newInv[item.emoji] = { ...newInv[item.emoji] }; // Deep copy
          }
          newInv[item.emoji].count += item.count;
        });
        return newInv;
      });

      // Update Collection
      setCollection(currCol => {
        const newCol = { ...currCol };
        Object.values(harvestedItems).forEach(item => {
          if (!newCol[item.emoji]) {
            newCol[item.emoji] = {
              discovered: true,
              count: 0,
              firstDiscoveredAt: new Date().toISOString()
            };
          } else {
            newCol[item.emoji] = { ...newCol[item.emoji] }; // Deep copy
          }
          newCol[item.emoji].count += item.count;
        });
        return newCol;
      });

      return newPlants;
    });
  }, [unlocks.harvestAll]);

  const activateFood = useCallback((type) => {
    const foodTypes = {
      '3min-free': { duration: 180000, multiplier: 0.5, cost: 0, name: '3min Free' },
      '1min': { duration: 60000, multiplier: 2.0, cost: 200, name: '1min Speed' },
      '5min': { duration: 300000, multiplier: 1.0, cost: 150, name: '5min Normal' },
      '10min': { duration: 600000, multiplier: 0.7, cost: 350, name: '10min Slow' }
    };

    const food = foodTypes[type];
    if (!food) return;

    if (gold >= food.cost) {
      setGold(g => g - food.cost);
      setFoodState({
        active: true,
        endTime: Date.now() + food.duration,
        type: type,
        multiplier: food.multiplier
      });
    }
  }, [gold]);

  const cancelFood = useCallback(() => {
    setFoodState({ active: false, endTime: 0, type: null, multiplier: 1 });
  }, []);

  return {
    gold,
    plants,
    inventory,
    collection,
    upgradeLevel,
    unlocks,
    rarityLevel,
    foodState,
    pityCounter,
    harvest,
    sell,
    sellAll,
    buyUpgrade,
    buyUnlock,
    buyRarityUpgrade,
    harvestAll,
    activateFood,
    cancelFood
  };
}
