// ======================================================
// STUDENT LIFE
// CAMPUS PROTOTYPE
// WORLD SYSTEM V3
// NPC DIALOGUE SYSTEM
// ======================================================


// ======================================================
// PLAYER DATA
// ======================================================

let playerData = {
    id: null,

    name: "",
    age: 18,
    gender: "",
    course: "",

    money: 20000,

    health: 100,
    energy: 100,
    hunger: 100,
    happiness: 100,

    day: 1,
    hour: 8,
    minute: 0,

    inventory: {
        food: 0,
        data: 0,
        books: 0,
        clothes: 0
    }
};


// ======================================================
// GAME VARIABLES
// ======================================================

let game = null;
let gameScene = null;

let player = null;
let playerNameLabel = null;

let cursors = null;
let wasd = null;
let interactKey = null;
let escapeKey = null;

let interactionText = null;
let messageText = null;

let moneyText = null;
let healthText = null;
let energyText = null;
let hungerText = null;
let happinessText = null;
let timeText = null;
let dayText = null;

let shopPanel = null;
let inventoryPanel = null;

// ======================================================
// DIALOGUE VARIABLES
// ======================================================

let dialoguePanel = null;
let dialogueNameText = null;
let dialogueBodyText = null;
let dialogueHintText = null;
let dialogueChoiceTexts = [];

let activeNPC = null;
let activeDialogueNode = null;

let npcs = [];

let currentLocation = null;

let messageTimer = null;
let gameClock = null;

const SPEED = 4;


// ======================================================
// WORLD SETTINGS
// ======================================================

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;


// ======================================================
// LOCATIONS
// ======================================================

const locations = {

    university: {
        x: 500,
        y: 260,
        width: 500,
        height: 220,
        radius: 270
    },

    lectureHall: {
        x: 500,
        y: 680,
        radius: 150
    },

    lawFaculty: {
        x: 820,
        y: 1020,
        radius: 170
    },

    library: {
        x: 1500,
        y: 1050,
        radius: 170
    },

    hostel: {
        x: 1880,
        y: 270,
        width: 400,
        height: 220,
        radius: 230
    },

    kitchen: {
        x: 280,
        y: 1330,
        width: 280,
        height: 110,
        radius: 160
    },

    shop: {
        x: 700,
        y: 1330,
        width: 280,
        height: 110,
        radius: 160
    },

    busStop: {
        x: 1240,
        y: 190,
        radius: 130
    },

    job: {
        x: 1660,
        y: 1410,
        width: 280,
        height: 100,
        radius: 160
    },

    residence: {
        x: 300,
        y: 850,
        radius: 170
    }

};


// ======================================================
// CHARACTER CREATION
// ======================================================

const characterForm =
    document.getElementById("character-form");


characterForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("player-name")
            .value
            .trim();

    const age =
        Number(
            document
                .getElementById("player-age")
                .value
        );

    const gender =
        document
            .getElementById("player-gender")
            .value;

    const course =
        document
            .getElementById("player-course")
            .value
            .trim();


    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!age || age < 16 || age > 60) {
        alert("Please enter a valid age.");
        return;
    }

    if (!gender) {
        alert("Please select your gender.");
        return;
    }

    if (!course) {
        alert("Please enter your course.");
        return;
    }


    playerData.id =
        crypto.randomUUID();

    playerData.name = name;
    playerData.age = age;
    playerData.gender = gender;
    playerData.course = course;


    console.log("PLAYER:", playerData);


    document
        .getElementById("character-creation")
        .style.display = "none";


    startGame();
});


// ======================================================
// START GAME
// ======================================================

function startGame() {

    const config = {

        type: Phaser.AUTO,

        width: 1280,
        height: 720,

        parent: "game-container",

        backgroundColor: "#5f914c",

        physics: {

            default: "arcade",

            arcade: {

                gravity: {
                    y: 0
                },

                debug: false
            }
        },

        scene: {

            preload,

            create,

            update
        }
    };


    game =
        new Phaser.Game(config);
}


// ======================================================
// PRELOAD
// ======================================================

function preload() {

}


// ======================================================
// CREATE
// ======================================================

function create() {

    gameScene = this;

    createWorld();

    createPlayer();

    createNPCs();

    createControls();

    createHUD();

    createInteractionUI();

    setupCamera();

    startClock();
}


// ======================================================
// WORLD
// ======================================================

