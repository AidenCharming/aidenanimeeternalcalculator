const denominations = [
    { name: 'None', value: 1 },
    { name: 'K', value: 1e3 },
    { name: 'M', value: 1e6 },
    { name: 'B', value: 1e9 },
    { name: 'T', value: 1e12 },
    { name: 'qd', value: 1e15 },
    { name: 'Qn', value: 1e18 },
    { name: 'sx', value: 1e21 },
    { name: 'Sp', value: 1e24 },
    { name: 'O', value: 1e27 },
    { name: 'N', value: 1e30 },
    { name: 'de', value: 1e33 },
    { name: 'Ud', value: 1e36 },
    { name: 'DD', value: 1e39 },
    { name: 'tdD', value: 1e42 },
    { name: 'qdD', value: 1e45 },
    { name: 'QnD', value: 1e48 },
    { name: 'sxD', value: 1e51 },
    { name: 'SpD', value: 1e54 },
    { name: 'OcD', value: 1e57 },
    { name: 'NvD', value: 1e60 },
    { name: 'Vgn', value: 1e63 },
    { name: 'UVg', value: 1e66 },
    { name: 'DVg', value: 1e69 },
    { name: 'TVg', value: 1e72 },
    { name: 'qtV', value: 1e75 },
    { name: 'QnV', value: 1e78 },
    { name: 'SeV', value: 1e81 },
    { name: 'SPG', value: 1e84 },
    { name: 'OVG', value: 1e87 },
    { name: 'NVG', value: 1e90 },
    { name: 'TGN', value: 1e93 },
    { name: 'UTG', value: 1e96 },
    { name: 'DTG', value: 1e99 },
    { name: 'tsTG', value: 1e102 },
    { name: 'qtTG', value: 1e105 },
    { name: 'QnTG', value: 1e108 },
    { name: 'ssTG', value: 1e111 },
    { name: 'SpTG', value: 1e114 },
    { name: 'OcTG', value: 1e117 },
    { name: 'NoTG', value: 1e120 },
    { name: 'QdDR', value: 1e123 },
    { name: 'uQDR', value: 1e126 },
    { name: 'dQDR', value: 1e129 },
    { name: 'tQDR', value: 1e132 },
    { name: 'qdQDR', value: 1e135 },
    { name: 'QnQDR', value: 1e138 },
    { name: 'sxQDR', value: 1e141 },
    { name: 'SpQDR', value: 1e144 },
    { name: 'OQDDr', value: 1e147 },
    { name: 'NQDDr', value: 1e150 },
    { name: 'qQGNT', value: 1e153 },
    { name: 'uQGNT', value: 1e156 },
    { name: 'dQGNT', value: 1e159 },
    { name: 'tQGNT', value: 1e162 },
    { name: 'qdQGNT', value: 1e165 },
    { name: 'QnQGNT', value: 1e168 },
    { name: 'sxQGNT', value: 1e171 },
    { name: 'SpQGNT', value: 1e174 },
    { name: 'OQQGNT', value: 1e177 },
    { name: 'NQQGNT', value: 1e180 },
    { name: 'SXGNTL', value: 1e183 },
    { name: 'USXGNTL', value: 1e186 },
    { name: 'DSXGNTL', value: 1e189 },
    { name: 'TSXGNTL', value: 1e192 },
    { name: 'QTSXGNTL', value: 1e195 },
    { name: 'QNSXGNTL', value: 1e198 },
    { name: 'SXSXGNTL', value: 1e201 },
    { name: 'SPSXGNTL', value: 1e204 },
    { name: 'OSXGNTL', value: 1e207 },
    { name: 'NVSXGNTL', value: 1e210 },
    { name: 'SPTGNTL', value: 1e213 },
    { name: 'USPTGNTL', value: 1e216 },
    { name: 'DSPTGNTL', value: 1e219 },
    { name: 'TSPTGNTL', value: 1e222 },
    { name: 'QTSPTGNTL', value: 1e225 },
    { name: 'QNSPTGNTL', value: 1e228 },
    { name: 'SXSPTGNTL', value: 1e231 },
    { name: 'SPSPTGNTL', value: 1e234 },
    { name: 'OSPTGNTL', value: 1e237 },
    { name: 'NVSPTGNTL', value: 1e240 },
    { name: 'OTGNTL', value: 1e243 },
    { name: 'UOTGNTL', value: 1e246 },
    { name: 'DOTGNTL', value: 1e249 },
    { name: 'TOTGNTL', value: 1e252 },
    { name: 'QTOTGNTL', value: 1e255 },
    { name: 'QNOTGNTL', value: 1e258 },
    { name: 'SXOTGNTL', value: 1e261 },
    { name: 'SPOTGNTL', value: 1e264 },
    { name: 'OOTGNTL', value: 1e267 },
    { name: 'NVOTGNTL', value: 1e270 },
    { name: 'NONGNTL', value: 1e273 },
    { name: 'UNONGNTL', value: 1e276 },
    { name: 'DNONGNTL', value: 1e279 },
    { name: 'TNONGNTL', value: 1e282 },
    { name: 'QTNONGNTL', value: 1e285 },
    { name: 'QNNONGNTL', value: 1e288 },
    { name: 'SXNONGNTL', value: 1e291 },
    { name: 'SPNONGNTL', value: 1e294 },
    { name: 'OTNONGNTL', value: 1e297 },
    { name: 'NONONGNTL', value: 1e300 },
    { name: 'CENT', value: 1e303 },
    { name: 'UNCENT', value: 1e306 }
];

