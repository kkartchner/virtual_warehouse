class Aisle {
    constructor(west_lvl_cnt, east_lvl_cnt) {
        this.west_lvl_cnt = west_lvl_cnt;
        this.east_lvl_cnt = east_lvl_cnt;
    }
}

let vars = {
    aisleCount: 11,
    aisleLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],

    aisleList: [
    new Aisle(2, 0), // Aisle 1 top-west, bottom-east 
    new Aisle(1, 3),  // Aisle 2
    new Aisle(3, 4),  // Aisle 3
    new Aisle(4, 2),  // Aisle 4
    new Aisle(0, 4),  // Aisle 5

    new Aisle (2, 0), // Aisle 6
    new Aisle(4, 3),  // Aisle 7
    new Aisle(4, 3),  // Aisle 8
    new Aisle(4, 3),  // Aisle 9
    new Aisle(3, 2),  // Aisle 10
    new Aisle(0, 3),  // Aisle 11
    ],

    twelvers: [['E', 'H'],  // Aisle 1
    ['A', 'D'],  // Aisle 2
    ['E', 'H'],  // Aisle 3
    ['A', 'D'],  // Aisle 4
    ['E', 'H'],  // Aisle 5

    ['A', 'D'],   // Aisle 6
    ['A', 'D'],  // Aisle 7
    ['E', 'H'],  // Aisle 8
    ['A', 'D'],  // Aisle 9
    ['E', 'H'],  // Aisle 10
    ['A', 'D']  // Aisle 11
    ],

    flip_aisles: [2, 4, 6, 7, 9, 11],
}