// Standard medical reference table (approximate)
export const babyGrowthData = {
    1: { weightGrams: 0, lengthCm: 0 },
    2: { weightGrams: 0, lengthCm: 0 },
    3: { weightGrams: 0, lengthCm: 0 }, // Blastocyst
    4: { weightGrams: 0.1, lengthCm: 0.1 }, // Poppy seed
    5: { weightGrams: 0.1, lengthCm: 0.2 }, // Sesame seed
    6: { weightGrams: 0.2, lengthCm: 0.5 }, // Lentil
    7: { weightGrams: 0.5, lengthCm: 1.0 }, // Blueberry
    8: { weightGrams: 1, lengthCm: 1.6 }, // Kidney bean
    9: { weightGrams: 2, lengthCm: 2.3 }, // Grape
    10: { weightGrams: 4, lengthCm: 3.1 }, // Kumquat
    11: { weightGrams: 7, lengthCm: 4.1 }, // Fig
    12: { weightGrams: 14, lengthCm: 5.4 }, // Lime
    13: { weightGrams: 23, lengthCm: 7.4 }, // Lemon
    14: { weightGrams: 43, lengthCm: 8.7 }, // Nectarine
    15: { weightGrams: 70, lengthCm: 10.1 }, // Apple
    16: { weightGrams: 100, lengthCm: 11.6 }, // Avocado
    17: { weightGrams: 140, lengthCm: 13 }, // Turnip
    18: { weightGrams: 190, lengthCm: 14.2 }, // Bell pepper
    19: { weightGrams: 240, lengthCm: 15.3 }, // Heirloom tomato
    20: { weightGrams: 300, lengthCm: 16.4 }, // Banana
    21: { weightGrams: 360, lengthCm: 26.7 }, // Carrot
    22: { weightGrams: 430, lengthCm: 27.8 }, // Spaghetti squash
    23: { weightGrams: 500, lengthCm: 28.9 }, // Large mango
    24: { weightGrams: 600, lengthCm: 30 }, // Corn
    25: { weightGrams: 660, lengthCm: 34.6 }, // Rutabaga
    26: { weightGrams: 760, lengthCm: 35.6 }, // Scallion
    27: { weightGrams: 875, lengthCm: 36.6 }, // Cauliflower
    28: { weightGrams: 1000, lengthCm: 37.6 }, // Eggplant
    29: { weightGrams: 1150, lengthCm: 38.6 }, // Butternut squash
    30: { weightGrams: 1300, lengthCm: 39.9 }, // Cabbage
    31: { weightGrams: 1500, lengthCm: 41.1 }, // Coconut
    32: { weightGrams: 1700, lengthCm: 42.4 }, // Kale
    33: { weightGrams: 1900, lengthCm: 43.7 }, // Pineapple
    34: { weightGrams: 2100, lengthCm: 45 }, // Cantaloupe
    35: { weightGrams: 2380, lengthCm: 46.2 }, // Honeydew melon
    36: { weightGrams: 2600, lengthCm: 47.4 }, // Papaya
    37: { weightGrams: 2850, lengthCm: 48.6 }, // Swiss chard
    38: { weightGrams: 3080, lengthCm: 49.8 }, // Leek
    39: { weightGrams: 3280, lengthCm: 50.7 }, // Mini watermelon
    40: { weightGrams: 3500, lengthCm: 51.2 }, // Small pumpkin
    41: { weightGrams: 3600, lengthCm: 51.7 },
    42: { weightGrams: 3700, lengthCm: 52 }
};

export const getBabyGrowth = (week) => {
    // If week < 4, return null (too early)
    if (week < 4) return null;

    // Cap at 42 (or 40 if user requested strict 40 cap, but 42 is safer for "overdue")
    // User asked "max 40"
    if (week > 40) return babyGrowthData[40];

    return babyGrowthData[week] || null;
};