function createWorld() {

    // ==================================================
    // MAIN GROUND
    // ==================================================

    gameScene.add.rectangle(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        0x6fa34f
    );


    // ==================================================
    // SECONDARY GRASS AREAS
    // ==================================================

    gameScene.add.rectangle(
        1200,
        550,
        2200,
        420,
        0x75aa52
    );


    gameScene.add.rectangle(
        1200,
        1250,
        2200,
        500,
        0x659947
    );


    // ==================================================
    // MAIN HORIZONTAL ROAD
    // ==================================================

    gameScene.add.rectangle(
        1200,
        600,
        WORLD_WIDTH,
        150,
        0x3e3e3e
    );


    gameScene.add.rectangle(
        1200,
        520,
        WORLD_WIDTH,
        8,
        0xcfcfcf
    );


    gameScene.add.rectangle(
        1200,
        680,
        WORLD_WIDTH,
        8,
        0xcfcfcf
    );


    for (
        let x = 30;
        x < WORLD_WIDTH;
        x += 120
    ) {

        gameScene.add.rectangle(
            x,
            600,
            70,
            6,
            0xffffff
        );
    }


    // ==================================================
    // MAIN VERTICAL ROAD
    // ==================================================

    gameScene.add.rectangle(
        1240,
        800,
        130,
        1600,
        0x3e3e3e
    );


    gameScene.add.rectangle(
        1170,
        800,
        7,
        1600,
        0xcfcfcf
    );


    gameScene.add.rectangle(
        1310,
        800,
        7,
        1600,
        0xcfcfcf
    );


    for (
        let y = 50;
        y < WORLD_HEIGHT;
        y += 100
    ) {

        gameScene.add.rectangle(
            1240,
            y,
            6,
            55,
            0xffffff
        );
    }


    // ==================================================
    // NORTH CAMPUS ROAD
    // ==================================================

    gameScene.add.rectangle(
        650,
        330,
        1000,
        80,
        0x484848
    );


    for (
        let x = 180;
        x < 1120;
        x += 110
    ) {

        gameScene.add.rectangle(
            x,
            330,
            55,
            4,
            0xffffff
        );
    }


    // ==================================================
    // SOUTH CAMPUS ROAD
    // ==================================================

    gameScene.add.rectangle(
        750,
        1120,
        1100,
        80,
        0x484848
    );


    for (
        let x = 200;
        x < 1250;
        x += 110
    ) {

        gameScene.add.rectangle(
            x,
            1120,
            55,
            4,
            0xffffff
        );
    }


    // ==================================================
    // UNIVERSITY
    // ==================================================

    drawBuilding(
        locations.university.x,
        locations.university.y,
        locations.university.width,
        locations.university.height,
        0xd9c49c,
        "OSUN VALLEY\nUNIVERSITY"
    );


    gameScene.add.rectangle(
        500,
        400,
        230,
        35,
        0x9c9c9c
    );


    gameScene.add.rectangle(
        500,
        420,
        190,
        25,
        0xbcbcbc
    );


    // ==================================================
    // LECTURE HALL
    // ==================================================

    drawBuilding(
        locations.lectureHall.x,
        locations.lectureHall.y,
        300,
        180,
        0xc7d5dd,
        "LECTURE\nHALL"
    );


    // ==================================================
    // LAW FACULTY
    // ==================================================

    drawBuilding(
        locations.lawFaculty.x,
        locations.lawFaculty.y,
        330,
        190,
        0xc7b89c,
        "FACULTY OF\nLAW"
    );


    // ==================================================
    // LIBRARY
    // ==================================================

    drawBuilding(
        locations.library.x,
        locations.library.y,
        350,
        190,
        0xb6c7d8,
        "UNIVERSITY\nLIBRARY"
    );


    // ==================================================
    // HOSTEL
    // ==================================================

    drawBuilding(
        locations.hostel.x,
        locations.hostel.y,
        locations.hostel.width,
        locations.hostel.height,
        0xbcc9d6,
        "STUDENT\nHOSTEL"
    );


    // ==================================================
    // HOSTEL BLOCKS
    // ==================================================

    drawSmallBuilding(
        1580,
        300,
        210,
        150,
        0xaab9c6,
        "HOSTEL A"
    );


    drawSmallBuilding(
        2180,
        300,
        210,
        150,
        0xaab9c6,
        "HOSTEL B"
    );


    // ==================================================
    // BUS TERMINAL
    // ==================================================

    gameScene.add.rectangle(
        locations.busStop.x,
        locations.busStop.y,
        240,
        100,
        0x98704e
    );


    gameScene.add.rectangle(
        locations.busStop.x,
        locations.busStop.y - 60,
        270,
        15,
        0x70452e
    );


    gameScene.add.text(
        locations.busStop.x,
        locations.busStop.y,
        "BUS TERMINAL",
        {
            fontSize: "23px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center"
        }
    ).setOrigin(0.5);


    // ==================================================
    // MAMA'S KITCHEN
    // ==================================================

    drawSmallBuilding(
        locations.kitchen.x,
        locations.kitchen.y,
        locations.kitchen.width,
        locations.kitchen.height,
        0xe4ad32,
        "MAMA'S\nKITCHEN"
    );


    // ==================================================
    // CAMPUS SHOP
    // ==================================================

    drawSmallBuilding(
        locations.shop.x,
        locations.shop.y,
        locations.shop.width,
        locations.shop.height,
        0x8eaed1,
        "CAMPUS\nSHOP"
    );


    // ==================================================
    // STUDENT WORK
    // ==================================================

    drawSmallBuilding(
        locations.job.x,
        locations.job.y,
        locations.job.width,
        locations.job.height,
        0x7e6a9c,
        "STUDENT\nWORK"
    );


    // ==================================================
    // STUDENT RESIDENCE
    // ==================================================

    drawBuilding(
        locations.residence.x,
        locations.residence.y,
        300,
        170,
        0xcaa9a9,
        "STUDENT\nRESIDENCE"
    );


    // ==================================================
    // CAFETERIA
    // ==================================================

    drawSmallBuilding(
        1050,
        850,
        280,
        130,
        0xd29d6c,
        "CAMPUS\nCAFETERIA"
    );


    // ==================================================
    // SPORTS AREA
    // ==================================================

    gameScene.add.rectangle(
        1900,
        900,
        450,
        260,
        0x4d8748
    );


    gameScene.add.rectangle(
        1900,
        900,
        400,
        210,
        0x579a4f
    ).setStrokeStyle(
        5,
        0xffffff
    );


    gameScene.add.line(
        1900,
        900,
        1700,
        900,
        2100,
        900,
        0xffffff
    ).setLineWidth(3);


    gameScene.add.text(
        1900,
        900,
        "SPORTS\nFIELD",
        {
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center"
        }
    ).setOrigin(0.5);


    // ==================================================
    // CAMPUS SIGN
    // ==================================================

    createWorldSign(
        1100,
        450,
        "IFETEDO CAMPUS"
    );


    // ==================================================
    // WORLD TREES
    // ==================================================

    createLargeTreeMap();


    // ==================================================
    // SMALL PATHS
    // ==================================================

    createPath(
        500,
        440,
        500,
        560
    );


    createPath(
        820,
        1120,
        820,
        1250
    );


    createPath(
        1500,
        950,
        1500,
        800
    );


    createPath(
        700,
        1330,
        1000,
        1330
    );


    // ==================================================
    // WORLD BORDER
    // ==================================================

    gameScene.add.rectangle(
        WORLD_WIDTH / 2,
        20,
        WORLD_WIDTH,
        40,
        0x315b32
    );


    gameScene.add.rectangle(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT - 20,
        WORLD_WIDTH,
        40,
        0x315b32
    );


    gameScene.add.rectangle(
        20,
        WORLD_HEIGHT / 2,
        40,
        WORLD_HEIGHT,
        0x315b32
    );


    gameScene.add.rectangle(
        WORLD_WIDTH - 20,
        WORLD_HEIGHT / 2,
        40,
        WORLD_HEIGHT,
        0x315b32
    );
}


// ======================================================
// PATH HELPER
// ======================================================

function createPath(
    x1,
    y1,
    x2,
    y2
) {

    const width =
        Math.abs(x2 - x1);

    const height =
        Math.abs(y2 - y1);


    gameScene.add.rectangle(
        (x1 + x2) / 2,
        (y1 + y2) / 2,
        Math.max(width, 35),
        Math.max(height, 35),
        0xc9b27c
    );
}


// ======================================================
// BUILDING HELPERS
// ======================================================

function drawBuilding(
    x,
    y,
    width,
    height,
    color,
    text
) {

    gameScene.add.rectangle(
        x + 10,
        y + 12,
        width,
        height,
        0x315031,
        0.25
    );


    gameScene.add.rectangle(
        x,
        y,
        width,
        height,
        color
    );


    gameScene.add.rectangle(
        x,
        y - height / 2 - 18,
        width * 0.78,
        36,
        0x754b3d
    );


    gameScene.add.rectangle(
        x,
        y + height / 2 - 30,
        42,
        60,
        0x53382c
    );


    const windowY =
        y - 20;


    gameScene.add.rectangle(
        x - width / 3,
        windowY,
        45,
        35,
        0x9bd3e6
    );


    gameScene.add.rectangle(
        x + width / 3,
        windowY,
        45,
        35,
        0x9bd3e6
    );


    gameScene.add.text(
        x,
        y - 50,
        text,
        {
            fontSize: "25px",
            color: "#202020",
            fontStyle: "bold",
            align: "center"
        }
    ).setOrigin(0.5);
}


function drawSmallBuilding(
    x,
    y,
    width,
    height,
    color,
    text
) {

    gameScene.add.rectangle(
        x + 8,
        y + 10,
        width,
        height,
        0x315031,
        0.25
    );


    gameScene.add.rectangle(
        x,
        y,
        width,
        height,
        color
    );


    gameScene.add.rectangle(
        x,
        y - height / 2 - 10,
        width * 0.85,
        20,
        0x70452e
    );


    gameScene.add.rectangle(
        x,
        y + height / 2 - 25,
        38,
        50,
        0x53382c
    );


    gameScene.add.text(
        x,
        y - 5,
        text,
        {
            fontSize: "20px",
            color: "#202020",
            fontStyle: "bold",
            align: "center"
        }
    ).setOrigin(0.5);
}


// ======================================================
// WORLD SIGN
// ======================================================

