const el = {};
const tabs = ['rankup', 'eta', 'time-to-energy', 'lootcalc', 'ttk', 'raid', 'star', 'checklist']; // ADDED 'lootcalc'

function switchTab(activeTab) {
    tabs.forEach(tab => {
        const panel = el[`panel-${tab}`]; 
        const button = el[`tab-${tab}`];
        if (panel && button) {
            if (tab === activeTab) {
                panel.classList.remove('hidden');
                button.classList.add('active');
            } else {
                panel.classList.add('hidden');
                button.classList.remove('active');
            }
        }
    });
}

const activityData = {};

function setFarmingMode(mode, button) {
    const parent = button.closest('.toggle-container');
    if (!parent) return;

    const buttons = parent.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    if (el.fourSpotFarming) {
        el.fourSpotFarming.checked = (mode === 'four');
        calculateTTK();
    }
}

function setClickerSpeed(speed, button) {
    const parent = button.closest('.toggle-container');
    if (!parent) return;

    const buttons = parent.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const isFast = (speed === 'fast');
    
    const checkboxId = button.dataset.clickerspeed || button.dataset.clickerspeedEta || button.dataset.clickerspeedTte || button.dataset.clickerspeedLoot;

    // Handle Loot Calc's dedicated checkbox if it exists, otherwise fall back to others
    if (el.clickerSpeedLoot) el.clickerSpeedLoot.checked = isFast;
    if (el.clickerSpeed) el.clickerSpeed.checked = isFast;
    if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isFast;
    if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isFast;

    calculateRankUp();
    calculateEnergyETA();
    calculateTimeToEnergy();
    calculateLootDrops();
}

function copyResult(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.innerText !== '0s' && element.innerText !== 'N/A' && element.innerText !== '0') {
        navigator.clipboard.writeText(element.innerText).then(() => {
            const originalBg = element.style.backgroundColor;
            element.style.backgroundColor = '#10b981';
            setTimeout(() => {
                element.style.backgroundColor = originalBg;
            }, 200);
        });
    }
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = localStorage.getItem('ae_theme') || 'dark';
    
    if (currentTheme === 'dark') {
        body.className = 'game-theme';
        localStorage.setItem('ae_theme', 'game');
    } else if (currentTheme === 'game') {
        body.className = 'blue-theme';
        localStorage.setItem('ae_theme', 'blue');
    } else {
        body.className = '';
        localStorage.setItem('ae_theme', 'dark');
    }
}




function getNumberValue(id) {
    if (el[id]) {
        return parseFloat(el[id].value) || 0;
    }
    return 0;
}

function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    // Defensive check: ensure denominations is defined
    const reversedDenominations = typeof denominations !== 'undefined' ? [...denominations].reverse() : [];
    for (const denom of reversedDenominations) {
        if (denom.value > 1 && num >= denom.value) {
            return `${(num / denom.value).toFixed(2)}${denom.name}`;
        }
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatTime(timeInSeconds) {
    const MAX_SECONDS_CAP = 3.154e10;
    if (timeInSeconds > MAX_SECONDS_CAP || !isFinite(timeInSeconds)) {
        return "Over 1000 Years";
    }
    
    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);

    let resultString = '';
    if (days > 0) resultString += `${days}d `;
    if (hours > 0 || days > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;

    return resultString.trim();
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function saveRankUpData() {
    try {
        if (el.rankSelect) localStorage.setItem('ae_rankSelect', el.rankSelect.value);
        if (el.rankInput) localStorage.setItem('ae_rankInput', el.rankInput.value);
        if (el.currentEnergy) localStorage.setItem('ae_currentEnergy', el.currentEnergy.value);
        if (el.currentEnergyDenominationInput) localStorage.setItem('ae_currentEnergyDenomInput', el.currentEnergyDenominationInput.value);
        if (el.currentEnergyDenominationValue) localStorage.setItem('ae_currentEnergyDenomValue', el.currentEnergyDenominationValue.value);
        if (el.energyPerClick) localStorage.setItem('ae_energyPerClick', el.energyPerClick.value);
        if (el.energyPerClickDenominationInput) localStorage.setItem('ae_energyPerClickDenomInput', el.energyPerClickDenominationInput.value);
        if (el.energyPerClickDenominationValue) localStorage.setItem('ae_energyPerClickDenomValue', el.energyPerClickDenominationValue.value);
        if (el.clickerSpeed) localStorage.setItem('ae_clickerSpeed', el.clickerSpeed.checked);
    } catch (e) {
        console.error("Failed to save rankup data to localStorage", e);
    }
}

function loadRankUpData() {
    try {
        const rankSelect = localStorage.getItem('ae_rankSelect');
        if (rankSelect && el.rankSelect) {
            el.rankSelect.value = rankSelect;
            if (el.rankInput) el.rankInput.value = rankSelect;
        }

        const rankInput = localStorage.getItem('ae_rankInput');
        if (rankInput && el.rankInput) el.rankInput.value = rankInput;

        const currentEnergy = localStorage.getItem('ae_currentEnergy');
        if (currentEnergy && el.currentEnergy) el.currentEnergy.value = currentEnergy;

        const currentEnergyDenomInput = localStorage.getItem('ae_currentEnergyDenomInput');
        if (currentEnergyDenomInput && el.currentEnergyDenominationInput) el.currentEnergyDenominationInput.value = currentEnergyDenomInput;

        const currentDenom = denominations.find(d => d.name === currentEnergyDenomInput);
        if (el.currentEnergyDenominationValue) {
            el.currentEnergyDenominationValue.value = currentDenom ? currentDenom.value : '1';
        }

        const energyPerClick = localStorage.getItem('ae_energyPerClick');
        if (energyPerClick && el.energyPerClick) el.energyPerClick.value = energyPerClick;

        const energyPerClickDenomInput = localStorage.getItem('ae_energyPerClickDenomInput');
        if (energyPerClickDenomInput && el.energyPerClickDenominationInput) el.energyPerClickDenominationInput.value = energyPerClickDenomInput;

        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomInput);
        if (el.energyPerClickDenominationValue) {
            el.energyPerClickDenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }

        const clickerSpeed = localStorage.getItem('ae_clickerSpeed');
        const isFast = (clickerSpeed === 'true');
        
        if (el.clickerSpeed) {
            el.clickerSpeed.checked = isFast;
            
            const parentDiv = el.clickerSpeed.parentElement;
            if (parentDiv) {
                const buttonToActivate = isFast ? parentDiv.querySelector('.toggle-btn[data-clickerspeed="fast"]') : parentDiv.querySelector('.toggle-btn[data-clickerspeed="slow"]');
                if (buttonToActivate) {
                    setClickerSpeed(isFast ? 'fast' : 'slow', buttonToActivate);
                }
            }
        }

        displayRankRequirement();
        calculateRankUp();

    } catch (e) {
        console.error("Failed to load rankup data to localStorage", e);
    }
}

function saveETAData() {
    try {
        if (el.targetEnergyETA) localStorage.setItem('ae_targetEnergyETA', el.targetEnergyETA.value);
        if (el.targetEnergyETADenominationInput) localStorage.setItem('ae_targetEnergyETADenomInput', el.targetEnergyETADenominationInput.value);
        if (el.targetEnergyETADenominationValue) localStorage.setItem('ae_targetEnergyETADenomValue', el.targetEnergyETADenominationValue.value);
    } catch(e) {
        console.error("Failed to save ETA data to localStorage", e);
    }
}

function loadETAData() {
    try {
        const currentEnergyNum = localStorage.getItem('ae_currentEnergy') || '';
        if (el.currentEnergyETA) el.currentEnergyETA.value = currentEnergyNum;

        const currentEnergyDenomText = localStorage.getItem('ae_currentEnergyDenomInput') || '';
        if (el.currentEnergyETADenominationInput) el.currentEnergyETADenominationInput.value = currentEnergyDenomText;

        const currentDenom = denominations.find(d => d.name === currentEnergyDenomText);
        if (el.currentEnergyETADenominationValue) {
            el.currentEnergyETADenominationValue.value = currentDenom ? currentDenom.value : '1';
        }
        
        const energyPerClickNum = localStorage.getItem('ae_energyPerClick') || '';
        if (el.energyPerClickETA) el.energyPerClickETA.value = energyPerClickNum;

        const energyPerClickDenomText = localStorage.getItem('ae_energyPerClickDenomInput') || '';
        if (el.energyPerClickETADenominationInput) el.energyPerClickETADenominationInput.value = energyPerClickDenomText;

        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomText);
        if (el.energyPerClickETADenominationValue) {
            el.energyPerClickETADenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }
        
        const targetEnergyNum = localStorage.getItem('ae_targetEnergyETA') || '';
        if (el.targetEnergyETA) el.targetEnergyETA.value = targetEnergyNum;

        const targetEnergyDenomText = localStorage.getItem('ae_targetEnergyETADenominationInput') || '';
        if (el.targetEnergyETADenominationInput) el.targetEnergyETADenominationInput.value = targetEnergyDenomText;

        const targetDenom = denominations.find(d => d.name === targetEnergyDenomText);
        if (el.targetEnergyETADenominationValue) {
            el.targetEnergyETADenominationValue.value = targetDenom ? targetDenom.value : '1';
        }
        
        const clickerSpeed = localStorage.getItem('ae_clickerSpeed');
        const isFast = (clickerSpeed === 'true');

        if (el.clickerSpeedETA) {
            el.clickerSpeedETA.checked = isFast;
            
            const parentDiv = el.clickerSpeedETA.parentElement;
            if (parentDiv) {
                const buttonToActivate = isFast ? parentDiv.querySelector('.toggle-btn[data-clickerspeed-eta="fast"]') : parentDiv.querySelector('.toggle-btn[data-clickerspeed-eta="slow"]');
                if (buttonToActivate) {
                    setClickerSpeed(isFast ? 'fast' : 'slow', buttonToActivate);
                }
            }
        }

        calculateEnergyETA();
    } catch(e) {
        console.error("Failed to load ETA data from localStorage", e);
    }
}

