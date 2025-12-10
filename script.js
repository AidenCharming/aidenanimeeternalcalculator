const el = {};
const tabs = ['rankup', 'eta', 'time-to-energy', 'coin', 'lootcalc', 'ttk', 'damage', 'checklist'];

const themes = ['blue', 'dark-blue', 'teal', 'dark-teal', 'purple', 'dark-purple', 'pink', 'dark-pink', 'green', 'dark-green', 'orange', 'dark-orange', 'red', 'dark-red'];
const themeColors = {
    'blue': '#0062ff',
    'dark-blue': '#02368a',
    'teal': '#39a78e',
    'dark-teal': '#008566ff',
    'purple': '#5d00ff',
    'dark-purple': '#3f01ac',
    'pink': '#ff00d4',
    'dark-pink': '#960089',
    'green': '#00ff00',
    'dark-green': '#009600',
    'orange': '#ff4800',
    'dark-orange': '#aa3102',
    'red': '#ff0000',
    'dark-red': '#8b0202'
};

const CHECKLIST_SAVE_KEY = 'ae_checklist_progress';
const LOOT_RESPAWN_DELAY = 2.5;
const LOOT_KILL_OVERHEAD = 0.5;
const SLOW_CPS = 1.0919;
const FAST_CPS = 5.88505;
let currentNumberFormat = 'letters';

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

async function updateAllWorldTitles(savedData) {
    if (typeof checklistDataByWorld === 'undefined') return;
    if (!savedData) {
        try {
            savedData = await localforage.getItem(CHECKLIST_SAVE_KEY) || {};
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

async function saveChecklistData() {
    if (typeof checklistDataByWorld === 'undefined') return;
    try {
        let savedData = await localforage.getItem(CHECKLIST_SAVE_KEY) || {};
        const checklistPanel = el['panel-checklist'];
        if (!checklistPanel) return;
        const checkboxes = checklistPanel.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            if(cb.checked) {
                savedData[cb.id] = true;
            } else {
                delete savedData[cb.id];
            }
        });
        await localforage.setItem(CHECKLIST_SAVE_KEY, savedData);
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

async function loadChecklistData() {
    if (typeof checklistDataByWorld === 'undefined') return;
    try {
        const savedData = await localforage.getItem(CHECKLIST_SAVE_KEY) || {};
        populateWorldChecklists(savedData);
        updateAllWorldTitles(savedData);
        const hideCompleted = await localforage.getItem('ae_checklist_hide_completed');
        if (el['hide-completed-checkbox']) {
            el['hide-completed-checkbox'].checked = (hideCompleted === 'true' || hideCompleted === true);
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
            } else {
                panel.classList.add('hidden');
                button.classList.remove('active');
            }
        }
    });
    const mobileNav = document.getElementById('mobile-nav-select');
    if (mobileNav && mobileNav.value !== activeTab) {
        mobileNav.value = activeTab;
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
    if (el.clickerSpeedDmg) el.clickerSpeedDmg.checked = isFast;
    
    calculateRankUp();
    calculateEnergyETA();
    calculateTimeToEnergy();
    calculateDamage();
}

function copyResult(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.innerText !== '0s' && element.innerText !== 'N/A' && element.innerText !== '0') {
        navigator.clipboard.writeText(element.innerText).then(() => {
            const originalBg = document.body.classList.contains('theme-green') ? '#10b981' : getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
            element.style.backgroundColor = '#10b981';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 200);
        });
    }
}

function populateThemeDropdown() {
    const select = document.getElementById('theme-select');
    if (!select) return;
    
    select.innerHTML = '';
    
    themes.forEach(theme => {
        const option = document.createElement('option');
        option.value = theme;
        
        const displayName = theme.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        option.text = displayName;
        select.appendChild(option);
    });
}

async function setTheme(themeName) {
    const body = document.body;
    
    themes.forEach(t => body.classList.remove(`theme-${t}`));
    
    if (themeName !== 'blue') {
        body.classList.add(`theme-${themeName}`);
    }
    
    try {
        await localforage.setItem('ae_theme', themeName);
    } catch (e) {
        console.error("Failed to save theme preference", e);
    }
    
    updateKoFiButton(themeName);
}