function createWorldSign(
    x,
    y,
    text
) {

    gameScene.add.rectangle(
        x,
        y,
        260,
        65,
        0x513a2c
    );


    gameScene.add.rectangle(
        x,
        y - 40,
        12,
        80,
        0x53382c
    );


    gameScene.add.rectangle(
        x + 115,
        y - 40,
        12,
        80,
        0x53382c
    );


    gameScene.add.text(
        x,
        y,
        text,
        {
            fontSize: "21px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    ).setOrigin(0.5);
}


// ======================================================
// TREES
// ======================================================

function createLargeTreeMap() {

    const treePositions = [

        [90, 120],
        [170, 300],
        [90, 540],
        [170, 720],
        [90, 980],
        [150, 1200],
        [90, 1450],

        [350, 520],
        [700, 520],
        [920, 520],
        [1050, 520],

        [1450, 140],
        [1600, 120],
        [1750, 120],
        [2050, 120],
        [2300, 120],

        [1450, 520],
        [1600, 520],
        [1780, 520],
        [2100, 520],
        [2280, 520],

        [1450, 760],
        [1600, 760],
        [1750, 760],
        [2200, 760],

        [1400, 1250],
        [1550, 1250],
        [1750, 1250],
        [1950, 1250],
        [2200, 1250],

        [400, 1450],
        [600, 1450],
        [1000, 1450],
        [1200, 1450],

        [2100, 1450],
        [2300, 1450]
    ];


    treePositions.forEach(function(pos) {

        createTree(
            pos[0],
            pos[1]
        );
    });
}


// ======================================================
// TREE
// ======================================================

function createTree(
    x,
    y
) {

    gameScene.add.ellipse(
        x,
        y + 35,
        60,
        20,
        0x315031,
        0.3
    );


    gameScene.add.rectangle(
        x,
        y + 28,
        12,
        38,
        0x704b32
    );


    gameScene.add.circle(
        x,
        y,
        28,
        0x246b35
    );


    gameScene.add.circle(
        x - 18,
        y + 8,
        22,
        0x2f7a3c
    );


    gameScene.add.circle(
        x + 18,
        y + 8,
        22,
        0x2f7a3c
    );


    gameScene.add.circle(
        x,
        y - 18,
        22,
        0x398a43
    );
}


// ======================================================
// PLAYER
// ======================================================

function createPlayer() {

    player =
        gameScene.add.circle(
            1200,
            800,
            22,
            0x1e40af
        );


    player.setStrokeStyle(
        3,
        0xffffff
    );


    playerNameLabel =
        gameScene.add.text(
            1200,
            765,
            playerData.name,
            {
                fontSize: "15px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 3
            }
        ).setOrigin(0.5);
}


// ======================================================
// NPCS
// ======================================================

function createNPCs() {

    const students = [

        {
            name: "Tobi",
            x: 430,
            y: 560,
            color: 0xc2410c
        },

        {
            name: "Amaka",
            x: 850,
            y: 760,
            color: 0x9333ea
        },

        {
            name: "David",
            x: 1050,
            y: 1040,
            color: 0x15803d
        },

        {
            name: "Zainab",
            x: 1450,
            y: 650,
            color: 0xdb2777
        },

        {
            name: "Kelechi",
            x: 1760,
            y: 760,
            color: 0xd97706
        },

        {
            name: "Samuel",
            x: 2080,
            y: 1050,
            color: 0x2563eb
        },

        {
            name: "Blessing",
            x: 640,
            y: 1250,
            color: 0xe11d48
        },

        {
            name: "Yusuf",
            x: 900,
            y: 1450,
            color: 0x0891b2
        }
    ];


    students.forEach(function(student) {

        const body =
            gameScene.add.circle(
                student.x,
                student.y,
                18,
                student.color
            );


        body.setStrokeStyle(
            2,
            0xffffff
        );


        const label =
            gameScene.add.text(
                student.x,
                student.y - 30,
                student.name,
                {
                    fontSize: "13px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 3
                }
            ).setOrigin(0.5);


        npcs.push({

            body,

            label,

            name: student.name,

            direction:
                Math.random() > 0.5
                    ? 1
                    : -1,

            friendship: 0
        });
    });
}


// ======================================================
// NPC DIALOGUE DATA
// ======================================================

const dialogueScripts = {

    // ==================================================
    // TOBI
    // ==================================================

    Tobi: {

        start: {

            text:
                "Omo! You just dey roam around? You get class today?",

            choices: [

                {
                    text: "Yeah, I have a lecture.",
                    next: "class",
                    friendship: 2
                },

                {
                    text: "Nope, I'm just exploring.",
                    next: "exploring",
                    friendship: 1
                },

                {
                    text: "What's happening on campus?",
                    next: "campus",
                    friendship: 3
                }

            ]
        },


        class: {

            text:
                "Same here. I'm trying not to miss my next class. This campus fit make person walk tire.",

            choices: [

                {
                    text: "We can head there together.",
                    next: "friends",
                    friendship: 3
                },

                {
                    text: "Good luck bro.",
                    next: "goodluck",
                    friendship: 1
                },

                {
                    text: "Maybe later.",
                    next: "later",
                    friendship: -1
                }

            ]
        },


        exploring: {

            text:
                "Exploring? Nice. You go discover plenty things if you sabi where to look.",

            choices: [

                {
                    text: "Show me around sometime.",
                    next: "friends",
                    friendship: 3
                },

                {
                    text: "I like discovering things myself.",
                    next: "independent",
                    friendship: 1
                },

                {
                    text: "I'm actually looking for food.",
                    next: "food",
                    friendship: 2
                }

            ]
        },


        campus: {

            text:
                "Nothing serious. Just the usual lectures, assignments and students looking for money.",

            choices: [

                {
                    text: "That sounds like student life.",
                    next: "friends",
                    friendship: 2
                },

                {
                    text: "I'm trying to make money too.",
                    next: "money",
                    friendship: 3
                },

                {
                    text: "I'm already tired.",
                    next: "tired",
                    friendship: 1
                }

            ]
        },


        friends: {

            text:
                "I like your vibe. We go definitely link up again.",

            choices: [

                {
                    text: "Definitely.",
                    next: "end",
                    friendship: 2
                },

                {
                    text: "You owe me lunch though.",
                    next: "end",
                    friendship: 1
                },

                {
                    text: "We'll see.",
                    next: "end",
                    friendship: 0
                }

            ]
        },


        goodluck: {

            text:
                "Thanks, my guy. See you around.",

            choices: []
        },


        later: {

            text:
                "No wahala. Catch you later.",

            choices: []
        },


        independent: {

            text:
                "Fair enough. Just don't get lost.",

            choices: []
        },


        food: {

            text:
                "Food? Mama's Kitchen is somewhere south from here. You can't miss it.",

            choices: []
        },


        money: {

            text:
                "Same hustle everywhere. Just make sure you don't spend everything you earn.",

            choices: []
        },


        tired: {

            text:
                "I feel you. Student life no easy.",

            choices: []
        },


        end: {

            text:
                "Alright, I'll see you around campus.",

            choices: []
        }
    },


    // ==================================================
    // AMAKA
    // ==================================================

    Amaka: {

        start: {

            text:
                "Hi! I've seen you around. Are you new here?",

            choices: [

                {
                    text: "Yeah, I'm new.",
                    next: "new",
                    friendship: 3
                },

                {
                    text: "I've been here for a while.",
                    next: "old",
                    friendship: 1
                },

                {
                    text: "Why do you ask?",
                    next: "why",
                    friendship: 0
                }

            ]
        },


        new: {

            text:
                "I knew it! You have that 'I'm still figuring this place out' look.",

            choices: [

                {
                    text: "Can you show me around?",
                    next: "help",
                    friendship: 4
                },

                {
                    text: "I'll figure it out.",
                    next: "independent",
                    friendship: 1
                },

                {
                    text: "Maybe you can tell me where to eat.",
                    next: "food",
                    friendship: 2
                }

            ]
        },


        old: {

            text:
                "Really? Maybe we just haven't crossed paths properly.",

            choices: [

                {
                    text: "Now we have.",
                    next: "friendly",
                    friendship: 3
                },

                {
                    text: "Exactly.",
                    next: "friendly",
                    friendship: 1
                },

                {
                    text: "I guess so.",
                    next: "end",
                    friendship: 0
                }

            ]
        },


        why: {

            text:
                "Because you look like somebody who might need help finding their way around.",

            choices: [

                {
                    text: "I actually do.",
                    next: "help",
                    friendship: 3
                },

                {
                    text: "I'm good.",
                    next: "independent",
                    friendship: 0
                },

                {
                    text: "Thanks for checking.",
                    next: "friendly",
                    friendship: 2
                }

            ]
        },


        help: {

            text:
                "No problem. Just ask me if you get confused. Campus can be stressful.",

            choices: []
        },


        independent: {

            text:
                "Okay, confident. I like that.",

            choices: []
        },


        food: {

            text:
                "Mama's Kitchen is your safest bet if you're hungry. Just don't expect restaurant treatment.",

            choices: []
        },


        friendly: {

            text:
                "You're actually nice. I thought you were going to ignore me.",

            choices: []
        },


        end: {

            text:
                "Anyway, nice talking to you.",

            choices: []
        }
    },


    // ==================================================
    // DAVID
    // ==================================================

    David: {

        start: {

            text:
                "Bro, you dey attend class or you dey dodge lectures?",

            choices: [

                {
                    text: "I attend my classes.",
                    next: "serious",
                    friendship: 2
                },

                {
                    text: "Sometimes I dodge.",
                    next: "dodge",
                    friendship: 3
                },

                {
                    text: "Mind your business.",
                    next: "rude",
                    friendship: -3
                }

            ]
        },


        serious: {

            text:
                "Good. At least somebody is taking school seriously.",

            choices: [

                {
                    text: "I have to.",
                    next: "money",
                    friendship: 1
                },

                {
                    text: "I'm trying.",
                    next: "money",
                    friendship: 2
                },

                {
                    text: "School isn't everything.",
                    next: "end",
                    friendship: 0
                }

            ]
        },


        dodge: {

            text:
                "😂 I knew it! Just make sure you don't dodge the important ones.",

            choices: [

                {
                    text: "You too?",
                    next: "friends",
                    friendship: 3
                },

                {
                    text: "Never.",
                    next: "end",
                    friendship: 1
                },

                {
                    text: "Maybe.",
                    next: "end",
                    friendship: 0
                }

            ]
        },


        rude: {

            text:
                "Omo, calm down. I was just asking.",

            choices: []
        },


        money: {

            text:
                "That's the real challenge. School, food, transport, everything costs money.",

            choices: [

                {
                    text: "Exactly.",
                    next: "friends",
                    friendship: 2
                },

                {
                    text: "I need a job.",
                    next: "job",
                    friendship: 3
                },

                {
                    text: "I'll survive.",
                    next: "end",
                    friendship: 1
                }

            ]
        },


        job: {

            text:
                "Check the student work area. You might find something there.",

            choices: []
        },


        friends: {

            text:
                "You're cool. We should talk again sometime.",

            choices: []
        },


        end: {

            text:
                "Alright bro. See you later.",

            choices: []
        }
    },


    // ==================================================
    // ZAINAB
    // ==================================================

    Zainab: {

        start: {

            text:
                "Excuse me, are you lost?",

            choices: [

                {
                    text: "Maybe a little.",
                    next: "help",
                    friendship: 3
                },

                {
                    text: "No, I'm exploring.",
                    next: "explore",
                    friendship: 2
                },

                {
                    text: "I'm completely fine.",
                    next: "fine",
                    friendship: 1
                }

            ]
        },


        help: {

            text:
                "I thought so. The campus is bigger than it looks.",

            choices: [

                {
                    text: "Can you help me?",
                    next: "guide",
                    friendship: 4
                },

                {
                    text: "I'll manage.",
                    next: "end",
                    friendship: 1
                },

                {
                    text: "Thanks anyway.",
                    next: "end",
                    friendship: 2
                }

            ]
        },


        explore: {

            text:
                "Exploring is actually a good way to learn the campus.",

            choices: [

                {
                    text: "Exactly.",
                    next: "friendly",
                    friendship: 2
                },

                {
                    text: "I'm looking for interesting places.",
                    next: "places",
                    friendship: 3
                },

                {
                    text: "I'm just bored.",
                    next: "bored",
                    friendship: 1
                }

            ]
        },


        fine: {

            text:
                "Alright then. I won't disturb you.",

            choices: []
        },


        guide: {

            text:
                "Sure. The library is north-east from here, and the Faculty of Law is further south.",

            choices: []
        },


        friendly: {

            text:
                "I like your energy. Maybe we'll see each other again.",

            choices: []
        },


        places: {

            text:
                "The sports field gets lively later in the day. You should check it out.",

            choices: []
        },


        bored: {

            text:
                "Then you definitely need to find some friends on campus.",

            choices: []
        },


        end: {

            text:
                "Take care. See you around.",

            choices: []
        }
    },


    // ==================================================
    // KELECHI
    // ==================================================

    Kelechi: {

        start: {

            text:
                "Guy! How far?",

            choices: [

                {
                    text: "I'm good.",
                    next: "good",
                    friendship: 2
                },

                {
                    text: "I'm tired.",
                    next: "tired",
                    friendship: 2
                },

                {
                    text: "I'm hungry.",
                    next: "hungry",
                    friendship: 3
                }

            ]
        },


        good: {
            text:
                "That's what I like to hear. Keep moving.",
            choices: []
        },

        tired: {
            text:
                "Find somewhere to rest before you collapse.",
            choices: []
        },

        hungry: {
            text:
                "Then stop walking around and find food! 😂",
            choices: []
        }
    },


    // ==================================================
    // SAMUEL
    // ==================================================

    Samuel: {

        start: {

            text:
                "You play football?",

            choices: [

                {
                    text: "Sometimes.",
                    next: "football",
                    friendship: 2
                },

                {
                    text: "Not really.",
                    next: "study",
                    friendship: 1
                },

                {
                    text: "Why?",
                    next: "why",
                    friendship: 1
                }

            ]
        },


        football: {
            text:
                "Come to the sports field sometime. We usually play there.",
            choices: []
        },

        study: {
            text:
                "Fair enough. Everybody has their thing.",
            choices: []
        },

        why: {
            text:
                "We're looking for more people for a game later.",
            choices: []
        }
    },


    // ==================================================
    // BLESSING
    // ==================================================

    Blessing: {

        start: {

            text:
                "Have you eaten today?",

            choices: [

                {
                    text: "Not yet.",
                    next: "eat",
                    friendship: 3
                },

                {
                    text: "Yes.",
                    next: "yes",
                    friendship: 1
                },

                {
                    text: "I'm not hungry.",
                    next: "notHungry",
                    friendship: 0
                }

            ]
        },


        eat: {
            text:
                "Please go and eat. Student life is already stressful enough.",
            choices: []
        },

        yes: {
            text:
                "Good. Take care of yourself.",
            choices: []
        },

        notHungry: {
            text:
                "Okay, but don't forget to eat later.",
            choices: []
        }
    },


    // ==================================================
    // YUSUF
    // ==================================================

    Yusuf: {

        start: {

            text:
                "You just starting your day?",

            choices: [

                {
                    text: "Yeah.",
                    next: "start",
                    friendship: 2
                },

                {
                    text: "I've been around.",
                    next: "around",
                    friendship: 1
                },

                {
                    text: "Why?",
                    next: "why",
                    friendship: 0
                }

            ]
        },


        start: {
            text:
                "Then you've got plenty time to explore campus.",
            choices: []
        },

        around: {
            text:
                "Nice. Maybe we'll bump into each other again.",
            choices: []
        },

        why: {
            text:
                "Just making conversation, bro.",
            choices: []
        }
    }

};


// ======================================================
// CAMERA
// ======================================================

function setupCamera() {

    const camera =
        gameScene.cameras.main;


    camera.setBounds(
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT
    );


    camera.startFollow(
        player,
        true,
        0.08,
        0.08
    );
}


// ======================================================
// CONTROLS
// ======================================================

function createControls() {

    cursors =
        gameScene.input.keyboard.createCursorKeys();


    wasd =
        gameScene.input.keyboard.addKeys({

            up:
                Phaser.Input.Keyboard.KeyCodes.W,

            down:
                Phaser.Input.Keyboard.KeyCodes.S,

            left:
                Phaser.Input.Keyboard.KeyCodes.A,

            right:
                Phaser.Input.Keyboard.KeyCodes.D
        });


    interactKey =
        gameScene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );


    escapeKey =
        gameScene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ESC
        );


    interactKey.on(
        "down",
        function() {

            // Dialogue gets priority

            if (dialoguePanel) {
                return;
            }


            if (
                shopPanel ||
                inventoryPanel
            ) {
                return;
            }


            interact();
        }
    );


    escapeKey.on(
        "down",
        function() {

            // Dialogue

            if (dialoguePanel) {

                closeDialogue();

                return;
            }


            if (shopPanel) {

                closeShop();

                return;
            }


            if (inventoryPanel) {

                closeInventory();

                return;
            }
        }
    );
}


