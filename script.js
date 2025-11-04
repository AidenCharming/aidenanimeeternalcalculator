const el = {};
const tabs = ['rankup', 'eta', 'time-to-energy', 'ttk', 'raid', 'star', 'checklist'];

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
    const buttons = button.parentElement.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    if (el.fourSpotFarming) {
        el.fourSpotFarming.checked = (mode === 'four');
        calculateTTK();
    }
}

function setClickerSpeed(speed, button) {
    const buttons = button.parentElement.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const isFast = (speed === 'fast');
    if (el.clickerSpeed) el.clickerSpeed.checked = isFast;
    if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isFast;
    if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isFast;
    
    calculateRankUp();
    calculateEnergyETA();
    calculateTimeToEnergy();
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
    const reversedDenominations = [...denominations].reverse();
    for (const denom of reversedDenominations) {
        if (denom.value > 1 && num >= denom.value) {
            return `${(num / denom.value).toFixed(2)}${denom.name}`;
        }
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
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
        if (clickerSpeed !== null) {
            const isChecked = (clickerSpeed === 'true');
            if (el.clickerSpeed) el.clickerSpeed.checked = isChecked;
            if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isChecked;
            if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isChecked;
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
    } catch(e) {
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
            const singleBtn = ttkPanel.querySelector('.toggle-btn[onclick*="\'single\'"]');
            const fourBtn = ttkPanel.querySelector('.toggle-btn[onclick*="\'four\'"]');

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
    } catch(e) {
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
    } catch(e) {
        console.error("Failed to save Raid data to localStorage", e);
    }
}

function loadRaidData() {
    try {
        const dps = localStorage.getItem('ae_raid_dps');
        if (dps && el.yourDPSActivity) el.yourDPSActivity.value = dps;

        const dpsDenomInput = localStorage.getItem('ae_raid_dpsDenomInput');
        if (dpsDenomInput && el.dpsActivityDenominationInput) el.dpsActivityDenominationInput.value = dpsDenomInput;
        
        const dpsDenom = denominations.find(d => d.name === dpsDenomInput);
        if (el.dpsDenominationValue) {
            el.dpsDenominationValue.value = dpsDenom ? dpsDenom.value : '1';
        }

        const timeLimit = localStorage.getItem('ae_raid_timeLimit');
        if (timeLimit && el.activityTimeLimit) el.activityTimeLimit.value = timeLimit;

        const activity = localStorage.getItem('ae_raid_activity');
        if (activity && el.activitySelect) {
            if (el.activitySelect.querySelector(`option[value="${activity}"]`)) {
                el.activitySelect.value = activity;
            } else {
                console.warn(`Saved activity "${activity}" not found in dropdown.`);
            }
            handleActivityChange();
        }
        calculateMaxStage();
    } catch(e) {
        console.error("Failed to load Raid data from localStorage", e);
    }
}

function saveTimeToEnergyData() {
    try {
        if (el.timeToReturnSelect) localStorage.setItem('ae_tte_returnTime', el.timeToReturnSelect.value); 
        if (el.timeToReturnSelectMinutes) localStorage.setItem('ae_tte_returnTimeMinutes', el.timeToReturnSelectMinutes.value);

        if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
            boostItems.forEach(item => {
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
    } catch(e) {
        console.error("Failed to save TimeToEnergy data to localStorage", e);
    }
}

function loadTimeToEnergyData() {
     try {
        const returnTimeMinutes = localStorage.getItem('ae_tte_returnTimeMinutes');
        if (returnTimeMinutes && el.timeToReturnSelectMinutes) {
            el.timeToReturnSelectMinutes.value = returnTimeMinutes;
}
        const energyPerClickTTE_Num = localStorage.getItem('ae_tte_energyPerClick') || '';
        if (el.energyPerClickTTE) el.energyPerClickTTE.value = energyPerClickTTE_Num;

        const energyPerClickTTE_DenomText = localStorage.getItem('ae_tte_energyPerClickDenomInput') || '';
        if (el.energyPerClickTTEDenominationInput) el.energyPerClickTTEDenominationInput.value = energyPerClickTTE_DenomText;

        const energyPerClickTTE_Denom = denominations.find(d => d.name === energyPerClickTTE_DenomText);
        if (el.energyPerClickTTEDenominationValue) {
        el.energyPerClickTTEDenominationValue.value = energyPerClickTTE_Denom ? energyPerClickTTE_Denom.value : '1';
        }
        
        const energyPerClickNum = localStorage.getItem('ae_energyPerClick') || '';
        if (el.energyPerClickTTE) el.energyPerClickTTE.value = energyPerClickNum;

        const energyPerClickDenomText = localStorage.getItem('ae_energyPerClickDenomInput') || '';
        if (el.energyPerClickTTEDenominationInput) el.energyPerClickTTEDenominationInput.value = energyPerClickDenomText;

        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomText);
        if (el.energyPerClickTTEDenominationValue) {
            el.energyPerClickTTEDenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }

        if (el.energyPerClickTTE) localStorage.setItem('ae_tte_energyPerClick', el.energyPerClickTTE.value);
        if (el.energyPerClickTTEDenominationInput) localStorage.setItem('ae_tte_energyPerClickDenomInput', el.energyPerClickTTEDenominationInput.value);
        if (el.energyPerClickTTEDenominationValue) localStorage.setItem('ae_tte_energyPerClickDenomValue', el.energyPerClickTTEDenominationValue.value);

        const returnTime = localStorage.getItem('ae_tte_returnTime');
        if (returnTime && el.timeToReturnSelect) {
            el.timeToReturnSelect.value = returnTime;
        }

        if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
            boostItems.forEach(item => {
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
    } catch(e) {
        console.error("Failed to load TimeToEnergy data from localStorage", e);
    }
}

function saveStarData() {
    try {
        if (el.starLevelSelect) localStorage.setItem('ae_star_level', el.starLevelSelect.value);
        if (el.starSpeedSelect) localStorage.setItem('ae_star_speed', el.starSpeedSelect.value);
        if (el.starAmount) localStorage.setItem('ae_star_amount', el.starAmount.value);
        if (el.starBaseLuck) localStorage.setItem('ae_star_baseLuck', el.starBaseLuck.value);
        if (el.starTimeHours) localStorage.setItem('ae_star_timeHours', el.starTimeHours.value);
    } catch(e) {
        console.error("Failed to save Star data to localStorage", e);
    }
}

function loadStarData() {
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

    } catch(e) {
        console.error("Failed to load Star data from localStorage", e);
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

    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);

    let resultString = '';
    if (days > 0) resultString += `${days}d `;
    if (hours > 0 || days > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;

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
    const timeInSeconds = (timeInHours * 3600) + (timeInMinutes * 60);

    const SLOW_CPS = 1.0919;
    const FAST_CPS = 5.88505;
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const baseEnergyPerSecond = energyPerClick * clicksPerSecond;

    const returnTimeEl = el.timeToEnergyReturnTime;
    const resultEl = el.timeToEnergyResult;

    if (baseEnergyPerSecond <= 0 || timeInSeconds <= 0) {
        resultEl.innerText = formatNumber(currentEnergy);
        if (returnTimeEl) returnTimeEl.innerText = "Select a time";
        saveTimeToEnergyData();
        return;
    }

    const events = [0];
    const activeBoosts = [];

    boostItems.forEach(item => {
        const hours = getNumberValue(`boost-${item.id}-hours`);
        const minutes = getNumberValue(`boost-${item.id}-minutes`);
        const durationInSeconds = (hours * 3600) + (minutes * 60);

        if (durationInSeconds > 0) {
            const expirationTime = Math.min(durationInSeconds, timeInSeconds);
            activeBoosts.push({ multiplier: item.multiplier, expiresAt: expirationTime });
            if (expirationTime < timeInSeconds) {
                events.push(expirationTime);
            }
        }
    });
    events.push(timeInSeconds);

    const uniqueSortedEvents = [...new Set(events)].sort((a, b) => a - b);

    let totalEnergyGained = 0;

    for (let i = 0; i < uniqueSortedEvents.length - 1; i++) {
        const startTime = uniqueSortedEvents[i];
        const endTime = uniqueSortedEvents[i+1];
        const segmentDuration = endTime - startTime;
        
        const midpointTime = startTime + 1; 

        let segmentMultiplier = 1.0;
        activeBoosts.forEach(boost => {
            if (midpointTime <= boost.expiresAt) {
                segmentMultiplier *= boost.multiplier;
            }
        });

        const energyInSegment = baseEnergyPerSecond * segmentMultiplier * segmentDuration;
        totalEnergyGained += energyInSegment;
    }

    const finalTotalEnergy = currentEnergy + totalEnergyGained;

    resultEl.innerText = formatNumber(finalTotalEnergy);

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
    saveTimeToEnergyData();
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

    const MAX_SECONDS_CAP = 3.154e10;

    if (timeInSeconds > MAX_SECONDS_CAP || !isFinite(timeInSeconds)) {
        singleResultEl.innerText = "Over 1000 Years";
        if (questResultEl) {
            const kills = quantity > 0 ? quantity : 1;
            questResultEl.innerText = `Time for ${kills} kills: Over 1000 Years`;
        }
        if (questReturnEl) questReturnEl.innerText = 'ETA: Eternity';
        saveTTKData();
        return;
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

        if (totalTimeInSeconds > MAX_SECONDS_CAP || !isFinite(totalTimeInSeconds)) {
            if (questResultEl) questResultEl.innerText = `Time for ${quantity} kills: Over 1000 Years`;
            if (questReturnEl) questReturnEl.innerText = 'ETA: Eternity';
            saveTTKData();
            return;
        }

        const totalDays = Math.floor(totalTimeInSeconds / 86400);
        const totalHours = Math.floor((totalTimeInSeconds % 86400) / 3600);
        const totalMinutes = Math.floor((totalTimeInSeconds % 3600) / 60);
        const totalSeconds = Math.round(totalTimeInSeconds % 60);

        let totalResultString = '';
        if (totalDays > 0) totalResultString += `${totalDays}d `;
        if (totalHours > 0 || totalDays > 0) totalResultString += `${totalHours}h `;
        if (totalMinutes > 0 || totalHours > 0 || days > 0) totalResultString += `${totalMinutes}m `;
        totalResultString += `${totalSeconds}s`;

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
    if (selectedRank && rankRequirements[selectedRank]) {
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
    const energyForRank = rankRequirements[selectedRank] || 0;

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

    const days = Math.floor(timeInSeconds / 86400);
    const hours = Math.floor((timeInSeconds % 86400) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.round(timeInSeconds % 60);

    let resultString = '';
    if (days > 0) resultString += `${days}d `;
    if (hours > 0 || days > 0) resultString += `${hours}h `;
    if (minutes > 0 || hours > 0 || days > 0) resultString += `${minutes}m `;
    resultString += `${seconds}s`;

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
    
    Object.keys(worldData).forEach(worldName => {
        const option = document.createElement('option');
        option.value = worldName;
        option.innerText = worldName;
        worldSelect.appendChild(option);
    });
}

function populateEnemyDropdown() {
    const enemySelect = el.enemySelect;
    if (!enemySelect || !el.worldSelect || !el.enemyHealth || !el.enemyHealthDisplay) return;

    const selectedWorldName = el.worldSelect.value;
    const world = worldData[selectedWorldName];

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
    const world = worldData[selectedWorldName];
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

    boostItems.forEach(item => {
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
        return;
    }

    el.activityTimeLimit.value = activity.timeLimit;

    if (activity.type === 'raid') {
        resultLabel.innerText = 'Estimated Max Wave:';
    } else {
        resultLabel.innerText = 'Estimated Max Room:';
    }
    calculateMaxStage();
}

function calculateMaxStage() {
    if (!el.activitySelect || !el.yourDPSActivity || !el.dpsActivityDenominationValue || 
        !el.activityTimeLimit || !el.activityResult) {
        return; 
    }
    
    const selection = el.activitySelect.value;
    if (!selection) {
        el.activityResult.innerText = '0 / 0';
        saveRaidData();
        return;
    }

    const activity = activityData[selection];
    const yourDPS = (getNumberValue('yourDPSActivity') || 0) * (parseFloat(el.dpsActivityDenominationValue.value) || 1);
    const timeLimit = getNumberValue('activityTimeLimit');
    const resultEl = el.activityResult;

    const maxStages = activity ? activity.maxStages : 0;

    if (!activity || yourDPS <= 0 || timeLimit <= 0) {
        resultEl.innerText = `0 / ${maxStages}`;
        saveRaidData();
        return;
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
    saveRaidData();
}


function setupRankSearch(inputId, valueId, listId) {
    const inputEl = el[inputId];
    const valueEl = el[valueId];
    const listEl = el[listId];

    if (!inputEl || !valueEl || !listEl) {
        console.error("Missing elements for setupRankSearch:", inputId);
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

    if (!inputEl || !valueEl || !listEl) {
        console.error("Missing elements for setupDenominationSearch:", inputId);
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
                inputEl.value = currentDenom && currentDenom.name !== 'None' ? currentDenom.name : '';
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


document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('[id]').forEach(element => {
        el[element.id] = element;
    });

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

    function onRankUpCEDenomChange() {
        calculateRankUp();
        if(el.currentEnergyETADenominationInput) el.currentEnergyETADenominationInput.value = el.currentEnergyDenominationInput.value;
        if(el.currentEnergyETADenominationValue) el.currentEnergyETADenominationValue.value = el.currentEnergyDenominationValue.value;
        calculateEnergyETA();
        if(el.currentEnergyTTEDenominationInput) el.currentEnergyTTEDenominationInput.value = el.currentEnergyDenominationInput.value;
        if(el.currentEnergyTTEDenominationValue) el.currentEnergyTTEDenominationValue.value = el.currentEnergyDenominationValue.value;
        calculateTimeToEnergy();
    }

    function onETACEDenomChange() {
        calculateEnergyETA();
        if(el.currentEnergyDenominationInput) el.currentEnergyDenominationInput.value = el.currentEnergyETADenominationInput.value;
        if(el.currentEnergyDenominationValue) el.currentEnergyDenominationValue.value = el.currentEnergyETADenominationValue.value;
        calculateRankUp();
        if(el.currentEnergyTTEDenominationInput) el.currentEnergyTTEDenominationInput.value = el.currentEnergyETADenominationInput.value;
        if(el.currentEnergyTTEDenominationValue) el.currentEnergyTTEDenominationValue.value = el.currentEnergyETADenominationValue.value;
        calculateTimeToEnergy();
    }
    
    function onTTECEDenomChange() {
        calculateTimeToEnergy();
        if(el.currentEnergyDenominationInput) el.currentEnergyDenominationInput.value = el.currentEnergyTTEDenominationInput.value;
        if(el.currentEnergyDenominationValue) el.currentEnergyDenominationValue.value = el.currentEnergyTTEDenominationValue.value;
        calculateRankUp();
        if(el.currentEnergyETADenominationInput) el.currentEnergyETADenominationInput.value = el.currentEnergyTTEDenominationInput.value;
        if(el.currentEnergyETADenominationValue) el.currentEnergyETADenominationValue.value = el.currentEnergyETADenominationValue.value;
        calculateEnergyETA();
    }

    function onRankUpEPCDenomChange() {
        calculateRankUp();
        if(el.energyPerClickETADenominationInput) el.energyPerClickETADenominationInput.value = el.energyPerClickDenominationInput.value;
        if(el.energyPerClickETADenominationValue) el.energyPerClickETADenominationValue.value = el.energyPerClickDenominationValue.value;
        calculateEnergyETA();
        if(el.energyPerClickTTEDenominationInput) el.energyPerClickTTEDenominationInput.value = el.energyPerClickDenominationInput.value;
        if(el.energyPerClickTTEDenominationValue) el.energyPerClickTTEDenominationValue.value = el.energyPerClickDenominationValue.value;
        calculateTimeToEnergy();
    }

    function onETAEPCdenomChange() {
        calculateEnergyETA();
        if(el.energyPerClickDenominationInput) el.energyPerClickDenominationInput.value = el.energyPerClickETADenominationInput.value;
        if(el.energyPerClickDenominationValue) el.energyPerClickDenominationValue.value = el.energyPerClickETADenominationValue.value;
        calculateRankUp();
    }

    function onTTEEPCDenomChange() {
        calculateTimeToEnergy();
    }

    const syncDPS_TTKToRaid = () => {
        if(el.yourDPSActivity) el.yourDPSActivity.value = el.yourDPS.value;
        if(el.dpsActivityDenominationInput) el.dpsActivityDenominationInput.value = el.dpsDenominationInput.value;
        if(el.dpsActivityDenominationValue) el.dpsActivityDenominationValue.value = el.dpsDenominationValue.value;
        calculateMaxStage();
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
        syncDPS_RaidToTTK();
    }

    setupDenominationSearch('dpsDenominationInput', 'dpsDenominationValue', 'dpsDenominationList', onTTKDenomChange);
    setupDenominationSearch('dpsActivityDenominationInput', 'dpsActivityDenominationValue', 'dpsActivityDenominationList', onRaidDenomChange);
    
    setupDenominationSearch('currentEnergyDenominationInput', 'currentEnergyDenominationValue', 'currentEnergyDenominationList', onRankUpCEDenomChange);
    setupDenominationSearch('energyPerClickDenominationInput', 'energyPerClickDenominationValue', 'energyPerClickDenominationList', onRankUpEPCDenomChange);
    
    setupDenominationSearch('currentEnergyETADenominationInput', 'currentEnergyETADenominationValue', 'currentEnergyETADenominationList', onETACEDenomChange);
    setupDenominationSearch('targetEnergyETADenominationInput', 'targetEnergyETADenominationValue', 'targetEnergyETADenominationList', calculateEnergyETA);
    setupDenominationSearch('energyPerClickETADenominationInput', 'energyPerClickETADenominationValue', 'energyPerClickETADenominationList', onETAEPCdenomChange);

    setupDenominationSearch('currentEnergyTTEDenominationInput', 'currentEnergyTTEDenominationValue', 'currentEnergyTTEDenominationList', onTTECEDenomChange);
    setupDenominationSearch('energyPerClickTTEDenominationInput', 'energyPerClickTTEDenominationValue', 'energyPerClickTTEDenominationList', onTTEEPCDenomChange);

    if (el.currentEnergy) {
        el.currentEnergy.addEventListener('input', debounce(() => {
            if (el.currentEnergyETA) el.currentEnergyETA.value = el.currentEnergy.value;
            if (el.currentEnergyTTE) el.currentEnergyTTE.value = el.currentEnergy.value;
            calculateRankUp();
            calculateEnergyETA();
            calculateTimeToEnergy();
        }, 300));
    }
    if (el.currentEnergyETA) {
        el.currentEnergyETA.addEventListener('input', debounce(() => {
            if (el.currentEnergy) el.currentEnergy.value = el.currentEnergyETA.value;
            if (el.currentEnergyTTE) el.currentEnergyTTE.value = el.currentEnergyETA.value;
            calculateRankUp();
            calculateEnergyETA();
            calculateTimeToEnergy();
        }, 300));
    }
    if (el.currentEnergyTTE) {
        el.currentEnergyTTE.addEventListener('input', debounce(() => {
            if (el.currentEnergy) el.currentEnergy.value = el.currentEnergyTTE.value;
            if (el.currentEnergyETA) el.currentEnergyETA.value = el.currentEnergyTTE.value;
            calculateRankUp();
            calculateEnergyETA();
            calculateTimeToEnergy();
        }, 300));
    }

    if (el.energyPerClick) {
    el.energyPerClick.addEventListener('input', debounce(() => {
        if (el.energyPerClickETA) el.energyPerClickETA.value = el.energyPerClick.value;
        calculateRankUp();
        calculateEnergyETA();
    }, 300));
    }
    if (el.energyPerClickETA) {
        el.energyPerClickETA.addEventListener('input', debounce(() => {
            if (el.energyPerClick) el.energyPerClick.value = el.energyPerClickETA.value;
            calculateRankUp();
            calculateEnergyETA();
        }, 300));
    }
if (el.energyPerClickTTE) {
    el.energyPerClickTTE.addEventListener('input', debounce(calculateTimeToEnergy, 300));
}
    
    if (el.clickerSpeed) el.clickerSpeed.addEventListener('change', () => {
        const isChecked = el.clickerSpeed.checked;
        if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isChecked;
        if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isChecked;
        calculateRankUp();
        calculateEnergyETA();
        calculateTimeToEnergy();
    });
    if (el.clickerSpeedETA) el.clickerSpeedETA.addEventListener('change', () => {
        const isChecked = el.clickerSpeedETA.checked;
        if (el.clickerSpeed) el.clickerSpeed.checked = isChecked;
        if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isChecked;
        calculateRankUp();
        calculateEnergyETA();
        calculateTimeToEnergy();
    });
    if (el.clickerSpeedTTE) el.clickerSpeedTTE.addEventListener('change', () => {
        const isChecked = el.clickerSpeedTTE.checked;
        if (el.clickerSpeed) el.clickerSpeed.checked = isChecked;
        if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isChecked;
        calculateRankUp();
        calculateEnergyETA();
        calculateTimeToEnergy();
    });


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

    if (el.timeToReturnSelect) el.timeToReturnSelect.addEventListener('change', calculateTimeToEnergy);
    if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
        boostItems.forEach(item => {
            const hoursEl = el[`boost-${item.id}-hours`];
            const minutesEl = el[`boost-${item.id}-minutes`];
            if (hoursEl) {
                hoursEl.addEventListener('change', calculateTimeToEnergy);
            }
            if (minutesEl) {
                minutesEl.addEventListener('change', calculateTimeToEnergy);
            }
        });
    }

    if (el.timeToReturnSelect) el.timeToReturnSelect.addEventListener('change', calculateTimeToEnergy);

    if (el.timeToReturnSelectMinutes) el.timeToReturnSelectMinutes.addEventListener('change', calculateTimeToEnergy);

    if (el.yourDPS) {
        el.yourDPS.addEventListener('input', debounce(() => {
            calculateTTK();
            if (el.yourDPSActivity) el.yourDPSActivity.value = el.yourDPS.value;
            calculateMaxStage();
            saveTTKData();
        }, 300));
    }
    if (el.enemyQuantity) el.enemyQuantity.addEventListener('input', debounce(calculateTTK, 300));
    if (el.fourSpotFarming) el.fourSpotFarming.addEventListener('change', calculateTTK);

    if (el.yourDPSActivity) {
        el.yourDPSActivity.addEventListener('input', debounce(() => {
            calculateMaxStage();
            if (el.yourDPS) el.yourDPS.value = el.yourDPSActivity.value;
            calculateTTK();
        }, 300));
    }
    if (el.activityTimeLimit) el.activityTimeLimit.addEventListener('input', debounce(calculateMaxStage, 300));

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
    
    loadRankUpData();
    loadETAData();
    loadTimeToEnergyData();
    loadTTKData();
    loadStarData();

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

    if (el.worldSelect) {
        populateEnemyDropdown(); 
    } else {
        calculateTTK();
    }


    setTimeout(() => {
        calculateRankUp();
        calculateEnergyETA();
        calculateTimeToEnergy();
        calculateTTK();
        calculateMaxStage();
        calculateStarCalc();
    }, 100);


    if (typeof checklistDataByWorld !== 'undefined' && typeof worldData !== 'undefined') {
        console.log("DEBUG: World and Checklist data found! Initializing new checklist UI...");

        const checklistPanel = el['panel-checklist']; 
        if (!checklistPanel) {
            console.error("DEBUG: Checklist panel 'panel-checklist' not found in HTML. Checklist functionality will be disabled.");
            return;
        }

        const checklistContainer = el['checklist-worlds-container'];
        if (!checklistContainer) {
             console.error("DEBUG: Checklist container 'checklist-worlds-container' not found in HTML.");
            return;
        }

        const CHECKLIST_SAVE_KEY = 'ae_checklist_progress';

        function styleChecklistItem(checkbox, isChecked) {
            const span = checkbox.nextElementSibling;
            if (span) {
                if (isChecked) {
                    span.style.textDecoration = 'line-through';
                    span.style.color = '#888';
                } else {
                    span.style.textDecoration = 'none';
                    span.style.color = '#ccc';
                }
            }
        }
        
        function createChecklistItem(item, savedData) {
            const label = document.createElement('label');
            label.className = 'checklist-item';
            label.htmlFor = item.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = item.id;
            checkbox.name = item.id;
            checkbox.checked = !!savedData[item.id];

            const span = document.createElement('span');
            span.textContent = item.name;

            label.appendChild(checkbox);
            label.appendChild(span);

            styleChecklistItem(checkbox, checkbox.checked);
            return label;
        }

        function updateAllWorldTitles(savedData) {
            if (!savedData) {
                try {
                    savedData = JSON.parse(localStorage.getItem(CHECKLIST_SAVE_KEY)) || {};
                } catch (e) {
                    savedData = {};
                }
            }

            const worldNames = Object.keys(checklistDataByWorld);
            let overallTotal = 0;
            let overallCompleted = 0;
            let categoryStats = { 
                gachas: {total: 0, completed: 0}, 
                progressions: {total: 0, completed: 0}, 
                sssRank: {total: 0, completed: 0}, 
                auras: {total: 0, completed: 0}, 
                accessories: {total: 0, completed: 0},
                quests: {total: 0, completed: 0} 
            };

            for (const worldName of worldNames) {
                const world = checklistDataByWorld[worldName];
                const worldNameId = worldName.replace(/\s+/g, '-').toLowerCase();
                const worldTitleEl = document.getElementById(`world-title-${worldNameId}`);

                let totalItems = 0;
                let completedItems = 0;
        
                const categories = ['gachas', 'progressions', 'sssRank', 'auras', 'accessories', 'quests'];
                categories.forEach(catKey => {
                    if (world[catKey]) {
                        totalItems += world[catKey].length;
                        if (categoryStats[catKey]) {
                            categoryStats[catKey].total += world[catKey].length;
                        }
                        
                        world[catKey].forEach(item => {
                            if (savedData[item.id]) {
                                completedItems++;
                                if (categoryStats[catKey]) {
                                    categoryStats[catKey].completed++;
                                }
                            }
                        });
                        
                        const subTitleEl = document.getElementById(`${catKey}-title-${worldNameId}`);
                        if(subTitleEl) {
                            const subTotal = world[catKey].length;
                            const subCompleted = world[catKey].filter(item => savedData[item.id]).length;
                            let catName = catKey.charAt(0).toUpperCase() + catKey.slice(1);
                            if (catKey === 'sssRank') catName = 'SSS Rank';
                            
                            subTitleEl.innerHTML = `${catName} <span class="category-badge badge-${catKey}">${subCompleted}/${subTotal}</span>`;
                        }
                    }
                });

                if (worldTitleEl) {
                    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                    worldTitleEl.innerText = `${worldName} (${completedItems} / ${totalItems})`;
                    worldTitleEl.style.setProperty('--progress', `${percentage}%`);
                }
                overallTotal += totalItems;
                overallCompleted += completedItems;
            }
            
            const overallProgressText = el['overall-progress-text'];
            const overallProgressFill = el['overall-progress-fill'];
            if (overallProgressText && overallProgressFill) {
                const percentage = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;
                overallProgressText.innerText = `${overallCompleted} / ${overallTotal} (${percentage}%)`;
                overallProgressFill.style.width = `${percentage}%`;
            }
            
            Object.keys(categoryStats).forEach(cat => {
                let elId;
                if (cat === 'sssRank') elId = 'sssrank-count';
                else elId = `${cat}-count`;
                
                const countEl = document.getElementById(elId);
                if (countEl) {
                    countEl.innerText = `${categoryStats[cat].completed}/${categoryStats[cat].total}`;
                } else {
                    console.warn(`Count element with ID '${elId}' not found.`);
                }
            });
        }

        function saveChecklistData() {
            try {
                const savedData = {};
                if (!checklistPanel) return;
                const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]:checked');
                checkboxes.forEach(cb => {
                    savedData[cb.id] = true;
                });
                localStorage.setItem(CHECKLIST_SAVE_KEY, JSON.stringify(savedData));
                updateAllWorldTitles(savedData);
            } catch (e) {
                console.error("Failed to save checklist data:", e);
            }
        }

        function populateWorldChecklists(savedData) {
            checklistContainer.innerHTML = '';

            const worldOrder = Object.keys(worldData);
            if (checklistDataByWorld["Miscellaneous"]) {
                worldOrder.push("Miscellaneous");
            }

            for (const worldName of worldOrder) {
                if (!checklistDataByWorld[worldName]) continue;

                const world = checklistDataByWorld[worldName];
                const worldNameId = worldName.replace(/\s+/g, '-').toLowerCase();

                const section = document.createElement('section');
                
                const worldHeader = document.createElement('div');
                worldHeader.className = 'world-section-header';
                
                const title = document.createElement('h2');
                title.className = 'world-section-title';
                title.id = `world-title-${worldNameId}`;
                title.innerText = `${worldName} (0 / 0)`; 
                worldHeader.appendChild(title);

                const worldToggleContainer = document.createElement('div');
                worldToggleContainer.className = 'toggle-container world-toggle';

                const checkAllWorldBtn = document.createElement('button');
                checkAllWorldBtn.className = 'toggle-btn world-check-all';
                checkAllWorldBtn.innerText = 'Check All';
                checkAllWorldBtn.dataset.worldId = worldNameId; 

                const uncheckAllWorldBtn = document.createElement('button');
                uncheckAllWorldBtn.className = 'toggle-btn world-uncheck-all';
                uncheckAllWorldBtn.innerText = 'Uncheck All';
                uncheckAllWorldBtn.dataset.worldId = worldNameId; 

                worldToggleContainer.appendChild(checkAllWorldBtn);
                worldToggleContainer.appendChild(uncheckAllWorldBtn);
                worldHeader.appendChild(worldToggleContainer);
                
                section.appendChild(worldHeader);

                const categories = [
                    { key: 'gachas', name: 'Gachas', css: 'gachas' },
                    { key: 'progressions', name: 'Progressions', css: 'progressions' },
                    { key: 'sssRank', name: 'SSS Rank', css: 'sssRank' },
                    { key: 'auras', name: 'Auras', css: 'auras' },
                    { key: 'accessories', name: 'Accessories', css: 'accessories' },
                    { key: 'quests', name: 'Quests', css: 'quests' }
                ];

                const subsections = [];

                categories.forEach(cat => {
                    if (world[cat.key] && world[cat.key].length > 0) {
                        const subSection = document.createElement('div');
                        subSection.className = 'checklist-category-subsection';
                        
                        const subTitle = document.createElement('h3');
                        subTitle.className = `world-subsection-title ${cat.css}`;
                        subTitle.id = `${cat.key}-title-${worldNameId}`;
                        subTitle.innerText = `${cat.name} (0 / ${world[cat.key].length})`;
                        subSection.appendChild(subTitle);
                        
                        const listDiv = document.createElement('div');
                        listDiv.className = 'space-y-2';
                        world[cat.key].forEach(item => {
                            listDiv.appendChild(createChecklistItem(item, savedData));
                        });
                        subSection.appendChild(listDiv);
                        subsections.push(subSection);
                    }
                });

                if (subsections.length > 0) {
                    const grid = document.createElement('div');
                    let gridCols = 'md:grid-cols-2 lg:grid-cols-3';
                    if (subsections.length === 1) gridCols = ''; 
                    if (subsections.length === 2) gridCols = 'md:grid-cols-2'; 
                    
                    grid.className = `grid grid-cols-1 ${gridCols} gap-6 mt-4`;
                    
                    subsections.forEach(sub => grid.appendChild(sub));
                    section.appendChild(grid);
                }

                checklistContainer.appendChild(section);
            }
        }

        function loadChecklistData() {
            try {
                const savedData = JSON.parse(localStorage.getItem(CHECKLIST_SAVE_KEY)) || {};
                populateWorldChecklists(savedData);
                updateAllWorldTitles(savedData);
            } catch (e) {
                console.error("Failed to load checklist data:", e);
                populateWorldChecklists({});
                updateAllWorldTitles({});
            }
        }

        function filterChecklistItems(searchTerm = '', categoryFilter = '') {
            const searchLower = searchTerm.toLowerCase();
            const worldSections = checklistPanel.querySelectorAll('section');
            
            worldSections.forEach(section => {
                const subsections = section.querySelectorAll('.checklist-category-subsection');
                let sectionHasVisible = false;
                
                subsections.forEach(subsection => {
                    const subTitle = subsection.querySelector('h3');
                    if (!subTitle) return;
                    
                    const items = subsection.querySelectorAll('.checklist-item');
                    let visibleItems = 0;
                    
                    const subId = subTitle.id;
                    const categoryMatch = !categoryFilter || (categoryFilter === 'sssrank' ? subId.includes('sssRank-title') : subId.includes(`${categoryFilter}-title`));
                    
                    items.forEach(item => {
                        const text = item.textContent.toLowerCase();
                        const searchMatch = !searchTerm || text.includes(searchLower);
                        
                        if (categoryMatch && searchMatch) {
                            item.style.display = 'flex';
                            visibleItems++;
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    
                    if (visibleItems > 0) {
                        subsection.style.display = ''; 
                        sectionHasVisible = true;
                    } else {
                        subsection.style.display = 'none';
                    }
                });
                
                section.style.display = sectionHasVisible ? 'block' : 'none';
            });
        }
        


        checklistPanel.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const item = e.target.closest('.checklist-item');
                if (e.target.checked && item) {
                    item.classList.add('completed');
                    setTimeout(() => item.classList.remove('completed'), 500);
                }
                styleChecklistItem(e.target, e.target.checked);
                saveChecklistData();
            }
        });

        checklistContainer.addEventListener('click', (e) => {
            const target = e.target;
            let checkValue;

            if (target.classList.contains('world-check-all')) {
                checkValue = true;
            } else if (target.classList.contains('world-uncheck-all')) {
                checkValue = false;
            } else {
                return;
            }

            const section = target.closest('section');
            if (!section) return;

            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = checkValue;
                styleChecklistItem(cb, checkValue);
            });

            saveChecklistData();
        });


        if (el['checklist-search']) {
            el['checklist-search'].addEventListener('input', (e) => {
                const categoryFilter = el['category-filter'] ? el['category-filter'].value : '';
                filterChecklistItems(e.target.value, categoryFilter);
            });
        }
        
        if (el['category-filter']) {
            el['category-filter'].addEventListener('change', (e) => {
                const searchTerm = el['checklist-search'] ? el['checklist-search'].value : '';
                filterChecklistItems(searchTerm, e.target.value);
            });
        }

        if (el['check-all-btn']) {
            el['check-all-btn'].addEventListener('click', () => {
                if (!checklistPanel) return;
                const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    cb.checked = true;
                    styleChecklistItem(cb, true);
                });
                saveChecklistData();
            });
        }

        if (el['uncheck-all-btn']) {
            el['uncheck-all-btn'].addEventListener('click', () => {
                if (!checklistPanel) return;
                const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(cb => {
                    cb.checked = false;
                    styleChecklistItem(cb, false);
                });
                saveChecklistData();
            });
        }
        
        loadChecklistData();

    } else {
        console.warn("DEBUG: Checklist data (checklistDataByWorld) or World data (worldData) NOT found. Checklist will not load.");
    }
});
