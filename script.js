const el = {};
const tabs = ['rankup', 'eta', 'time-to-energy', 'lootcalc', 'ttk', 'raid', 'alerts', 'star', 'checklist'];

const dungeonIntervals = {
    'Easy Dungeon': { startMinute: 0, id: 'easy' },
    'Medium Dungeon': { startMinute: 10, id: 'medium' },
    'Hard Dungeon': { startMinute: 20, id: 'hard' },
    'Insane Dungeon': { startMinute: 30, id: 'insane' },
    'Crazy Dungeon': { startMinute: 40, id: 'crazy' },
    'Nightmare Dungeon': { startMinute: 50, id: 'nightmare' },
    'Leaf Raid': { startMinute: 15, id: 'leaf' }
};

let nextAlertTimeout;
let countdownInterval;
let isAlertPending = false;
let tabFlashInterval = null;
const ORIGINAL_TITLE = document.title;
const FLASH_TITLE = '[!!! DUNGEON READY !!!]';
const FLASH_INTERVAL_MS = 1000;
const CHECKLIST_SAVE_KEY = 'ae_checklist_progress';
const LOOT_RESPAWN_DELAY = 3.0;
const LOOT_KILL_OVERHEAD = 0.5;
const SLOW_CPS = 1.0919;
const FAST_CPS = 5.88505;
let currentNumberFormat = 'letters';
const activityData = {};

function toEngineeringNotation(num) {
    if (num === 0) return "0";
    if (!isFinite(num)) return "N/A";
    if (Math.abs(num) < 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    let log10 = Math.log10(Math.abs(num));
    let exponent = Math.floor(log10 / 3) * 3;
    let mantissa = num / Math.pow(10, exponent);
    return parseFloat(mantissa.toFixed(2)) + 'e' + exponent;
}

function isWorldCompleted(worldSection) {
    const checkboxes = worldSection.querySelectorAll('.checklist-item input[type="checkbox"]');
    if (checkboxes.length === 0) return true; 
    let completed = true;
    checkboxes.forEach(cb => {
        if (!cb.checked) completed = false;
    });
    return completed;
}

function isCategoryCompleted(subsection) {
    const checkboxes = subsection.querySelectorAll('.checklist-item input[type="checkbox"]');
    if (checkboxes.length === 0) return true;
    let completed = true;
    checkboxes.forEach(cb => {
        if (!cb.checked) completed = false;
    });
    return completed;
}

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
    if (typeof checklistDataByWorld === 'undefined') return;
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
        }
    });
}

function saveChecklistData() {
    if (typeof checklistDataByWorld === 'undefined') return;
    try {
        const savedData = {};
        const checklistPanel = el['panel-checklist'];
        if (!checklistPanel) return;
        const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            if(cb.checked) {
                savedData[cb.id] = true;
            }
        });
        localStorage.setItem(CHECKLIST_SAVE_KEY, JSON.stringify(savedData));
        updateAllWorldTitles(savedData);
        filterChecklistItems(el['checklist-search']?.value, el['category-filter']?.value);
    } catch (e) {}
}

function populateWorldChecklists(savedData) {
    if (typeof checklistDataByWorld === 'undefined') return;
    const checklistContainer = el['checklist-worlds-container'];
    if (!checklistContainer) return;
    checklistContainer.innerHTML = '';
    const worldOrder = Object.keys(checklistDataByWorld);
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
    if (typeof checklistDataByWorld === 'undefined') return;
    try {
        const savedData = JSON.parse(localStorage.getItem(CHECKLIST_SAVE_KEY)) || {};
        populateWorldChecklists(savedData);
        updateAllWorldTitles(savedData);
        const hideCompleted = localStorage.getItem('ae_checklist_hide_completed') === 'true';
        if (el['hide-completed-checkbox']) {
            el['hide-completed-checkbox'].checked = hideCompleted;
        }
        filterChecklistItems(el['checklist-search']?.value, el['category-filter']?.value);
    } catch (e) {
        populateWorldChecklists({});
        updateAllWorldTitles({});
    }
}