// ======================================================
// HUD
// ======================================================

function createHUD() {

    const hudBackground =
        gameScene.add.rectangle(
            640,
            40,
            1280,
            80,
            0x101010,
            0.94
        );


    hudBackground.setScrollFactor(0);


    const nameText =
        gameScene.add.text(
            20,
            14,
            playerData.name,
            {
                fontSize: "19px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        );


    nameText.setScrollFactor(0);


    moneyText =
        gameScene.add.text(
            20,
            48,
            "",
            {
                fontSize: "16px",
                color: "#a8e063"
            }
        );


    moneyText.setScrollFactor(0);


    healthText =
        gameScene.add.text(
            250,
            20,
            "",
            {
                fontSize: "15px",
                color: "#ffffff"
            }
        );


    healthText.setScrollFactor(0);


    energyText =
        gameScene.add.text(
            390,
            20,
            "",
            {
                fontSize: "15px",
                color: "#ffffff"
            }
        );


    energyText.setScrollFactor(0);


    hungerText =
        gameScene.add.text(
            530,
            20,
            "",
            {
                fontSize: "15px",
                color: "#ffffff"
            }
        );


    hungerText.setScrollFactor(0);


    happinessText =
        gameScene.add.text(
            680,
            20,
            "",
            {
                fontSize: "15px",
                color: "#ffffff"
            }
        );


    happinessText.setScrollFactor(0);


    timeText =
        gameScene.add.text(
            1030,
            17,
            "",
            {
                fontSize: "21px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        );


    timeText.setScrollFactor(0);


    dayText =
        gameScene.add.text(
            1030,
            48,
            "",
            {
                fontSize: "14px",
                color: "#bbbbbb"
            }
        );


    dayText.setScrollFactor(0);


    updateHUD();
}


// ======================================================
// INTERACTION UI
// ======================================================

function createInteractionUI() {

    interactionText =
        gameScene.add.text(
            640,
            665,
            "",
            {
                fontSize: "17px",
                color: "#ffffff",
                backgroundColor: "#111111",
                padding: {
                    left: 15,
                    right: 15,
                    top: 9,
                    bottom: 9
                }
            }
        )
        .setOrigin(0.5);


    interactionText.setScrollFactor(0);

    interactionText.setVisible(false);


    messageText =
        gameScene.add.text(
            640,
            600,
            "",
            {
                fontSize: "17px",
                color: "#ffffff",
                backgroundColor: "#111111",
                padding: {
                    left: 15,
                    right: 15,
                    top: 9,
                    bottom: 9
                }
            }
        )
        .setOrigin(0.5);


    messageText.setScrollFactor(0);

    messageText.setVisible(false);
}


// ======================================================
// NPC DETECTION
// ======================================================

function getNearbyNPC() {
    if (!player) {
        return null;
    }

    let closestNPC = null;
    let closestDistance = 130;

    npcs.forEach(function(npc) {
        const currentDistance =
            distance(
                player.x,
                player.y,
                npc.body.x,
                npc.body.y
            );

        if (currentDistance < closestDistance) {
            closestDistance = currentDistance;
            closestNPC = npc;
        }
    });

    return closestNPC;
}


// ======================================================
// LOCATION DETECTION
// ======================================================

function getLocation() {

    if (!player) {
        return null;
    }


    const x = player.x;
    const y = player.y;


    if (
        distance(
            x,
            y,
            locations.kitchen.x,
            locations.kitchen.y
        ) < locations.kitchen.radius
    ) {

        return "kitchen";
    }


    if (
        distance(
            x,
            y,
            locations.shop.x,
            locations.shop.y
        ) < locations.shop.radius
    ) {

        return "shop";
    }


    if (
        distance(
            x,
            y,
            locations.hostel.x,
            locations.hostel.y
        ) < locations.hostel.radius
    ) {

        return "hostel";
    }


    if (
        distance(
            x,
            y,
            locations.university.x,
            locations.university.y
        ) < locations.university.radius
    ) {

        return "university";
    }


    if (
        distance(
            x,
            y,
            locations.lectureHall.x,
            locations.lectureHall.y
        ) < locations.lectureHall.radius
    ) {

        return "lectureHall";
    }


    if (
        distance(
            x,
            y,
            locations.lawFaculty.x,
            locations.lawFaculty.y
        ) < locations.lawFaculty.radius
    ) {

        return "lawFaculty";
    }


    if (
        distance(
            x,
            y,
            locations.library.x,
            locations.library.y
        ) < locations.library.radius
    ) {

        return "library";
    }


    if (
        distance(
            x,
            y,
            locations.residence.x,
            locations.residence.y
        ) < locations.residence.radius
    ) {

        return "residence";
    }


    if (
        distance(
            x,
            y,
            locations.job.x,
            locations.job.y
        ) < locations.job.radius
    ) {

        return "job";
    }


    if (
        distance(
            x,
            y,
            locations.busStop.x,
            locations.busStop.y
        ) < locations.busStop.radius
    ) {

        return "bus";
    }


    return null;
}


// ======================================================
// DISTANCE
// ======================================================

function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.sqrt(
        Math.pow(x1 - x2, 2) +
        Math.pow(y1 - y2, 2)
    );
}


// ======================================================
// INTERACTION
// ======================================================

function interact() {

    // ==================================================
    // NPC TAKES PRIORITY
    // ==================================================

    const nearbyNPC =
        getNearbyNPC();


    if (nearbyNPC) {

        openDialogue(
            nearbyNPC
        );

        return;
    }


    const location =
        getLocation();


    if (!location) {
        return;
    }


    if (location === "kitchen") {

        eatAtKitchen();

        return;
    }


    if (location === "shop") {

        openShop();

        return;
    }


    if (location === "hostel") {

        sleep();

        return;
    }


    if (location === "university") {

        attendClass();

        return;
    }


    if (location === "lectureHall") {

        attendClass();

        return;
    }


    if (location === "lawFaculty") {

        attendClass();

        return;
    }


    if (location === "library") {

        studyAtLibrary();

        return;
    }


    if (location === "residence") {

        restAtResidence();

        return;
    }


    if (location === "job") {

        work();

        return;
    }


    if (location === "bus") {

        showMessage(
            "Bus terminal: transport system coming soon."
        );

        return;
    }
}


// ======================================================
// OPEN DIALOGUE
// ======================================================

function openDialogue(npc) {

    if (dialoguePanel) {
        return;
    }


    const script =
        dialogueScripts[npc.name];


    if (!script) {

        showMessage(
            `${npc.name} has nothing to say right now.`
        );

        return;
    }


    activeNPC =
        npc;


    activeDialogueNode =
        script.start;


    interactionText.setVisible(false);


    createDialoguePanel();


    renderDialogueNode(
        activeDialogueNode
    );
}


// ======================================================
// CREATE DIALOGUE PANEL
// ======================================================

function createDialoguePanel() {

    dialoguePanel =
        gameScene.add.container(
            640,
            535
        );


    dialoguePanel.setScrollFactor(0);


    // ==================================================
    // BACKGROUND
    // ==================================================

    const background =
        gameScene.add.rectangle(
            0,
            0,
            1120,
            280,
            0x0b0b0b,
            0.97
        );


    background.setStrokeStyle(
        3,
        0x6fa34f
    );


    dialoguePanel.add(
        background
    );


    // ==================================================
    // NPC NAME
    // ==================================================

    dialogueNameText =
        gameScene.add.text(
            -500,
            -115,
            "",
            {
                fontSize: "24px",
                color: "#a8e063",
                fontStyle: "bold"
            }
        );


    dialoguePanel.add(
        dialogueNameText
    );


    // ==================================================
    // DIALOGUE BODY
    // ==================================================

    dialogueBodyText =
        gameScene.add.text(
            -500,
            -72,
            "",
            {
                fontSize: "18px",
                color: "#ffffff",
                wordWrap: {
                    width: 1000
                },
                lineSpacing: 6
            }
        );


    dialoguePanel.add(
        dialogueBodyText
    );


    // ==================================================
    // CHOICES
    // ==================================================

    dialogueChoiceTexts = [];


    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const choiceText =
            gameScene.add.text(
                -500,
                -5 + i * 43,
                "",
                {
                    fontSize: "17px",
                    color: "#ffffff",
                    wordWrap: {
                        width: 1000
                    }
                }
            );


        dialoguePanel.add(
            choiceText
        );


        dialogueChoiceTexts.push(
            choiceText
        );
    }


    // ==================================================
    // HINT
    // ==================================================

    dialogueHintText =
        gameScene.add.text(
            500,
            112,
            "",
            {
                fontSize: "14px",
                color: "#aaaaaa"
            }
        )
        .setOrigin(1, 0.5);


    dialoguePanel.add(
        dialogueHintText
    );
}


// ======================================================
// RENDER DIALOGUE NODE
// ======================================================

function renderDialogueNode(node) {

    if (
        !dialoguePanel ||
        !node
    ) {
        return;
    }


    activeDialogueNode =
        node;


    dialogueNameText.setText(
        activeNPC.name
    );


    dialogueBodyText.setText(
        node.text
    );


    dialogueChoiceTexts.forEach(
        function(choiceText, index) {

            choiceText.setText("");

            choiceText.setVisible(false);
        }
    );


    // ==================================================
    // CHOICES
    // ==================================================

    if (
        node.choices &&
        node.choices.length > 0
    ) {

        node.choices.forEach(
            function(choice, index) {

                if (
                    index >= 3
                ) {
                    return;
                }


                dialogueChoiceTexts[index]
                    .setText(
                        `${index + 1}. ${choice.text}`
                    )
                    .setVisible(true);
            }
        );


        dialogueHintText.setText(
            "Press 1, 2 or 3 to respond     |     ESC — Close"
        );

    }

    else {

        dialogueHintText.setText(
            "ESC — Close"
        );
    }
}


// ======================================================
// CHOOSE DIALOGUE OPTION
// ======================================================

function chooseDialogue(
    choiceIndex
) {

    if (
        !dialoguePanel ||
        !activeDialogueNode
    ) {
        return;
    }


    const choices =
        activeDialogueNode.choices;


    if (
        !choices ||
        !choices[choiceIndex]
    ) {
        return;
    }


    const choice =
        choices[choiceIndex];


    // ==================================================
    // FRIENDSHIP
    // ==================================================

    if (
        typeof choice.friendship === "number"
    ) {

        activeNPC.friendship +=
            choice.friendship;
    }


    // ==================================================
    // SMALL TIME PASSAGE
    // ==================================================

    advanceTime(1);


    // ==================================================
    // NEXT NODE
    // ==================================================

    const script =
        dialogueScripts[
            activeNPC.name
        ];


    const nextNode =
        script[choice.next];


    if (!nextNode) {

        closeDialogue();

        return;
    }


    renderDialogueNode(
        nextNode
    );


    // ==================================================
    // FRIENDSHIP FEEDBACK
    // ==================================================

    if (
        choice.friendship > 0
    ) {

        showMessage(
            `${activeNPC.name} likes your response. Friendship +${choice.friendship}`
        );

    }

    else if (
        choice.friendship < 0
    ) {

        showMessage(
            `${activeNPC.name} didn't like that. Friendship ${choice.friendship}`
        );
    }
}


// ======================================================
// DIALOGUE KEYBOARD
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (!dialoguePanel) {
            return;
        }


        if (event.key === "1") {

            chooseDialogue(0);

            return;
        }


        if (event.key === "2") {

            chooseDialogue(1);

            return;
        }


        if (event.key === "3") {

            chooseDialogue(2);

            return;
        }
    }
);