const rankRequirements = {
    "0": 0,
    "1": 9.00e3, "2": 4.50e4, "3": 2.43e5, "4": 1.41e6, "5": 8.75e6, "6": 5.78e7, "7": 4.05e8, "8": 3.00e9, "9": 2.34e10, "10": 1.17e11,
    "11": 6.31e11, "12": 1.07e12, "13": 2.52e12, "14": 1.50e13, "15": 1.55e14, "16": 7.76e14, "17": 7.06e15, "18": 9.03e16, "19": 1.04e18, "20": 9.49e18,
    "21": 5.88e19, "22": 3.89e20, "23": 2.72e21, "24": 2.01e22, "25": 1.57e23, "26": 7.86e23, "27": 4.24e24, "28": 2.46e25, "29": 1.53e26, "30": 1.01e27,
    "31": 7.05e27, "32": 5.22e28, "33": 4.07e29, "34": 2.04e30, "35": 1.10e31, "36": 6.38e31, "37": 3.96e32, "38": 2.61e33, "39": 1.83e34, "40": 1.35e35,
    "41": 1.06e36, "42": 5.28e36, "43": 2.85e37, "44": 1.66e38, "45": 1.03e39, "46": 6.77e39, "47": 4.74e40, "48": 3.51e41, "49": 2.74e42, "50": 1.37e43,
    "51": 7.40e43, "52": 4.29e44, "53": 2.66e45, "54": 1.76e46, "55": 8.53e46, "56": 9.10e47, "57": 4.10e48, "58": 8.20e48, "59": 4.80e49, "60": 3.36e50,
    "61": 4.90e51, "62": 4.56e52, "63": 3.19e53, "64": 2.36e54, "65": 1.84e55, "66": 9.21e55, "67": 4.97e56, "68": 2.89e57, "69": 1.79e58, "70": 1.18e59,
    "71": 8.28e59, "72": 6.13e60, "73": 4.78e61, "74": 2.39e62, "75": 1.29e63, "76": 7.49e63, "77": 4.64e64, "78": 3.06e65, "79": 2.15e66, "80": 1.60e67,
    "81": 1.25e68, "82": 7.49e68, "83": 4.79e69, "84": 3.26e70, "85": 2.35e71, "86": 1.00e74, "87": 1.00e75, "88": 1.50e76, "89": 5.00e76, "90": 2.50e77,
    "91": 2.00e78, "92": 1.00e79, "93": 5.00e79, "94": 5.00e80, "95": 5.00e81, "96": 5.00e83, "97": 2.50e85, "98": 2.50e86, "99": 2.50e87, "100": 1.00e89,
    "101": 7.50e89, "102": 3.00e90, "103": 3.00e91, "104": 2.50e92, "105": 1.00e93, "106": 1.00e94, "107": 1.50e95, "108": 7.50e95, "109": 5.00e96, "110": 5.00e97,
    "111": 5.00e98, "112": 1.00e100, "113": 5.00e100, "114": 2.50e101, "115": 1.00e102, "116": 3.00e103, "117": 1.50e104, "118": 7.50e104, "119": 9.00e106, "120": "900E+105", 
	"121": 1.80E+109, "122": 15.00E+109, "123": 5.00e+111, "124": 50.00e+111, "125": 900.00e+111, "126": 35.00e+114, "127": 350.00e+114, "128": 70.00e+116,
	"129": 90.00e+117, "130": 1.00e+120, "131": 1.50E+121, "132": 1.50E+122, "133": 2.00E+123, "134": 2.50E+124, "135": 2.00E+125, "136": 9.50E+126, "137": 1.10E+128, 
    "138": 1.50E+129, "139": 3.00E+130, "140": 5.00E+131, "141": 5.00E+132, "142": 50.0E+132, "143": 500.0E+132, "144": 2.50E+135, "145": 5.00E+135, "146": 2E+138,
    "147": 10E+138, "148": 5.00E+139, "149": 2.00E+140, "150": 2.00E+141, "151": 1.00E+143, "152": 1.00E+144, "153": 1.00E+145, "154":5.00E+145, "155":2.50E+146,
    "156": 2.00E+148, "157": 1.00E+149, "158": 1.50E+150, "159": 2.50E+151, "160": 7.50E+151
};