function saveTTKData() {
    try {
        if (el.worldSelect) localStorage.setItem('ae_ttk_world', el.worldSelect.value);
        if (el.enemySelect) localStorage.setItem('ae_ttk_enemy', el.enemySelect.value);
        if (el.yourDPS) localStorage.setItem('ae_ttk_dps', el.yourDPS.value);
        if (el.dpsDenominationInput) localStorage.setItem('ae_ttk_dpsDenomInput', el.dpsDenominationInput.value);
        if (el.dpsDenominationValue) localStorage.setItem('ae_ttk_dpsDenomValue', el.dpsDenominationValue.value);
        if (el.enemyQuantity) localStorage.setItem('ae_ttk_quantity', el.enemyQuantity.value);
        if (el.fourSpotFarming) localStorage.setItem('ae_ttk_fourSpot', el.fourSpotFarming.checked);
    } catch (e) {
        console.error("Failed to save TTK data to localStorage", e);
    }
}

function loadTTKData() {
    try {
        const dps = localStorage.getItem('ae_ttk_dps');
        const dpsDenomInput = localStorage.getItem('ae_ttk_dpsDenomInput');
        const quantity = localStorage.getItem('ae_ttk_quantity');
        const fourSpot = localStorage.getItem('ae_ttk_fourSpot');
        const world = localStorage.getItem('ae_ttk_world');
        const enemy = localStorage.getItem('ae_ttk_enemy');

        if (el.yourDPS) el.yourDPS.value = dps || '';
        if (el.dpsDenominationInput) el.dpsDenominationInput.value = dpsDenomInput || '';
        
        const dpsDenom = denominations.find(d => d.name === dpsDenomInput);
        if (el.dpsDenominationValue) {
            el.dpsDenominationValue.value = dpsDenom ? dpsDenom.value : '1';
        }

        if (quantity && el.enemyQuantity) el.enemyQuantity.value = quantity;
        
        if (fourSpot !== null && el.fourSpotFarming) {
            el.fourSpotFarming.checked = (fourSpot === 'true');
        }

        const ttkPanel = el['panel-ttk'];
        if (ttkPanel) {
            const singleBtn = ttkPanel.querySelector('.toggle-btn[data-farming-mode="single"]');
            const fourBtn = ttkPanel.querySelector('.toggle-btn[data-farming-mode="four"]');

            if (singleBtn && fourBtn) {
                if (el.fourSpotFarming.checked) {
                    singleBtn.classList.remove('active');
                    fourBtn.classList.add('active');
                } else {
                    singleBtn.classList.add('active');
                    fourBtn.classList.remove('active');
                }
            }
        }
        
        if (world && el.worldSelect) {
            el.worldSelect.value = world;
        }

        if (enemy && el.enemySelect) {
             el.tempWorld = world;
             el.tempEnemy = enemy;
        }
    } catch (e) {
        console.error("Failed to load TTK data from localStorage", e);
    }
}

function saveRaidData() {
    try {
        if (el.activitySelect) localStorage.setItem('ae_raid_activity', el.activitySelect.value);
        if (el.yourDPSActivity) localStorage.setItem('ae_raid_dps', el.yourDPSActivity.value);
        if (el.dpsActivityDenominationInput) localStorage.setItem('ae_raid_dpsDenomInput', el.dpsActivityDenominationInput.value);
        if (el.dpsActivityDenominationValue) localStorage.setItem('ae_raid_dpsDenomValue', el.dpsActivityDenominationValue.value);
        if (el.activityTimeLimit) localStorage.setItem('ae_raid_timeLimit', el.activityTimeLimit.value);
        if (el.keyRunQuantity) localStorage.setItem('ae_raid_key_quantity', el.keyRunQuantity.value);
    } catch (e) {
        console.error("Failed to save Raid data to localStorage", e);
    }
}

function loadRaidData() {
    try {
        const activity = localStorage.getItem('ae_raid_activity');
        if (activity && el.activitySelect) {
            if (el.activitySelect.querySelector(`option[value="${activity}"]`)) {
                el.activitySelect.value = activity;
            } else {
                console.warn(`Saved activity "${activity}" not found in dropdown.`);
            }
        }

        const dps = localStorage.getItem('ae_raid_dps');
        if (dps && el.yourDPSActivity) el.yourDPSActivity.value = dps;

        const dpsDenomInput = localStorage.getItem('ae_raid_dpsDenomInput');
        if (dpsDenomInput && el.dpsActivityDenominationInput) el.dpsActivityDenominationInput.value = dpsDenomInput;
        
        const dpsDenom = denominations.find(d => d.name === dpsDenomInput);
        if (el.dpsActivityDenominationValue) {
            el.dpsActivityDenominationValue.value = dpsDenom ? dpsDenom.value : '1';
        }

        const timeLimit = localStorage.getItem('ae_raid_timeLimit');
        if (timeLimit && el.activityTimeLimit) el.activityTimeLimit.value = timeLimit;
        
        const quantity = localStorage.getItem('ae_raid_key_quantity');
        if (quantity && el.keyRunQuantity) el.keyRunQuantity.value = quantity;
        
        // Trigger necessary updates since values have been loaded
        handleActivityChange();
        calculateMaxStage();
        calculateKeyRunTime();
    } catch (e) {
        console.error("Failed to load Raid data from localStorage", e);
    }
}

function saveTimeToEnergyData() {
    try {
        if (el.currentEnergyTTE) localStorage.setItem('ae_tte_currentEnergy', el.currentEnergyTTE.value);
        if (el.currentEnergyTTEDenominationInput) localStorage.setItem('ae_tte_currentEnergyDenomInput', el.currentEnergyTTEDenominationInput.value);
        if (el.currentEnergyTTEDenominationValue) localStorage.setItem('ae_tte_currentEnergyDenomValue', el.currentEnergyTTEDenominationValue.value);

        if (el.energyPerClickTTE) localStorage.setItem('ae_tte_energyPerClick', el.energyPerClickTTE.value);
        if (el.energyPerClickTTEDenominationInput) localStorage.setItem('ae_tte_energyPerClickDenomInput', el.energyPerClickTTEDenominationInput.value);
        if (el.energyPerClickTTEDenominationValue) localStorage.setItem('ae_tte_energyPerClickDenomValue', el.energyPerClickTTEDenominationValue.value);

        if (el.timeToReturnSelect) localStorage.setItem('ae_tte_returnTime', el.timeToReturnSelect.value); 
        if (el.timeToReturnSelectMinutes) localStorage.setItem('ae_tte_returnTimeMinutes', el.timeToReturnSelectMinutes.value);

        if (el.clickerSpeedTTE) localStorage.setItem('ae_clickerSpeed', el.clickerSpeedTTE.checked); 

        if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
            boostItems.filter(item => item.type === 'energy').forEach(item => {
                const hoursEl = el[`boost-${item.id}-hours`];
                const minutesEl = el[`boost-${item.id}-minutes`];
                if (hoursEl) {
                    localStorage.setItem(`ae_tte_boost_${item.id}_hours`, hoursEl.value);
                }
                if (minutesEl) {
                    localStorage.setItem(`ae_tte_boost_${item.id}_minutes`, minutesEl.value);
                }
            });
        }
    } catch (e) {
        console.error("Failed to save TimeToEnergy data to localStorage", e);
    }
}

function loadTimeToEnergyData() {
     try {
        const currentEnergyNum = localStorage.getItem('ae_tte_currentEnergy') || '';
        if (el.currentEnergyTTE) el.currentEnergyTTE.value = currentEnergyNum;
        
        const currentEnergyDenomText = localStorage.getItem('ae_tte_currentEnergyDenomInput') || '';
        if (el.currentEnergyTTEDenominationInput) el.currentEnergyTTEDenominationInput.value = currentEnergyDenomText;
        
        const currentDenom = denominations.find(d => d.name === currentEnergyDenomText);
        if (el.currentEnergyTTEDenominationValue) {
            el.currentEnergyTTEDenominationValue.value = currentDenom ? currentDenom.value : '1';
        }

        const energyPerClickNum = localStorage.getItem('ae_tte_energyPerClick') || '';
        if (el.energyPerClickTTE) el.energyPerClickTTE.value = energyPerClickNum;

        const energyPerClickDenomText = localStorage.getItem('ae_tte_energyPerClickDenomInput') || '';
        if (el.energyPerClickTTEDenominationInput) el.energyPerClickTTEDenominationInput.value = energyPerClickDenomText;

        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomText);
        if (el.energyPerClickTTEDenominationValue) {
            el.energyPerClickTTEDenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }

        const returnTime = localStorage.getItem('ae_tte_returnTime');
        if (returnTime && el.timeToReturnSelect) {
            el.timeToReturnSelect.value = returnTime;
        }
        const returnTimeMinutes = localStorage.getItem('ae_tte_returnTimeMinutes');
        if (returnTimeMinutes && el.timeToReturnSelectMinutes) {
            el.timeToReturnSelectMinutes.value = returnTimeMinutes;
        }

        const clickerSpeed = localStorage.getItem('ae_clickerSpeed');
        const isFast = (clickerSpeed === 'true');
        
        if (el.clickerSpeedTTE) {
            el.clickerSpeedTTE.checked = isFast;
            
            const parentDiv = el.clickerSpeedTTE.parentElement;
            if (parentDiv) {
                const buttonToActivate = isFast ? parentDiv.querySelector('.toggle-btn[data-clickerspeed-tte="fast"]') : parentDiv.querySelector('.toggle-btn[data-clickerspeed-tte="slow"]');
                if (buttonToActivate) {
                    setClickerSpeed(isFast ? 'fast' : 'slow', buttonToActivate);
                }
            }
        }


        if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
            boostItems.filter(item => item.type === 'energy').forEach(item => {
                const hoursEl = el[`boost-${item.id}-hours`];
                const minutesEl = el[`boost-${item.id}-minutes`];
                const savedHours = localStorage.getItem(`ae_tte_boost_${item.id}_hours`);
                const savedMinutes = localStorage.getItem(`ae_tte_boost_${item.id}_minutes`);
                
                if (hoursEl && savedHours !== null) {
                    hoursEl.value = savedHours;
                }
                if (minutesEl && savedMinutes !== null) {
                    minutesEl.value = savedMinutes;
                }
            });
        }

        calculateTimeToEnergy();
    } catch (e) {
        console.error("Failed to load TimeToEnergy data from localStorage", e);
    }
}