// ======================================================
// CLOSE DIALOGUE
// ======================================================

function closeDialogue() {

    if (!dialoguePanel) {
        return;
    }


    dialoguePanel.destroy();


    dialoguePanel = null;

    dialogueNameText = null;

    dialogueBodyText = null;

    dialogueHintText = null;

    dialogueChoiceTexts = [];

    activeNPC = null;

    activeDialogueNode = null;


    if (interactionText) {

        interactionText.setVisible(
            false
        );
    }
}


// ======================================================
// KITCHEN
// ======================================================

function eatAtKitchen() {

    if (playerData.money < 500) {

        showMessage(
            "You need ₦500 for a meal."
        );

        return;
    }


    playerData.money -= 500;


    playerData.hunger =
        Math.min(
            100,
            playerData.hunger + 30
        );


    playerData.happiness =
        Math.min(
            100,
            playerData.happiness + 5
        );


    advanceTime(30);

    updateHUD();


    showMessage(
        "You ate a meal. Hunger +30."
    );
}


// ======================================================
// UNIVERSITY / CLASS
// ======================================================

function attendClass() {

    if (playerData.energy < 15) {

        showMessage(
            "You're too tired for class."
        );

        return;
    }


    playerData.energy =
        Math.max(
            0,
            playerData.energy - 15
        );


    playerData.happiness =
        Math.min(
            100,
            playerData.happiness + 5
        );


    advanceTime(90);

    updateHUD();


    showMessage(
        "You attended a lecture. +Academic progress"
    );
}