function filterChecklistItems(searchTerm = '', categoryFilter = '') {
    const checklistPanel = el['panel-checklist'];
    if (!checklistPanel) return;
    const searchLower = searchTerm.toLowerCase();
    const categoryFilterActive = !!categoryFilter;
    const searchActive = !!searchTerm;
    const isHiddenMode = el['hide-completed-checkbox'] ? el['hide-completed-checkbox'].checked : false;
    const worldSections = checklistPanel.querySelectorAll('section');
    worldSections.forEach(section => {
        const subsections = section.querySelectorAll('.checklist-category-subsection');
        let sectionHasVisibleContent = false;
        subsections.forEach(subsection => {
            const subTitle = subsection.querySelector('h3');
            if (!subTitle) return;
            const items = subsection.querySelectorAll('.checklist-item');
            let visibleItems = 0;
            const subId = subTitle.id;
            const categoryMatch = !categoryFilterActive || (categoryFilter === 'sssrank' ? subId.includes('sssRank-title') : subId.includes(`${categoryFilter}-title`));
            const isCompletedCategory = isCategoryCompleted(subsection);
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const itemCheckbox = item.querySelector('input[type="checkbox"]');
                const itemIsCompleted = itemCheckbox && itemCheckbox.checked;
                const searchMatch = !searchActive || text.includes(searchLower);
                const hideCompletedItemMatch = !isHiddenMode || !itemIsCompleted;
                if (categoryMatch && searchMatch && hideCompletedItemMatch) {
                    item.style.display = 'flex';
                    visibleItems++;
                } else {
                    item.style.display = 'none';
                }
            });
            const hideCompletedCategory = isCompletedCategory && isHiddenMode && !searchActive && !categoryFilterActive;
            if (visibleItems > 0 && !hideCompletedCategory) {
                subsection.style.display = 'block'; 
                sectionHasVisibleContent = true;
            } else {
                subsection.style.display = 'none';
            }
        });
        const worldIsCompleted = isWorldCompleted(section);
        const hideCompletedWorld = worldIsCompleted && isHiddenMode && !searchActive && !categoryFilterActive;
        if (sectionHasVisibleContent && !hideCompletedWorld) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

function switchTab(activeTab) {
    tabs.forEach(tab => {
        const panel = el[`panel-${tab}`]; 
        const button = el[`tab-${tab}`];
        if (panel && button) {
            if (tab === activeTab) {
                panel.classList.remove('hidden');
                button.classList.add('active');
                if (tab === 'alerts') {
                    startCountdownDisplay();
                }
            } else {
                panel.classList.add('hidden');
                button.classList.remove('active');
                if (tab === 'alerts') {
                    stopCountdownDisplay();
                }
            }
        }
    });
    if (activeTab === 'alerts' || document.visibilityState === 'visible') {
        stopTabFlashing();
    }
}

function setFarmingMode(mode, button) {
    const parent = button.closest('.toggle-container');
    if (!parent) return;
    const buttons = parent.querySelectorAll('.toggle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    if (button.closest('#panel-ttk') && el.fourSpotFarming) {
        el.fourSpotFarming.checked = (mode === 'four');
        calculateTTK();
        saveTTKData();
    } else if (button.closest('#panel-lootcalc') && el.lootFarmingMode) {
        el.lootFarmingMode.value = mode;
        calculateLootDrops();
        saveLootData();
    }
}

function setClickerSpeed(speed, button) {
    const parent = button.closest('.toggle-container');
    if (!parent) return;
    const buttons = parent.querySelectorAll('.toggle-btn');
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

function splitNumberToDenom(num) {
    if (num === 0) return { value: 0, name: '', multiplier: 1 };
    if (typeof denominations === 'undefined') {
        return { value: num, name: '', multiplier: 1 }; 
    }
    const reversedDenoms = [...denominations].sort((a, b) => b.value - a.value);
    for (const denom of reversedDenoms) {
        const baseValue = num / denom.value;
        if (baseValue >= 1 && baseValue < 1000) {
            return {
                value: parseFloat(baseValue.toFixed(2)),
                name: denom.name === 'None' ? '' : denom.name,
                multiplier: denom.value
            };
        }
    }
    const largestDenom = denominations[denominations.length - 1];
    if (num >= largestDenom.value) {
        const baseValue = num / largestDenom.value;
        return { 
            value: parseFloat(baseValue.toFixed(2)), 
            name: largestDenom.name, 
            multiplier: largestDenom.value 
        };
    }
    return { value: parseFloat(num.toFixed(2)), name: '', multiplier: 1 };
}

function setNumberFormat(format) {
    if (format === currentNumberFormat) return;
    const previousFormat = currentNumberFormat;
    currentNumberFormat = format;
    try {
        localStorage.setItem('ae_number_format', format);
    } catch (e) { }
    const scientificBtn = el['format-toggle-scientific'];
    const engineeringBtn = el['format-toggle-engineering'];
    const lettersBtn = el['format-toggle-letters'];
    if (scientificBtn) scientificBtn.classList.toggle('active', format === 'scientific');
    if (engineeringBtn) engineeringBtn.classList.toggle('active', format === 'engineering');
    if (lettersBtn) lettersBtn.classList.toggle('active', format === 'letters');
    const denomInputs = document.querySelectorAll('.grid-denom .relative');
    const isSimpleInput = format === 'scientific' || format === 'engineering';
    denomInputs.forEach(container => {
        const input = container.querySelector('input[type="text"]');
        if (input) {
            container.style.display = isSimpleInput ? 'none' : 'block';
        }
    });
    const inputPairs = [
        { numId: 'currentEnergy', denomId: 'currentEnergyDenominationInput', valueId: 'currentEnergyDenominationValue' },
        { numId: 'energyPerClick', denomId: 'energyPerClickDenominationInput', valueId: 'energyPerClickDenominationValue' },
        { numId: 'currentEnergyETA', denomId: 'currentEnergyETADenominationInput', valueId: 'currentEnergyETADenominationValue' },
        { numId: 'targetEnergyETA', denomId: 'targetEnergyETADenominationInput', valueId: 'targetEnergyETADenominationValue' },
        { numId: 'energyPerClickETA', denomId: 'energyPerClickETADenominationInput', valueId: 'energyPerClickETADenominationValue' },
        { numId: 'currentEnergyTTE', denomId: 'currentEnergyTTEDenominationInput', valueId: 'currentEnergyTTEDenominationValue' },
        { numId: 'energyPerClickTTE', denomId: 'energyPerClickTTEDenominationInput', valueId: 'energyPerClickTTEDenominationValue' },
        { numId: 'yourDPM', denomId: 'dpmDenominationInput', valueId: 'dpmDenominationValue' },
        { numId: 'yourDPMActivity', denomId: 'dpmActivityDenominationInput', valueId: 'dpmActivityDenominationValue' },
    ];
    if (previousFormat !== format) {
        inputPairs.forEach(pair => {
            const numEl = el[pair.numId];
            const denomInputEl = el[pair.denomId];
            const denomValueEl = el[pair.valueId];
            if (numEl && denomInputEl && denomValueEl) {
                let multiplier = previousFormat === 'letters' ? parseNumberInput(denomValueEl.value) : 1;
                let rawNumber = parseNumberInput(numEl.value) * multiplier;
                if (isFinite(rawNumber)) {
                    if (format === 'scientific') {
                        numEl.value = rawNumber.toExponential(2).replace('e+', 'e');
                    } else if (format === 'engineering') {
                         let log10 = Math.log10(Math.abs(rawNumber));
                         if (Math.abs(rawNumber) < 1000 || !isFinite(log10)) {
                             numEl.value = rawNumber;
                         } else {
                             let exponent = Math.floor(log10 / 3) * 3;
                             let mantissa = rawNumber / Math.pow(10, exponent);
                             numEl.value = parseFloat(mantissa.toFixed(2)) + 'e' + exponent;
                         }
                    } else {
                        const split = splitNumberToDenom(rawNumber);
                        numEl.value = split.value;
                        denomInputEl.value = split.name;
                        denomValueEl.value = split.multiplier;
                    }
                } else {
                    numEl.value = '0'; 
                }
                if (isSimpleInput) {
                    denomInputEl.value = '';
                    denomValueEl.value = 1;
                }
            }
        });
    }
    displayRankRequirement();
    calculateRankUp();
    calculateEnergyETA();
    calculateTimeToEnergy();
    calculateLootDrops();
    calculateTTK();
    if (el.enemySelect && el.enemySelect.value) displayEnemyHealth(); 
    calculateStarCalc();
}

function loadNumberFormat() {
    try {
        const savedFormat = localStorage.getItem('ae_number_format') || 'letters';
        currentNumberFormat = savedFormat; 
        const scientificBtn = el['format-toggle-scientific'];
        const engineeringBtn = el['format-toggle-engineering'];
        const lettersBtn = el['format-toggle-letters'];
        if (scientificBtn) scientificBtn.classList.toggle('active', currentNumberFormat === 'scientific');
        if (engineeringBtn) engineeringBtn.classList.toggle('active', currentNumberFormat === 'engineering');
        if (lettersBtn) lettersBtn.classList.toggle('active', currentNumberFormat === 'letters');
    } catch (e) {
        currentNumberFormat = 'letters';
    }
    const denomInputs = document.querySelectorAll('.grid-denom .relative');
    const isSimpleInput = currentNumberFormat === 'scientific' || currentNumberFormat === 'engineering';
    denomInputs.forEach(container => {
        const input = container.querySelector('input[type="text"]');
        if (input) {
            container.style.display = isSimpleInput ? 'none' : 'block';
            if (isSimpleInput) {
                const hiddenValueInput = container.querySelector('input[type="hidden"]');
                if (hiddenValueInput) {
                    hiddenValueInput.value = 1;
                }
            }
        }
    });
}

function parseNumberInput(value) {
    if (typeof value !== 'string') return 0;
    const parsed = Number(value.trim().replace(/[eE]\+/g, 'e')); 
    return isFinite(parsed) ? parsed : 0;
}

function getNumberValue(id) {
    if (el[id]) {
        return parseNumberInput(el[id].value);
    }
    return 0;
}

function formatNumber(num) {
    if (num === 0) return '0';
    if (!isFinite(num)) return 'N/A';
    if (typeof num !== 'number') {
        num = parseNumberInput(String(num));
        if (!isFinite(num)) return 'N/A';
    }
    if (Math.abs(num) < 1000) return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (currentNumberFormat === 'scientific') {
        return num.toExponential(2).replace('e+', 'e');
    } else if (currentNumberFormat === 'engineering') {
        return toEngineeringNotation(num);
    }
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
        if (el.energyCriticalChance) localStorage.setItem('ae_rankup_critChance', el.energyCriticalChance.value);
        if (el.criticalEnergy) localStorage.setItem('ae_rankup_critEnergy', el.criticalEnergy.value);
    } catch (e) {}
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
        if (el.energyCriticalChance) el.energyCriticalChance.value = localStorage.getItem('ae_rankup_critChance') || '';
        if (el.criticalEnergy) el.criticalEnergy.value = localStorage.getItem('ae_rankup_critEnergy') || '';
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
    } catch (e) {}
}

function saveETAData() {
    try {
        if (el.targetEnergyETA) localStorage.setItem('ae_targetEnergyETA', el.targetEnergyETA.value);
        if (el.targetEnergyETADenominationInput) localStorage.setItem('ae_targetEnergyETADenomInput', el.targetEnergyETADenominationInput.value);
        if (el.targetEnergyETADenominationValue) localStorage.setItem('ae_targetEnergyETADenomValue', el.targetEnergyETADenominationValue.value);
        if (el.energyCriticalChanceETA) localStorage.setItem('ae_eta_critChance', el.energyCriticalChanceETA.value);
        if (el.criticalEnergyETA) localStorage.setItem('ae_eta_critEnergy', el.criticalEnergyETA.value);
    } catch(e) {}
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
        if (el.energyCriticalChanceETA) el.energyCriticalChanceETA.value = localStorage.getItem('ae_eta_critChance') || '';
        if (el.criticalEnergyETA) el.criticalEnergyETA.value = localStorage.getItem('ae_eta_critEnergy') || '';
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
    } catch(e) {}
}

function saveTTKData() {
    try {
        if (el.worldSelect) localStorage.setItem('ae_ttk_world', el.worldSelect.value);
        if (el.enemySelect) localStorage.setItem('ae_ttk_enemy', el.enemySelect.value);
        if (el.yourDPM) localStorage.setItem('ae_ttk_dpm', el.yourDPM.value); 
        if (el.dpmDenominationInput) localStorage.setItem('ae_ttk_dpmDenomInput', el.dpmDenominationInput.value);
        if (el.dpmDenominationValue) localStorage.setItem('ae_ttk_dpmDenomValue', el.dpmDenominationValue.value);
        if (el.enemyQuantity) localStorage.setItem('ae_ttk_quantity', el.enemyQuantity.value);
        if (el.fourSpotFarming) localStorage.setItem('ae_ttk_fourSpot', el.fourSpotFarming.checked);
    } catch (e) {}
}