function saveLootData() {
    try {
        if (el.lootDropMin) localStorage.setItem('ae_loot_dropMin', el.lootDropMin.value);
        if (el.lootDropMax) localStorage.setItem('ae_loot_dropMax', el.lootDropMax.value);
        if (el.lootBaseDropRate) localStorage.setItem('ae_loot_baseRate', el.lootBaseDropRate.value);
        if (el.lootTimeTargetHours) localStorage.setItem('ae_loot_targetHours', el.lootTimeTargetHours.value);
        if (el.lootTimeTargetMinutes) localStorage.setItem('ae_loot_targetMinutes', el.lootTimeTargetMinutes.value);
        if (el.yourKillsPerSecond) localStorage.setItem('ae_loot_kps', el.yourKillsPerSecond.value);
        if (el.lootDropTargetCount) localStorage.setItem('ae_loot_targetCount', el.lootDropTargetCount.value);
        if (el.clickerSpeedLoot) localStorage.setItem('ae_loot_clickerSpeed', el.clickerSpeedLoot.checked);
        
        if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
            boostItems.filter(item => item.type && item.type.startsWith('loot')).forEach(item => {
                const hoursEl = el[`boost-${item.id}-hours`];
                const minutesEl = el[`boost-${item.id}-minutes`];
                if (hoursEl) {
                    localStorage.setItem(`ae_loot_boost_${item.id}_hours`, hoursEl.value);
                }
                if (minutesEl) {
                    localStorage.setItem(`ae_loot_boost_${item.id}_minutes`, minutesEl.value);
                }
            });
        }

    } catch (e) {
        console.error("Failed to save Loot data to localStorage", e);
    }
}

function loadLootData() {
    try {
        // Load Input Fields (Defaulting to expected user values)
        if (el.lootDropMin) el.lootDropMin.value = localStorage.getItem('ae_loot_dropMin') || 1;
        if (el.lootDropMax) el.lootDropMax.value = localStorage.getItem('ae_loot_dropMax') || 1;
        if (el.lootBaseDropRate) el.lootBaseDropRate.value = localStorage.getItem('ae_loot_baseRate') || 10; // Changed default from 0.1 to 10
        if (el.lootTimeTargetHours) el.lootTimeTargetHours.value = localStorage.getItem('ae_loot_targetHours') || 1;
        if (el.lootTimeTargetMinutes) el.lootTimeTargetMinutes.value = localStorage.getItem('ae_loot_targetMinutes') || 0;
        if (el.yourKillsPerSecond) el.yourKillsPerSecond.value = localStorage.getItem('ae_loot_kps') || 1.0;
        if (el.lootDropTargetCount) el.lootDropTargetCount.value = localStorage.getItem('ae_loot_targetCount') || 1;

        const clickerSpeed = localStorage.getItem('ae_loot_clickerSpeed');
        const isFast = (clickerSpeed === 'true');
        if (el.clickerSpeedLoot) {
            el.clickerSpeedLoot.checked = isFast;
        }

        // Load Boost Durations
        if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
            boostItems.filter(item => item.type && item.type.startsWith('loot')).forEach(item => {
                const hoursEl = el[`boost-${item.id}-hours`];
                const minutesEl = el[`boost-${item.id}-minutes`];
                const savedHours = localStorage.getItem(`ae_loot_boost_${item.id}_hours`);
                const savedMinutes = localStorage.getItem(`ae_loot_boost_${item.id}_minutes`);
                
                if (hoursEl && savedHours !== null) hoursEl.value = savedHours;
                if (minutesEl && savedMinutes !== null) minutesEl.value = savedMinutes;
            });
        }
        
        // Update Clicker Speed Toggle
        const lootPanel = el['panel-lootcalc'];
        if (lootPanel) {
            const slowBtn = lootPanel.querySelector('.toggle-btn[data-clickerspeed-loot="slow"]');
            const fastBtn = lootPanel.querySelector('.toggle-btn[data-clickerspeed-loot="fast"]');
            if (slowBtn && fastBtn) {
                if (isFast) {
                    slowBtn.classList.remove('active');
                    fastBtn.classList.add('active');
                } else {
                    slowBtn.classList.add('active');
                    fastBtn.classList.remove('active');
                }
            }
        }

        calculateLootDrops();
    } catch (e) {
        console.error("Failed to load Loot data from localStorage", e);
    }
}


function calculateStarData() {
    try {
        const level = localStorage.getItem('ae_star_level');
        if (level && el.starLevelSelect) el.starLevelSelect.value = level;

        const speed = localStorage.getItem('ae_star_speed');
        if (speed && el.starSpeedSelect) el.starSpeedSelect.value = speed;

        const amount = localStorage.getItem('ae_star_amount');
        if (amount && el.starAmount) el.starAmount.value = amount;

        const baseLuck = localStorage.getItem('ae_star_baseLuck');
        if (baseLuck && el.starBaseLuck) el.starBaseLuck.value = baseLuck;
        
        const timeHours = localStorage.getItem('ae_star_timeHours');
        if (timeHours && el.starTimeHours) el.starTimeHours.value = timeHours;

        displayStarCost();
        calculateStarCalc();

    } catch (e) {
        console.error("Failed to load Star data to localStorage", e);
    }
}


function calculateEnergyETA() {
    if (!el.etaResult) return;

    const isFastClicker = el.clickerSpeedETA ? el.clickerSpeedETA.checked : false;

    const currentEnergyValue = getNumberValue('currentEnergyETA');
    const currentEnergyDenom = el.currentEnergyETADenominationValue ? (parseFloat(el.currentEnergyETADenominationValue.value) || 1) : 1;
    const currentEnergy = currentEnergyValue * currentEnergyDenom;

    const targetEnergyValue = getNumberValue('targetEnergyETA');
    const targetEnergyDenom = el.targetEnergyETADenominationValue ? (parseFloat(el.targetEnergyETADenominationValue.value) || 1) : 1;
    const targetEnergy = targetEnergyValue * targetEnergyDenom;

    const energyPerClickValue = getNumberValue('energyPerClickETA');
    const energyPerClickDenom = el.energyPerClickETADenominationValue ? (parseFloat(el.energyPerClickETADenominationValue.value) || 1) : 1;
    const energyPerClick = energyPerClickValue * energyPerClickDenom;

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = targetEnergy - currentEnergy;
    const returnTimeEl = el.etaReturnTime;

    if (energyNeeded <= 0) {
        el.etaResult.innerText = 'Target Reached!';
        if (returnTimeEl) returnTimeEl.innerText = "You're already there!";
        return;
    }
    if (energyPerClick <= 0 || clicksPerSecond <= 0) {
        el.etaResult.innerText = 'N/A';
        if (returnTimeEl) returnTimeEl.innerText = '';
        saveETAData();
        return;
    }

    const timeInSeconds = (energyNeeded / energyPerClick) / clicksPerSecond;

    let resultString = formatTime(timeInSeconds);

    el.etaResult.innerText = resultString.trim();

    if (returnTimeEl) {
        const now = new Date();
        const returnTime = new Date(now.getTime() + timeInSeconds * 1000);
        const returnString = returnTime.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        returnTimeEl.innerText = `Return on: ${returnString}`;
    }
    saveETAData();
}

function calculateTimeToEnergy() {
    if (!el.timeToEnergyResult || typeof boostItems === 'undefined') return;

    const isFastClicker = el.clickerSpeedTTE ? el.clickerSpeedTTE.checked : false;

    const currentEnergyValue = getNumberValue('currentEnergyTTE');
    const currentEnergyDenom = el.currentEnergyTTEDenominationValue ? (parseFloat(el.currentEnergyTTEDenominationValue.value) || 1) : 1;
    const currentEnergy = currentEnergyValue * currentEnergyDenom;

    const energyPerClickValue = getNumberValue('energyPerClickTTE');
    const energyPerClickDenom = el.energyPerClickTTEDenominationValue ? (parseFloat(el.energyPerClickTTEDenominationValue.value) || 1) : 1;
    const energyPerClick = energyPerClickValue * energyPerClickDenom;

    const timeInHours = getNumberValue('timeToReturnSelect');
    const timeInMinutes = getNumberValue('timeToReturnSelectMinutes');
    const targetTimeInSeconds = (timeInHours * 3600) + (timeInMinutes * 60);

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const baseEnergyPerSecond = energyPerClick * clicksPerSecond;

    const returnTimeEl = el.timeToEnergyReturnTime;
    const resultEl = el.timeToEnergyResult;
    const tableBody = el.boostSimulationTableBody;

    if (baseEnergyPerSecond <= 0 || targetTimeInSeconds <= 0) {
        resultEl.innerText = formatNumber(currentEnergy);
        if (returnTimeEl) returnTimeEl.innerText = "Select a time";
        if (tableBody) tableBody.innerHTML = '';
        saveTimeToEnergyData();
        return;
    }

    
    const allActiveBoosts = [];
    boostItems.filter(item => item.type === 'energy').forEach(item => {
        const hours = getNumberValue(`boost-${item.id}-hours`);
        const minutes = getNumberValue(`boost-${item.id}-minutes`);
        const duration = (hours * 3600) + (minutes * 60);

        if (duration > 0) {
            allActiveBoosts.push({
                id: item.id,
                multiplier: item.multiplier,
                duration: duration
            });
        }
    });

    const primaryChainIds = ['spooky-energy-potion', 'energy-potion', 'small-potion'];
    const secondaryChainIds = ['energy-macaron', 'chocolat-bar'];

    const calculateEnergyForDuration = (targetDuration) => {
        let currentTotalEnergyGained = 0;
        let remainingDuration = targetDuration;
        
        const primaryQueue = allActiveBoosts.filter(b => primaryChainIds.includes(b.id))
                                         .sort((a, b) => primaryChainIds.indexOf(a.id) - primaryChainIds.indexOf(b.id));
        
        const secondaryQueue = allActiveBoosts.filter(b => secondaryChainIds.includes(b.id))
                                           .sort((a, b) => secondaryChainIds.indexOf(a.id) - secondaryChainIds.indexOf(b.id));

        const primaryRemaining = new Map(primaryQueue.map(b => [b.id, b.duration]));
        const secondaryRemaining = new Map(secondaryQueue.map(b => [b.id, b.duration]));

        while (remainingDuration > 0 && (primaryQueue.length > 0 || secondaryQueue.length > 0)) {
            
            const currentPrimary = primaryQueue.length > 0 ? primaryQueue[0] : null;
            const currentSecondary = secondaryQueue.length > 0 ? secondaryQueue[0] : null;

            let currentPrimaryMultiplier = currentPrimary ? currentPrimary.multiplier : 1.0;
            let currentSecondaryMultiplier = currentSecondary ? currentSecondary.multiplier : 1.0;
            
            let segmentDuration = remainingDuration;

            if (currentPrimary) {
                segmentDuration = Math.min(segmentDuration, primaryRemaining.get(currentPrimary.id));
            }
            if (currentSecondary) {
                segmentDuration = Math.min(segmentDuration, secondaryRemaining.get(currentSecondary.id));
            }

            const totalMultiplier = currentPrimaryMultiplier * currentSecondaryMultiplier;
            const energyInSegment = baseEnergyPerSecond * totalMultiplier * segmentDuration;
            currentTotalEnergyGained += energyInSegment;
            
            remainingDuration -= segmentDuration;

            if (currentPrimary) {
                const newTime = primaryRemaining.get(currentPrimary.id) - segmentDuration;
                primaryRemaining.set(currentPrimary.id, newTime);
                if (newTime <= 0) {
                    primaryQueue.shift();
                }
            }
            if (currentSecondary) {
                const newTime = secondaryRemaining.get(currentSecondary.id) - segmentDuration;
                secondaryRemaining.set(currentSecondary.id, newTime);
                if (newTime <= 0) {
                    secondaryQueue.shift();
                }
            }
        }
        
        if (remainingDuration > 0) {
            currentTotalEnergyGained += baseEnergyPerSecond * 1.0 * remainingDuration;
        }

        return currentEnergy + currentTotalEnergyGained;
    };


    const finalTotalEnergy = calculateEnergyForDuration(targetTimeInSeconds);

    resultEl.innerText = formatNumber(finalTotalEnergy);

    if (returnTimeEl) {
        const now = new Date();
        const returnTime = new Date(now.getTime() + targetTimeInSeconds * 1000);
        const returnString = returnTime.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        returnTimeEl.innerText = `Return on: ${returnString}`;
    }
    
    if (tableBody) {
        tableBody.innerHTML = ''; 
    }

    saveTimeToEnergyData();
}