// ======================================================
// LIBRARY
// ======================================================

function studyAtLibrary() {

    if (playerData.energy < 10) {

        showMessage(
            "You're too tired to study."
        );

        return;
    }


    playerData.energy =
        Math.max(
            0,
            playerData.energy - 10
        );


    playerData.happiness =
        Math.min(
            100,
            playerData.happiness + 2
        );


    advanceTime(60);

    updateHUD();


    showMessage(
        "You studied at the library for 1 hour."
    );
}


// ======================================================
// RESIDENCE
// ======================================================

function restAtResidence() {

    if (playerData.energy >= 80) {

        showMessage(
            "You don't really need to rest yet."
        );

        return;
    }


    playerData.energy =
        Math.min(
            100,
            playerData.energy + 25
        );


    advanceTime(30);

    updateHUD();


    showMessage(
        "You rested at the student residence. Energy +25."
    );
}


// ======================================================
// WORK
// ======================================================

function work() {

    if (playerData.energy < 20) {

        showMessage(
            "You're too tired to work."
        );

        return;
    }


    playerData.energy -= 20;


    const earnings = 1500;


    playerData.money += earnings;


    advanceTime(120);

    updateHUD();


    showMessage(
        `You worked for 2 hours and earned ₦${earnings.toLocaleString()}.`
    );
}