function loadTTKData() {
    try {
        const dpm = localStorage.getItem('ae_ttk_dpm'); 
        const dpmDenomInput = localStorage.getItem('ae_ttk_dpmDenomInput');
        const quantity = localStorage.getItem('ae_ttk_quantity');
        const fourSpot = localStorage.getItem('ae_ttk_fourSpot');
        const world = localStorage.getItem('ae_ttk_world');
        const enemy = localStorage.getItem('ae_ttk_enemy');
        if (el.yourDPM) el.yourDPM.value = dpm || '';
        if (el.dpmDenominationInput) el.dpmDenominationInput.value = dpmDenomInput || '';
        const dpmDenom = denominations.find(d => d.name === dpmDenomInput);
        if (el.dpmDenominationValue) {
            el.dpmDenominationValue.value = dpmDenom ? dpmDenom.value : '1';
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
    } catch (e) {}
}

function saveRaidData() {
    try {
        if (el.activitySelect) localStorage.setItem('ae_raid_activity', el.activitySelect.value);
        if (el.yourDPMActivity) localStorage.setItem('ae_raid_dpm', el.yourDPMActivity.value);
        if (el.dpmActivityDenominationInput) localStorage.setItem('ae_raid_dpmDenomInput', el.dpmActivityDenominationInput.value);
        if (el.dpmActivityDenominationValue) localStorage.setItem('ae_raid_dpmDenomValue', el.dpmActivityDenominationValue.value);
        if (el.activityTimeLimit) localStorage.setItem('ae_raid_timeLimit', el.activityTimeLimit.value);
        if (el.keyRunQuantity) localStorage.setItem('ae_raid_key_quantity', el.keyRunQuantity.value);
    } catch (e) {}
}

function loadRaidData() {
    try {
        const activity = localStorage.getItem('ae_raid_activity');
        if (activity && el.activitySelect) {
            if (el.activitySelect.querySelector(`option[value="${activity}"]`)) {
                el.activitySelect.value = activity;
            }
        }
        const dpm = localStorage.getItem('ae_raid_dpm');
        if (dpm && el.yourDPMActivity) el.yourDPMActivity.value = dpm;
        const dpmDenomInput = localStorage.getItem('ae_raid_dpmDenomInput');
        if (el.dpmActivityDenominationInput) el.dpmActivityDenominationInput.value = dpmDenomInput;
        const dpmDenom = denominations.find(d => d.name === dpmDenomInput);
        if (el.dpmActivityDenominationValue) {
            el.dpmActivityDenominationValue.value = dpmDenom ? dpmDenom.value : '1';
        }
        const timeLimit = localStorage.getItem('ae_raid_timeLimit');
        if (timeLimit && el.activityTimeLimit) el.activityTimeLimit.value = timeLimit;
        const quantity = localStorage.getItem('ae_raid_key_quantity');
        if (quantity && el.keyRunQuantity) el.keyRunQuantity.value = quantity;
        calculateMaxStage();
        calculateKeyRunTime();
    } catch (e) {}
}

function saveTimeToEnergyData() {
    try {
        if (el.currentEnergyTTE) localStorage.setItem('ae_tte_currentEnergy', el.currentEnergyTTE.value);
        if (el.currentEnergyTTEDenominationInput) localStorage.setItem('ae_tte_currentEnergyDenomInput', el.currentEnergyTTEDenominationInput.value);
        if (el.currentEnergyTTEDenominationValue) localStorage.setItem('ae_tte_currentEnergyDenomValue', el.currentEnergyTTEDenominationValue.value);
        if (el.energyPerClickTTE) localStorage.setItem('ae_tte_energyPerClick', el.energyPerClickTTE.value);
        if (el.energyPerClickTTEDenominationInput) localStorage.setItem('ae_tte_energyPerClickDenomInput', el.energyPerClickTTEDenominationInput.value);
        if (el.energyPerClickTTEDenominationValue) localStorage.setItem('ae_tte_energyPerClickDenomValue', el.energyPerClickTTEDenominationValue.value);
        if (el.energyCriticalChanceTTE) localStorage.setItem('ae_tte_critChance', el.energyCriticalChanceTTE.value);
        if (el.criticalEnergyTTE) localStorage.setItem('ae_tte_critEnergy', el.criticalEnergyTTE.value);
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
    } catch (e) {}
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
        if (el.energyCriticalChanceTTE) el.energyCriticalChanceTTE.value = localStorage.getItem('ae_tte_critChance') || '';
        if (el.criticalEnergyTTE) localStorage.setItem('ae_tte_critEnergy', el.criticalEnergyTTE.value);
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
    } catch (e) {}
}

function saveLootData() {
    try {
        if (el.lootTokenDropMin) localStorage.setItem('ae_loot_tokenMin', el.lootTokenDropMin.value);
        if (el.lootTokenDropMax) localStorage.setItem('ae_loot_tokenMax', el.lootTokenDropMax.value);
        if (el.lootBaseTokenDropRate) localStorage.setItem('ae_loot_baseTokenRate', el.lootBaseTokenDropRate.value);
        if (el.lootTokenMultiplier) localStorage.setItem('ae_loot_tokenMultiplier', el.lootTokenMultiplier.value);
        if (el.lootSpecialDropRate) localStorage.setItem('ae_loot_specialRate', el.lootSpecialDropRate.value);
        if (el.lootSpecialItemName) localStorage.setItem('ae_loot_specialItemName', el.lootSpecialItemName.value);
        if (el.lootMobKillTime) localStorage.setItem('ae_loot_mobKillTime', el.lootMobKillTime.value);
        if (el.lootFarmingMode) localStorage.setItem('ae_loot_farmingMode', el.lootFarmingMode.value);
        if (el.lootTimeTargetHours) localStorage.setItem('ae_loot_targetHours', el.lootTimeTargetHours.value);
        if (el.lootTimeTargetMinutes) localStorage.setItem('ae_loot_targetMinutes', el.lootTimeTargetMinutes.value);
        if (el.lootTokenTargetCount) localStorage.setItem('ae_loot_targetTokenCount', el.lootTokenTargetCount.value);
    } catch (e) {}
}

function loadLootData() {
    try {
        if (el.lootTokenDropMin) el.lootTokenDropMin.value = localStorage.getItem('ae_loot_tokenMin') || 1;
        if (el.lootTokenDropMax) el.lootTokenDropMax.value = localStorage.getItem('ae_loot_tokenMax') || 1;
        if (el.lootBaseTokenDropRate) el.lootBaseTokenDropRate.value = localStorage.getItem('ae_loot_baseTokenRate') || 10;
        if (el.lootTokenMultiplier) el.lootTokenMultiplier.value = localStorage.getItem('ae_loot_tokenMultiplier') || 3.16;
        if (el.lootSpecialDropRate) el.lootSpecialDropRate.value = localStorage.getItem('ae_loot_specialRate') || 1;
        if (el.lootSpecialItemName) el.lootSpecialItemName.value = localStorage.getItem('ae_loot_specialItemName') || 'Special Drops';
        const savedKillTime = localStorage.getItem('ae_loot_mobKillTime');
        if (el.lootMobKillTime) {
            el.lootMobKillTime.value = savedKillTime !== null ? savedKillTime : 'instakill';
        }
        const savedFarmingMode = localStorage.getItem('ae_loot_farmingMode');
        if (el.lootFarmingMode) {
            el.lootFarmingMode.value = savedFarmingMode || 'single';
            const modeContainer = el['loot-farming-mode-container'];
            if (modeContainer) {
                const buttons = modeContainer.querySelectorAll('.toggle-btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                const activeBtn = modeContainer.querySelector(`.toggle-btn[data-loot-farming-mode="${el.lootFarmingMode.value}"]`);
                if (activeBtn) activeBtn.classList.add('active');
            }
        }
        if (el.lootTimeTargetHours) el.lootTimeTargetHours.value = localStorage.getItem('ae_loot_targetHours') || 1;
        if (el.lootTimeTargetMinutes) el.lootTimeTargetMinutes.value = localStorage.getItem('ae_loot_targetMinutes') || 0;
        if (el.lootTokenTargetCount) el.lootTokenTargetCount.value = localStorage.getItem('ae_loot_targetTokenCount') || 1;
        if (el.lootSpecialItemName) {
            el.lootSpecialItemName.dispatchEvent(new Event('input'));
        }
        calculateLootDrops();
    } catch (e) {}
}

function saveStarData() {
    try {
        if (el.starLevelSelect) localStorage.setItem('ae_star_level', el.starLevelSelect.value);
        if (el.starSpeedSelect) localStorage.setItem('ae_star_speed', el.starSpeedSelect.value);
        if (el.starAmount) localStorage.setItem('ae_star_amount', el.starAmount.value);
        if (el.starBaseLuck) localStorage.setItem('ae_star_baseLuck', el.starBaseLuck.value);
        if (el.starTimeHours) localStorage.setItem('ae_star_timeHours', el.starTimeHours.value);
    } catch (e) {}
}

function loadStarData() {
    if (typeof starCostData === 'undefined' || typeof starSpeedData === 'undefined' || typeof starRarityDataByLevel === 'undefined') {
        return;
    }
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
    } catch (e) {}
}