function calculateLootDrops() {
    if (typeof boostItems === 'undefined' || !el.lootEstimatedDropsResult) return;

    // Inputs
    const minDrop = getNumberValue('lootDropMin') || 1;
    const maxDrop = getNumberValue('lootDropMax') || 1;
    const baseRate = getNumberValue('lootBaseDropRate') / 100; // Convert % input (e.g., 10) to decimal (0.1)
    const targetHours = getNumberValue('lootTimeTargetHours');
    const targetMinutes = getNumberValue('lootTimeTargetMinutes');
    const targetDrops = getNumberValue('lootDropTargetCount') || 1;
    const killsPerSecond = getNumberValue('yourKillsPerSecond') || 1; // KPS is user-provided and includes respawn time

    const targetTimeInSeconds = (targetHours * 3600) + (targetMinutes * 60);

    const baseKillsPerSecond = killsPerSecond > 0 ? killsPerSecond : 1; 
    
    // 1. Get Loot Boosts
    const lootBoosts = boostItems.filter(item => item.type && item.type.startsWith('loot'));

    const allActiveBoosts = [];
    lootBoosts.forEach(item => {
        const hours = getNumberValue(`boost-${item.id}-hours`);
        const minutes = getNumberValue(`boost-${item.id}-minutes`);
        const duration = (hours * 3600) + (minutes * 60);

        if (duration > 0) {
            allActiveBoosts.push({
                id: item.id,
                type: item.type,
                value: item.type === 'loot_mult' ? item.multiplier : item.additive,
                duration: duration
            });
        }
    });

    const multiplicativeBoosts = allActiveBoosts.filter(b => b.type === 'loot_mult')
                                                .sort((a, b) => b.value - a.value); // Sort descending multiplier
    
    const additiveBoosts = allActiveBoosts.filter(b => b.type === 'loot_add')
                                          .sort((a, b) => b.value - a.value); // Sort descending additive value

    let totalDropsEstimate = 0;
    let timeRemaining = targetTimeInSeconds;

    // Boost Calculation Loop
    while (timeRemaining > 0 && (multiplicativeBoosts.length > 0 || additiveBoosts.length > 0)) {
        
        let segmentDuration = timeRemaining;
        let currentMultiplier = 1.0;
        let currentAdditiveRate = 0;

        // Determine current multiplicative boost and its duration
        const activeMultBoost = multiplicativeBoosts.length > 0 ? multiplicativeBoosts[0] : null;
        if (activeMultBoost) {
            currentMultiplier = activeMultBoost.value;
            segmentDuration = Math.min(segmentDuration, activeMultBoost.duration);
        }

        // Determine current additive boost and its duration
        const activeAddBoost = additiveBoosts.length > 0 ? additiveBoosts[0] : null;
        if (activeAddBoost) {
            currentAdditiveRate = activeAddBoost.value;
            segmentDuration = Math.min(segmentDuration, activeAddBoost.duration);
        }
        
        // Final effective rate and drop range for this segment
        const effectiveDropRate = Math.min(baseRate + currentAdditiveRate, 1.0); // Cap rate at 100% (1.0)
        const avgDropCount = (minDrop * currentMultiplier + maxDrop * currentMultiplier) / 2;
        
        // Calculate expected drops in this segment
        const segmentKills = baseKillsPerSecond * segmentDuration;
        const dropsInSegment = segmentKills * effectiveDropRate * avgDropCount;

        totalDropsEstimate += dropsInSegment;
        
        // Advance time and update boost queues
        timeRemaining -= segmentDuration;
        
        if (activeMultBoost) {
            activeMultBoost.duration -= segmentDuration;
            if (activeMultBoost.duration <= 0) multiplicativeBoosts.shift();
        }
        if (activeAddBoost) {
            activeAddBoost.duration -= segmentDuration;
            if (activeAddBoost.duration <= 0) additiveBoosts.shift();
        }
    }

    // After all boosts expire (if any time remains)
    if (timeRemaining > 0) {
        const effectiveDropRate = baseRate;
        const avgDropCount = (minDrop + maxDrop) / 2;
        const segmentKills = baseKillsPerSecond * timeRemaining;
        totalDropsEstimate += segmentKills * effectiveDropRate * avgDropCount;
    }
    
    // Results Calculation (Time to Target Drop Count)
    const overallAvgDropRatePerSecond = targetTimeInSeconds > 0 ? totalDropsEstimate / targetTimeInSeconds : 0;
    let timeToTargetDrops = 0;
    
    if (overallAvgDropRatePerSecond > 0) {
        timeToTargetDrops = targetDrops / overallAvgDropRatePerSecond;
    }

    // Display Estimated Total Drops
    if (el.lootEstimatedDropsResult) {
        el.lootEstimatedDropsResult.innerText = formatNumber(Math.floor(totalDropsEstimate));
    }

    // Display Time to Target Drop Count
    if (el.lootTimeToTargetResult) {
        if (timeToTargetDrops <= 0 || overallAvgDropRatePerSecond === 0 || timeToTargetDrops === Infinity) {
            el.lootTimeToTargetResult.innerText = 'N/A';
        } else {
            el.lootTimeToTargetResult.innerText = formatTime(timeToTargetDrops);
        }
    }
    
    saveLootData();
}


function calculateTTK() {
    if (!el.ttkResult) return;

    const enemyHealth = getNumberValue('enemyHealth');
    const dpsInput = getNumberValue('yourDPS');
    const dpsMultiplier = el.dpsDenominationValue ? (parseFloat(el.dpsDenominationValue.value) || 1) : 1;
    const yourDPS = dpsInput * dpsMultiplier;
    
    const quantity = Math.floor(getNumberValue('enemyQuantity')) || 0;
    const isFourSpot = el.fourSpotFarming ? el.fourSpotFarming.checked : false;

    const singleResultEl = el.ttkResult;
    const questResultEl = el.questTTKResult;
    const questReturnEl = el.questReturnTime;

    if (enemyHealth <= 0 || yourDPS <= 0) {
        singleResultEl.innerText = 'N/A';
        if (questResultEl) questResultEl.innerText = '';
        if (questReturnEl) questReturnEl.innerText = '';
        saveTTKData();
        return;
    }

    const timeInSeconds = enemyHealth / yourDPS;

    let resultString = formatTime(timeInSeconds);

    if (resultString.trim() === '0s') {
        singleResultEl.innerText = "Instakill";
    } else {
        singleResultEl.innerText = resultString.trim();
    }

    if (quantity > 0) {
        const ENEMY_RESPAWN_TIME = 3;
        const ENEMY_GROUP_SIZE = isFourSpot ? 4 : 1;
        const respawnLimitPerKill = ENEMY_RESPAWN_TIME / ENEMY_GROUP_SIZE;
        const yourTimePerKill = timeInSeconds + 0.5; 
        const effectiveTimePerKill = Math.max(yourTimePerKill, respawnLimitPerKill);
        const totalTimeInSeconds = effectiveTimePerKill * quantity;

        if (totalTimeInSeconds === Infinity) {
            if (questResultEl) questResultEl.innerText = `Time for ${quantity} kills: Over 1000 Years`;
            if (questReturnEl) questReturnEl.innerText = 'ETA: Eternity';
            saveTTKData();
            return;
        }

        let totalResultString = formatTime(totalTimeInSeconds);

        if (questResultEl) questResultEl.innerText = `Time for ${quantity} kills: ${totalResultString.trim()}`;

        if (questReturnEl) {
            const now = new Date();
            const returnTime = new Date(now.getTime() + totalTimeInSeconds * 1000);
            const returnString = returnTime.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });
            questReturnEl.innerText = `Mobs killed by: ${returnString}`;
        }

    } else {
        if (questResultEl) questResultEl.innerText = '';
        if (questReturnEl) questReturnEl.innerText = '';
    }
    saveTTKData();
}