// ======================================================
// SLEEP
// ======================================================

function sleep() {

    if (playerData.energy >= 90) {

        showMessage(
            "You aren't tired enough to sleep."
        );

        return;
    }


    playerData.energy = 100;


    playerData.health =
        Math.min(
            100,
            playerData.health + 15
        );


    playerData.happiness =
        Math.min(
            100,
            playerData.happiness + 10
        );


    playerData.day++;

    playerData.hour = 7;

    playerData.minute = 0;


    updateHUD();


    showMessage(
        "You slept and woke up at 7:00 AM."
    );
}


// ======================================================
// SHOP
// ======================================================

function openShop() {

    if (shopPanel) {
        return;
    }


    interactionText.setVisible(false);


    shopPanel =
        gameScene.add.container(
            640,
            360
        );


    shopPanel.setScrollFactor(0);


    const background =
        gameScene.add.rectangle(
            0,
            0,
            720,
            510,
            0x101010,
            0.98
        );


    background.setStrokeStyle(
        2,
        0x8eaed1
    );


    shopPanel.add(background);


    const title =
        gameScene.add.text(
            0,
            -215,
            "CAMPUS SHOP",
            {
                fontSize: "31px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        )
        .setOrigin(0.5);


    shopPanel.add(title);


    const money =
        gameScene.add.text(
            0,
            -175,
            `Money: ₦${playerData.money.toLocaleString()}`,
            {
                fontSize: "18px",
                color: "#a8e063"
            }
        )
        .setOrigin(0.5);


    shopPanel.add(money);


    const items = [

        ["1", "food", "Snack", "₦300"],

        ["2", "data", "Mobile Data", "₦1,000"],

        ["3", "books", "School Books", "₦2,500"],

        ["4", "clothes", "Clothes", "₦5,000"]

    ];


    items.forEach(function(item, index) {

        const y =
            -115 + index * 70;


        const rowBackground =
            gameScene.add.rectangle(
                0,
                y,
                600,
                55,
                0x222222
            );


        shopPanel.add(
            rowBackground
        );


        const row =
            gameScene.add.text(
                -280,
                y,
                `${item[0]}. ${item[2]}`,
                {
                    fontSize: "18px",
                    color: "#ffffff",
                    fontStyle: "bold"
                }
            )
            .setOrigin(0, 0.5);


        shopPanel.add(row);


        const price =
            gameScene.add.text(
                250,
                y,
                item[3],
                {
                    fontSize: "18px",
                    color: "#a8e063",
                    fontStyle: "bold"
                }
            )
            .setOrigin(1, 0.5);


        shopPanel.add(price);
    });


    const instructions =
        gameScene.add.text(
            0,
            195,
            "1–4 Buy Item    |    ESC Close",
            {
                fontSize: "16px",
                color: "#bbbbbb"
            }
        )
        .setOrigin(0.5);


    shopPanel.add(instructions);
}


// ======================================================
// BUY ITEM
// ======================================================

function buyItem(key) {

    const products = {

        food: {
            name: "Snack",
            price: 300
        },

        data: {
            name: "Mobile Data",
            price: 1000
        },

        books: {
            name: "School Books",
            price: 2500
        },

        clothes: {
            name: "Clothes",
            price: 5000
        }

    };


    const item =
        products[key];


    if (!item) {
        return;
    }


    if (playerData.money < item.price) {

        showMessage(
            "Not enough money."
        );

        return;
    }


    playerData.money -= item.price;


    playerData.inventory[key]++;


    if (key === "food") {

        playerData.hunger =
            Math.min(
                100,
                playerData.hunger + 12
            );
    }


    if (key === "clothes") {

        playerData.happiness =
            Math.min(
                100,
                playerData.happiness + 8
            );
    }


    advanceTime(10);

    updateHUD();


    closeShop();


    showMessage(
        `Bought ${item.name} for ₦${item.price.toLocaleString()}.`
    );
}


// ======================================================
// SHOP KEYBOARD
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (!shopPanel) {
            return;
        }


        if (event.key === "1") {

            buyItem("food");
        }


        if (event.key === "2") {

            buyItem("data");
        }


        if (event.key === "3") {

            buyItem("books");
        }


        if (event.key === "4") {

            buyItem("clothes");
        }
    }
);


// ======================================================
// CLOSE SHOP
// ======================================================

function closeShop() {

    if (!shopPanel) {
        return;
    }


    shopPanel.destroy();

    shopPanel = null;
}


// ======================================================
// INVENTORY
// ======================================================

function openInventory() {

    if (inventoryPanel) {
        return;
    }


    inventoryPanel =
        gameScene.add.container(
            640,
            360
        );


    inventoryPanel.setScrollFactor(0);


    const background =
        gameScene.add.rectangle(
            0,
            0,
            600,
            430,
            0x101010,
            0.98
        );


    background.setStrokeStyle(
        2,
        0x6fa34f
    );


    inventoryPanel.add(
        background
    );


    const title =
        gameScene.add.text(
            0,
            -175,
            "INVENTORY",
            {
                fontSize: "30px",
                color: "#ffffff",
                fontStyle: "bold"
            }
        )
        .setOrigin(0.5);


    inventoryPanel.add(title);


    const items = [

        `Food: ${playerData.inventory.food}`,

        `Mobile Data: ${playerData.inventory.data}`,

        `School Books: ${playerData.inventory.books}`,

        `Clothes: ${playerData.inventory.clothes}`

    ];


    items.forEach(
        function(item, index) {

            const text =
                gameScene.add.text(
                    -200,
                    -90 + index * 65,
                    item,
                    {
                        fontSize: "19px",
                        color: "#ffffff"
                    }
                );


            inventoryPanel.add(text);
        }
    );


    const instructions =
        gameScene.add.text(
            0,
            170,
            "I / ESC — Close",
            {
                fontSize: "16px",
                color: "#bbbbbb"
            }
        )
        .setOrigin(0.5);


    inventoryPanel.add(
        instructions
    );
}