function getEffectiveEnergyPerClick(baseEnergyPerClick, critChanceId, critEnergyId) {
    if (baseEnergyPerClick <= 0) return 0;
    const critChance = getNumberValue(critChanceId) / 100;
    const critMultiplier = getNumberValue(critEnergyId) / 100;
    if (critChance <= 0) return baseEnergyPerClick;
    const effectiveMultiplier = 1 + (critChance * critMultiplier);
    return baseEnergyPerClick * effectiveMultiplier;
}

function calculateEnergyETA() {
    if (!el.etaResult) return;
    const isFastClicker = el.clickerSpeedETA ? el.clickerSpeedETA.checked : false;
    const currentEnergyValue = getNumberValue('currentEnergyETA');
    const currentEnergyDenom = currentNumberFormat === 'letters' ? (el.currentEnergyETADenominationValue ? (parseFloat(el.currentEnergyETADenominationValue.value) || 1) : 1) : 1;
    const currentEnergy = currentEnergyValue * currentEnergyDenom;
    const targetEnergyValue = getNumberValue('targetEnergyETA');
    const targetEnergyDenom = currentNumberFormat === 'letters' ? (el.targetEnergyETADenominationValue ? (parseFloat(el.targetEnergyETADenominationValue.value) || 1) : 1) : 1;
    const targetEnergy = targetEnergyValue * targetEnergyDenom;
    const energyPerClickValue = getNumberValue('energyPerClickETA');
    const energyPerClickDenom = currentNumberFormat === 'letters' ? (el.energyPerClickETADenominationValue ? (parseFloat(el.energyPerClickETADenominationValue.value) || 1) : 1) : 1;
    const baseEnergyPerClick = energyPerClickValue * energyPerClickDenom;
    const effectiveEnergyPerClick = getEffectiveEnergyPerClick(
        baseEnergyPerClick, 
        'energyCriticalChanceETA', 
        'criticalEnergyETA'
    );
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = targetEnergy - currentEnergy;
    const returnTimeEl = el.etaReturnTime;
    if (energyNeeded <= 0) {
        el.etaResult.innerText = 'Target Reached!';
        if (returnTimeEl) returnTimeEl.innerText = "You're already there!";
        return;
    }
    if (effectiveEnergyPerClick <= 0 || clicksPerSecond <= 0) {
        el.etaResult.innerText = 'N/A';
        if (returnTimeEl) returnTimeEl.innerText = '';
        saveETAData();
        return;
    }
    const timeInSeconds = (energyNeeded / effectiveEnergyPerClick) / clicksPerSecond;
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
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const currentEnergyValue = getNumberValue('currentEnergyTTE');
    const currentEnergyDenom = currentNumberFormat === 'letters' ? (el.currentEnergyTTEDenominationValue ? (parseFloat(el.currentEnergyTTEDenominationValue.value) || 1) : 1) : 1;
    const startEnergy = currentEnergyValue * currentEnergyDenom;
    const energyPerClickValue = getNumberValue('energyPerClickTTE');
    const energyPerClickDenom = currentNumberFormat === 'letters' ? (el.energyPerClickTTEDenominationValue ? (parseFloat(el.energyPerClickTTEDenominationValue.value) || 1) : 1) : 1;
    const rawBasePPC = energyPerClickValue * energyPerClickDenom;
    const effectivePPC = getEffectiveEnergyPerClick(
        rawBasePPC, 
        'energyCriticalChanceTTE', 
        'criticalEnergyTTE'
    );
    const baseEPS = effectivePPC * clicksPerSecond;
    const timeInHours = getNumberValue('timeToReturnSelect');
    const timeInMinutes = getNumberValue('timeToReturnSelectMinutes');
    const targetDuration = (timeInHours * 3600) + (timeInMinutes * 60);
    const resultEl = el.timeToEnergyResult;
    const returnTimeEl = el.timeToEnergyReturnTime;
    if (baseEPS <= 0 || targetDuration <= 0) {
        resultEl.innerText = formatNumber(startEnergy);
        if (returnTimeEl) returnTimeEl.innerText = "Select a time";
        if (el.boostSimulationTableBody) el.boostSimulationTableBody.innerHTML = '';
        saveTimeToEnergyData();
        return;
    }
    const potionPriority = ['spooky-energy-potion', 'energy-potion', 'small-potion'];
    const foodPriority = ['energy-macaron', 'chocolate-bar'];
    const buildQueue = (priorityList) => {
        let queue = [];
        priorityList.forEach(id => {
            const itemData = boostItems.find(b => b.id === id);
            if (!itemData) return;
            const h = getNumberValue(`boost-${id}-hours`);
            const m = getNumberValue(`boost-${id}-minutes`);
            const duration = (h * 3600) + (m * 60);
            if (duration > 0) {
                queue.push({
                    id: id,
                    multiplier: itemData.multiplier, 
                    remaining: duration
                });
            }
        });
        return queue;
    };
    let potionQueue = buildQueue(potionPriority);
    let foodQueue = buildQueue(foodPriority);
    let accumulatedEnergy = 0;
    let timeElapsed = 0;
    while (timeElapsed < targetDuration) {
        const currentPotion = potionQueue.length > 0 ? potionQueue[0] : { multiplier: 1.0, remaining: Infinity };
        const currentFood = foodQueue.length > 0 ? foodQueue[0] : { multiplier: 1.0, remaining: Infinity };
        const pMult = currentPotion.multiplier;
        const fMult = currentFood.multiplier;
        const timeRemainingInSim = targetDuration - timeElapsed;
        const stepDuration = Math.min(
            timeRemainingInSim,
            currentPotion.remaining,
            currentFood.remaining
        );
        const totalMultiplier = pMult * fMult;
        const segmentEnergy = baseEPS * totalMultiplier * stepDuration;
        accumulatedEnergy += segmentEnergy;
        timeElapsed += stepDuration;
        if (currentPotion.remaining !== Infinity) {
            currentPotion.remaining -= stepDuration;
            if (currentPotion.remaining <= 0.1) potionQueue.shift();
        }
        if (currentFood.remaining !== Infinity) {
            currentFood.remaining -= stepDuration;
            if (currentFood.remaining <= 0.1) foodQueue.shift();
        }
    }
    const finalTotal = startEnergy + accumulatedEnergy;
    resultEl.innerText = formatNumber(finalTotal);
    if (returnTimeEl) {
        const now = new Date();
        const arrival = new Date(now.getTime() + targetDuration * 1000);
        returnTimeEl.innerText = `Return on: ${arrival.toLocaleString('en-US', { 
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
        })}`;
    }
    saveTimeToEnergyData();
}