function updateKoFiButton(themeName) {
    const existingWidget = document.querySelector('.kofi-overlay-widget-wrapper');
    if (existingWidget) existingWidget.remove();

    const colorHex = themeColors[themeName] || themeColors['blue'];
    
    if (typeof kofiWidgetOverlay !== 'undefined') {
        kofiWidgetOverlay.draw('aidencharming', {
            'type': 'floating-chat',
            'floating-chat.donateButton.text': 'Support Me',
            'floating-chat.donateButton.background-color': colorHex,
            'floating-chat.donateButton.text-color': '#fff'
        });
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

async function setNumberFormat(format) {
    if (format === currentNumberFormat) return;
    const previousFormat = currentNumberFormat;
    currentNumberFormat = format;
    
    try {
        await localforage.setItem('ae_number_format', format);
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
        { numId: 'dmgCurrentEnergy', denomId: 'dmgCurrentEnergyDenomInput', valueId: 'dmgCurrentEnergyDenomValue' },
        { numId: 'dmgStatDamage', denomId: 'dmgStatDamageDenomInput', valueId: 'dmgStatDamageDenomValue' },
        { numId: 'coinBase', denomId: 'coinBaseDenomInput', valueId: 'coinBaseDenomValue' },
        { numId: 'coinMulti', denomId: 'coinMultiDenomInput', valueId: 'coinMultiDenomValue' }
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
    calculateDamage(); 
    calculateCoinIncome(); 
}

async function loadNumberFormat() {
    try {
        const savedFormat = await localforage.getItem('ae_number_format') || 'letters';
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
    if (timeInSeconds > MAX_SECONDS_CAP) {
        return "Over 1000 Years";
    }
    if (!isFinite(timeInSeconds)) {
        return "N/A";
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

async function saveRankUpData() {
    try {
        if (el.rankSelect) await localforage.setItem('ae_rankSelect', el.rankSelect.value);
        if (el.rankInput) await localforage.setItem('ae_rankInput', el.rankInput.value);
        if (el.currentEnergy) await localforage.setItem('ae_currentEnergy', el.currentEnergy.value);
        if (el.currentEnergyDenominationInput) await localforage.setItem('ae_currentEnergyDenomInput', el.currentEnergyDenominationInput.value);
        if (el.currentEnergyDenominationValue) await localforage.setItem('ae_currentEnergyDenomValue', el.currentEnergyDenominationValue.value);
        if (el.energyPerClick) await localforage.setItem('ae_energyPerClick', el.energyPerClick.value);
        if (el.energyPerClickDenominationInput) await localforage.setItem('ae_energyPerClickDenomInput', el.energyPerClickDenominationInput.value);
        if (el.energyPerClickDenominationValue) await localforage.setItem('ae_energyPerClickDenomValue', el.energyPerClickDenominationValue.value);
        if (el.clickerSpeed) await localforage.setItem('ae_clickerSpeed', el.clickerSpeed.checked);
        if (el.energyCriticalChance) await localforage.setItem('ae_rankup_critChance', el.energyCriticalChance.value);
        if (el.criticalEnergy) await localforage.setItem('ae_rankup_critEnergy', el.criticalEnergy.value);
    } catch (e) {}
}

async function loadRankUpData() {
    try {
        const rankSelect = await localforage.getItem('ae_rankSelect');
        if (rankSelect && el.rankSelect) {
            el.rankSelect.value = rankSelect;
            if (el.rankInput) el.rankInput.value = rankSelect;
        }
        const rankInput = await localforage.getItem('ae_rankInput');
        if (rankInput && el.rankInput) el.rankInput.value = rankInput;
        const currentEnergy = await localforage.getItem('ae_currentEnergy');
        if (currentEnergy && el.currentEnergy) el.currentEnergy.value = currentEnergy;
        const currentEnergyDenomInput = await localforage.getItem('ae_currentEnergyDenomInput');
        if (currentEnergyDenomInput && el.currentEnergyDenominationInput) el.currentEnergyDenominationInput.value = currentEnergyDenomInput;
        const currentDenom = denominations.find(d => d.name === currentEnergyDenomInput);
        if (el.currentEnergyDenominationValue) {
            el.currentEnergyDenominationValue.value = currentDenom ? currentDenom.value : '1';
        }
        const energyPerClick = await localforage.getItem('ae_energyPerClick');
        if (energyPerClick && el.energyPerClick) el.energyPerClick.value = energyPerClick;
        const energyPerClickDenomInput = await localforage.getItem('ae_energyPerClickDenomInput');
        if (energyPerClickDenomInput && el.energyPerClickDenominationInput) el.energyPerClickDenominationInput.value = energyPerClickDenomInput;
        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomInput);
        if (el.energyPerClickDenominationValue) {
            el.energyPerClickDenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }
        const clickerSpeed = await localforage.getItem('ae_clickerSpeed');
        const isFast = (clickerSpeed === true || clickerSpeed === 'true');
        if (el.energyCriticalChance) el.energyCriticalChance.value = await localforage.getItem('ae_rankup_critChance') || '';
        if (el.criticalEnergy) el.criticalEnergy.value = await localforage.getItem('ae_rankup_critEnergy') || '';
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

async function saveETAData() {
    try {
        if (el.targetEnergyETA) await localforage.setItem('ae_targetEnergyETA', el.targetEnergyETA.value);
        if (el.targetEnergyETADenominationInput) await localforage.setItem('ae_targetEnergyETADenomInput', el.targetEnergyETADenominationInput.value);
        if (el.targetEnergyETADenominationValue) await localforage.setItem('ae_targetEnergyETADenomValue', el.targetEnergyETADenominationValue.value);
        if (el.energyCriticalChanceETA) await localforage.setItem('ae_eta_critChance', el.energyCriticalChanceETA.value);
        if (el.criticalEnergyETA) await localforage.setItem('ae_eta_critEnergy', el.criticalEnergyETA.value);
    } catch(e) {}
}

async function loadETAData() {
    try {
        const currentEnergyNum = await localforage.getItem('ae_currentEnergy') || '';
        if (el.currentEnergyETA) el.currentEnergyETA.value = currentEnergyNum;
        const currentEnergyDenomText = await localforage.getItem('ae_currentEnergyDenomInput') || '';
        if (el.currentEnergyETADenominationInput) el.currentEnergyETADenominationInput.value = currentEnergyDenomText;
        const currentDenom = denominations.find(d => d.name === currentEnergyDenomText);
        if (el.currentEnergyETADenominationValue) {
            el.currentEnergyETADenominationValue.value = currentDenom ? currentDenom.value : '1';
        }
        const energyPerClickNum = await localforage.getItem('ae_energyPerClick') || '';
        if (el.energyPerClickETA) el.energyPerClickETA.value = energyPerClickNum;
        const energyPerClickDenomText = await localforage.getItem('ae_energyPerClickDenomInput') || '';
        if (el.energyPerClickETADenominationInput) el.energyPerClickETADenominationInput.value = energyPerClickDenomText;
        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomText);
        if (el.energyPerClickETADenominationValue) {
            el.energyPerClickETADenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }
        const targetEnergyNum = await localforage.getItem('ae_targetEnergyETA') || '';
        if (el.targetEnergyETA) el.targetEnergyETA.value = targetEnergyNum;
        const targetEnergyDenomText = await localforage.getItem('ae_targetEnergyETADenomInput') || '';
        if (el.targetEnergyETADenominationInput) el.targetEnergyETADenominationInput.value = targetEnergyDenomText;
        const targetDenom = denominations.find(d => d.name === targetEnergyDenomText);
        if (el.targetEnergyETADenominationValue) {
            el.targetEnergyETADenominationValue.value = targetDenom ? targetDenom.value : '1';
        }
        if (el.energyCriticalChanceETA) el.energyCriticalChanceETA.value = await localforage.getItem('ae_eta_critChance') || '';
        if (el.criticalEnergyETA) el.criticalEnergyETA.value = await localforage.getItem('ae_eta_critEnergy') || '';
        const clickerSpeed = await localforage.getItem('ae_clickerSpeed');
        const isFast = (clickerSpeed === true || clickerSpeed === 'true');
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

async function saveTTKData() {
    try {
        if (el.worldSelect) await localforage.setItem('ae_ttk_world', el.worldSelect.value);
        if (el.enemySelect) await localforage.setItem('ae_ttk_enemy', el.enemySelect.value);
        if (el.yourDPM) await localforage.setItem('ae_ttk_dpm', el.yourDPM.value); 
        if (el.dpmDenominationInput) await localforage.setItem('ae_ttk_dpmDenomInput', el.dpmDenominationInput.value);
        if (el.dpmDenominationValue) await localforage.setItem('ae_ttk_dpmDenomValue', el.dpmDenominationValue.value);
        if (el.enemyQuantity) await localforage.setItem('ae_ttk_quantity', el.enemyQuantity.value);
        if (el.fourSpotFarming) await localforage.setItem('ae_ttk_fourSpot', el.fourSpotFarming.checked);
    } catch (e) {}
}

async function loadTTKData() {
    try {
        const dpm = await localforage.getItem('ae_ttk_dpm'); 
        const dpmDenomInput = await localforage.getItem('ae_ttk_dpmDenomInput');
        const quantity = await localforage.getItem('ae_ttk_quantity');
        const fourSpot = await localforage.getItem('ae_ttk_fourSpot');
        const world = await localforage.getItem('ae_ttk_world');
        const enemy = await localforage.getItem('ae_ttk_enemy');
        if (el.yourDPM) el.yourDPM.value = dpm || '';
        if (el.dpmDenominationInput) el.dpmDenominationInput.value = dpmDenomInput || '';
        const dpmDenom = denominations.find(d => d.name === dpmDenomInput);
        if (el.dpmDenominationValue) {
            el.dpmDenominationValue.value = dpmDenom ? dpmDenom.value : '1';
        }
        if (quantity && el.enemyQuantity) el.enemyQuantity.value = quantity;
        if (fourSpot !== null && el.fourSpotFarming) {
            el.fourSpotFarming.checked = (fourSpot === true || fourSpot === 'true');
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

async function saveTimeToEnergyData() {
    try {
        if (el.currentEnergyTTE) await localforage.setItem('ae_tte_currentEnergy', el.currentEnergyTTE.value);
        if (el.currentEnergyTTEDenominationInput) await localforage.setItem('ae_tte_currentEnergyDenomInput', el.currentEnergyTTEDenominationInput.value);
        if (el.currentEnergyTTEDenominationValue) await localforage.setItem('ae_tte_currentEnergyDenomValue', el.currentEnergyTTEDenominationValue.value);
        if (el.energyPerClickTTE) await localforage.setItem('ae_tte_energyPerClick', el.energyPerClickTTE.value);
        if (el.energyPerClickTTEDenominationInput) await localforage.setItem('ae_tte_energyPerClickDenomInput', el.energyPerClickTTEDenominationInput.value);
        if (el.energyPerClickTTEDenominationValue) await localforage.setItem('ae_tte_energyPerClickDenomValue', el.energyPerClickTTEDenominationValue.value);
        if (el.energyCriticalChanceTTE) await localforage.setItem('ae_tte_critChance', el.energyCriticalChanceTTE.value);
        if (el.criticalEnergyTTE) await localforage.setItem('ae_tte_critEnergy', el.criticalEnergyTTE.value);
        if (el.timeToReturnSelect) await localforage.setItem('ae_tte_returnTime', el.timeToReturnSelect.value); 
        if (el.timeToReturnSelectMinutes) await localforage.setItem('ae_tte_returnTimeMinutes', el.timeToReturnSelectMinutes.value);
        if (el.clickerSpeedTTE) await localforage.setItem('ae_clickerSpeed', el.clickerSpeedTTE.checked); 
        if (typeof boostItems !== 'undefined' && Array.isArray(boostItems)) {
            boostItems.filter(item => item.type === 'energy').forEach(async item => {
                const hoursEl = el[`boost-${item.id}-hours`];
                const minutesEl = el[`boost-${item.id}-minutes`];
                if (hoursEl) {
                    await localforage.setItem(`ae_tte_boost_${item.id}_hours`, hoursEl.value);
                }
                if (minutesEl) {
                    await localforage.setItem(`ae_tte_boost_${item.id}_minutes`, minutesEl.value);
                }
            });
        }
    } catch (e) {}
}

async function loadTimeToEnergyData() {
     try {
        const currentEnergyNum = await localforage.getItem('ae_currentEnergy') || '';
        if (el.currentEnergyTTE) el.currentEnergyTTE.value = currentEnergyNum;
        const currentEnergyDenomText = await localforage.getItem('ae_currentEnergyDenomInput') || '';
        if (el.currentEnergyTTEDenominationInput) el.currentEnergyTTEDenominationInput.value = currentEnergyDenomText;
        const currentDenom = denominations.find(d => d.name === currentEnergyDenomText);
        if (el.currentEnergyTTEDenominationValue) {
            el.currentEnergyTTEDenominationValue.value = currentDenom ? currentDenom.value : '1';
        }
        const energyPerClickNum = await localforage.getItem('ae_energyPerClick') || '';
        if (el.energyPerClickTTE) el.energyPerClickTTE.value = energyPerClickNum;
        const energyPerClickDenomText = await localforage.getItem('ae_energyPerClickDenomInput') || '';
        if (el.energyPerClickTTEDenominationInput) el.energyPerClickTTEDenominationInput.value = energyPerClickDenomText;
        const energyPerClickDenom = denominations.find(d => d.name === energyPerClickDenomText);
        if (el.energyPerClickTTEDenominationValue) {
            el.energyPerClickTTEDenominationValue.value = energyPerClickDenom ? energyPerClickDenom.value : '1';
        }
        if (el.energyCriticalChanceTTE) el.energyCriticalChanceTTE.value = await localforage.getItem('ae_rankup_critChance') || '';
        if (el.criticalEnergyTTE) el.criticalEnergyTTE.value = await localforage.getItem('ae_rankup_critEnergy') || '';
        const returnTime = await localforage.getItem('ae_tte_returnTime');
        if (returnTime && el.timeToReturnSelect) {
            el.timeToReturnSelect.value = returnTime;
        }
        const returnTimeMinutes = await localforage.getItem('ae_tte_returnTimeMinutes');
        if (returnTimeMinutes && el.timeToReturnSelectMinutes) {
            el.timeToReturnSelectMinutes.value = returnTimeMinutes;
        }
        const clickerSpeed = await localforage.getItem('ae_clickerSpeed');
        const isFast = (clickerSpeed === true || clickerSpeed === 'true');
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
            boostItems.filter(item => item.type === 'energy').forEach(async item => {
                const hoursEl = el[`boost-${item.id}-hours`];
                const minutesEl = el[`boost-${item.id}-minutes`];
                const savedHours = await localforage.getItem(`ae_tte_boost_${item.id}_hours`);
                const savedMinutes = await localforage.getItem(`ae_tte_boost_${item.id}_minutes`);
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

async function saveLootData() {
    try {
        if (el.lootTokenDropMin) await localforage.setItem('ae_loot_tokenMin', el.lootTokenDropMin.value);
        if (el.lootTokenDropMax) await localforage.setItem('ae_loot_tokenMax', el.lootTokenDropMax.value);
        if (el.lootBaseTokenDropRate) await localforage.setItem('ae_loot_baseTokenRate', el.lootBaseTokenDropRate.value);
        if (el.lootTokenMultiplier) await localforage.setItem('ae_loot_tokenMultiplier', el.lootTokenMultiplier.value);
        if (el.lootSpecialDropRate) await localforage.setItem('ae_loot_specialRate', el.lootSpecialDropRate.value);
        if (el.lootSpecialItemName) await localforage.setItem('ae_loot_specialItemName', el.lootSpecialItemName.value);
        if (el.lootMobKillTime) await localforage.setItem('ae_loot_mobKillTime', el.lootMobKillTime.value);
        if (el.lootFarmingMode) await localforage.setItem('ae_loot_farmingMode', el.lootFarmingMode.value);
        if (el.lootTimeTargetHours) await localforage.setItem('ae_loot_targetHours', el.lootTimeTargetHours.value);
        if (el.lootTimeTargetMinutes) await localforage.setItem('ae_loot_targetMinutes', el.lootTimeTargetMinutes.value);
        if (el.lootTokenTargetCount) await localforage.setItem('ae_loot_targetTokenCount', el.lootTokenTargetCount.value);
    } catch (e) {}
}

async function loadLootData() {
    try {
        if (el.lootTokenDropMin) el.lootTokenDropMin.value = await localforage.getItem('ae_loot_tokenMin') || 1;
        if (el.lootTokenDropMax) el.lootTokenDropMax.value = await localforage.getItem('ae_loot_tokenMax') || 1;
        if (el.lootBaseTokenDropRate) el.lootBaseTokenDropRate.value = await localforage.getItem('ae_loot_baseTokenRate') || 10;
        if (el.lootTokenMultiplier) el.lootTokenMultiplier.value = await localforage.getItem('ae_loot_tokenMultiplier') || 3.16;
        if (el.lootSpecialDropRate) el.lootSpecialDropRate.value = await localforage.getItem('ae_loot_specialRate') || 1;
        if (el.lootSpecialItemName) el.lootSpecialItemName.value = await localforage.getItem('ae_loot_specialItemName') || 'Special Drops';
        const savedKillTime = await localforage.getItem('ae_loot_mobKillTime');
        if (el.lootMobKillTime) {
            el.lootMobKillTime.value = savedKillTime !== null ? savedKillTime : 'instakill';
        }
        const savedFarmingMode = await localforage.getItem('ae_loot_farmingMode');
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
        if (el.lootTimeTargetHours) el.lootTimeTargetHours.value = await localforage.getItem('ae_loot_targetHours') || 1;
        if (el.lootTimeTargetMinutes) el.lootTimeTargetMinutes.value = await localforage.getItem('ae_loot_targetMinutes') || 0;
        if (el.lootTokenTargetCount) el.lootTokenTargetCount.value = await localforage.getItem('ae_loot_targetTokenCount') || 1;
        if (el.lootSpecialItemName) {
            el.lootSpecialItemName.dispatchEvent(new Event('input'));
        }
        calculateLootDrops();
    } catch (e) {}
}

async function saveDamageData() {
    try {
        if(el.dmgCurrentEnergy) {
            await localforage.setItem('ae_dmg_energy', el.dmgCurrentEnergy.value);
            // FORCE SYNC: Also save to the main "Rank Up" keys so it doesn't get overwritten on reload
            await localforage.setItem('ae_currentEnergy', el.dmgCurrentEnergy.value); 
        }
        
        if(el.dmgCurrentEnergyDenomInput) {
            await localforage.setItem('ae_dmg_energyDenom', el.dmgCurrentEnergyDenomInput.value);
            await localforage.setItem('ae_currentEnergyDenomInput', el.dmgCurrentEnergyDenomInput.value);
        }
        
        if(el.dmgCurrentEnergyDenomValue) {
            await localforage.setItem('ae_dmg_energyDenomVal', el.dmgCurrentEnergyDenomValue.value);
            await localforage.setItem('ae_currentEnergyDenomValue', el.dmgCurrentEnergyDenomValue.value);
        }

        if(el.dmgStatDamage) await localforage.setItem('ae_dmg_stat', el.dmgStatDamage.value);
        if(el.dmgStatDamageDenomInput) await localforage.setItem('ae_dmg_statDenom', el.dmgStatDamageDenomInput.value);
        if(el.dmgStatDamageDenomValue) await localforage.setItem('ae_dmg_statDenomVal', el.dmgStatDamageDenomValue.value);

        if(el.dmgCritChance) await localforage.setItem('ae_dmg_critChance', el.dmgCritChance.value);
        if(el.dmgCritDamage) await localforage.setItem('ae_dmg_critDmg', el.dmgCritDamage.value);
        if(el.clickerSpeedDmg) await localforage.setItem('ae_clickerSpeed', el.clickerSpeedDmg.checked);

        const comps = ['compShadow1','compShadow2','compTitan1','compTitan2','compStand1','compStand2','compZombie1','compZombie2'];
        for(const id of comps) {
            if(el[id]) await localforage.setItem(`ae_dmg_${id}`, el[id].value);
        }
    } catch(e){}
}

async function loadDamageData() {
    try {
        if(el.dmgCurrentEnergy) el.dmgCurrentEnergy.value = await localforage.getItem('ae_dmg_energy') || '';
        
        const enDenom = await localforage.getItem('ae_dmg_energyDenom');
        if(el.dmgCurrentEnergyDenomInput && enDenom) {
            el.dmgCurrentEnergyDenomInput.value = enDenom;
            const d = denominations.find(x => x.name === enDenom);
            if(d && el.dmgCurrentEnergyDenomValue) el.dmgCurrentEnergyDenomValue.value = d.value;
        }

        if(el.dmgStatDamage) el.dmgStatDamage.value = await localforage.getItem('ae_dmg_stat') || '';
        const statDenom = await localforage.getItem('ae_dmg_statDenom');
        if(el.dmgStatDamageDenomInput && statDenom) {
            el.dmgStatDamageDenomInput.value = statDenom;
            const d = denominations.find(x => x.name === statDenom);
            if(d && el.dmgStatDamageDenomValue) el.dmgStatDamageDenomValue.value = d.value;
        }

        if(el.dmgCritChance) el.dmgCritChance.value = await localforage.getItem('ae_dmg_critChance') || '';
        if(el.dmgCritDamage) el.dmgCritDamage.value = await localforage.getItem('ae_dmg_critDmg') || '';

        const clickerSpeed = await localforage.getItem('ae_clickerSpeed');
        const isFast = (clickerSpeed === true || clickerSpeed === 'true');
        if(el.clickerSpeedDmg) {
            el.clickerSpeedDmg.checked = isFast;
            const parent = el.clickerSpeedDmg.parentElement;
            if(parent) {
                const btn = isFast ? parent.querySelector('[data-clickerspeed-dmg="fast"]') : parent.querySelector('[data-clickerspeed-dmg="slow"]');
                if(btn) {
                    parent.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            }
        }

        const comps = ['compShadow1','compShadow2','compTitan1','compTitan2','compStand1','compStand2','compZombie1','compZombie2'];
        for(const id of comps) {
            if(el[id]) el[id].value = await localforage.getItem(`ae_dmg_${id}`) || '';
        }

        calculateDamage();
    } catch(e){}
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

function calculateCoinIncome() {
    if (!el.coinPerKillResult || !el.coinPerHourResult) return;

    const baseVal = getNumberValue('coinBase');

    const baseDenom = currentNumberFormat === 'letters' ? 
        (el.coinBaseDenomValue ? (parseFloat(el.coinBaseDenomValue.value) || 1) : 1) : 1;
    const totalBase = baseVal * baseDenom;

    const multiVal = getNumberValue('coinMulti');
    const multiDenom = currentNumberFormat === 'letters' ? 
        (el.coinMultiDenomValue ? (parseFloat(el.coinMultiDenomValue.value) || 1) : 1) : 1;
    const totalMulti = multiVal * multiDenom;

    const coinsPerKill = totalBase * totalMulti;

    const LOOT_KILL_OVERHEAD = 0.5;
    const LOOT_RESPAWN_DELAY = 2.5;

    let killTimeInput = 'instakill';
    if (el.coinMobKillTime && el.coinMobKillTime.value) {
        killTimeInput = el.coinMobKillTime.value;
    }

    const farmingMode = el.coinFarmingMode ? el.coinFarmingMode.value : 'single';
    const spotMultiplier = farmingMode === 'four' ? 4 : 1;

    let rawTimePerKill = parseNumberInput(killTimeInput);
    if (killTimeInput === 'instakill' || rawTimePerKill <= 0) {
        rawTimePerKill = 0.001; 
    }

    const timeToCompleteKill = rawTimePerKill + LOOT_KILL_OVERHEAD;
    const respawnLimitPerKill = LOOT_RESPAWN_DELAY / spotMultiplier; 
    const timePerCycle = Math.max(timeToCompleteKill, respawnLimitPerKill);
    
    const effectiveKillsPerSecond = 1 / timePerCycle;
    
    const coinsPerSecond = coinsPerKill * effectiveKillsPerSecond * spotMultiplier;
    const coinsPerHour = coinsPerSecond * 3600;

    el.coinPerKillResult.innerText = formatNumber(coinsPerKill);
    el.coinPerHourResult.innerText = formatNumber(coinsPerHour);

    saveCoinData();
}

function calculateLootDrops() {
    if (!el.lootTokensResult || !el.lootSpecialDropsResult) return;

    const tokenDropMin = getNumberValue('lootTokenDropMin') || 1;
    const tokenDropMax = getNumberValue('lootTokenDropMax') || 1;
    const baseTokenRate = (getNumberValue('lootBaseTokenDropRate') || 0) / 100;

    let tokenMultiplier = getNumberValue('lootTokenMultiplier');
    if (tokenMultiplier <= 0) tokenMultiplier = 1;

    const specialDropRate = (getNumberValue('lootSpecialDropRate') || 0) / 100;
    
    const specialItemName = el.lootSpecialItemName ? el.lootSpecialItemName.value.trim() : 'Special Drops';
    if (el.specialItemLabel) {
        el.specialItemLabel.innerText = `Avg ${specialItemName} per Target Time:`;
    }

    const targetHours = getNumberValue('lootTimeTargetHours');
    const targetMinutes = getNumberValue('lootTimeTargetMinutes');
    const targetTimeInSeconds = (targetHours * 3600) + (targetMinutes * 60);
    const targetTokenCount = getNumberValue('lootTokenTargetCount') || 1;

    let killTimeInput = 'instakill';
    if (el.lootMobKillTime && el.lootMobKillTime.value) {
        killTimeInput = el.lootMobKillTime.value;
    }

    const farmingMode = el.lootFarmingMode ? el.lootFarmingMode.value : 'single';
    const spotMultiplier = farmingMode === 'four' ? 4 : 1;

    let rawTimePerKill = parseNumberInput(killTimeInput);
    if (killTimeInput === 'instakill' || rawTimePerKill <= 0) {
        rawTimePerKill = 0.001; 
    }
    
    const LOOT_KILL_OVERHEAD = 0.5;
    const LOOT_RESPAWN_DELAY = 2.5;

    const timeToCompleteKill = rawTimePerKill + LOOT_KILL_OVERHEAD;
    const respawnLimitPerKill = LOOT_RESPAWN_DELAY / spotMultiplier;
    const timePerCycle = Math.max(timeToCompleteKill, respawnLimitPerKill);
    const effectiveKillsPerSecond = 1 / timePerCycle;

    const TOKEN_FACTOR = 4.0;
    const SPECIAL_DROP_FACTOR = 1.2;
    const VARIANCE_PERCENT = 0.3; 

    const baseTokenRatePerSecond = (effectiveKillsPerSecond * tokenMultiplier * baseTokenRate * spotMultiplier) / TOKEN_FACTOR;
    const avgTokenDropQuantity = (tokenDropMin + tokenDropMax) / 2;
    const effectiveTokensPerSecond = baseTokenRatePerSecond * avgTokenDropQuantity;

    const totalAvgTokens = effectiveTokensPerSecond * targetTimeInSeconds;
    const totalMinTokens = totalAvgTokens * (1 - VARIANCE_PERCENT);
    const totalMaxTokens = totalAvgTokens * (1 + VARIANCE_PERCENT);

    const rawSpecialDropsPerSecond = effectiveKillsPerSecond * 1 * specialDropRate * spotMultiplier;
    const effectiveSpecialDropsPerSecond = rawSpecialDropsPerSecond / SPECIAL_DROP_FACTOR;
    
    const totalAvgSpecial = effectiveSpecialDropsPerSecond * targetTimeInSeconds;
    const totalMinSpecial = totalAvgSpecial * (1 - VARIANCE_PERCENT);
    const totalMaxSpecial = totalAvgSpecial * (1 + VARIANCE_PERCENT);

    if (el.lootTokensResult) {
         if (totalAvgTokens === 0) {
             el.lootTokensResult.innerText = "0";
         } else {
             if (Math.abs(totalMinTokens - totalMaxTokens) < 1) {
                 el.lootTokensResult.innerText = formatNumber(totalAvgTokens);
             } else {
                 el.lootTokensResult.innerText = `${formatNumber(totalMinTokens)} - ${formatNumber(totalMaxTokens)}`;
             }
         }
    }

    if (el.lootSpecialDropsResult) {
        if (totalAvgSpecial === 0) {
            el.lootSpecialDropsResult.innerText = "0";
        } else {
            if (Math.abs(totalMinSpecial - totalMaxSpecial) < 1) {
                el.lootSpecialDropsResult.innerText = formatNumber(totalAvgSpecial);
            } else {
                el.lootSpecialDropsResult.innerText = `${formatNumber(totalMinSpecial)} - ${formatNumber(totalMaxSpecial)}`;
            }
        }
    }

    if (el.lootTokenTimeToTargetResult) {
        if (effectiveTokensPerSecond > 0) {
            const timeToTarget = targetTokenCount / effectiveTokensPerSecond;
            el.lootTokenTimeToTargetResult.innerText = formatTime(timeToTarget);
        } else {
             el.lootTokenTimeToTargetResult.innerText = "N/A"; 
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
    const selectedEnemyName = el.enemySelect ? el.enemySelect.value : '';
    const isSecretBoss = SS_SSS_MOBS.includes(selectedEnemyName);
    const BASE_RESPAWN_TIME = isSecretBoss ? 2 : 3; 

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
        const ENEMY_GROUP_SIZE = isFourSpot ? 4 : 1;
        const respawnLimitPerKill = BASE_RESPAWN_TIME / ENEMY_GROUP_SIZE;
        
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

function calculateDamage() {
    if (!el.dpsResult || !el.dpmResult) return;

    const energyVal = getNumberValue('dmgCurrentEnergy');
    const energyDenom = currentNumberFormat === 'letters' ? 
        (el.dmgCurrentEnergyDenomValue ? (parseFloat(el.dmgCurrentEnergyDenomValue.value) || 1) : 1) : 1;
    const totalEnergy = energyVal * energyDenom;

    const dmgVal = getNumberValue('dmgStatDamage');
    const dmgDenom = currentNumberFormat === 'letters' ? 
        (el.dmgStatDamageDenomValue ? (parseFloat(el.dmgStatDamageDenomValue.value) || 1) : 1) : 1;
    const totalDamageStat = dmgVal * dmgDenom;

    const baseClick = totalEnergy * totalDamageStat;
    
    const critChance = (getNumberValue('dmgCritChance') || 0) / 100;
    const critDmg = (getNumberValue('dmgCritDamage') || 0) / 100;

    let avgMultiplier = 1;
    if (critChance > 0) {
        avgMultiplier = (1 * (1 - critChance)) + (critDmg * critChance);
    }
    const avgClickDamage = baseClick * avgMultiplier;

    const isFast = el.clickerSpeedDmg ? el.clickerSpeedDmg.checked : false;
    const clicksPerSec = isFast ? FAST_CPS : SLOW_CPS;
    const playerDPS = avgClickDamage * clicksPerSec;

    const calcMinion = (inputId, interval) => {
        const mult = getNumberValue(inputId);
        if (mult <= 0) return 0;
        const attacksPerSecond = 1 / interval;
        const dmgPerHit = (mult / 100) * avgClickDamage;
        return dmgPerHit * attacksPerSecond;
    };

    let minionDPS = 0;
    minionDPS += calcMinion('compShadow1', 1.0);
    minionDPS += calcMinion('compShadow2', 1.0);
    minionDPS += calcMinion('compTitan1', 1.0);
    minionDPS += calcMinion('compTitan2', 1.0);
    minionDPS += calcMinion('compStand1', 0.2);
    minionDPS += calcMinion('compStand2', 0.2);
    minionDPS += calcMinion('compZombie1', 2.0);
    minionDPS += calcMinion('compZombie2', 2.0);

    const preDPS = playerDPS + minionDPS;
    const totalDPS = preDPS * .94;
    const totalDPM = totalDPS * 60;

    el.dpsResult.innerText = formatNumber(totalDPS);
    el.dpmResult.innerText = formatNumber(totalDPM);

    saveDamageData();
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
    const selectedEnemy = el.enemySelect.value;
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

function populateKillTimeDropdownForId(elementId) {
    const selectElement = document.getElementById(elementId);
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
        'currentEnergy': ['currentEnergyETA', 'currentEnergyTTE', 'dmgCurrentEnergy'],
        'energyPerClick': ['energyPerClickETA', 'energyPerClickTTE'],
        'currentEnergyETA': ['currentEnergy', 'currentEnergyTTE'],
        'energyPerClickETA': ['energyPerClick', 'energyPerClickTTE'],
        'currentEnergyTTE': ['currentEnergy', 'currentEnergyETA'],
        'energyPerClickTTE': ['energyPerClick', 'energyPerClickETA'],
        'dmgCurrentEnergy': ['currentEnergy', 'currentEnergyETA', 'currentEnergyTTE']
    };
    const criticalInputMap = {
        'energyCriticalChance': ['energyCriticalChanceETA', 'energyCriticalChanceTTE'],
        'criticalEnergy': ['criticalEnergyETA', 'criticalEnergyTTE'],
        'energyCriticalChanceETA': ['energyCriticalChance', 'energyCriticalChanceTTE'],
        'criticalEnergyETA': ['criticalEnergy', 'criticalEnergyTTE'],
        'energyCriticalChanceTTE': ['energyCriticalChance', 'energyCriticalChanceETA'],
        'criticalEnergyTTE': ['criticalEnergy', 'criticalEnergyETA']
    };
    const denomInputMap = {
        'dmgCurrentEnergyDenomInput': ['currentEnergyDenominationInput', 'currentEnergyETADenominationInput', 'currentEnergyTTEDenominationInput'],
        'currentEnergyDenominationInput': ['currentEnergyETADenominationInput', 'currentEnergyTTEDenominationInput', 'dmgCurrentEnergyDenomInput'],
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

async function saveCoinData() {
    try {
        if (el.coinBase) await localforage.setItem('ae_coin_base', el.coinBase.value);
        if (el.coinBaseDenomInput) await localforage.setItem('ae_coin_baseDenom', el.coinBaseDenomInput.value);
        if (el.coinBaseDenomValue) await localforage.setItem('ae_coin_baseDenomVal', el.coinBaseDenomValue.value);
        
        if (el.coinMulti) await localforage.setItem('ae_coin_multi', el.coinMulti.value);
        if (el.coinMultiDenomInput) await localforage.setItem('ae_coin_multiDenom', el.coinMultiDenomInput.value);
        if (el.coinMultiDenomValue) await localforage.setItem('ae_coin_multiDenomVal', el.coinMultiDenomValue.value);

        if (el.coinMobKillTime) await localforage.setItem('ae_coin_killTime', el.coinMobKillTime.value);
        if (el.coinFarmingMode) await localforage.setItem('ae_coin_farmingMode', el.coinFarmingMode.value);
    } catch(e) {}
}

async function loadCoinData() {
    try {
        if (el.coinBase) el.coinBase.value = await localforage.getItem('ae_coin_base') || '';
        
        const baseDenomName = await localforage.getItem('ae_coin_baseDenom');
        if (el.coinBaseDenomInput && baseDenomName) {
            el.coinBaseDenomInput.value = baseDenomName;
            const denom = denominations.find(d => d.name === baseDenomName);
            if (denom && el.coinBaseDenomValue) el.coinBaseDenomValue.value = denom.value;
        }

        if (el.coinMulti) el.coinMulti.value = await localforage.getItem('ae_coin_multi') || '';

        const multiDenomName = await localforage.getItem('ae_coin_multiDenom');
        if (el.coinMultiDenomInput && multiDenomName) {
            el.coinMultiDenomInput.value = multiDenomName;
            const denom = denominations.find(d => d.name === multiDenomName);
            if (denom && el.coinMultiDenomValue) el.coinMultiDenomValue.value = denom.value;
        }

        const savedKillTime = await localforage.getItem('ae_coin_killTime');
        if (el.coinMobKillTime) el.coinMobKillTime.value = savedKillTime || 'instakill';

        const savedMode = await localforage.getItem('ae_coin_farmingMode');
        if (savedMode && el.coinFarmingMode) {
            el.coinFarmingMode.value = savedMode;
            const container = document.getElementById('coin-farming-mode-container');
            if (container) {
                container.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
                const activeBtn = container.querySelector(`[data-coin-farming-mode="${savedMode}"]`);
                if (activeBtn) activeBtn.classList.add('active');
            }
        }

        calculateCoinIncome();
    } catch(e) {}
}

async function toggleCompletedVisibility() {
    const isHidden = el['hide-completed-checkbox'] ? el['hide-completed-checkbox'].checked : false;
    if (el['hide-completed-checkbox']) {
        try {
            await localforage.setItem('ae_checklist_hide_completed', isHidden ? 'true' : 'false');
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

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('[id]').forEach(element => {
        el[element.id] = element;
    });
    const mobileNavSelect = el['mobile-nav-select'];
    if (mobileNavSelect) {
        mobileNavSelect.addEventListener('change', (e) => {
            switchTab(e.target.value);
        });
    }
    if (el.coinMobKillTime) {
        populateKillTimeDropdownForId('coinMobKillTime');
    }

    setupDenominationSearch('coinBaseDenomInput', 'coinBaseDenomValue', 'coinBaseDenomList', calculateCoinIncome);
    setupDenominationSearch('coinMultiDenomInput', 'coinMultiDenomValue', 'coinMultiDenomList', calculateCoinIncome);

    const coinDebounce = debounce(calculateCoinIncome, 300);
    if (el.coinBase) el.coinBase.addEventListener('input', coinDebounce);
    if (el.coinMulti) el.coinMulti.addEventListener('input', coinDebounce);
    if (el.coinMobKillTime) el.coinMobKillTime.addEventListener('change', coinDebounce);

    const coinModeContainer = document.getElementById('coin-farming-mode-container');
    if (coinModeContainer) {
        coinModeContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.toggle-btn');
            if (btn) {
                const mode = btn.dataset.coinFarmingMode;
                el.coinFarmingMode.value = mode;
                coinModeContainer.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                calculateCoinIncome();
            }
        });
    }

    await loadCoinData();

    setupDenominationSearch('dmgCurrentEnergyDenomInput', 'dmgCurrentEnergyDenomValue', 'dmgCurrentEnergyDenomList', calculateDamage);
    setupDenominationSearch('dmgStatDamageDenomInput', 'dmgStatDamageDenomValue', 'dmgStatDamageDenomList', calculateDamage);

    const damageDebounce = debounce(calculateDamage, 300);
    
    const dmgInputs = [
        'dmgCurrentEnergy', 'dmgStatDamage', 'dmgCritChance', 'dmgCritDamage',
        'compShadow1', 'compShadow2', 
        'compTitan1', 'compTitan2', 
        'compStand1', 'compStand2', 
        'compZombie1', 'compZombie2'
    ];
    dmgInputs.forEach(id => {
        if(el[id]) el[id].addEventListener('input', damageDebounce);
    });

    if(el.clickerSpeedDmg) el.clickerSpeedDmg.addEventListener('change', damageDebounce);

    await loadDamageData();

    const lootFarmingModeContainer = el['loot-farming-mode-container'];
    if (lootFarmingModeContainer) {
        lootFarmingModeContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.toggle-btn');
            if (button && button.dataset.lootFarmingMode) {
                setFarmingMode(button.dataset.lootFarmingMode, button);
            }
        });
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
        el.backgroundToggle.addEventListener('change', async () => {
            const isImage = el.backgroundToggle.checked;
            applyBackgroundPreference(isImage);
            try {
                await localforage.setItem(BACKGROUND_KEY, isImage ? '1' : '0');
            } catch (e) {}
        });
    }
    (async () => {
        try {
            const savedPref = await localforage.getItem(BACKGROUND_KEY);
            if (savedPref === '1') {
                if (el.backgroundToggle) el.backgroundToggle.checked = true;
                applyBackgroundPreference(true);
            } else {
                if (el.backgroundToggle) el.backgroundToggle.checked = false;
                applyBackgroundPreference(false);
            }
        } catch (e) {}
    })();
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
                        } else if (button.dataset.clickerspeedDmg) {
                            setClickerSpeed(button.dataset.clickerspeedDmg, button);
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
    populateLootKillTimeDropdown();
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
    function onTTKDenomChange() {
        calculateTTK();
    }
    setupDenominationSearch('dpmDenominationInput', 'dpmDenominationValue', 'dpmDenominationList', onTTKDenomChange);
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
            saveTTKData();
        }, 300));
    }
    if (el.enemyQuantity) el.enemyQuantity.addEventListener('input', debounce(calculateTTK, 300));
    if (el.fourSpotFarming) el.fourSpotFarming.addEventListener('change', calculateTTK);
    if (el['theme-select']) {
        populateThemeDropdown();

        el['theme-select'].addEventListener('change', (e) => {
            setTheme(e.target.value);
        });

        (async () => {
            const savedTheme = await localforage.getItem('ae_theme') || 'blue';
        
            el['theme-select'].value = savedTheme;

            if (savedTheme !== 'blue') {
                document.body.classList.add(`theme-${savedTheme}`);
            }
            updateKoFiButton(savedTheme);
        })();
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
    
    (async () => {
        await loadNumberFormat();
        await loadRankUpData();
        await loadETAData();
        await loadTimeToEnergyData(); 
        await loadLootData();
        await loadTTKData();
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
            await loadChecklistData();
        }
    })();

    const handleScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        const threshold = 20;

        if (scrollTop > threshold) {
            document.body.classList.add('scrolled');
        } else {
            document.body.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });

    setTimeout(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop <= 20 && window.innerWidth <= 768) {
            document.body.classList.add('scrolled');
        }
    }, 5000);
});