function displayRankRequirement() {
    if (!el.rankSelect || !el.energyForRankFormatted) return;
    const selectedRank = el.rankSelect.value;
    if (selectedRank && typeof rankRequirements !== 'undefined' && rankRequirements[selectedRank]) {
        el.energyForRankFormatted.innerText = formatNumber(rankRequirements[selectedRank]);
    } else {
        el.energyForRankFormatted.innerText = 'Select a rank to see requirement';
    }
}

function calculateRankUp() {
    if (!el.rankUpResult) {
        console.warn('rankUpResult element not found');
        return;
    }
    
    const isFastClicker = el.clickerSpeed ? el.clickerSpeed.checked : false;

    const currentEnergyValue = getNumberValue('currentEnergy');
    const currentEnergyDenom = el.currentEnergyDenominationValue ? (parseFloat(el.currentEnergyDenominationValue.value) || 1) : 1;
    const currentEnergy = currentEnergyValue * currentEnergyDenom;

    const energyPerClickValue = getNumberValue('energyPerClick');
    const energyPerClickDenom = el.energyPerClickDenominationValue ? (parseFloat(el.energyPerClickDenominationValue.value) || 1) : 1;
    const energyPerClick = energyPerClickValue * energyPerClickDenom;

    const selectedRank = el.rankSelect ? el.rankSelect.value : '';
    const energyForRank = typeof rankRequirements !== 'undefined' ? rankRequirements[selectedRank] || 0 : 0;

    const returnTimeEl = el.rankUpReturnTime;

    if (!selectedRank || !energyForRank) {
        el.rankUpResult.innerText = 'Select a rank';
        if (returnTimeEl) returnTimeEl.innerText = '';
        saveRankUpData();
        return;
    }

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = energyForRank - currentEnergy;

    if (energyNeeded <= 0) {
        el.rankUpResult.innerText = 'Rank Up Ready!';
        if (returnTimeEl) returnTimeEl.innerText = 'Ready to rank up now!';
        saveRankUpData();
        return;
    }
    if (energyPerClick <= 0) {
        el.rankUpResult.innerText = 'N/A';
        if (returnTimeEl) returnTimeEl.innerText = '';
        saveRankUpData();
        return;
    }

    const timeInSeconds = (energyNeeded / energyPerClick) / clicksPerSecond;

    let resultString = formatTime(timeInSeconds);

    el.rankUpResult.innerText = resultString.trim();

    if (returnTimeEl) {
        const now = new Date();
        const returnTime = new Date(now.getTime() + timeInSeconds * 1000);
        const returnString = returnTime.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        returnTimeEl.innerText = `Return on: ${returnString}`;
    }
    saveRankUpData();
}

function populateWorldDropdown() {
    const worldSelect = el.worldSelect;
    if (!worldSelect) return;
    
    while (worldSelect.options.length > 1) {
        worldSelect.remove(1);
    }
    
    if (typeof worldData !== 'undefined') {
        Object.keys(worldData).forEach(worldName => {
            const option = document.createElement('option');
            option.value = worldName;
            option.innerText = worldName;
            worldSelect.appendChild(option);
        });
    }
}

function populateEnemyDropdown() {
    const enemySelect = el.enemySelect;
    if (!enemySelect || !el.worldSelect || !el.enemyHealth || !el.enemyHealthDisplay) return;

    const selectedWorldName = el.worldSelect.value;
    const world = typeof worldData !== 'undefined' ? worldData[selectedWorldName] : null;

    enemySelect.innerHTML = '<option value="">-- Select an Enemy --</option>';
    el.enemyHealth.value = '';
    el.enemyHealthDisplay.innerText = 'Select an enemy to see health';

    if (world && world.enemies) {
        Object.keys(world.enemies).forEach(enemyName => {
            const option = document.createElement('option');
            option.value = enemyName;
            option.innerText = enemyName;
            enemySelect.appendChild(option);
        });

        if (el.tempWorld === selectedWorldName && el.tempEnemy && enemySelect.querySelector(`option[value="${el.tempEnemy}"]`)) {
            enemySelect.value = el.tempEnemy;
            el.tempWorld = null; 
            el.tempEnemy = null;
        }
    }
    
    displayEnemyHealth();
}

function displayEnemyHealth() {
    if (!el.worldSelect || !el.enemySelect || !el.enemyHealth || !el.enemyHealthDisplay) return;

    const selectedWorldName = el.worldSelect.value;
    const selectedEnemy = el.enemySelect.value;
    const world = typeof worldData !== 'undefined' ? worldData[selectedWorldName] : null;
    const enemyHealthInput = el.enemyHealth;
    const enemyHealthDisplay = el.enemyHealthDisplay;

    if (world && world.enemies && world.enemies[selectedEnemy]) {
        const healthValue = world.enemies[selectedEnemy];
        enemyHealthInput.value = healthValue;
        enemyHealthDisplay.innerText = formatNumber(healthValue);
    } else {
        enemyHealthInput.value = '';
        enemyHealthDisplay.innerText = 'Select an enemy to see health';
    }
    calculateTTK();
}

function populateTimeToReturnDropdown() {
    const select = el.timeToReturnSelect;
    if (!select) return;
    
    for (let i = 1; i <= 48; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `${i} Hour${i > 1 ? 's' : ''}`;
        select.appendChild(option);
    }
}

function populateTimeToReturnMinutesDropdown() {
    const select = el.timeToReturnSelectMinutes;
    if (!select) return;

    const zeroOption = document.createElement('option');
    zeroOption.value = 0;
    zeroOption.innerText = '0 Minutes';
    select.appendChild(zeroOption);

    for (let i = 1; i <= 59; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `${i} Minute${i > 1 ? 's' : ''}`;
        select.appendChild(option);
    }
}

function populateBoostDurations() {
    if (typeof boostItems === 'undefined') return;

    const hourOptions = [];
    for (let i = 0; i <= 48; i++) {
        hourOptions.push(`<option value="${i}">${i}h</option>`);
    }
    const hourHTML = hourOptions.join('');

    const minuteOptions = [];
    for (let i = 0; i <= 59; i++) {
        minuteOptions.push(`<option value="${i}">${i}m</option>`);
    }
    const minuteHTML = minuteOptions.join('');

    // Filter for Energy and Loot types
    const relevantBoosts = boostItems.filter(item => item.type === 'energy' || item.type.startsWith('loot'));

    relevantBoosts.forEach(item => {
        const hoursEl = el[`boost-${item.id}-hours`];
        const minutesEl = el[`boost-${item.id}-minutes`];
        if (hoursEl) hoursEl.innerHTML = hourHTML;
        if (minutesEl) minutesEl.innerHTML = minuteHTML;
    });
}

function populateStarLevelDropdown() {
    const select = el.starLevelSelect;
    if (!select || typeof starCostData === 'undefined') return;
    
    select.innerHTML = '<option value="">-- Select Level --</option>';
    Object.keys(starCostData).forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.innerText = `Star ${level}`;
        select.appendChild(option);
    });
}

function populateStarSpeedDropdown() {
    const select = el.starSpeedSelect;
    if (!select || typeof starSpeedData === 'undefined') return;

    select.innerHTML = '<option value="">-- Select Speed --</option>';
    Object.keys(starSpeedData).forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.innerText = `Star Speed ${level}`;
        select.appendChild(option);
    });
}

function displayStarCost() {
    if (!el.starLevelSelect || !el.starCostDisplay || typeof starCostData === 'undefined') return;

    const selectedLevel = el.starLevelSelect.value;
    const cost = starCostData[selectedLevel];

    if (cost) {
        el.starCostDisplay.innerText = formatNumber(cost);
    } else {
        el.starCostDisplay.innerText = 'Select a level';
    }
    calculateStarCalc();
}