function calculateLootDrops() {
    if (!el.lootTokensResult || !el.lootSpecialDropsResult) return;
    const tokenDropMin = getNumberValue('lootTokenDropMin');
    const tokenDropMax = getNumberValue('lootTokenDropMax');
    const baseTokenRate = getNumberValue('lootBaseTokenDropRate') / 100;
    const tokenMultiplier = getNumberValue('lootTokenMultiplier');
    const specialDropRate = getNumberValue('lootSpecialDropRate') / 100;
    const specialItemName = el.lootSpecialItemName ? el.lootSpecialItemName.value.trim() : 'Special Drops';
    if (el.specialItemLabel) {
        el.specialItemLabel.innerText = `Avg ${specialItemName} per Target Time:`;
    }
    const targetHours = getNumberValue('lootTimeTargetHours');
    const targetMinutes = getNumberValue('lootTimeTargetMinutes');
    const targetTimeInSeconds = (targetHours * 3600) + (targetMinutes * 60);
    const targetTokenCount = getNumberValue('lootTokenTargetCount') || 1;
    const killTimeInput = el.lootMobKillTime ? el.lootMobKillTime.value : 'N/A';
    const farmingMode = el.lootFarmingMode ? el.lootFarmingMode.value : 'single';
    const spotMultiplier = farmingMode === 'four' ? 4 : 1;
    if (tokenMultiplier <= 0 || killTimeInput === 'N/A' || targetTimeInSeconds <= 0) {
        el.lootTokensResult.innerText = 'N/A';
        el.lootSpecialDropsResult.innerText = 'N/A';
        if (el.lootTokenTimeToTargetResult) el.lootTokenTimeToTargetResult.innerText = 'N/A';
        saveLootData();
        return;
    }
    let rawTimePerKill = parseNumberInput(killTimeInput);
    if (killTimeInput === 'instakill') {
        rawTimePerKill = 0.001;
    }
    const timeToCompleteKill = rawTimePerKill + LOOT_KILL_OVERHEAD;
    const respawnLimitPerKill = LOOT_RESPAWN_DELAY / spotMultiplier;
    const timePerCycle = Math.max(timeToCompleteKill, respawnLimitPerKill);
    const effectiveKillsPerSecond = 1 / timePerCycle;
    const avgTokenDropQuantity = (tokenDropMin + tokenDropMax) / 2;
    const rawTokensPerSecond = effectiveKillsPerSecond * avgTokenDropQuantity * tokenMultiplier * baseTokenRate * spotMultiplier;
    const rawSpecialDropsPerSecond = effectiveKillsPerSecond * 1 * specialDropRate * spotMultiplier;
    const REALITY_FACTOR = 2.8;
    const effectiveTokensPerSecond = rawTokensPerSecond / REALITY_FACTOR;
    const effectiveSpecialDropsPerSecond = rawSpecialDropsPerSecond / REALITY_FACTOR;
    let totalTokensEstimate = effectiveTokensPerSecond * targetTimeInSeconds;
    let totalSpecialDropsEstimate = effectiveSpecialDropsPerSecond * targetTimeInSeconds;
    let timeToTargetTokens = 0;
    if (effectiveTokensPerSecond > 0) {
        timeToTargetTokens = targetTokenCount / effectiveTokensPerSecond;
    } else if (targetTokenCount > 0) {
        timeToTargetTokens = Infinity;
    }
    if (el.lootTokensResult) {
        el.lootTokensResult.innerText = formatNumber(totalTokensEstimate);
    }
    if (el.lootSpecialDropsResult) {
        el.lootSpecialDropsResult.innerText = formatNumber(totalSpecialDropsEstimate);
    }
    if (el.lootTokenTimeToTargetResult) {
        if (timeToTargetTokens <= 0 || !isFinite(timeToTargetTokens)) {
            el.lootTokenTimeToTargetResult.innerText = 'N/A';
        } else {
            el.lootTokenTimeToTargetResult.innerText = formatTime(timeToTargetTokens);
        }
    }
    saveLootData();
}

function calculateTTK() {
    if (!el.ttkResult) return;
    const enemyHealth = getNumberValue('enemyHealth');
    const dpmInput = getNumberValue('yourDPM');
    const dpmMultiplier = currentNumberFormat === 'letters' ? (el.dpmDenominationValue ? (parseFloat(el.dpmDenominationValue.value) || 1) : 1) : 1;
    const totalDPM = dpmInput * dpmMultiplier;
    const yourDPS = totalDPM / 60; 
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
        const yourTimePerKill = timeInSeconds + LOOT_KILL_OVERHEAD;
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
        return;
    }
    const isFastClicker = el.clickerSpeed ? el.clickerSpeed.checked : false;
    const currentEnergyValue = getNumberValue('currentEnergy');
    const currentEnergyDenom = currentNumberFormat === 'letters' ? (el.currentEnergyDenominationValue ? (parseFloat(el.currentEnergyDenominationValue.value) || 1) : 1) : 1;
    const currentEnergy = currentEnergyValue * currentEnergyDenom;
    const energyPerClickValue = getNumberValue('energyPerClick');
    const energyPerClickDenom = currentNumberFormat === 'letters' ? (el.energyPerClickDenominationValue ? (parseFloat(el.energyPerClickDenominationValue.value) || 1) : 1) : 1;
    const baseEnergyPerClick = energyPerClickValue * energyPerClickDenom;
    const effectiveEnergyPerClick = getEffectiveEnergyPerClick(
        baseEnergyPerClick, 
        'energyCriticalChance', 
        'criticalEnergy'
    );
    const selectedRank = el.rankSelect ? el.rankSelect.value : '';
    const energyForRank = typeof rankRequirements !== 'undefined' ? rankRequirements[selectedRank] || 0 : 0;
    const returnTimeEl = el.rankUpReturnTime;
    if (!selectedRank || !energyForRank) {
        el.rankUpResult.innerText = 'Select a rank';
        if (returnTimeEl) returnTimeEl.innerText = '';
        saveRankUpData();
        return;
    }
    const clicksPerSecond = isFastClicker ? FAST_CPS : SLOW_CPS;
    const energyNeeded = energyForRank - currentEnergy;
    if (energyNeeded <= 0) {
        el.rankUpResult.innerText = 'Rank Up Ready!';
        if (returnTimeEl) returnTimeEl.innerText = 'Ready to rank up now!';
        saveRankUpData();
        return;
    }
    if (effectiveEnergyPerClick <= 0) {
        el.rankUpResult.innerText = 'N/A';
        if (returnTimeEl) returnTimeEl.innerText = '';
        saveRankUpData();
        return;
    }
    const timeInSeconds = (energyNeeded / effectiveEnergyPerClick) / clicksPerSecond;
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
        let displayValue;
        let numericHealth;
        const isSimpleFormat = currentNumberFormat === 'scientific' || currentNumberFormat === 'engineering';
        if (isSimpleFormat && typeof healthValue === 'string') {
            numericHealth = parseNumberInput(healthValue);
            displayValue = formatNumber(numericHealth);
        } else {
            numericHealth = parseNumberInput(String(healthValue));
            displayValue = formatNumber(numericHealth);
        }
        enemyHealthInput.value = numericHealth;
        enemyHealthDisplay.innerText = displayValue; 
    } else {
        enemyHealthInput.value = '';
        enemyHealthDisplay.innerText = 'Select an enemy to see health';
    }
    calculateTTK();
}

function populateHoursDropdown(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '';
    for (let i = 0; i <= 48; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `${i} Hour${i === 1 ? '' : 's'}`;
        selectElement.appendChild(option);
    }
}

function populateMinutesDropdown(selectElement) {
    if (!selectElement) return;
    selectElement.innerHTML = '';
    for (let i = 0; i <= 59; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `${i} Minute${i === 1 ? '' : 's'}`;
        selectElement.appendChild(option);
    }
}

function populateTimeToReturnDropdown() {
    populateHoursDropdown(el.timeToReturnSelect);
}

function populateTimeToReturnMinutesDropdown() {
    populateMinutesDropdown(el.timeToReturnSelectMinutes);
}

function populateBoostDurations() {
    if (typeof boostItems === 'undefined') return;
    const relevantBoosts = boostItems.filter(item => item.type === 'energy');
    relevantBoosts.forEach(item => {
        const hoursEl = el[`boost-${item.id}-hours`];
        const minutesEl = el[`boost-${item.id}-minutes`];
        if (hoursEl) populateHoursDropdown(hoursEl);
        if (minutesEl) populateMinutesDropdown(minutesEl);
    });
    if (el.lootTimeTargetHours) populateHoursDropdown(el.lootTimeTargetHours);
    if (el.lootTimeTargetMinutes) populateMinutesDropdown(el.lootTimeTargetMinutes);
}

function populateLootKillTimeDropdown() {
    const selectElement = el.lootMobKillTime;
    if (!selectElement) return;
    selectElement.innerHTML = '';
    let option = document.createElement('option');
    option.value = 'instakill';
    option.innerText = 'Instakill (<0.5s Kill Time)';
    selectElement.appendChild(option);
    for (let s = 0.1; s <= 60.0; s += 0.1) {
        const value = Math.round(s * 10) / 10;
        if (value > 1 && value < 10 && value * 10 % 5 !== 0) continue;
        if (value >= 10 && value % 1 !== 0) continue;
        option = document.createElement('option');
        option.value = value.toFixed(1);
        option.innerText = `${value.toFixed(1)} Seconds`;
        selectElement.appendChild(option);
        if (s >= 1 && s < 10) s += 0.4;
        else if (s >= 10) s += 0.9;
    }
}

function populateStarLevelDropdown() {
    if (!el.starLevelSelect || typeof starCostData === 'undefined') return;
    const select = el.starLevelSelect;
    select.innerHTML = '<option value="">-- Select Level --</option>';
    Object.keys(starCostData).forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.innerText = `Star ${level}`;
        select.appendChild(option);
    });
}