const worldData = {
    "Halloween World": {
        "enemies": {
            "Carrotto": 3.12E+33,
            "Evil Bald Man": 2.96E+59,
            "Pumpkinado": 9.67E+86,
            "Bald Warlock": 1.52E+120,
            "Spook-suke": 3.88E+164,
        }
    },
    "Earth City": {
        "enemies": {
            "Kriluni": 5000.0,
            "Ymicha": 230000.0,
            "Tian Shan": 5000000.0,
            "Kohan": 30000000.0,
            "Picco": 100000000.0,
            "Koku": 240000000.0,
            "Kid Kohan": 2500000000000000.0
        }
    },
    "Windmill Island": {
        "enemies": {
            "Nomi": 4500000000.0,
            "Usup": 70000000000.0,
            "Robins": 250000000000.0,
            "Senji": 1200000000000.0,
            "Zaro": 50000000000000.0,
            "Loffy": 120000000000000.0,
            "Shanks": 5e+21
        }
    },
    "Soul Society": {
        "enemies": {
            "Hime": 150000000000000.0,
            "Ichige": 2500000000000000.0,
            "Uryua": 5.5e+16,
            "Rakiu": 1.6e+17,
            "Yoichi": 8.5e+17,
            "Kahara": 1e+18,
            "Eizen": 2.5e+24
        }
    },
    "Cursed School": {
        "enemies": {
            "Itodo": 1.5e+18,
            "Nebara": 5e+19,
            "Magum": 1.1e+20,
            "Meki": 4.75e+20,
            "Tage": 9.69e+21,
            "Gajo": 5e+22,
            "Sakuni": 1.2e+26
        }
    },
    "Slayer Village": {
        "enemies": {
            "Nazuki": 1e+23,
            "Tenjar": 5e+23,
            "Zentsu": 2.5e+24,
            "Insake": 1.25e+25,
            "Tamoka": 6.26e+25,
            "Shinabe": 3.12e+26,
            "Rangoki": 3.12e+34
        }
    },
    "Solo Island": {
        "enemies": {
            "Weak Sung": 6.25e+26,
            "Green Goblin": 3.12e+27,
            "White Tiger": 1.56e+28,
            "Cha": 7.81e+28,
            "Choi": 3.91e+29,
            "Solo Sung": 1.95e+30,
            "Statue of God": 1.95e+38
        }
    },
    "Clover Village": {
        "enemies": {
            "Noalle": 7.8e+30,
            "Megna": 8e+31,
            "Finrel": 8.43e+32,
            "Aste": 9.08e+33,
            "Yune": 9.57e+34,
            "Yemi": 1.01e+36,
            "Novi Chroni": 1.01e+44
        }
    },
    "Leaf Village": {
        "enemies": {
            "Sekuri": 2.69e+35,
            "Kid Norto": 2.29e+36,
            "Kid Seske": 2.41e+37,
            "Kakashki": 2.54e+38,
            "Jiria": 2.68e+39,
            "Tsuni": 2.82e+40,
            "Itechi": 2.82e+48,
            "Madera": 5.64e+48
        }
    },
    "Spirit Residence": {
        "enemies": {
            "Ken": 5e+40,
            "Aira": 4e+41,
            "Jiji": 4.22e+42,
            "Momo": 4.44e+43,
            "Alien": 4.68e+44,
            "Saiko": 4.94e+45,
            "Ken Turbo": 4.94e+53
        }
    },
    "Magic Hunter City": {
        "enemies": {
            "Lero": 3e+46,
            "Gone": 2.4e+47,
            "Karapik": 2.53e+48,
            "Killas": 2.67e+49,
            "Hisoker": 2.81e+50,
            "Illumio": 2.96e+51,
            "Killas Godspeed": 2.96e+59
        }
    },
    "Titan City": {
        "enemies": {
            "Armin": 5e+51,
            "Annie": 4e+52,
            "Mikala": 4.22e+53,
            "Rainar": 4.44e+54,
            "Ervin": 4.68e+55,
            "Lavi": 4.94e+56,
            "Eran": 4.94e+64
        }
    },
    "Village of Sins": {
        "enemies": {
            "Diyana": 9.9e+56,
            "Kyng": 7.92e+57,
            "Gowen": 8.35e+58,
            "Merlu": 8.8e+59,
            "Bane": 9.27e+60,
            "Melyon": 9.77e+61,
            "Esanor": 9.77e+69
        }
    },
    "Kaiju Base": {
        "enemies": {
            "Kefka": 5e+62,
            "Rano": 4.5e+63,
            "Ihero": 4.74e+64,
            "Kikoi": 5e+65,
            "Sosiro": 5.27e+66,
            "Meena": 5.55e+67,
            "Number 8": 5.55e+75
        }
    },
    "Tempest Capital": {
        "enemies": {
            "Gobito": 2.73e+68,
            "Gabido": 2.73e+69,
            "Sakai": 4.1e+70,
            "Hakamaru": 4.32e+71,
            "Benitaro": 4.55e+72,
            "Rimaru": 4.79e+73,
            "Valzora": 4.79e+81
        }
    },
    "Virtual City": {
        "enemies": {
            "Lisbeta": 9.58e+73,
            "Silica": 7.66e+74,
            "Klain": 8.08e+75,
            "Yai": 8.71e+76,
            "Asana": 9.18e+77,
            "Beater": 9.67e+78,
            "The Paladin": 9.67e+86
        }
    },
    "Cairo": {
        "enemies": {
            "Speedy": 1.93e+79,
            "Cesar": 1.54e+80,
            "Joseph": 1.63e+81,
            "Polyreff": 1.75e+82,
            "Avdoli": 1.85e+83,
            "Jokaro": 1.94e+84,
            "Dino": 1.95e+92
        }
    },
    "Ghoul City": {
        "enemies": {
            "Hideyo": 6.79e+85,
            "Joozu": 5.43e+86,
            "Madyo": 5.73e+87,
            "Kotaro": 6.17e+88,
            "Toaoka": 6.51e+89,
            "Kanny": 6.86e+90,
            "Arama": 6.86e+98
        }
    },
    "Chainsaw City": {
        "enemies": {
            "Kabeni": 3.95e+93,
            "Benji": 4.15e+94,
            "Powa": 4.36e+95,
            "Aoki": 4.59e+96,
            "Raza": 4.83e+97,
            "Makomi": 5.09e+98,
            "Mr Chainsaw": 5.09e+102,
            "Hero of Hell": 5.09e+106
        }
    },
    "Tokyo Empire": {
        "enemies": {
            "Akiki": 2.04e+99,
            "Arter": 1.63e+100,
            "Shinro": 1.47e+101,
            "Tameki": 1.58e+102,
            "Iriso": 1.67e+103,
            "Witch Queen": 1.75e+104,
            "Leonardo": 1.76e+108,
            "Bansho": 1.76e+112
        }
    },
    "Green Planet": {
        "enemies": {
            "Bulam": 1.76e+111,
            "Young Kohan": 1.41e+112,
            "Armored Kriluni": 1.27e+113,
            "Giniy": 1.37e+114,
            "Vegeti": 1.44e+115,
            "Lord Frizzi": 1.52e+116,
            "Koku SSJ": 1.52e+120,
            "Frizzi Final Form": 1.52e+124
        }
    },
    "Hollow World": {
        "enemies": {
            "Ohime": 1.01e+120,
            "Ichiga": 8e+120,
            "Chaddo": 7.28e+121,
            "Zayrel": 7.85e+122,
            "Uloqi": 8.27e+123,
            "Grimmi": 8.72e+124,
            "Cifer": 8.72e+127,
            "Vasto Ichige": 8.72e+131
        }
    },
    "Shadow Academy": {
        "enemies": {
            "Cyd": 3.54e+127,
            "Zeta": 2.83e+128,
            "Delta": 2.55e+129,
            "Beta": 2.75e+130,
            "Gamma": 2.9e+131,
            "Alpha": 3.05e+132,
            "Blood Queen": 3.05e+136,
            "Shadow": 3.05e+140
        }
    },
    "Z City": {
        "enemies": {
            "Crabby": 2.29e+136,
            "Mantis": 4.58e+137,
            "Tatsura": 9.16e+138,
            "Ganos": 1.83e+140,
            "King of Seas": 3.66e+141,
            "Bald Man": 7.33e+142,
            "Lord Boro": 7.33e+146,
            "Galaxy Hunter": 7.33e+150
        }
    },
    "Great Tomb": {
        "enemies": {
            "Pandoros Actor": 4.8e+146,
            "Auro": 3.84e+147,
            "Maro": 3.46e+148,
            "Sebes": 3.73e+149,
            "Shaltir": 3.93e+150,
            "Demurge": 4.14e+151,
            "Albedia": 4.14e+155,
            "Anz Ool Gawn": 4.14e+159
        }
    },
	"Thriller Park": {
        "enemies": {
            "Robini": 2.25e+155,
            "Perina": 1.80e+156,
            "Franq": 3.24e+157,
            "Brukk": 3.49e+158,
            "Nightmare Loffy": 3.68e+159,
            "Orrs": 3.88e+160,
            "Riuma": 3.88e+164,
			"Riuma 20%": 7.74E+163,
            "Gekar Morra": 3.88e+168
        }
    },
	"Amusement Park": {
        "enemies": {
            "Masumo": 2.90E+164,
            "Lu Shaoran": 2.90E+165,
            "Shiru": 5.22E+166,
            "Nakumo": 5.63E+167,
            "Sakomura": 5.93E+168,
            "Shibasa": 6.25E+169,
            "Hayo": 6.25E+173,
			"Hayo 20%": 1.25E+173,
            "Tagamura": 6.25E+177,
            "Takemoto": 6.25E+178
        }
    },
    "Re:Manor": {
        "enemies": {
            "Sabaru": 3.10E+173,
            "Rammy": 3.10E+174,
            "Remmy": 5.58E+175,
            "Fredrika": 6.02E+176,
            "Felis": 6.34E+177,
            "Emilli": 6.68E+178,
            "Bellatrice": 6.68E+182,
			"Bellatrice 20%": 1.33E+182,
            "Roswald": 6.68E+186
        }
    },
    "Asfordo Academy": {
        "enemies": {
            "Euphy": "6.68e181",
            "Reloush": "1.34e183",
            "Ogi": "2.4e184",
            "Anja": "2.58e185",
            "Kalla": "2.73e186",
            "Susaku": "2.88e187",
            "Zero": "2.88e191",
			"Zero 20%": "57.6e189",
            "Emperor Reloush": "2.88e195"
        }
    },
        "Science Village": {
        "enemies": {
            "Chromel": "8.23e189",
            "Senko": "5.76e191",
            "Genru": "1.04e193",
            "Ginrai": "1.14e194",
            "Uryon": "1.25e195",
            "Taiko": "1.38e196",
            "Kohara": "1.38e200",
			"Kohara 20%": "27.6e198",
            "Tsukaro": "1.38e204"
        }
    },
        "Sand Village": {
        "enemies": {
            "Shikomeru": "6.9e199",
            "Kenkoro": "2.07e201",
            "Kaboto": "3.73e202",
            "Temoro": "4.02e203",
            "Deidi": "4.32e204",
            "Hiruken": "4.46e205",
            "Gaari": "4.46e209",
			"Gaari 20%": "89.2e207",
            "Sasaru": "4.46e213"
        }
    },
        "Night Raid Base": {
        "enemies": {
            "Sheene": "4.46e208",
            "Vols": "1.34e210",
            "Leina": "2.41e211",
            "Buran": "2.6e212",
            "Tatsumo": "2.74e213",
            "Kurona": "2.89e214",
            "Susanoe": "2.89e218",
			"Susanoe 20%": "5.78e217",
            "Akara": "2.89e222"
        }
    },
    "Salty School": {
        "enemies": {
            "Arataki": "2.89e217",
            "Taruka": "8.66e218",
            "Retsu": "1.56e220",
            "Mob": "1.67e221",
            "Shoi": "1.77e222",
            "Kurona": "1.87e223",
            "Mob 100%": "1.87e227",
			"Mob 100% 20%": "3.74e226",
            "Dimpy": "1.87e231"
        }
    }
};