function calculateStarCalc() {
    if (typeof starCostData === 'undefined' || typeof starSpeedData === 'undefined' || 
        typeof starRarityDataByLevel === 'undefined') {
        return;
    }

    const level = el.starLevelSelect ? el.starLevelSelect.value : '1';
    const speedLevel = el.starSpeedSelect ? el.starSpeedSelect.value : '';
    const starAmount = getNumberValue('starAmount');
    const luck = getNumberValue('starBaseLuck') || 1;
    const timeHours = getNumberValue('starTimeHours');
    const timeInSeconds = timeHours * 3600;

    const costPerStar = starCostData[level] || 0;
    const timePerBatch = starSpeedData[speedLevel] || 0;
    
    let totalBatches = 0;
    if (timePerBatch > 0) {
        totalBatches = Math.floor(timeInSeconds / timePerBatch);
    }
    
    const totalStarsOpened = totalBatches * starAmount;
    const totalCost = totalStarsOpened * costPerStar;

    if (el.starTotalPulls) el.starTotalPulls.innerText = formatNumber(totalStarsOpened);
    if (el.starTotalCost) el.starTotalCost.innerText = formatNumber(totalCost);

    const baseRarities = starRarityDataByLevel[level] || starRarityDataByLevel["1"];
    const cap = 1/8;
    
    let boostedSum = 0;
    let unchangedCount = 0;
    const finalRarities = [];

    baseRarities.forEach(rarity => {
        const basePercent = rarity.percent;
        
        if (basePercent <= cap && basePercent > 0) {
            const newRate = Math.min(basePercent * luck, cap);
            boostedSum += newRate;
            finalRarities.push({ name: rarity.name, percent: newRate, isUnchanged: false });
        } else {
            if (basePercent > 0) {
                unchangedCount++;
            }
            finalRarities.push({ name: rarity.name, percent: 0, isUnchanged: true, basePercent: basePercent });
        }
    });

    const leftover = 1 - boostedSum;
    const sharePerUnchanged = (leftover > 0 && unchangedCount > 0) ? leftover / unchangedCount : 0;

    finalRarities.forEach(rarity => {
        if (rarity.isUnchanged) {
            rarity.percent = (rarity.basePercent > 0) ? sharePerUnchanged : 0;
        }
    });

    const tableBody = el.starRarityTableBody;
    if (tableBody) {
        tableBody.innerHTML = '';

        finalRarities.forEach((rarity, index) => {
            const estimatedHatches = totalStarsOpened * rarity.percent;
            
            const row = document.createElement('tr');
            if (index < finalRarities.length - 1) {
                row.className = 'border-b border-gray-700';
            }

            row.innerHTML = `
                <td class="py-2 px-1 text-sm text-gray-300">${rarity.name}</td>
                <td class="py-2 px-1 text-sm text-gray-400 text-right">${(rarity.percent * 100).toFixed(4)}%</td>
                <td class="py-2 px-1 text-lg text-white font-semibold text-right">${formatNumber(Math.floor(estimatedHatches))}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    saveStarData();
}

async function loadAllData() {
    try {
        const response = await fetch('activity-bundle.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bundle = await response.json();
        
        Object.assign(activityData, bundle.activities || {});
        
        console.log("DEBUG: Successfully loaded and parsed activity-bundle.json");

    } catch (error) {
        console.error("Fatal error loading activity-bundle.json:", error);
        alert("Failed to load critical raid/dungeon data. Please refresh the page.");
    }
}

function populateActivityDropdown() {
    const select = el.activitySelect;
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select an Activity --</option>';

    const sortedActivityNames = Object.keys(activityData).sort((a, b) => a.localeCompare(b));

    sortedActivityNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.innerText = name;
        select.appendChild(option);
    });
}

function handleActivityChange() {
    if (!el.activitySelect || !el.activityResult || !el.activityTimeLimit || !el.activityResultLabel) return;
    
    const selection = el.activitySelect.value;
    const activity = activityData[selection];
    const resultLabel = el.activityResultLabel;

    if (!activity) {
        el.activityResult.innerText = '0 / 0';
        el.activityTimeLimit.value = ''; 
        saveRaidData();
        return;
    }

    el.activityTimeLimit.value = activity.timeLimit;

    if (activity.type === 'raid') {
        resultLabel.innerText = 'Estimated Max Wave:';
    } else {
        resultLabel.innerText = 'Estimated Max Room:';
    }
    calculateMaxStage();
    calculateKeyRunTime();
    saveRaidData();
}

function calculateMaxStage() {
    if (!el.activitySelect || !el.yourDPSActivity || !el.dpsActivityDenominationValue || 
        !el.activityTimeLimit || !el.activityResult) {
        return 0; 
    }
    
    const selection = el.activitySelect.value;
    if (!selection) {
        el.activityResult.innerText = '0 / 0';
        return 0;
    }

    const activity = activityData[selection];
    const yourDPS = (getNumberValue('yourDPSActivity') || 0) * (parseFloat(el.dpsActivityDenominationValue.value) || 1);
    const timeLimit = getNumberValue('activityTimeLimit');
    const resultEl = el.activityResult;

    const maxStages = activity ? activity.maxStages : 0;

    if (!activity || yourDPS <= 0 || timeLimit <= 0) {
        resultEl.innerText = `0 / ${maxStages}`;
        return 0;
    }

    const maxDamageInTime = yourDPS * timeLimit;
    let completedStage = 0;

    if (activity.enemies) {
        const singleEnemyRaids = ["Mundo Raid", "Gleam Raid", "Tournament Raid"];

        for (let i = 1; i <= maxStages; i++) {
            const stageKey = `Room ${i}`;
            let stageHealth = activity.enemies[stageKey];

            if (!stageHealth) {
                console.warn(`Health data missing for ${selection} - ${stageKey}`);
                break;
            }

            stageHealth = parseFloat(stageHealth);

            let enemyMultiplier = 1;
            if (activity.type === 'raid' && !singleEnemyRaids.includes(selection)) {
                enemyMultiplier = 5;
            } else if (activity.type === 'dungeon' && !singleEnemyRaids.includes(selection)) {
                 enemyMultiplier = 1;
            }

            const totalStageHealth = stageHealth * enemyMultiplier;

            if (maxDamageInTime < totalStageHealth) {
                break;
            }
            completedStage = i;
        }
    } else {
        console.warn(`Activity "${selection}" does not have the expected 'enemies' structure.`);
    }

    resultEl.innerText = `${completedStage} / ${maxStages}`;
    return completedStage;
}

/**
 * Calculates the total time needed to complete a specified number of runs (keys).
 */
function calculateKeyRunTime() {
    if (!el.keyRunTimeResult || !el.activitySelect) return;
    
    const activityName = el.activitySelect.value;
    const activity = activityData[activityName];
    const keyQuantity = Math.floor(getNumberValue('keyRunQuantity')) || 0;
    const resultEl = el.keyRunTimeResult;
    const returnTimeEl = el.keyRunReturnTime;
    
    const yourDPS = (getNumberValue('yourDPSActivity') || 0) * (parseFloat(el.dpsActivityDenominationValue.value) || 1);
    const completedStage = calculateMaxStage(); // Calls calculateMaxStage to get completedStage

    if (!activity || keyQuantity <= 0 || yourDPS <= 0 || completedStage <= 0) {
        resultEl.innerText = '0s';
        if (returnTimeEl) returnTimeEl.innerText = '';
        return;
    }
    
    let timeInSecondsPerRun = 0;
    const singleEnemyRaids = ["Mundo Raid", "Gleam Raid", "Tournament Raid"];
    const RESPawn_TIME = 0.1;

    for (let i = 1; i <= completedStage; i++) {
        const stageKey = `Room ${i}`;
        let stageHealth = parseFloat(activity.enemies[stageKey]);
        
        let enemyMultiplier = 1;
        if (activity.type === 'raid' && !singleEnemyRaids.includes(activityName)) {
            enemyMultiplier = 5;
        }
        
        const totalStageHealth = stageHealth * enemyMultiplier;
        
        const killTime = totalStageHealth / yourDPS;
        const timePerStage = Math.max(killTime + 0.5, 1.0) + RESPawn_TIME;
        
        timeInSecondsPerRun += timePerStage; 
    }
    
    
    const totalTimeInSeconds = timeInSecondsPerRun * keyQuantity;
    
    if (totalTimeInSeconds === Infinity) {
        resultEl.innerText = "Over 1000 Years";
        if (returnTimeEl) returnTimeEl.innerText = 'ETA: Eternity';
        return;
    }

    let resultString = formatTime(totalTimeInSeconds);
    
    resultEl.innerText = resultString.trim() || '0s';

    if (returnTimeEl) {
        const now = new Date();
        const returnTime = new Date(now.getTime() + totalTimeInSeconds * 1000);
        const returnString = returnTime.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
        returnTimeEl.innerText = `Finish Time: ${returnString}`;
    }

}


function setupRankSearch(inputId, valueId, listId) {
    const inputEl = el[inputId];
    const valueEl = el[valueId];
    const listEl = el[listId];

    // Defensive check
    if (!inputEl || !valueEl || !listEl || typeof rankRequirements === 'undefined') {
        console.error("Missing elements or rankRequirements for setupRankSearch:", inputId);
        return;
    }

    const allRanks = Object.keys(rankRequirements).sort((a, b) => parseInt(a) - parseInt(b));

    function filterAndShowRanks() {
        const filterText = inputEl.value.trim();
        const filtered = allRanks.filter(rank => rank.startsWith(filterText));
        renderRanksList(filtered);
    }

    function renderRanksList(list) {
        listEl.innerHTML = '';
        if (list.length === 0) {
            listEl.classList.add('hidden');
            return;
        }
        list.forEach(rank => {
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-[#3a3a5a] cursor-pointer text-sm';
            item.textContent = rank;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                inputEl.value = rank;
                valueEl.value = rank;
                listEl.classList.add('hidden');
                displayRankRequirement();
                calculateRankUp();
            });
            listEl.appendChild(item);
        });
        listEl.classList.remove('hidden');
    }

    function handleRankInputBlur() {
        setTimeout(() => {
            if (!inputEl || !valueEl) return;
            const rankValue = inputEl.value.trim();
            if (rankRequirements[rankValue]) {
                if (valueEl.value !== rankValue) {
                    valueEl.value = rankValue;
                    displayRankRequirement();
                    calculateRankUp();
                }
            }
            if (listEl) listEl.classList.add('hidden');
        }, 150);
    }

    function handleRankInputFocus() {
        filterAndShowRanks();
    }


    inputEl.addEventListener('input', debounce(filterAndShowRanks, 300));
    inputEl.addEventListener('focus', handleRankInputFocus);
    inputEl.addEventListener('blur', handleRankInputBlur);
}


function setupDenominationSearch(inputId, valueId, listId, callback) {
    const inputEl = el[inputId];
    const valueEl = el[valueId];
    const listEl = el[listId];

    // Defensive check
    if (!inputEl || !valueEl || !listEl || typeof denominations === 'undefined') {
        console.error("Missing elements or denominations for setupDenominationSearch:", inputId);
        return;
    }

    function filterAndShowDenominations() {
        const filterText = inputEl.value.trim().toLowerCase();
        const filtered = denominations.filter(d => d.name.toLowerCase().startsWith(filterText));
        renderDenominationsList(filtered);
    }

    function renderDenominationsList(list) {
        listEl.innerHTML = '';
        if (list.length === 0) { listEl.classList.add('hidden'); return; }

        list.sort((a, b) => a.value - b.value);

        list.forEach(d => {
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-[#3a3a5a] cursor-pointer text-sm';
            item.textContent = d.name === 'None' ? 'None (No Abbreviation)' : d.name;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                inputEl.value = d.name === 'None' ? '' : d.name;
                valueEl.value = d.value;
                listEl.classList.add('hidden');
                if (callback) callback();
            });
            listEl.appendChild(item);
        });
        listEl.classList.remove('hidden');
    }

    function handleDenominationBlur() {
         setTimeout(() => {
            if (!inputEl || !valueEl) return;
            const inputText = inputEl.value.trim();
            const foundDenom = denominations.find(d => d.name.toLowerCase() === inputText.toLowerCase());

            if (foundDenom) {
                valueEl.value = foundDenom.value;
                inputEl.value = foundDenom.name === 'None' ? '' : foundDenom.name;
            } else if (inputText === '') {
                valueEl.value = 1;
            } else {
                const currentValue = parseFloat(valueEl.value) || 1;
                const currentDenom = denominations.find(d => d.value == currentValue);
                // Only update the input text if a valid denomination value is already stored
                if (currentDenom) {
                    inputEl.value = currentDenom.name !== 'None' ? currentDenom.name : '';
                } else {
                    inputEl.value = ''; // Clear input if invalid text was entered and no stored value exists
                    valueEl.value = 1; // Default to 1 (None)
                }
            }

            if (listEl) listEl.classList.add('hidden');
            if (callback) callback();
        }, 150);
    }

    function handleDenominationFocus() {
        filterAndShowDenominations();
    }

    inputEl.addEventListener('input', debounce(filterAndShowDenominations, 300));
    inputEl.addEventListener('focus', handleDenominationFocus);
    inputEl.addEventListener('blur', handleDenominationBlur);
}

document.addEventListener('click', (event) => {
    const relativeContainers = document.querySelectorAll('.relative');
    let clickedInsideAContainer = false;

    relativeContainers.forEach(container => {
        if (container.contains(event.target)) {
            clickedInsideAContainer = true;
        }
    });

    if (!clickedInsideAContainer) {
        const allLists = document.querySelectorAll('.search-list');
        allLists.forEach(list => list.classList.add('hidden'));
    }
});

// NEW FUNCTION: Syncs Energy data fields across all three panels.
function syncEnergyData(sourceInputId, sourceDenomInputId, sourceDenomValueId) {
    const sourceValue = el[sourceInputId]?.value || '';
    const sourceDenomInput = el[sourceDenomInputId]?.value || '';
    const sourceDenomValue = el[sourceDenomValueId]?.value || '1';

    // List of input IDs to synchronize (excluding the source)
    const energyInputMap = {
        'currentEnergy': ['currentEnergyETA', 'currentEnergyTTE'],
        'energyPerClick': ['energyPerClickETA', 'energyPerClickTTE'],
        'currentEnergyETA': ['currentEnergy', 'currentEnergyTTE'],
        'energyPerClickETA': ['energyPerClick', 'energyPerClickTTE'],
        'currentEnergyTTE': ['currentEnergy', 'currentEnergyETA'],
        'energyPerClickTTE': ['energyPerClick', 'energyPerClickETA']
    };
    
    // List of denomination input/value IDs to synchronize (excluding the source)
    const denomInputMap = {
        'currentEnergyDenominationInput': ['currentEnergyETADenominationInput', 'currentEnergyTTEDenominationInput'],
        'currentEnergyDenominationValue': ['currentEnergyETADenominationValue', 'currentEnergyTTEDenominationValue'],
        'energyPerClickDenominationInput': ['energyPerClickETADenominationInput', 'energyPerClickTTEDenominationInput'],
        'energyPerClickDenominationValue': ['energyPerClickETADenominationValue', 'energyPerClickTTEDenominationValue'],
        'currentEnergyETADenominationInput': ['currentEnergyDenominationInput', 'currentEnergyTTEDenominationInput'],
        'currentEnergyETADenominationValue': ['currentEnergyDenominationValue', 'currentEnergyTTEDenominationValue'],
        'energyPerClickETADenominationInput': ['energyPerClickDenominationInput', 'energyPerClickTTEDenominationInput'],
        'energyPerClickETADenominationValue': ['energyPerClickDenominationValue', 'energyPerClickTTEDenominationValue'],
        'currentEnergyTTEDenominationInput': ['currentEnergyDenominationInput', 'currentEnergyETADenominationInput'],
        'currentEnergyTTEDenominationValue': ['currentEnergyDenominationValue', 'currentEnergyETADenominationValue'],
        'energyPerClickTTEDenominationInput': ['energyPerClickDenominationInput', 'energyPerClickETADenominationInput'],
        'energyPerClickTTEDenominationValue': ['energyPerClickDenominationValue', 'energyPerClickETADenominationValue']
    };

    // Sync input values
    const targetInputs = energyInputMap[sourceInputId] || [];
    targetInputs.forEach(targetId => {
        if (el[targetId]) el[targetId].value = sourceValue;
    });

    // Sync denomination inputs/values
    const targetDenomInputs = denomInputMap[sourceDenomInputId] || [];
    targetDenomInputs.forEach(targetId => {
        if (el[targetId]) el[targetId].value = sourceDenomInput;
    });

    const targetDenomValues = denomInputMap[sourceDenomValueId] || [];
    targetDenomValues.forEach(targetId => {
        if (el[targetId]) el[targetId].value = sourceDenomValue;
    });

    // Recalculate everything that depends on the change
    calculateRankUp();
    calculateEnergyETA();
    calculateTimeToEnergy();
}


document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('[id]').forEach(element => {
        el[element.id] = element;
    });

    // Hidden checkbox for Loot Clicker Speed
    if (!el.clickerSpeedLoot) {
        el.clickerSpeedLoot = document.createElement('input');
        el.clickerSpeedLoot.type = 'checkbox';
        el.clickerSpeedLoot.id = 'clickerSpeedLoot';
        el.clickerSpeedLoot.classList.add('hidden');
        const lootPanel = el['panel-lootcalc'];
        if (lootPanel) lootPanel.appendChild(el.clickerSpeedLoot);
    }

    const BACKGROUND_KEY = 'ae_image_background';

    function applyBackgroundPreference(isImage) {
        if (isImage) {
            document.body.classList.add('image-background');
        } else {
            document.body.classList.remove('image-background');
        }
    }

    if (el.backgroundToggle) {
        el.backgroundToggle.addEventListener('change', () => {
            const isImage = el.backgroundToggle.checked;
            applyBackgroundPreference(isImage);
            try {
                localStorage.setItem(BACKGROUND_KEY, isImage ? '1' : '0');
            } catch (e) {
                console.error("Failed to save background preference", e);
            }
        });
    }

    try {
        const savedPref = localStorage.getItem(BACKGROUND_KEY);
        if (savedPref === '1') {
            if (el.backgroundToggle) el.backgroundToggle.checked = true;
            applyBackgroundPreference(true);
        } else {
            if (el.backgroundToggle) el.backgroundToggle.checked = false;
            applyBackgroundPreference(false);
        }
    } catch (e) {
        console.error("Failed to load background preference", e);
        applyBackgroundPreference(false);
    }

    
    const tabControls = el['tab-controls'];
    if (tabControls) {
        tabControls.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-btn');
            if (button && button.dataset.tab) {
                switchTab(button.dataset.tab);
            }
        });
    }

    const clickerSpeedControls = document.querySelectorAll('.toggle-container');
    clickerSpeedControls.forEach(container => {
        container.addEventListener('click', (e) => {
            const button = e.target.closest('.toggle-btn');
            if (button) {
                if (button.dataset.clickerspeed) {
                    setClickerSpeed(button.dataset.clickerspeed, button);
                } else if (button.dataset.clickerspeedEta) {
                    setClickerSpeed(button.dataset.clickerspeedEta, button);
                } else if (button.dataset.clickerspeedTte) {
                    setClickerSpeed(button.dataset.clickerspeedTte, button);
                } else if (button.dataset.clickerspeedLoot) {
                    setClickerSpeed(button.dataset.clickerspeedLoot, button);
                } else if (button.dataset.farmingMode) {
                    setFarmingMode(button.dataset.farmingMode, button);
                }
            }
        });
    });


    console.log("DEBUG: DOM fully loaded. Initializing script.");
    switchTab('rankup');
    
    populateWorldDropdown(); 
    populateTimeToReturnDropdown();
    populateTimeToReturnMinutesDropdown();
    populateBoostDurations();
    populateStarLevelDropdown();
    populateStarSpeedDropdown();

    loadAllData().then(() => {
        console.log("DEBUG: Activity data loading complete. Setting up raid UI.");
        
        populateActivityDropdown();

        loadRaidData();
    });

    setupRankSearch('rankInput', 'rankSelect', 'rankList');

    // REFACTORED ENERGY DENOMINATION CHANGE HANDLERS
    function onRankUpCEDenomChange() {
        syncEnergyData('currentEnergy', 'currentEnergyDenominationInput', 'currentEnergyDenominationValue');
    }
    function onETACEDenomChange() {
        syncEnergyData('currentEnergyETA', 'currentEnergyETADenominationInput', 'currentEnergyETADenominationValue');
    }
    function onTTECEDenomChange() {
        syncEnergyData('currentEnergyTTE', 'currentEnergyTTEDenominationInput', 'currentEnergyTTEDenominationValue');
    }

    function onRankUpEPCDenomChange() {
        syncEnergyData('energyPerClick', 'energyPerClickDenominationInput', 'energyPerClickDenominationValue');
    }
    function onETAEPCdenomChange() {
        syncEnergyData('energyPerClickETA', 'energyPerClickETADenominationInput', 'energyPerClickETADenominationValue');
    }
    function onTTEEPCDenomChange() {
        syncEnergyData('energyPerClickTTE', 'energyPerClickTTEDenominationInput', 'energyPerClickTTEDenominationValue');
    }
    
    
    const syncDPS_TTKToRaid = () => {
        if(el.yourDPSActivity) el.yourDPSActivity.value = el.yourDPS.value;
        if(el.dpsActivityDenominationInput) el.dpsActivityDenominationInput.value = el.dpsDenominationInput.value;
        if(el.dpsActivityDenominationValue) el.dpsActivityDenominationValue.value = el.dpsDenominationValue.value;
        calculateMaxStage();
        calculateKeyRunTime();
        saveRaidData();
    };
    function onTTKDenomChange() {
        calculateTTK();
        syncDPS_TTKToRaid();
    }
    
    const syncDPS_RaidToTTK = () => {
        if(el.yourDPS) el.yourDPS.value = el.yourDPSActivity.value;
        if(el.dpsDenominationInput) el.dpsDenominationInput.value = el.dpsActivityDenominationInput.value;
        if(el.dpsDenominationValue) el.dpsDenominationValue.value = el.dpsActivityDenominationValue.value;
        calculateTTK();
    };
    function onRaidDenomChange() {
        calculateMaxStage();
        calculateKeyRunTime();
        saveRaidData();
        syncDPS_RaidToTTK();
    }

    setupDenominationSearch('dpsDenominationInput', 'dpsDenominationValue', 'dpsDenominationList', onTTKDenomChange);
    setupDenominationSearch('dpsActivityDenominationInput', 'dpsActivityDenominationValue', 'dpsActivityDenominationList', onRaidDenomChange);
    
    // Explicitly wire up the denomination input fields to the sync handlers
    setupDenominationSearch('currentEnergyDenominationInput', 'currentEnergyDenominationValue', 'currentEnergyDenominationList', onRankUpCEDenomChange);
    setupDenominationSearch('energyPerClickDenominationInput', 'energyPerClickDenominationValue', 'energyPerClickDenominationList', onRankUpEPCDenomChange);
    
    setupDenominationSearch('currentEnergyETADenominationInput', 'currentEnergyETADenominationValue', 'currentEnergyETADenominationList', onETACEDenomChange);
    setupDenominationSearch('targetEnergyETADenominationInput', 'targetEnergyETADenominationValue', 'targetEnergyETADenominationList', calculateEnergyETA);
    setupDenominationSearch('energyPerClickETADenominationInput', 'energyPerClickETADenominationValue', 'energyPerClickETADenominationList', onETAEPCdenomChange);

    setupDenominationSearch('currentEnergyTTEDenominationInput', 'currentEnergyTTEDenominationValue', 'currentEnergyTTEDenominationList', onTTECEDenomChange);
    setupDenominationSearch('energyPerClickTTEDenominationInput', 'energyPerClickTTEDenominationValue', 'energyPerClickTTEDenominationList', onTTEEPCDenomChange); 
    

    // Initial value synchronization and calculation triggers (input value changes)
    if (el.currentEnergy) {
        el.currentEnergy.addEventListener('input', debounce(() => {
            syncEnergyData('currentEnergy', 'currentEnergyDenominationInput', 'currentEnergyDenominationValue');
        }, 300));
    }
    if (el.currentEnergyETA) {
        el.currentEnergyETA.addEventListener('input', debounce(() => {
            syncEnergyData('currentEnergyETA', 'currentEnergyETADenominationInput', 'currentEnergyETADenominationValue');
        }, 300));
    }
    if (el.currentEnergyTTE) {
        el.currentEnergyTTE.addEventListener('input', debounce(() => {
            syncEnergyData('currentEnergyTTE', 'currentEnergyTTEDenominationInput', 'currentEnergyTTEDenominationValue');
        }, 300));
    }

    if (el.energyPerClick) {
    el.energyPerClick.addEventListener('input', debounce(() => {
        syncEnergyData('energyPerClick', 'energyPerClickDenominationInput', 'energyPerClickDenominationValue');
    }, 300));
    }
    if (el.energyPerClickETA) {
        el.energyPerClickETA.addEventListener('input', debounce(() => {
            syncEnergyData('energyPerClickETA', 'energyPerClickETADenominationInput', 'energyPerClickETADenominationValue');
        }, 300));
    }
    if (el.energyPerClickTTE) {
        el.energyPerClickTTE.addEventListener('input', debounce(() => {
            syncEnergyData('energyPerClickTTE', 'energyPerClickTTEDenominationInput', 'energyPerClickTTEDenominationValue');
        }, 300));
    }
    
    // Global clicker speed sync
    const globalClickerSync = (isChecked) => {
        if (el.clickerSpeed) el.clickerSpeed.checked = isChecked;
        if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isChecked;
        if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isChecked;
        if (el.clickerSpeedLoot) el.clickerSpeedLoot.checked = isChecked;
        calculateRankUp();
        calculateEnergyETA();
        calculateTimeToEnergy();
        calculateLootDrops();
    };

    if (el.clickerSpeed) el.clickerSpeed.addEventListener('change', () => globalClickerSync(el.clickerSpeed.checked));
    if (el.clickerSpeedETA) el.clickerSpeedETA.addEventListener('change', () => globalClickerSync(el.clickerSpeedETA.checked));
    if (el.clickerSpeedTTE) el.clickerSpeedTTE.addEventListener('change', () => globalClickerSync(el.clickerSpeedTTE.checked));
    
    // Loot specific clicker speed handling
    if (el.clickerSpeedLoot) {
        el.clickerSpeedLoot.addEventListener('change', () => {
             const isChecked = el.clickerSpeedLoot.checked;
             if (el.clickerSpeed) el.clickerSpeed.checked = isChecked;
             if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isChecked;
             if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isChecked;
             calculateLootDrops();
        });
    }


    if (el.rankSelect) el.rankSelect.addEventListener('change', () => {
        displayRankRequirement();
        calculateRankUp();
    });
    if (el.rankInput) el.rankInput.addEventListener('input', debounce(() => {
        if (el.rankSelect) el.rankSelect.value = el.rankInput.value;
        displayRankRequirement();
        calculateRankUp();
    }, 300));

    if (el.targetEnergyETA) el.targetEnergyETA.addEventListener('input', debounce(calculateEnergyETA, 300));

    // Energy Boosts listeners
    if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
        boostItems.filter(item => item.type === 'energy').forEach(item => {
            const hoursEl = el[`boost-${item.id}-hours`];
            const minutesEl = el[`boost-${item.id}-minutes`];
            if (hoursEl) hoursEl.addEventListener('change', calculateTimeToEnergy);
            if (minutesEl) minutesEl.addEventListener('change', calculateTimeToEnergy);
        });
    }
    if (el.timeToReturnSelect) el.timeToReturnSelect.addEventListener('change', calculateTimeToEnergy);
    if (el.timeToReturnSelectMinutes) el.timeToReturnSelectMinutes.addEventListener('change', calculateTimeToEnergy);
    
    // Loot Calc listeners
    const lootDebounce = debounce(calculateLootDrops, 300);

    if (el.lootDropMin) el.lootDropMin.addEventListener('input', lootDebounce);
    if (el.lootDropMax) el.lootDropMax.addEventListener('input', lootDebounce);
    if (el.lootBaseDropRate) el.lootBaseDropRate.addEventListener('input', lootDebounce);
    if (el.lootTimeTargetHours) el.lootTimeTargetHours.addEventListener('input', lootDebounce);
    if (el.lootTimeTargetMinutes) el.lootTimeTargetMinutes.addEventListener('input', lootDebounce);
    if (el.yourKillsPerSecond) el.yourKillsPerSecond.addEventListener('input', lootDebounce);
    if (el.lootDropTargetCount) el.lootDropTargetCount.addEventListener('input', lootDebounce);

    if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
        boostItems.filter(item => item.type && item.type.startsWith('loot')).forEach(item => {
            const hoursEl = el[`boost-${item.id}-hours`];
            const minutesEl = el[`boost-${item.id}-minutes`];
            if (hoursEl) hoursEl.addEventListener('change', lootDebounce);
            if (minutesEl) minutesEl.addEventListener('change', lootDebounce);
        });
    }


    if (el.yourDPS) {
        el.yourDPS.addEventListener('input', debounce(() => {
            calculateTTK();
            if (el.yourDPSActivity) el.yourDPSActivity.value = el.yourDPS.value;
            calculateMaxStage();
            calculateKeyRunTime();
            saveTTKData(); 
        }, 300));
    }
    if (el.enemyQuantity) el.enemyQuantity.addEventListener('input', debounce(calculateTTK, 300));
    if (el.fourSpotFarming) el.fourSpotFarming.addEventListener('change', calculateTTK);
    
    // START RAID LISTENERS
    const raidDebounce = debounce(() => {
        calculateMaxStage();
        calculateKeyRunTime();
        saveRaidData();
    }, 300);

    if (el.activitySelect) {
        el.activitySelect.addEventListener('change', () => {
            handleActivityChange();
            saveRaidData(); // Save Activity change immediately
        });
    }

    if (el.yourDPSActivity) {
        el.yourDPSActivity.addEventListener('input', () => {
            raidDebounce();
            // Sync to TTK
            if (el.yourDPS) el.yourDPS.value = el.yourDPSActivity.value;
            calculateTTK();
        });
    }

    if (el.activityTimeLimit) el.activityTimeLimit.addEventListener('input', raidDebounce);
    
    if (el.keyRunQuantity) el.keyRunQuantity.addEventListener('input', raidDebounce);
    // END RAID LISTENERS


    if (el.starLevelSelect) el.starLevelSelect.addEventListener('change', displayStarCost);
    if (el.starSpeedSelect) el.starSpeedSelect.addEventListener('change', calculateStarCalc);
    if (el.starAmount) el.starAmount.addEventListener('input', debounce(calculateStarCalc, 300));
    if (el.starBaseLuck) el.starBaseLuck.addEventListener('input', debounce(calculateStarCalc, 300));
    if (el.starTimeHours) el.starTimeHours.addEventListener('input', debounce(calculateStarCalc, 300));

    if (el['theme-toggle']) {
        el['theme-toggle'].addEventListener('click', toggleTheme);
        
        const savedTheme = localStorage.getItem('ae_theme') || 'dark';
        if (savedTheme === 'game') {
            document.body.className = 'game-theme';
        } else if (savedTheme === 'blue') {
            document.body.className = 'blue-theme';
        }
    }
    
    if (el.worldSelect) {
        el.worldSelect.addEventListener('change', () => {
            populateEnemyDropdown();
            saveTTKData(); 
        });
    }

    if (el.enemySelect) {
        el.enemySelect.addEventListener('change', () => {
            displayEnemyHealth();
            saveTTKData(); 
        });
    }

    // --- INITIAL DATA LOAD ---
    // Load data from persistence
    loadRankUpData();
    loadETAData();
    loadTimeToEnergyData(); 
    loadLootData();
    loadTTKData();
    loadStarData();

    if (el.worldSelect) {
        populateEnemyDropdown(); 
    } else {
        calculateTTK();
    }

    // NEW: Ensure all energy fields sync up once loaded to avoid inconsistencies, especially with denomination defaults.
    // The previous timeout of 100ms is too short for reliable load and sync. Using a final DOM update pattern.
    if (el.currentEnergy) {
        el.currentEnergy.dispatchEvent(new Event('input')); 
    } else if (el.currentEnergyETA) {
        el.currentEnergyETA.dispatchEvent(new Event('input'));
    } else if (el.currentEnergyTTE) {
        el.currentEnergyTTE.dispatchEvent(new Event('input'));
    }
    
    // Final recalculations
    calculateLootDrops();
    calculateMaxStage();
    calculateKeyRunTime();
    calculateStarCalc();

});