function populateStarSpeedDropdown() {
    if (!el.starSpeedSelect || typeof starSpeedData === 'undefined') return;
    const select = el.starSpeedSelect;
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
        const response = await fetch('activity-bundle.json?v=6.0');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bundle = await response.json();
        Object.assign(activityData, bundle.activities || {});
    } catch (error) {}
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
    if (!el.activitySelect || !el.yourDPMActivity || !el.dpmActivityDenominationValue || 
        !el.activityTimeLimit || !el.activityResult) {
        return 0; 
    }
    const selection = el.activitySelect.value;
    if (!selection) {
        el.activityResult.innerText = '0 / 0';
        return 0;
    }
    const activity = activityData[selection];
    const dpmValue = (getNumberValue('yourDPMActivity') || 0) * (currentNumberFormat === 'letters' ? (parseFloat(el.dpmActivityDenominationValue.value) || 1) : 1);
    const yourDPS = dpmValue / 60;
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
            let stageHealth = parseNumberInput(String(activity.enemies[stageKey]));
            if (!stageHealth) {
                break;
            }
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
    } else {}
    resultEl.innerText = `${completedStage} / ${maxStages}`;
    return completedStage;
}

function calculateKeyRunTime() {
    if (!el.keyRunTimeResult || !el.activitySelect) return;
    const activityName = el.activitySelect.value;
    const activity = activityData[activityName];
    const keyQuantity = Math.floor(getNumberValue('keyRunQuantity')) || 0;
    const resultEl = el.keyRunTimeResult;
    const returnTimeEl = el.keyRunReturnTime;
    const dpmValue = (getNumberValue('yourDPMActivity') || 0) * (currentNumberFormat === 'letters' ? (parseFloat(el.dpmActivityDenominationValue.value) || 1) : 1);
    const yourDPS = dpmValue / 60;
    const completedStage = calculateMaxStage();
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
        let stageHealth = parseNumberInput(String(activity.enemies[stageKey]));
        let enemyMultiplier = 1;
        if (activity.type === 'raid' && !singleEnemyRaids.includes(activityName)) {
            enemyMultiplier = 5;
        }
        const totalStageHealth = stageHealth * enemyMultiplier;
        const killTime = totalStageHealth / yourDPS;
        const timePerStage = Math.max(killTime + LOOT_KILL_OVERHEAD, 1.0) + RESPawn_TIME;
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
    if (!inputEl || !valueEl || !listEl || typeof rankRequirements === 'undefined') {
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
    if (!inputEl || !valueEl || !listEl || typeof denominations === 'undefined') {
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
                const currentValue = parseNumberInput(valueEl.value) || 1;
                const currentDenom = denominations.find(d => d.value == currentValue);
                if (currentDenom) {
                    inputEl.value = currentDenom.name !== 'None' ? currentDenom.name : '';
                } else {
                    inputEl.value = '';
                    valueEl.value = 1;
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

function syncEnergyData(sourceInputId, sourceDenomInputId, sourceDenomValueId) {
    const sourceValue = el[sourceInputId]?.value || '';
    const sourceDenomInput = el[sourceDenomInputId]?.value || '';
    const sourceDenomValue = el[sourceDenomValueId]?.value || '1';
    const energyInputMap = {
        'currentEnergy': ['currentEnergyETA', 'currentEnergyTTE'],
        'energyPerClick': ['energyPerClickETA', 'energyPerClickTTE'],
        'currentEnergyETA': ['currentEnergy', 'currentEnergyTTE'],
        'energyPerClickETA': ['energyPerClick', 'energyPerClickTTE'],
        'currentEnergyTTE': ['currentEnergy', 'currentEnergyETA'],
        'energyPerClickTTE': ['energyPerClick', 'energyPerClickETA']
    };
    const criticalInputMap = {
        'energyCriticalChance': ['energyCriticalChanceETA', 'energyCriticalChanceTTE'],
        'criticalEnergy': ['criticalEnergyETA', 'criticalEnergyTTE'],
        'energyCriticalChanceETA': ['energyCriticalChance', 'criticalEnergyTTE'],
        'criticalEnergyETA': ['criticalEnergy', 'criticalEnergyTTE'],
        'energyCriticalChanceTTE': ['energyCriticalChance', 'energyCriticalChanceETA'],
        'criticalEnergyTTE': ['criticalEnergy', 'criticalEnergyETA']
    };
    const denomInputMap = {
        'currentEnergyDenominationInput': ['currentEnergyETADenominationInput', 'currentEnergyTTEDenominationInput'],
        'currentEnergyDenominationValue': ['currentEnergyETADenominationValue', 'currentEnergyTTEDenominationValue'],
        'energyPerClickDenominationInput': ['energyPerClickETADenominationInput', 'energyPerClickTTEDenominationInput'],
        'energyPerClickDenominationValue': ['energyPerClickETADenominationValue', 'energyPerClickTTEDenominationValue'],
        'currentEnergyETADenominationInput': ['currentEnergyDenominationInput', 'currentEnergyTTEDenominationInput'],
        'currentEnergyETADenominationValue': ['currentEnergyDenominationValue', 'currentEnergyTTEDenominationValue'],
        'energyPerClickETADenominationInput': ['energyPerClickDenominationInput', 'energyPerClickTTEDenominationInput'],
        'energyPerClickDenominationValue': ['energyPerClickDenominationValue', 'energyPerClickTTEDenominationValue'],
        'currentEnergyTTEDenominationInput': ['currentEnergyDenominationInput', 'currentEnergyETADenominationInput'],
        'currentEnergyTTEDenominationValue': ['currentEnergyDenominationValue', 'currentEnergyETADenominationValue'],
        'energyPerClickTTEDenominationInput': ['energyPerClickDenominationInput', 'energyPerClickETADenominationInput'],
        'energyPerClickTTEDenominationValue': ['energyPerClickDenominationValue', 'energyPerClickETADenominationValue']
    };
    const targetInputs = energyInputMap[sourceInputId] || [];
    targetInputs.forEach(targetId => {
        if (el[targetId]) el[targetId].value = sourceValue;
    });
    const targetCriticalInputs = criticalInputMap[sourceInputId] || [];
    targetCriticalInputs.forEach(targetId => {
         if (el[targetId]) el[targetId].value = sourceValue;
    });
    const targetDenomInputs = denomInputMap[sourceDenomInputId] || [];
    targetDenomInputs.forEach(targetId => {
        if (el[targetId]) el[targetId].value = sourceDenomInput;
    });
    const targetDenomValues = denomInputMap[sourceDenomValueId] || [];
    targetDenomValues.forEach(targetId => {
        if (el[targetId]) el[targetId].value = sourceDenomValue;
    });
    calculateRankUp();
    calculateEnergyETA();
    calculateTimeToEnergy();
}

function startTabFlashing() {
    if (tabFlashInterval === null) {
        let isFlashing = false;
        tabFlashInterval = setInterval(() => {
            document.title = isFlashing ? ORIGINAL_TITLE : FLASH_TITLE;
            isFlashing = !isFlashing;
        }, FLASH_INTERVAL_MS);
    }
}

function stopTabFlashing() {
    if (tabFlashInterval !== null) {
        clearInterval(tabFlashInterval);
        tabFlashInterval = null;
        document.title = ORIGINAL_TITLE;
        isAlertPending = false;
    }
}

function checkNotificationPermission() {
    if (!el.alertPermissionStatus || !el.requestPermissionBtn) return;
    if (!("Notification" in window)) {
        el.alertPermissionStatus.innerText = "Permissions: Not Supported";
        el.requestPermissionBtn.disabled = true;
        el.requestPermissionBtn.classList.remove('active');
        return;
    }
    const status = Notification.permission;
    el.alertPermissionStatus.innerText = `Permissions: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    el.requestPermissionBtn.disabled = status === 'granted';
    if (status === 'granted') {
        el.alertPermissionStatus.classList.remove('text-red-400');
        el.alertPermissionStatus.classList.add('text-green-400');
        el.requestPermissionBtn.classList.remove('active');
        el.requestPermissionBtn.innerText = "Permissions Granted";
    } else {
        el.alertPermissionStatus.classList.add('text-red-400');
        el.alertPermissionStatus.classList.remove('text-green-400');
        el.requestPermissionBtn.classList.add('active');
        el.requestPermissionBtn.innerText = "Request Notifications";
    }
}

function requestNotificationPermission() {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            checkNotificationPermission();
            if (permission === 'granted') {
                scheduleNextAlert();
            }
        });
    }
}

function calculateNextAlert() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    let earliestNextTime = Infinity;
    let nextDungeon = null;
    let selectedAlerts = [];
    Object.keys(dungeonIntervals).forEach(name => {
        const item = dungeonIntervals[name];
        const checkbox = el[`alert-${item.id}-dungeon`] || el[`alert-${item.id}-raid`];
        if (checkbox && checkbox.checked) {
            selectedAlerts.push(name);
            const startMinute = item.startMinute;
            let minutesUntilStart;
            if (startMinute >= currentMinute) {
                minutesUntilStart = startMinute - currentMinute;
            } else {
                minutesUntilStart = (60 - currentMinute) + startMinute;
            }
            let timeInSeconds = (minutesUntilStart * 60) - currentSecond;
            if (timeInSeconds <= 0) {
                timeInSeconds += 3600; 
            }
            if (timeInSeconds < earliestNextTime) {
                earliestNextTime = timeInSeconds;
                nextDungeon = name;
            }
        }
    });
    if (nextDungeon) {
        return {
            name: nextDungeon,
            timeInSeconds: earliestNextTime
        };
    }
    return null;
}

function fireAlert(dungeonName) {
    if (Notification.permission === 'granted') {
        const notification = new Notification("Dungeon Alert: Dungeon Ready!", {
            body: `${dungeonName} is now ready! You have a 2-minute window to join.`,
            icon: 'icon.webp'
        });
        if (el.alertSound) {
            el.alertSound.currentTime = 0;
            el.alertSound.play().catch(e => console.log("Audio playback blocked or failed:", e));
        }
    }
    isAlertPending = true;
    if (document.visibilityState !== 'visible') {
        startTabFlashing();
    }
    scheduleNextAlert();
}

function scheduleNextAlert() {
    if (nextAlertTimeout) {
        clearTimeout(nextAlertTimeout);
    }
    if (!calculateNextAlert()) {
        stopTabFlashing();
    }
    const nextAlert = calculateNextAlert();
    if (nextAlert && Notification.permission === 'granted') {
        const timeUntilAlertMs = Math.max(2000, nextAlert.timeInSeconds * 1000); 
        nextAlertTimeout = setTimeout(() => {
            fireAlert(nextAlert.name);
        }, timeUntilAlertMs);
    }
    startCountdownDisplay();
}

function updateCountdownDisplay() {
    const nextAlert = calculateNextAlert();
    if (el.nextDungeonTimer && el.nextDungeonName) {
        if (nextAlert) {
            el.nextDungeonTimer.innerText = formatTime(nextAlert.timeInSeconds);
            el.nextDungeonName.innerText = `Next: ${nextAlert.name} (${dungeonIntervals[nextAlert.name].startMinute}m mark)`;
        } else {
            el.nextDungeonTimer.innerText = "N/A";
            el.nextDungeonName.innerText = "Select dungeons to track.";
        }
    }
}

function startCountdownDisplay() {
    if (countdownInterval) return;
    updateCountdownDisplay();
    countdownInterval = setInterval(() => {
        updateCountdownDisplay();
    }, 1000);
}

function stopCountdownDisplay() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function saveAlertsData() {
    try {
        const savedAlerts = {};
        Object.keys(dungeonIntervals).forEach(name => {
            const id = dungeonIntervals[name].id;
            const checkbox = el[`alert-${id}-dungeon`] || el[`alert-${id}-raid`];
            if (checkbox) {
                savedAlerts[name] = checkbox.checked;
            }
        });
        localStorage.setItem('ae_alerts_selected', JSON.stringify(savedAlerts));
    } catch (e) {}
}

function loadAlertsData() {
    try {
        const savedAlerts = JSON.parse(localStorage.getItem('ae_alerts_selected')) || {};
        Object.keys(dungeonIntervals).forEach(name => {
            const id = dungeonIntervals[name].id;
            const checkbox = el[`alert-${id}-dungeon`] || el[`alert-${id}-raid`];
            if (checkbox) {
                checkbox.checked = savedAlerts[name] || false;
            }
        });
        checkNotificationPermission();
        scheduleNextAlert();
    } catch (e) {}
}

function toggleCompletedVisibility() {
    const isHidden = el['hide-completed-checkbox'] ? el['hide-completed-checkbox'].checked : false;
    if (el['hide-completed-checkbox']) {
        try {
            localStorage.setItem('ae_checklist_hide_completed', isHidden ? 'true' : 'false');
        } catch (e) {}
    }
    const searchTerm = el['checklist-search'] ? el['checklist-search'].value : '';
    const categoryFilter = el['category-filter'] ? el['category-filter'].value : '';
    filterChecklistItems(searchTerm, categoryFilter);
}

function populateTimeToReturnDropdown() {
    populateHoursDropdown(el.timeToReturnSelect);
}

function populateTimeToReturnMinutesDropdown() {
    populateMinutesDropdown(el.timeToReturnSelectMinutes);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[id]').forEach(element => {
        el[element.id] = element;
    });
    const lootFarmingModeContainer = el['loot-farming-mode-container'];
    if (lootFarmingModeContainer) {
        lootFarmingModeContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.toggle-btn');
            if (button && button.dataset.lootFarmingMode) {
                setFarmingMode(button.dataset.lootFarmingMode, button);
            }
        });
    }
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            stopTabFlashing();
        } else if (isAlertPending) {
            startTabFlashing();
        }
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
            } catch (e) {}
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
    } catch (e) {}
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
    if (clickerSpeedControls) {
        clickerSpeedControls.forEach(container => {
            if (container.id !== 'loot-farming-mode-container') { 
                container.addEventListener('click', (e) => {
                    const button = e.target.closest('.toggle-btn');
                    if (button) {
                        if (button.dataset.clickerspeed) {
                            setClickerSpeed(button.dataset.clickerspeed, button);
                        } else if (button.dataset.clickerspeedEta) {
                            setClickerSpeed(button.dataset.clickerspeedEta, button);
                        } else if (button.dataset.clickerspeedTte) {
                            setClickerSpeed(button.dataset.clickerspeedTte, button);
                        } else if (button.dataset.farmingMode) {
                            setFarmingMode(button.dataset.farmingMode, button);
                        } else if (button.dataset.format) {
                            setNumberFormat(button.dataset.format);
                        }
                    }
                });
            }
        });
    }
    const formatToggleScientific = el['format-toggle-scientific'];
    const formatToggleEngineering = el['format-toggle-engineering'];
    const formatToggleLetters = el['format-toggle-letters'];
    if (formatToggleScientific) {
        formatToggleScientific.addEventListener('click', () => setNumberFormat('scientific'));
    }
    if (formatToggleEngineering) {
        formatToggleEngineering.addEventListener('click', () => setNumberFormat('engineering'));
    }
    if (formatToggleLetters) {
        formatToggleLetters.addEventListener('click', () => setNumberFormat('letters'));
    }
    switchTab('rankup');
    populateWorldDropdown(); 
    populateTimeToReturnDropdown();
    populateTimeToReturnMinutesDropdown();
    populateBoostDurations();
    populateStarLevelDropdown();
    populateStarSpeedDropdown();
    populateLootKillTimeDropdown();
    loadAllData().then(() => {
        populateActivityDropdown();
        loadRaidData();
    });
    setupRankSearch('rankInput', 'rankSelect', 'rankList');
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
        if(el.yourDPMActivity && el.yourDPM) {
            const dpm = getNumberValue('yourDPM');
            const denom = el.dpmDenominationValue ? parseFloat(el.dpmDenominationValue.value) : 1;
            const split = splitNumberToDenom(dpm * denom);
            el.yourDPMActivity.value = split.value;
            if (el.dpmActivityDenominationInput) el.dpmActivityDenominationInput.value = split.name;
            if (el.dpmActivityDenominationValue) el.dpmActivityDenominationValue.value = split.multiplier;
        }
        calculateMaxStage();
        calculateKeyRunTime();
        saveRaidData();
    };
    function onTTKDenomChange() {
        calculateTTK();
        syncDPS_TTKToRaid();
    }
    const syncDPS_RaidToTTK = () => {
        if(el.yourDPM && el.yourDPMActivity) {
            const dpm = getNumberValue('yourDPMActivity');
            const denom = el.dpmActivityDenominationValue ? parseFloat(el.dpmActivityDenominationValue.value) : 1;
            const split = splitNumberToDenom(dpm * denom);
            el.yourDPM.value = split.value;
            if (el.dpmDenominationInput) el.dpmDenominationInput.value = split.name;
            if (el.dpmDenominationValue) el.dpmDenominationValue.value = split.multiplier;
        }
        calculateTTK();
    };
    function onRaidDenomChange() {
        calculateMaxStage();
        calculateKeyRunTime();
        saveRaidData();
        syncDPS_RaidToTTK();
    }
    setupDenominationSearch('dpmDenominationInput', 'dpmDenominationValue', 'dpmDenominationList', onTTKDenomChange);
    setupDenominationSearch('dpmActivityDenominationInput', 'dpmActivityDenominationValue', 'dpmActivityDenominationList', onRaidDenomChange);
    setupDenominationSearch('currentEnergyDenominationInput', 'currentEnergyDenominationValue', 'currentEnergyDenominationList', onRankUpCEDenomChange);
    setupDenominationSearch('energyPerClickDenominationInput', 'energyPerClickDenominationValue', 'energyPerClickDenominationList', onRankUpEPCDenomChange);
    setupDenominationSearch('currentEnergyETADenominationInput', 'currentEnergyETADenominationValue', 'currentEnergyETADenominationList', onETACEDenomChange);
    setupDenominationSearch('targetEnergyETADenominationInput', 'targetEnergyETADenominationValue', 'targetEnergyETADenominationList', calculateEnergyETA);
    setupDenominationSearch('energyPerClickETADenominationInput', 'energyPerClickETADenominationValue', 'energyPerClickETADenominationList', onETAEPCdenomChange);
    setupDenominationSearch('currentEnergyTTEDenominationInput', 'currentEnergyTTEDenominationValue', 'currentEnergyTTEDenominationList', onTTECEDenomChange);
    setupDenominationSearch('energyPerClickTTEDenominationInput', 'energyPerClickTTEDenominationValue', 'energyPerClickTTEDenominationList', onTTEEPCDenomChange); 
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
    const criticalDebounceAndSync = debounce((sourceId) => {
        syncEnergyData(sourceId, sourceId, sourceId);
    }, 300);
    if (el.energyCriticalChance) el.energyCriticalChance.addEventListener('input', () => criticalDebounceAndSync('energyCriticalChance'));
    if (el.criticalEnergy) el.criticalEnergy.addEventListener('input', () => criticalDebounceAndSync('criticalEnergy'));
    if (el.energyCriticalChanceETA) el.energyCriticalChanceETA.addEventListener('input', () => criticalDebounceAndSync('energyCriticalChanceETA'));
    if (el.criticalEnergyETA) el.criticalEnergyETA.addEventListener('input', () => criticalDebounceAndSync('criticalEnergyETA'));
    if (el.energyCriticalChanceTTE) el.energyCriticalChanceTTE.addEventListener('input', () => criticalDebounceAndSync('energyCriticalChanceTTE'));
    if (el.criticalEnergyTTE) el.criticalEnergyTTE.addEventListener('input', () => criticalDebounceAndSync('criticalEnergyTTE'));
    const globalClickerSync = (isChecked) => {
        if (el.clickerSpeed) el.clickerSpeed.checked = isChecked;
        if (el.clickerSpeedETA) el.clickerSpeedETA.checked = isChecked;
        if (el.clickerSpeedTTE) el.clickerSpeedTTE.checked = isChecked;
        calculateRankUp();
        calculateEnergyETA();
        calculateTimeToEnergy();
    };
    if (el.clickerSpeed) el.clickerSpeed.addEventListener('change', () => globalClickerSync(el.clickerSpeed.checked));
    if (el.clickerSpeedETA) el.clickerSpeedETA.addEventListener('change', () => globalClickerSync(el.clickerSpeedETA.checked));
    if (el.clickerSpeedTTE) el.clickerSpeedTTE.addEventListener('change', () => globalClickerSync(el.clickerSpeedTTE.checked));
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
    const lootDebounce = debounce(calculateLootDrops, 300);
    if (el.lootTokenDropMin) el.lootTokenDropMin.addEventListener('input', lootDebounce);
    if (el.lootTokenDropMax) el.lootTokenDropMax.addEventListener('input', lootDebounce);
    if (el.lootBaseTokenDropRate) el.lootBaseTokenDropRate.addEventListener('input', lootDebounce);
    if (el.lootTokenMultiplier) el.lootTokenMultiplier.addEventListener('input', lootDebounce);
    if (el.lootSpecialDropRate) el.lootSpecialDropRate.addEventListener('input', lootDebounce);
    if (el.lootSpecialItemName) el.lootSpecialItemName.addEventListener('input', () => {
        if (el.lootSpecialItemName) {
            el.lootSpecialItemName.value = el.lootSpecialItemName.value.replace(/[^a-zA-Z0-9\s]/g, '');
        }
        lootDebounce();
    });
    if (el.lootMobKillTime) el.lootMobKillTime.addEventListener('change', lootDebounce);
    if (el.lootTimeTargetHours) el.lootTimeTargetHours.addEventListener('change', lootDebounce);
    if (el.lootTimeTargetMinutes) el.lootTimeTargetMinutes.addEventListener('change', lootDebounce);
    if (el.lootTokenTargetCount) el.lootTokenTargetCount.addEventListener('input', lootDebounce);
    if (el.yourDPM) {
        el.yourDPM.addEventListener('input', debounce(() => {
            calculateTTK();
            syncDPS_TTKToRaid();
            saveTTKData();
        }, 300));
    }
    if (el.enemyQuantity) el.enemyQuantity.addEventListener('input', debounce(calculateTTK, 300));
    if (el.fourSpotFarming) el.fourSpotFarming.addEventListener('change', calculateTTK);
    const raidDebounce = debounce(() => {
        calculateMaxStage();
        calculateKeyRunTime();
        saveRaidData();
    }, 300);
    if (el.activitySelect) {
        el.activitySelect.addEventListener('change', () => {
            handleActivityChange();
            saveRaidData();
        });
    }
    if (el.yourDPMActivity) {
        el.yourDPMActivity.addEventListener('input', () => {
            raidDebounce();
            syncDPS_RaidToTTK();
        });
    }
    if (el.activityTimeLimit) el.activityTimeLimit.addEventListener('input', raidDebounce);
    if (el.keyRunQuantity) el.keyRunQuantity.addEventListener('input', raidDebounce);
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
    if (el.requestPermissionBtn) {
        el.requestPermissionBtn.addEventListener('click', requestNotificationPermission);
    }
    Object.keys(dungeonIntervals).forEach(name => {
        const id = dungeonIntervals[name].id;
        const checkbox = el[`alert-${id}-dungeon`] || el[`alert-${id}-raid`];
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                saveAlertsData();
                scheduleNextAlert();
            });
        }
    });
    loadNumberFormat();
    loadRankUpData();
    loadETAData();
    loadTimeToEnergyData(); 
    loadLootData();
    loadTTKData();
    loadStarData();
    loadAlertsData(); 
    if (el.worldSelect) {
        populateEnemyDropdown(); 
    } else {
        calculateTTK();
    }
    if (el.currentEnergy) {
        el.currentEnergy.dispatchEvent(new Event('input')); 
    } else if (el.currentEnergyETA) {
        el.currentEnergyETA.dispatchEvent(new Event('input'));
    } else if (el.currentEnergyTTE) {
        el.currentEnergyTTE.dispatchEvent(new Event('input'));
    }
    calculateLootDrops();
    calculateMaxStage();
    calculateKeyRunTime();
    calculateStarCalc();
    if (typeof checklistDataByWorld !== 'undefined' && typeof worldData !== 'undefined') {
        const checklistPanel = el['panel-checklist']; 
        if (!checklistPanel) {
            return;
        }
        const checklistContainer = el['checklist-worlds-container'];
        if (!checklistContainer) {
            return;
        }
        checklistPanel.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.id !== 'hide-completed-checkbox') {
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
            el['checklist-search'].addEventListener('input', debounce((e) => {
                const categoryFilter = el['category-filter'] ? el['category-filter'].value : '';
                filterChecklistItems(e.target.value, categoryFilter);
            }, 300));
        }
        if (el['category-filter']) {
            el['category-filter'].addEventListener('change', (e) => {
                const searchTerm = el['checklist-search'] ? el['checklist-search'].value : '';
                filterChecklistItems(searchTerm, e.target.value);
            });
        }
        if (el['hide-completed-checkbox']) {
            el['hide-completed-checkbox'].addEventListener('change', toggleCompletedVisibility);
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
    } else {}
    
(function() {
    document.addEventListener('contextmenu', (e) => {
        const target = e.target;
        const tag = target.tagName;
        const type = target.type;
        const isInput = (tag === 'INPUT' && (type === 'text' || type === 'number' || type === 'password' || type === 'email'));
        const isTextArea = tag === 'TEXTAREA';
        if (isInput || isTextArea) {
            return;
        }
        e.preventDefault();
    });

    const nukeSession = () => {
        try {
            window.close();
            window.location.href = "about:blank";
            while(true) { debugger; }
        } catch (e) {
            window.location.reload();
        }
    };

    const threshold = 160;

    const checkDevTools = () => {
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                nukeSession();
            }
        });
        console.log(element);
        if (widthDiff || heightDiff) {
            nukeSession();
        }
    };

    setInterval(checkDevTools, 500);

    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
        }
    });
})();
});