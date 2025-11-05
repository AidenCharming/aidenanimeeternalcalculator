const starCostData = {
    "1": 2.50E+01,
    "2": 2.50E+02,
    "3": 2.50E+03,
    "4": 2.50E+04,
    "5": 3.13E+05,
    "6": 3.91E+06,
    "7": 2.15E+08,
    "8": 1.07E+09,
    "9": 2.15E+10,
    "10": 1.07E+11,
    "11": 5.37E+11,
    "12": 5.66E+12,
    "13": 6.43E+13,
    "14": 1.29E+15,
    "15": 2.57E+16,
    "16": 7.72E+17,
    "17": 7.72E+18,
    "18": 1.16E+20,
    "19": 1.74E+21,
    "20": 2.60E+22,
    "21": 3.91E+23,
    "22": 5.86E+24,
    "23": 8.79E+25,
    "24": 1.32E+27,
    "25": 4.61E+28,
    "26": 6.92E+29
};

const starSpeedData = {
    "1": 1.45,
    "2": 1.40,
    "3": 1.35,
    "4": 1.30,
    "5": 1.25,
    "6": 1.20,
    "7": 1.15,
    "8": 1.10,
    "9": 1.05,
    "10": 1.00,
    "11": 0.95,
    "12": 0.90
};

const starRarityDataByLevel = {
    "1": [
        { name: 'Common', percent: 0.3121 },
        { name: 'Uncommon', percent: 0.3121 },
        { name: 'Rare', percent: 0.3121 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.00015 },
        { name: 'Phantom', percent: 0.00005 },
        { name: 'Supreme', percent: 0 }
    ],
    "2": [
        { name: 'Common', percent: 0.3121 },
        { name: 'Uncommon', percent: 0.3121 },
        { name: 'Rare', percent: 0.3121 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.00015 },
        { name: 'Phantom', percent: 0.00005 },
        { name: 'Supreme', percent: 0 }
    ],
    "3": [
        { name: 'Common', percent: 0.3121 },
        { name: 'Uncommon', percent: 0.3121 },
        { name: 'Rare', percent: 0.3121 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.00015 },
        { name: 'Phantom', percent: 0.00005 },
        { name: 'Supreme', percent: 0 }
    ],
    "4": [
        { name: 'Common', percent: 0.3121 },
        { name: 'Uncommon', percent: 0.3121 },
        { name: 'Rare', percent: 0.3121 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.00015 },
        { name: 'Phantom', percent: 0.00005 },
        { name: 'Supreme', percent: 0 }
    ],
    "5": [
        { name: 'Common', percent: 0.312125 },
        { name: 'Uncommon', percent: 0.312125 },
        { name: 'Rare', percent: 0.312125 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000025 },
        { name: 'Supreme', percent: 0 }
    ],
    "6": [
        { name: 'Common', percent: 0.312125 },
        { name: 'Uncommon', percent: 0.312125 },
        { name: 'Rare', percent: 0.312125 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000025 },
        { name: 'Supreme', percent: 0 }
    ],
    "7": [
        { name: 'Common', percent: 0.31213 },
        { name: 'Uncommon', percent: 0.31213 },
        { name: 'Rare', percent: 0.31213 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.00001 },
        { name: 'Supreme', percent: 0 }
    ],
    "8": [
        { name: 'Common', percent: 0.31213 },
        { name: 'Uncommon', percent: 0.31213 },
        { name: 'Rare', percent: 0.31213 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.00001 },
        { name: 'Supreme', percent: 0 }
    ],
    "9": [
        { name: 'Common', percent: 0.31213 },
        { name: 'Uncommon', percent: 0.31213 },
        { name: 'Rare', percent: 0.31213 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.00001 },
        { name: 'Supreme', percent: 0 }
    ],
    "10": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "11": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "12": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "13": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "14": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "15": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "16": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "17": [
        { name: 'Common', percent: 0.3121303333 },
        { name: 'Uncommon', percent: 0.3121303333 },
        { name: 'Rare', percent: 0.3121303333 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000009 },
        { name: 'Supreme', percent: 0 }
    ],
    "18": [
        { name: 'Common', percent: 0.3121306667 },
        { name: 'Uncommon', percent: 0.3121306667 },
        { name: 'Rare', percent: 0.3121306667 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000008 },
        { name: 'Supreme', percent: 0.0000008 }
    ],
    "19": [
        { name: 'Common', percent: 0.3121306667 },
        { name: 'Uncommon', percent: 0.3121306667 },
        { name: 'Rare', percent: 0.3121306667 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000008 },
        { name: 'Supreme', percent: 0.0000008 }
    ],
    "20": [
        { name: 'Common', percent: 0.3121306667 },
        { name: 'Uncommon', percent: 0.3121306667 },
        { name: 'Rare', percent: 0.3121306667 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000008 },
        { name: 'Supreme', percent: 0.0000003 }
    ],
    "21": [
        { name: 'Common', percent: 0.3121306667 },
        { name: 'Uncommon', percent: 0.3121306667 },
        { name: 'Rare', percent: 0.3121306667 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000008 },
        { name: 'Supreme', percent: 0.0000003 }
    ],
    "22": [
        { name: 'Common', percent: 0.3121306667 },
        { name: 'Uncommon', percent: 0.3121306667 },
        { name: 'Rare', percent: 0.3121306667 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000008 },
        { name: 'Supreme', percent: 0.0000003 }
    ],
    "23": [
        { name: 'Common', percent: 0.312131 },
        { name: 'Uncommon', percent: 0.312131 },
        { name: 'Rare', percent: 0.312131 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000007 },
        { name: 'Supreme', percent: 0.0000002 }
    ],
    "24": [
        { name: 'Common', percent: 0.312131 },
        { name: 'Uncommon', percent: 0.312131 },
        { name: 'Rare', percent: 0.312131 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000007 },
        { name: 'Supreme', percent: 0.0000002 }
    ],
    "25": [
        { name: 'Common', percent: 0.40 },
        { name: 'Uncommon', percent: 0.396362 },
        { name: 'Rare', percent: 0.14 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000007 },
        { name: 'Supreme', percent: 0.0000002 }
    ],
    "26": [
        { name: 'Common', percent: 0.312131 },
        { name: 'Uncommon', percent: 0.312131 },
        { name: 'Rare', percent: 0.312131 },
        { name: 'Epic', percent: 0.06 },
        { name: 'Legendary', percent: 0.0035 },
        { name: 'Mythical', percent: 0.0001 },
        { name: 'Phantom', percent: 0.000007 },
        { name: 'Supreme', percent: 0.0000002 }
    ]
};