function closeInventory() {

    if (!inventoryPanel) {
        return;
    }


    inventoryPanel.destroy();

    inventoryPanel = null;
}


// ======================================================
// INVENTORY KEY
// ======================================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key.toLowerCase() !== "i"
        ) {
            return;
        }


        if (shopPanel || dialoguePanel) {
            return;
        }


        if (inventoryPanel) {

            closeInventory();

        } else {

            openInventory();
        }
    }
);


// ======================================================
// MESSAGE
// ======================================================

function showMessage(message) {

    if (!messageText) {
        return;
    }


    if (messageTimer) {

        messageTimer.remove();
    }


    messageText.setText(
        message
    );


    messageText.setVisible(
        true
    );


    messageTimer =
        gameScene.time.delayedCall(
            3000,
            function() {

                messageText.setVisible(
                    false
                );
            }
        );
}


// ======================================================
// HUD UPDATE
// ======================================================

function updateHUD() {

    if (!moneyText) {
        return;
    }


    moneyText.setText(
        `₦${playerData.money.toLocaleString()}`
    );


    healthText.setText(
        `❤️ ${Math.round(playerData.health)}`
    );


    energyText.setText(
        `⚡ ${Math.round(playerData.energy)}`
    );


    hungerText.setText(
        `🍗 ${Math.round(playerData.hunger)}`
    );


    happinessText.setText(
        `😊 ${Math.round(playerData.happiness)}`
    );


    const hour =
        String(
            playerData.hour
        ).padStart(
            2,
            "0"
        );


    const minute =
        String(
            playerData.minute
        ).padStart(
            2,
            "0"
        );


    timeText.setText(
        `${hour}:${minute}`
    );


    dayText.setText(
        `Day ${playerData.day}`
    );
}


// ======================================================
// GAME CLOCK
// ======================================================

function startClock() {

    if (gameClock) {

        clearInterval(
            gameClock
        );
    }


    gameClock =
        setInterval(
            function() {

                advanceTime(1);

            },
            1000
        );
}


// ======================================================
// ADVANCE TIME
// ======================================================

function advanceTime(minutes) {

    playerData.minute +=
        minutes;


    while (
        playerData.minute >= 60
    ) {

        playerData.minute -=
            60;

        playerData.hour++;
    }


    if (
        playerData.hour >= 24
    ) {

        playerData.hour = 0;

        playerData.day++;
    }


    // ==================================================
    // HUNGER
    // ==================================================

    playerData.hunger =
        Math.max(
            0,
            playerData.hunger -
            minutes * 0.08
        );


    // ==================================================
    // ENERGY
    // ==================================================

    playerData.energy =
        Math.max(
            0,
            playerData.energy -
            minutes * 0.05
        );


    // ==================================================
    // HEALTH
    // ==================================================

    if (
        playerData.hunger <= 10
    ) {

        playerData.health =
            Math.max(
                0,
                playerData.health -
                minutes * 0.02
            );
    }


    updateHUD();
}


// ======================================================
// UPDATE
// ======================================================

function update() {

    if (!player) {
        return;
    }


    // ==================================================
    // STOP EVERYTHING DURING DIALOGUE
    // ==================================================

    if (dialoguePanel) {

        return;
    }


    // ==================================================
    // STOP MOVEMENT WHEN MENU IS OPEN
    // ==================================================

    if (
        shopPanel ||
        inventoryPanel
    ) {

        return;
    }


    let dx = 0;
    let dy = 0;


    // ==================================================
    // WASD / ARROW MOVEMENT
    // ==================================================

    if (
        cursors.left.isDown ||
        wasd.left.isDown
    ) {

        dx = -SPEED;
    }


    if (
        cursors.right.isDown ||
        wasd.right.isDown
    ) {

        dx = SPEED;
    }


    if (
        cursors.up.isDown ||
        wasd.up.isDown
    ) {

        dy = -SPEED;
    }


    if (
        cursors.down.isDown ||
        wasd.down.isDown
    ) {

        dy = SPEED;
    }


    // ==================================================
    // DIAGONAL NORMALIZATION
    // ==================================================

    if (
        dx !== 0 &&
        dy !== 0
    ) {

        dx *= 0.707;

        dy *= 0.707;
    }


    // ==================================================
    // MOVE PLAYER
    // ==================================================

    player.x += dx;

    player.y += dy;


    // ==================================================
    // WORLD BOUNDS
    // ==================================================

    player.x =
        Phaser.Math.Clamp(
            player.x,
            45,
            WORLD_WIDTH - 45
        );


    player.y =
        Phaser.Math.Clamp(
            player.y,
            80,
            WORLD_HEIGHT - 45
        );


    // ==================================================
    // PLAYER NAME
    // ==================================================

    if (playerNameLabel) {

        playerNameLabel.x =
            player.x;

        playerNameLabel.y =
            player.y - 35;
    }


    // ==================================================
    // CURRENT LOCATION
    // ==================================================

    currentLocation =
        getLocation();


    // ==================================================
    // NEARBY NPC
    // ==================================================

    const nearbyNPC =
        getNearbyNPC();


    // ==================================================
    // NPC PROMPT TAKES PRIORITY
    // ==================================================

    if (nearbyNPC) {

        interactionText.setText(
            `E — Talk to ${nearbyNPC.name}`
        );

        interactionText.setVisible(
            true
        );
    }


    // ==================================================
    // LOCATION PROMPTS
    // ==================================================

    else if (
        currentLocation === "kitchen"
    ) {

        interactionText.setText(
            "E — Eat at Mama's Kitchen"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "shop"
    ) {

        interactionText.setText(
            "E — Open Campus Shop"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "hostel"
    ) {

        interactionText.setText(
            "E — Sleep / Rest"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "university"
    ) {

        interactionText.setText(
            "E — Attend Class"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "lectureHall"
    ) {

        interactionText.setText(
            "E — Attend Lecture"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "lawFaculty"
    ) {

        interactionText.setText(
            "E — Attend Law Class"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "library"
    ) {

        interactionText.setText(
            "E — Study at Library"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "residence"
    ) {

        interactionText.setText(
            "E — Rest"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "job"
    ) {

        interactionText.setText(
            "E — Work"
        );

        interactionText.setVisible(
            true
        );
    }

    else if (
        currentLocation === "bus"
    ) {

        interactionText.setText(
            "E — Bus Terminal"
        );

        interactionText.setVisible(
            true
        );
    }

    else {

        interactionText.setVisible(
            false
        );
    }


    // ==================================================
    // NPC MOVEMENT
    // ==================================================

    npcs.forEach(
        function(npc) {

            npc.body.x +=
                npc.direction * 0.25;


            npc.label.x =
                npc.body.x;


            npc.label.y =
                npc.body.y - 30;


            if (
                npc.body.x < 80 ||
                npc.body.x >
                WORLD_WIDTH - 80
            ) {

                npc.direction *= -1;
            }
        }
    );
}