import { useState, useEffect, useCallback, useRef } from 'react';
import mushroomData from '../data/mushroom_types.json';
import recipeData from '../data/recipes.json';

const TOTAL_SLOTS = 25;
const GROWTH_PROBABILITY = 0.01;

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

  const [fertilizerLevel, setFertilizerLevel] = useState(() => {
    const saved = localStorage.getItem('plant_game_fertilizerLevel');
    return saved ? parseInt(saved) : 0;
  });

  const [consumables, setConsumables] = useState(() => {
    const saved = localStorage.getItem('plant_game_consumables');
    return saved ? JSON.parse(saved) : { seedBomb: 0, growthPotion: 0 };
  });

  const [cookedItems, setCookedItems] = useState(() => {
    const saved = localStorage.getItem('plant_game_cookedItems');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeBuffs, setActiveBuffs] = useState(() => {
    const saved = localStorage.getItem('plant_game_activeBuffs');
    return saved ? JSON.parse(saved) : [];
  });

  const [cookingState, setCookingState] = useState(() => {
    const saved = localStorage.getItem('plant_game_cookingState');
    return saved ? JSON.parse(saved) : { active: false, startTime: 0, duration: 0, ingredients: [], result: null };
  });

  const [discoveredRecipes, setDiscoveredRecipes] = useState(() => {
    const saved = localStorage.getItem('plant_game_discoveredRecipes');
    return saved ? JSON.parse(saved) : [];
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
    localStorage.setItem('plant_game_fertilizerLevel', fertilizerLevel);
    localStorage.setItem('plant_game_consumables', JSON.stringify(consumables));
    localStorage.setItem('plant_game_cookedItems', JSON.stringify(cookedItems));
    localStorage.setItem('plant_game_activeBuffs', JSON.stringify(activeBuffs));
    localStorage.setItem('plant_game_cookingState', JSON.stringify(cookingState));
    localStorage.setItem('plant_game_discoveredRecipes', JSON.stringify(discoveredRecipes));
  }, [gold, plants, inventory, collection, upgradeLevel, unlocks, rarityLevel, foodState, pityCounter, fertilizerLevel, consumables, cookedItems, activeBuffs, cookingState, discoveredRecipes]);

  // --- Refs for Loop ---
  const stateRef = useRef({
    plants,
    foodState,
    upgradeLevel,
    rarityLevel,
    pityCounter,
    fertilizerLevel,
    consumables,
    activeBuffs
  });

  useEffect(() => {
    stateRef.current = { plants, foodState, upgradeLevel, rarityLevel, pityCounter, fertilizerLevel, consumables, activeBuffs };
  }, [plants, foodState, upgradeLevel, rarityLevel, pityCounter, fertilizerLevel, consumables, activeBuffs]);

  // --- Game Loop ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      const { plants: currentPlants, foodState: currentFood, upgradeLevel: currentLevel, rarityLevel: currentRarity, pityCounter: currentPity, activeBuffs: currentBuffs } = stateRef.current;

      // Update Buffs
      const now = Date.now();
      const validBuffs = currentBuffs.filter(buff => buff.endTime > now);
      if (validBuffs.length !== currentBuffs.length) {
        setActiveBuffs(validBuffs);
      }

      // Calculate Buff Multipliers
      let speedMultiplier = 1;
      let spawnMultiplier = 1;

      validBuffs.forEach(buff => {
        if (buff.type === 'speed') speedMultiplier += buff.value;
        if (buff.type === 'spawn_rate') spawnMultiplier += buff.value;
      });

      // Check food expiration
      if (currentFood.active && Date.now() > currentFood.endTime) {
        setFoodState({ active: false, endTime: 0, type: null, multiplier: 1 });
        return; // Skip this tick to update state
      }

      // Calculate Growth Interval
      // Base: 3000ms. Upgrade: -10% per level (max 50%). Food: / multiplier. Buffs: / speedMultiplier
      let baseInterval = (3000 * Math.pow(0.95, currentLevel)) / speedMultiplier;
      if (baseInterval < 1000) baseInterval = 1000; // Cap speed

      setPlants(prevPlants => {
        let newPlants = [...prevPlants];
        let changed = false;

        // 1. Spawning
        const emptyIndices = newPlants.map((p, i) => p === null ? i : -1).filter(i => i !== -1);

        // Only spawn if food is active
        if (!currentFood.active) return prevPlants;

        // Pity System: increase spawn chance with each failure
        const baseChance = GROWTH_PROBABILITY * currentFood.multiplier * spawnMultiplier;
        const pityBonus = currentPity * 0.01; // +1% per failure
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
          // Base: 60s, reduces by 3s per upgrade level, min 5s
          const baseGrowthTime = Math.max(60000 - (currentLevel * 3000), 5000);
          let duration = baseGrowthTime;
          // Fertilizer only affects spawn chance, not growth speed

          newPlants[randomIndex] = {
            ...selectedType,
            id: Date.now() + Math.random(),
            stage: 'baby',
            plantedAt: Date.now(),
            growthProgress: 0, // Track accumulated growth time
            growthDuration: duration
          };

          changed = true;
        } else if (emptyIndices.length > 0) {
          // Spawn failure - increment pity counter
          setPityCounter(prev => prev + 1);
        }

        // 2. Growing
        // Only grow if food is active
        if (currentFood.active) {
          newPlants = newPlants.map(plant => {
            if (plant && plant.stage === 'baby') {
              // Initialize growthProgress if missing (migration for existing plants)
              const currentProgress = plant.growthProgress || 0;
              const newProgress = currentProgress + 1000; // Add 1 second per tick

              if (newProgress >= plant.growthDuration) {
                changed = true;
                return { ...plant, stage: 'adult', growthProgress: newProgress };
              }

              // Update progress
              changed = true;
              return { ...plant, growthProgress: newProgress };
            }
            return plant;
          });
        }

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

    setGold(g => {
      // Apply Gold Buff
      const goldBuff = activeBuffs.find(b => b.type === 'gold');
      const multiplier = goldBuff ? (1 + goldBuff.value) : 1;
      return g + Math.floor(item.value * amount * multiplier);
    });
  }, [inventory, activeBuffs]);

  const sellAll = useCallback(() => {
    let totalValue = 0;
    Object.values(inventory).forEach(item => {
      totalValue += item.value * item.count;
    });

    if (totalValue > 0) {
      setInventory({});
      setGold(g => {
        const goldBuff = activeBuffs.find(b => b.type === 'gold');
        const multiplier = goldBuff ? (1 + goldBuff.value) : 1;
        return g + Math.floor(totalValue * multiplier);
      });
    }
  }, [inventory, activeBuffs]);

  const buyUpgrade = useCallback(() => {
    const cost = 100 + (upgradeLevel * 50);
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

  const buyFertilizerUpgrade = useCallback(() => {
    const cost = 1000 + (fertilizerLevel * 500);
    if (gold >= cost) {
      setGold(g => g - cost);
      setFertilizerLevel(l => l + 1);
    }
  }, [gold, fertilizerLevel]);

  const buyConsumable = useCallback((type, cost) => {
    if (gold >= cost) {
      setGold(g => g - cost);
      setConsumables(prev => ({
        ...prev,
        [type]: (prev[type] || 0) + 1
      }));
    }
  }, [gold]);

  // Helper to get random mushroom type (duplicated logic for seed bomb)
  const getRandomMushroom = (currentRarity) => {
    const weightedMushrooms = mushroomData.mushrooms
      .filter(m => {
        if (m.rarity === 'epic' && currentRarity < 5) return false;
        if (m.rarity === 'legendary' && currentRarity < 10) return false;
        if (m.rarity === 'mythic' && currentRarity < 15) return false;
        return true;
      })
      .map(m => ({
        ...m,
        effectiveWeight: m.rarity === 'common'
          ? m.weight
          : m.weight * (1 + (currentRarity - 1) * 0.1)
      }));

    const totalWeight = weightedMushrooms.reduce((sum, type) => sum + type.effectiveWeight, 0);
    let random = Math.random() * totalWeight;
    for (const type of weightedMushrooms) {
      random -= type.effectiveWeight;
      if (random <= 0) return type;
    }
    return weightedMushrooms[0];
  };

  const useConsumable = useCallback((type) => {
    if (!consumables[type] || consumables[type] <= 0) return;

    let used = false;

    if (type === 'seedBomb') {
      setPlants(prev => {
        const newPlants = [...prev];
        let changed = false;
        for (let i = 0; i < TOTAL_SLOTS; i++) {
          if (!newPlants[i]) {
            const selectedType = getRandomMushroom(rarityLevel);
            // Base: 60s, reduces by 3s per upgrade level, min 5s
            const baseGrowthTime = Math.max(60000 - (upgradeLevel * 3000), 5000);

            newPlants[i] = {
              ...selectedType,
              id: Date.now() + Math.random() + i,
              stage: 'adult',
              plantedAt: Date.now(),
              growthProgress: baseGrowthTime,
              growthDuration: baseGrowthTime
            };
            changed = true;
          }
        }
        if (changed) used = true;
        return changed ? newPlants : prev;
      });
    } else if (type === 'growthPotion') {
      setPlants(prev => {
        const newPlants = prev.map(p => {
          if (p && p.stage === 'baby') {
            used = true;
            return { ...p, stage: 'adult', growthProgress: p.growthDuration };
          }
          return p;
        });
        used = true;
        return newPlants;
      });
    }

    if (used) {
      setConsumables(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
    }
  }, [consumables, rarityLevel, upgradeLevel]);

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

      // Fertilizer Upgrade Effect: +10% duration per level
      const bonusMultiplier = 1 + (fertilizerLevel * 0.1);
      const totalDuration = food.duration * bonusMultiplier;

      setFoodState({
        active: true,
        endTime: Date.now() + totalDuration,
        type: type,
        multiplier: food.multiplier
      });
    }
  }, [gold, fertilizerLevel]);

  const cancelFood = useCallback(() => {
    setFoodState({ active: false, endTime: 0, type: null, multiplier: 1 });
  }, []);

  const startCooking = useCallback((selectedIngredients) => {
    if (selectedIngredients.length !== 3) return;

    // Check if user has ingredients
    const ingredientCounts = {};
    selectedIngredients.forEach(emoji => {
      ingredientCounts[emoji] = (ingredientCounts[emoji] || 0) + 1;
    });

    for (const [emoji, count] of Object.entries(ingredientCounts)) {
      if (!inventory[emoji] || inventory[emoji].count < count) return;
    }

    // Consume ingredients
    setInventory(curr => {
      const newInv = { ...curr };
      selectedIngredients.forEach(emoji => {
        if (newInv[emoji]) {
          newInv[emoji] = { ...newInv[emoji] };
          newInv[emoji].count -= 1;
          if (newInv[emoji].count <= 0) delete newInv[emoji];
        }
      });
      return newInv;
    });

    // Find Recipe
    const sortedIngredients = [...selectedIngredients].sort();
    const recipe = recipeData.recipes.find(r => {
      const rIngredients = [...r.ingredients].sort();
      return JSON.stringify(rIngredients) === JSON.stringify(sortedIngredients);
    });

    if (recipe) {
      setCookingState({
        active: true,
        startTime: Date.now(),
        duration: recipe.time,
        ingredients: selectedIngredients,
        result: recipe
      });
    } else {
      // Mixed Stew (Failure)
      const totalValue = selectedIngredients.reduce((sum, emoji) => {
        const item = mushroomData.mushrooms.find(m => m.emoji === emoji);
        return sum + (item ? item.value : 0);
      }, 0);

      const mixedStew = {
        id: `mixed_stew_${Date.now()}`,
        name: "잡탕 스튜",
        emoji: "🍲",
        description: "알 수 없는 재료들이 뒤섞인 스튜. 맛은 보장할 수 없습니다.",
        value: Math.floor(totalValue * 1.1), // 1.1x Bonus
        count: 1,
        effect: null // No effect
      };

      setCookingState({
        active: true,
        startTime: Date.now(),
        duration: 10000, // 10 seconds default
        ingredients: selectedIngredients,
        result: { ...mixedStew, ingredients: selectedIngredients }
      });
    }
  }, [inventory]);

  const claimDish = useCallback(() => {
    if (!cookingState.active) return;

    const now = Date.now();
    const elapsed = now - cookingState.startTime;
    if (elapsed < cookingState.duration) return;

    const result = cookingState.result;

    // Add to Cooked Items
    setCookedItems(curr => {
      const newItems = { ...curr };
      // If it's a mixed stew (unique ID), add as new entry or stack?
      // Mixed stews have unique IDs, so they might clutter. 
      // Let's make a generic "mixed_stew" ID for stacking if possible, but values differ.
      // For simplicity, let's treat Mixed Stew as a generic item with average value? 
      // User asked for "total price of ingredients", so value varies.
      // To support stacking, we'd need to group by value or just have one "Mixed Stew" type.
      // Let's use the ID from the result. If it's a recipe, ID is constant.

      const itemId = result.id.startsWith('mixed_stew') ? 'mixed_stew' : result.id;

      if (!newItems[itemId]) {
        newItems[itemId] = { ...result, id: itemId, count: 0 };
        // If mixed stew, update value to average or keep last? 
        // Let's just keep the value of the *current* stew for simplicity, or make it unstackable?
        // Making it unstackable might be annoying.
        // Let's make Mixed Stew a fixed item in recipes.json? No, dynamic value.
        // Okay, for now, let's just add it. If ID is unique, it won't stack.
        // If we want to stack Mixed Stews, they need same value.
        // Let's just let them be unique for now if they have different values.
        // Actually, let's use the exact ID from the result.
      } else {
        newItems[itemId] = { ...newItems[itemId] };
      }

      // If it's mixed stew, we might want to average the value or something?
      // Let's just overwrite value for now if it stacks, or keep unique IDs.
      // Unique IDs for mixed stew means inventory clutter.
      // Let's try to make Mixed Stew have a consistent ID 'mixed_stew' but maybe fixed value?
      // User said: "Total price of ingredients".
      // Let's stick to unique IDs for Mixed Stews for now to preserve value.

      if (newItems[itemId].count === undefined) newItems[itemId].count = 0;
      newItems[itemId].count += 1;
      return newItems;
    });

    // Unlock Recipe
    if (!result.id.startsWith('mixed_stew')) {
      setDiscoveredRecipes(prev => {
        if (!prev.includes(result.id)) {
          return [...prev, result.id];
        }
        return prev;
      });
    }

    setCookingState({ active: false, startTime: 0, duration: 0, ingredients: [], result: null });
  }, [cookingState]);

  const useCookedItem = useCallback((recipeId) => {
    if (!cookedItems[recipeId] || cookedItems[recipeId].count <= 0) return;

    const item = cookedItems[recipeId];
    const effect = item.effect;

    // Apply Effect
    if (effect.type === 'instant_growth') {
      setPlants(prev => {
        const newPlants = [...prev];
        let count = effect.value;
        // Find random non-adult plants
        const candidates = newPlants
          .map((p, i) => ({ p, i }))
          .filter(({ p }) => p && p.stage === 'baby');

        // Shuffle candidates
        for (let i = candidates.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        candidates.slice(0, count).forEach(({ i }) => {
          newPlants[i] = { ...newPlants[i], stage: 'adult', growthProgress: newPlants[i].growthDuration };
        });

        return newPlants;
      });
    } else {
      // Buffs (speed, gold, spawn_rate)
      setActiveBuffs(prev => [
        ...prev.filter(b => b.type !== effect.type), // Overwrite same type buff
        {
          type: effect.type,
          value: effect.value,
          endTime: Date.now() + effect.duration,
          name: item.name
        }
      ]);
    }

    // Consume Item
    setCookedItems(curr => {
      const newItems = { ...curr };
      newItems[recipeId] = { ...newItems[recipeId] };
      newItems[recipeId].count -= 1;
      if (newItems[recipeId].count <= 0) delete newItems[recipeId];
      return newItems;
    });

  }, [cookedItems]);

  const sellCookedItem = useCallback((itemId, amount = 1) => {
    const item = cookedItems[itemId];
    if (!item || item.count < amount) return;

    setCookedItems(curr => {
      const newItems = { ...curr };
      newItems[itemId] = { ...newItems[itemId] };
      newItems[itemId].count -= amount;
      if (newItems[itemId].count <= 0) delete newItems[itemId];
      return newItems;
    });

    setGold(g => {
      // Apply Gold Buff
      const goldBuff = activeBuffs.find(b => b.type === 'gold');
      const multiplier = goldBuff ? (1 + goldBuff.value) : 1;
      // Mixed Stew value is already calculated with 1.1x, but let's apply gold buff too?
      // Why not.
      return g + Math.floor(item.value * amount * multiplier);
    });
  }, [cookedItems, activeBuffs]);

  // Developer Commands
  const resetGame = useCallback(() => {
    if (window.confirm('정말 초기화하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const activateGodMode = useCallback(() => {
    setGold(100000);

    const allMushrooms = mushroomData.mushrooms;
    const newInventory = {};

    allMushrooms.forEach(m => {
      newInventory[m.emoji] = {
        ...m,
        count: 99
      };
    });

    setInventory(newInventory);
    alert('God Mode Activated! ⚡');
  }, []);

  return {
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
    cookedItems,
    activeBuffs,
    useCookedItem,
    cookingState,
    discoveredRecipes,
    startCooking,
    claimDish,
    sellCookedItem,
    resetGame,
    activateGodMode
  };
}
