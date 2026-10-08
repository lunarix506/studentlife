/* ============================================================
   OSOGBO CAMPUS LIFE
   GAME.JS — PART 1/10
   FOUNDATION
   ============================================================ */

(() => {
    "use strict";

    /* =========================================================
       1. BASIC DOM HELPERS
       ========================================================= */

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);

    const show = (element) => {
        if (!element) return;

        element.classList.add("active");
        element.setAttribute("aria-hidden", "false");
    };

    const hide = (element) => {
        if (!element) return;

        element.classList.remove("active");
        element.setAttribute("aria-hidden", "true");
    };

    const setText = (selector, value) => {
        const element = $(selector);

        if (element) {
            element.textContent = value;
        }
    };

    const clamp = (value, min, max) => {
        return Math.max(min, Math.min(max, value));
    };

    const random = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const formatMoney = (amount) => {
        return `₦${Math.floor(amount).toLocaleString()}`;
    };

    const capitalize = (text) => {
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
    };


    /* =========================================================
       2. GAME CONSTANTS
       ========================================================= */

    const GAME_VERSION = "1.0.0";

    const STARTING_MONEY = 20000;

    /*
     * 1 real second = 1 game minute.
     */
    const REAL_SECONDS_PER_GAME_MINUTE = 1;

    const PLAYER_SPEED = 220;

    const WORLD_WIDTH = 3200;
    const WORLD_HEIGHT = 2200;

    const COLORS = {
        grass: 0x3f6338,
        grassLight: 0x547b43,
        road: 0x3b3b3b,
        roadEdge: 0x252525,
        building: 0x9b8065,
        buildingDark: 0x725d4b,
        wall: 0xc5b79e,
        white: 0xffffff,
        black: 0x111111,
        green: 0x4caf50,
        blue: 0x2196f3,
        yellow: 0xf4c542,
        red: 0xe74c3c
    };


    /* =========================================================
       3. DEFAULT GAME STATE
       ========================================================= */

    const DEFAULT_GAME_STATE = {

        version: GAME_VERSION,

        started: false,

        player: {
            name: "",
            age: 18,
            gender: "male",
            course: "Law",

            money: STARTING_MONEY,

            health: 100,
            energy: 100,
            hunger: 100,
            happiness: 80,

            academic: 0,
            reputation: 0
        },

        time: {
            day: 1,
            hour: 8,
            minute: 0,

            dayName: "Monday"
        },

        location: {
            current: "University Campus"
        },

        appearance: {
            skin: "medium",
            hair: "short",
            shirt: "blue"
        },

        inventory: {
            food: 0,
            data: 0,
            books: 0,
            clothes: 0
        },

        relationships: {
            Yusuf: {
                friendship: 0,
                conversations: 0,
                lastInteractionDay: 0
            },

            Aisha: {
                friendship: 0,
                conversations: 0,
                lastInteractionDay: 0
            },

            Tunde: {
                friendship: 0,
                conversations: 0,
                lastInteractionDay: 0
            },

            Chioma: {
                friendship: 0,
                conversations: 0,
                lastInteractionDay: 0
            },

            Ibrahim: {
                friendship: 0,
                conversations: 0,
                lastInteractionDay: 0
            }
        },

        quests: {
            current: "campusWelcome",

            completed: [],

            progress: 0
        },

        messages: [],

        stats: {
            classesAttended: 0,
            mealsTaken: 0,
            workSessions: 0,
            studySessions: 0,
            moneyEarned: 0,
            moneySpent: 0
        },

        settings: {
            sound: true,
            music: true,
            notifications: true,
            effects: true,
            quality: "high"
        }
    };


    /* =========================================================
       4. GAME STATE
       ========================================================= */

    let gameState = JSON.parse(
        JSON.stringify(DEFAULT_GAME_STATE)
    );


    /* =========================================================
       5. PHASER REFERENCES
       ========================================================= */

    let game = null;

    let gameScene = null;

    let playerSprite = null;

    let cursors = null;

    let wasd = null;

    let interactKey = null;

    let escKey = null;

    let gameStarted = false;


    /* =========================================================
       6. GAME FLAGS
       ========================================================= */

    const flags = {

        dialogueOpen: false,

        shopOpen: false,

        inventoryOpen: false,

        phoneOpen: false,

        profileOpen: false,

        mapOpen: false,

        paused: false,

        interactionLocked: false,

        mobileMovement: {
            up: false,
            down: false,
            left: false,
            right: false
        }
    };


    /* =========================================================
       7. LOADING SCREEN
       ========================================================= */

    const loadingScreen = $("#loading-screen");
    const loadingStatus = $("#loading-status");
    const loadingProgress = $("#loading-progress");
    const loadingPercentage = $("#loading-percentage");


    function updateLoading(progress, status) {

        const safeProgress = clamp(progress, 0, 100);

        if (loadingProgress) {
            loadingProgress.style.width = `${safeProgress}%`;
        }

        setText("#loading-percentage", `${safeProgress}%`);
        setText("#loading-status", status);
    }


    function finishLoading() {

        updateLoading(100, "Ready");

        setTimeout(() => {

            if (loadingScreen) {
                hide(loadingScreen);
            }

        }, 400);
    }


    /* =========================================================
       8. SCREEN MANAGEMENT
       ========================================================= */

    function showCreationScreen() {

        hide($("#loading-screen"));
        hide($("#game-container"));

        show($("#character-creation"));
    }


    function showGameScreen() {

        hide($("#character-creation"));
        show($("#game-container"));

        const gameUI = $("#game-ui");

        if (gameUI) {
            gameUI.classList.add("active");
        }
    }


    /* =========================================================
       9. CHARACTER CREATION PREVIEW
       ========================================================= */

    function updateCharacterPreview() {

        const nameInput = $("#player-name");
        const ageInput = $("#player-age");
        const genderInput = $("#player-gender");
        const courseInput = $("#player-course");

        const name =
            nameInput?.value.trim() || "Your Name";

        const age =
            ageInput?.value || "18";

        const gender =
            genderInput?.value || "male";

        const course =
            courseInput?.value || "Law";

        setText("#preview-name", name);
        setText("#preview-course", `${course} • ${age}`);

        const avatar = $("#creation-avatar");

        if (avatar) {

            avatar.textContent =
                name.charAt(0).toUpperCase() || "Y";

            avatar.dataset.gender = gender;
        }
    }


    function setupCharacterPreview() {

        const fields = [
            "#player-name",
            "#player-age",
            "#player-gender",
            "#player-course"
        ];

        fields.forEach((selector) => {

            const element = $(selector);

            if (!element) return;

            element.addEventListener(
                "input",
                updateCharacterPreview
            );

            element.addEventListener(
                "change",
                updateCharacterPreview
            );
        });

        updateCharacterPreview();
    }


    /* =========================================================
       10. CHARACTER CREATION VALIDATION
       ========================================================= */

    function getCharacterData() {

        const name =
            $("#player-name")?.value.trim();

        const age =
            Number($("#player-age")?.value || 18);

        const gender =
            $("#player-gender")?.value || "male";

        const course =
            $("#player-course")?.value || "Law";


        if (!name) {

            notify(
                "Character Creation",
                "Please enter your name."
            );

            return null;
        }


        if (age < 16 || age > 40) {

            notify(
                "Character Creation",
                "Please enter a valid age."
            );

            return null;
        }


        return {
            name,
            age,
            gender,
            course
        };
    }


    /* =========================================================
       11. RESET GAME STATE
       ========================================================= */

    function resetGameState() {

        gameState = JSON.parse(
            JSON.stringify(DEFAULT_GAME_STATE)
        );
    }


    /* =========================================================
       12. START GAME
       ========================================================= */

    function startGame(character) {

        resetGameState();

        gameState.player.name = character.name;
        gameState.player.age = character.age;
        gameState.player.gender = character.gender;
        gameState.player.course = character.course;

        gameState.started = true;

        gameStarted = true;

        updateLoading(40, "Preparing your campus life...");

        showGameScreen();

        initializePhaser();
    }


    /* =========================================================
       13. CHARACTER FORM
       ========================================================= */

    function setupCharacterForm() {

        const form = $("#character-form");

        if (!form) return;

        form.addEventListener("submit", (event) => {

    event.preventDefault();

    alert("FORM SUBMIT WORKS");

    const character = getCharacterData();

    if (!character) return;

    startGame(character);
});
    }


    /* =========================================================
       14. NOTIFICATION SYSTEM
       ========================================================= */

    function notify(title, body, duration = 3500) {

        if (!gameState.settings.notifications) {
            return;
        }

        const container =
            $("#notification-container");

        if (!container) return;


        const message =
            document.createElement("div");

        message.className = "notification";

        message.innerHTML = `
            <div class="notification-title">
                ${escapeHTML(title)}
            </div>

            <div class="notification-body">
                ${escapeHTML(body)}
            </div>
        `;


        container.appendChild(message);


        setTimeout(() => {

            message.classList.add("hide");

            setTimeout(() => {
                message.remove();
            }, 300);

        }, duration);
    }


    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /* =========================================================
       15. UI BAR HELPER
       ========================================================= */

    function updateBar(valueSelector, barSelector, value) {

        const safeValue =
            clamp(Math.round(value), 0, 100);

        setText(
            valueSelector,
            safeValue
        );

        const bar = $(barSelector);

        if (bar) {
            bar.style.width =
                `${safeValue}%`;
        }
    }


    /* =========================================================
       16. BASIC PLAYER HUD
       ========================================================= */

    function updatePlayerHUD() {

        const player = gameState.player;

        setText(
            "#hud-player-name",
            player.name
        );

        setText(
            "#hud-player-course",
            player.course
        );

        setText(
            "#money-value",
            formatMoney(player.money)
        );


        updateBar(
            "#health-value",
            "#health-bar",
            player.health
        );

        updateBar(
            "#energy-value",
            "#energy-bar",
            player.energy
        );

        updateBar(
            "#hunger-value",
            "#hunger-bar",
            player.hunger
        );

        updateBar(
            "#happiness-value",
            "#happiness-bar",
            player.happiness
        );


        const letter =
            player.name
                ? player.name.charAt(0).toUpperCase()
                : "?";

        setText(
            "#hud-avatar-letter",
            letter
        );

        setText(
            "#dialogue-avatar-letter",
            letter
        );

        setText(
            "#phone-avatar",
            letter
        );
    }


    /* =========================================================
       17. TIME HELPERS
       ========================================================= */

    const DAY_NAMES = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];


    function getTimeString() {

        let hour =
            gameState.time.hour;

        const minute =
            gameState.time.minute;

        const period =
            hour >= 12 ? "PM" : "AM";

        let displayHour =
            hour % 12;

        if (displayHour === 0) {
            displayHour = 12;
        }

        return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
    }


    function updateTimeHUD() {

        setText(
            "#time-value",
            getTimeString()
        );

        const hour =
            gameState.time.hour;

        setText(
            "#time-period",
            hour >= 6 && hour < 12
                ? "Morning"
                : hour >= 12 && hour < 17
                    ? "Afternoon"
                    : hour >= 17 && hour < 21
                        ? "Evening"
                        : "Night"
        );

        setText(
            "#day-value",
            `Day ${gameState.time.day}`
        );

        setText(
            "#date-value",
            gameState.time.dayName
        );
    }


    function advanceMinutes(minutes) {

        if (!Number.isFinite(minutes)) {
            return;
        }

        let total =
            gameState.time.hour * 60 +
            gameState.time.minute +
            minutes;


        while (total >= 1440) {

            total -= 1440;

            gameState.time.day++;

            const index =
                (gameState.time.day - 1) % 7;

            gameState.time.dayName =
                DAY_NAMES[index];
        }


        gameState.time.hour =
            Math.floor(total / 60);

        gameState.time.minute =
            total % 60;


        updateTimeHUD();
    }


    /* =========================================================
       18. PLAYER STAT HELPERS
       ========================================================= */

    function changeStat(stat, amount) {

        if (!(stat in gameState.player)) {
            return;
        }

        gameState.player[stat] =
            clamp(
                gameState.player[stat] + amount,
                0,
                100
            );

        updatePlayerHUD();
    }


    function changeMoney(amount) {

        gameState.player.money =
            Math.max(
                0,
                gameState.player.money + amount
            );

        updatePlayerHUD();
    }


    function spendMoney(amount) {

        if (
            amount <= 0 ||
            gameState.player.money < amount
        ) {
            notify(
                "Not enough money",
                "You don't have enough money for this."
            );

            return false;
        }

        changeMoney(-amount);

        gameState.stats.moneySpent += amount;

        return true;
    }


    /* =========================================================
       19. LOCATION
       ========================================================= */

    function setLocation(name, subtitle = "") {

        gameState.location.current = name;

        setText(
            "#location-name",
            name
        );

        setText(
            "#location-subtitle",
            subtitle
        );
    }


    /* =========================================================
       20. INITIAL UI UPDATE
       ========================================================= */

    function refreshAllUI() {

        updatePlayerHUD();

        updateTimeHUD();

        setLocation(
            gameState.location.current,
            "Campus"
        );
    }


    /* =========================================================
       21. BOOT SCENE
       ========================================================= */

    class BootScene extends Phaser.Scene {

        constructor() {

            super("BootScene");
        }


        create() {

            updateLoading(
                75,
                "Building campus..."
            );

            this.scene.start("GameScene");
        }
    }


    /* =========================================================
       22. MAIN GAME SCENE
       ========================================================= */

    class GameScene extends Phaser.Scene {

        constructor() {

            super("GameScene");
        }


        preload() {

            /*
             * No external image assets yet.
             *
             * The world will initially be generated
             * using Phaser graphics.
             */
        }


        create() {

            gameScene = this;

            updateLoading(
                85,
                "Creating your character..."
            );


            /* ---------------------------------------------
               WORLD
               --------------------------------------------- */

            this.physics.world.setBounds(
                0,
                0,
                WORLD_WIDTH,
                WORLD_HEIGHT
            );


            /* ---------------------------------------------
               BACKGROUND
               --------------------------------------------- */

            this.createWorldBackground();


            /* ---------------------------------------------
               PLAYER
               --------------------------------------------- */

            this.createPlayer();


            /* ---------------------------------------------
               CAMERA
               --------------------------------------------- */

            this.cameras.main.setBounds(
                0,
                0,
                WORLD_WIDTH,
                WORLD_HEIGHT
            );

            this.cameras.main.startFollow(
                playerSprite,
                true,
                0.08,
                0.08
            );


            /* ---------------------------------------------
               INPUT
               --------------------------------------------- */

            cursors =
                this.input.keyboard.createCursorKeys();

            wasd =
                this.input.keyboard.addKeys(
                    "W,A,S,D"
                );

            interactKey =
                this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes.E
                );

            escKey =
                this.input.keyboard.addKey(
                    Phaser.Input.Keyboard.KeyCodes.ESC
                );


            /* ---------------------------------------------
               START
               --------------------------------------------- */

            refreshAllUI();

            updateLoading(
                100,
                "Welcome to campus"
            );

            setTimeout(() => {

                finishLoading();

                notify(
                    "Welcome to campus",
                    `Welcome, ${gameState.player.name}. Your new life starts today.`
                );

            }, 500);
        }


        update() {

            if (!playerSprite) {
                return;
            }

            if (flags.paused) {
                return;
            }

            this.updatePlayerMovement();
        }


        /* =================================================
           WORLD BACKGROUND
           ================================================= */

        createWorldBackground() {

            const graphics =
                this.add.graphics();

            graphics.fillStyle(
                COLORS.grass,
                1
            );

            graphics.fillRect(
                0,
                0,
                WORLD_WIDTH,
                WORLD_HEIGHT
            );


            /*
             * Large campus roads.
             */

            graphics.fillStyle(
                COLORS.road,
                1
            );


            graphics.fillRect(
                0,
                900,
                WORLD_WIDTH,
                180
            );

            graphics.fillRect(
                1450,
                0,
                180,
                WORLD_HEIGHT
            );


            /*
             * Road edges.
             */

            graphics.lineStyle(
                4,
                COLORS.roadEdge,
                1
            );


            graphics.strokeRect(
                0,
                900,
                WORLD_WIDTH,
                180
            );

            graphics.strokeRect(
                1450,
                0,
                180,
                WORLD_HEIGHT
            );


            /*
             * Simple campus areas.
             */

            this.createGroundArea(
                250,
                250,
                650,
                420
            );

            this.createGroundArea(
                1900,
                250,
                800,
                420
            );

            this.createGroundArea(
                250,
                1300,
                650,
                500
            );

            this.createGroundArea(
                1900,
                1300,
                800,
                500
            );
        }


        createGroundArea(
            x,
            y,
            width,
            height
        ) {

            const graphics =
                this.add.graphics();

            graphics.fillStyle(
                COLORS.grassLight,
                0.45
            );

            graphics.fillRect(
                x,
                y,
                width,
                height
            );

            graphics.lineStyle(
                3,
                COLORS.grass,
                0.8
            );

            graphics.strokeRect(
                x,
                y,
                width,
                height
            );
        }


        /* =================================================
           PLAYER
           ================================================= */

        createPlayer() {

            playerSprite =
                this.add.circle(
                    1540,
                    1000,
                    24,
                    COLORS.blue
                );


            this.physics.add.existing(
                playerSprite
            );


            playerSprite.body.setCollideWorldBounds(
                true
            );


            playerSprite.setDepth(50);


            /*
             * Small player marker.
             */

            const marker =
                this.add.circle(
                    1540,
                    1000,
                    7,
                    COLORS.white
                );

            marker.setDepth(51);

            playerSprite.avatarMarker = marker;
        }


        /* =================================================
           PLAYER MOVEMENT
           ================================================= */

        updatePlayerMovement() {

            let x = 0;
            let y = 0;


            if (
                cursors.left.isDown ||
                wasd.A.isDown ||
                flags.mobileMovement.left
            ) {
                x -= 1;
            }


            if (
                cursors.right.isDown ||
                wasd.D.isDown ||
                flags.mobileMovement.right
            ) {
                x += 1;
            }


            if (
                cursors.up.isDown ||
                wasd.W.isDown ||
                flags.mobileMovement.up
            ) {
                y -= 1;
            }


            if (
                cursors.down.isDown ||
                wasd.S.isDown ||
                flags.mobileMovement.down
            ) {
                y += 1;
            }


            /*
             * Normalize diagonal movement.
             */

            if (x !== 0 && y !== 0) {

                const length =
                    Math.sqrt(
                        x * x + y * y
                    );

                x /= length;
                y /= length;
            }


            playerSprite.body.setVelocity(
                x * PLAYER_SPEED,
                y * PLAYER_SPEED
            );


            if (
                playerSprite.avatarMarker
            ) {

                playerSprite.avatarMarker.setPosition(
                    playerSprite.x,
                    playerSprite.y
                );
            }
        }
    }


    /* =========================================================
       23. PHASER INITIALIZATION
       ========================================================= */

    function initializePhaser() {

        if (game) {
            return;
        }


        const container =
            $("#game-container");


        if (!container) {

            console.error(
                "Game container was not found."
            );

            return;
        }


        const width =
            container.clientWidth || window.innerWidth;

        const height =
            container.clientHeight || window.innerHeight;


        const config = {

            type: Phaser.AUTO,

            parent: "game-container",

            width,
            height,

            backgroundColor: "#101010",

            physics: {

                default: "arcade",

                arcade: {

                    gravity: {
                        x: 0,
                        y: 0
                    },

                    debug: false
                }
            },

            scale: {

                mode: Phaser.Scale.RESIZE,

                autoCenter:
                    Phaser.Scale.CENTER_BOTH
            },

            scene: [
                BootScene,
                GameScene
            ]
        };


        game =
            new Phaser.Game(config);
    }


    /* =========================================================
       24. WINDOW RESIZE
       ========================================================= */

    window.addEventListener(
        "resize",
        () => {

            if (!game) return;

            game.scale.resize(
                window.innerWidth,
                window.innerHeight
            );
        }
    );


    /* =========================================================
       25. INITIAL SETUP
       ========================================================= */

    function initialize() {

        updateLoading(
            10,
            "Loading game..."
        );

        setupCharacterPreview();

        setupCharacterForm();

        updateLoading(
            25,
            "Preparing your new life..."
        );

        setTimeout(() => {

            showCreationScreen();

        }, 300);
    }


    /* =========================================================
       START
       ========================================================= */

    initialize();

    /*
     * IMPORTANT:
     *
     * DO NOT CLOSE THE IIFE HERE.
     *
     * PART 2 WILL CONTINUE DIRECTLY BELOW THIS LINE.
     */
 /* ============================================================
   OSOGBO CAMPUS LIFE
   GAME.JS — PART 2/10
   CAMPUS WORLD
   ============================================================ */


/* =========================================================
   26. CAMPUS LOCATIONS
   ========================================================= */

const CAMPUS_LOCATIONS = {

    university: {
        id: "university",
        name: "University Campus",
        subtitle: "Main Campus",
        x: 1180,
        y: 620,
        width: 500,
        height: 220,
        color: COLORS.building
    },

    lawFaculty: {
        id: "lawFaculty",
        name: "Faculty of Law",
        subtitle: "Faculty of Law",
        x: 350,
        y: 300,
        width: 420,
        height: 250,
        color: 0x8c7762
    },

    lectureHall: {
        id: "lectureHall",
        name: "Lecture Hall",
        subtitle: "Academic Block",
        x: 1980,
        y: 300,
        width: 480,
        height: 240,
        color: 0x806b58
    },

    library: {
        id: "library",
        name: "University Library",
        subtitle: "Study & Research",
        x: 2050,
        y: 590,
        width: 420,
        height: 230,
        color: 0x706a60
    },

    hostel: {
        id: "hostel",
        name: "Student Hostel",
        subtitle: "Your Residence",
        x: 300,
        y: 1370,
        width: 500,
        height: 300,
        color: 0x8b6f58
    },

    studentCentre: {
        id: "studentCentre",
        name: "Student Centre",
        subtitle: "Campus Social Area",
        x: 1900,
        y: 1360,
        width: 500,
        height: 280,
        color: 0x92785e
    },

    kitchen: {
        id: "kitchen",
        name: "Mama's Kitchen",
        subtitle: "Food & Refreshments",
        x: 880,
        y: 1260,
        width: 360,
        height: 220,
        color: 0x9d7656
    },

    shop: {
        id: "shop",
        name: "Campus Shop",
        subtitle: "Student Supplies",
        x: 1700,
        y: 1240,
        width: 360,
        height: 220,
        color: 0x6f8062
    },

    busStop: {
        id: "busStop",
        name: "Campus Bus Stop",
        subtitle: "Transport",
        x: 2550,
        y: 930,
        width: 360,
        height: 160,
        color: 0x777777
    },

    jobs: {
        id: "jobs",
        name: "Student Jobs",
        subtitle: "Part-Time Work",
        x: 1000,
        y: 1750,
        width: 400,
        height: 220,
        color: 0x806a55
    },

    residence: {
        id: "residence",
        name: "Student Residence",
        subtitle: "Off-Campus Area",
        x: 2050,
        y: 1770,
        width: 550,
        height: 220,
        color: 0x876c56
    }
};


/* =========================================================
   27. WORLD OBJECT GROUPS
   ========================================================= */

let campusBuildings = null;

let campusTrees = null;

let campusLabels = null;

let campusCollision = null;


/* =========================================================
   28. CREATE CAMPUS
   ========================================================= */

function createCampusWorld(scene) {

    campusBuildings =
        scene.physics.add.staticGroup();

    campusTrees =
        scene.add.group();

    campusLabels =
        scene.add.group();

    campusCollision =
        scene.physics.add.staticGroup();


    createCampusBuildings(scene);

    createCampusTrees(scene);

    createCampusDecorations(scene);

    createCampusLabels(scene);

    createCampusBoundaries(scene);

    createLocationZones(scene);
}


/* =========================================================
   29. BUILDINGS
   ========================================================= */

function createCampusBuildings(scene) {

    Object.values(CAMPUS_LOCATIONS).forEach(
        (location) => {

            createBuilding(
                scene,
                location
            );
        }
    );
}


/* =========================================================
   30. BUILDING CREATION
   ========================================================= */

function createBuilding(scene, location) {

    const {
        x,
        y,
        width,
        height,
        color
    } = location;


    const graphics =
        scene.add.graphics();


    /*
     * Main building.
     */

    graphics.fillStyle(
        color,
        1
    );

    graphics.fillRect(
        x,
        y,
        width,
        height
    );


    /*
     * Building outline.
     */

    graphics.lineStyle(
        5,
        COLORS.buildingDark,
        1
    );

    graphics.strokeRect(
        x,
        y,
        width,
        height
    );


    /*
     * Roof/top strip.
     */

    graphics.fillStyle(
        COLORS.buildingDark,
        1
    );

    graphics.fillRect(
        x,
        y,
        width,
        30
    );


    /*
     * Windows.
     */

    const windowColor =
        0xb9d7e8;


    const columns =
        Math.max(
            2,
            Math.floor(width / 100)
        );


    const rows =
        Math.max(
            1,
            Math.floor(height / 90)
        );


    for (let row = 0; row < rows; row++) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const wx =
                x +
                35 +
                column *
                ((width - 70) /
                    Math.max(1, columns - 1));

            const wy =
                y +
                55 +
                row * 70;


            if (wx > x + width - 25) {
                continue;
            }

            if (wy > y + height - 25) {
                continue;
            }


            graphics.fillStyle(
                windowColor,
                0.85
            );

            graphics.fillRect(
                wx - 12,
                wy - 10,
                24,
                20
            );
        }
    }


    /*
     * Door.
     */

    graphics.fillStyle(
        0x35291f,
        1
    );

    graphics.fillRect(
        x + width / 2 - 20,
        y + height - 45,
        40,
        45
    );


    /*
     * Collision body.
     */

    const body =
        scene.add.rectangle(
            x + width / 2,
            y + height / 2,
            width,
            height,
            0x000000,
            0
        );


    scene.physics.add.existing(
        body,
        true
    );


    campusCollision.add(
        body
    );
}


/* =========================================================
   31. TREES
   ========================================================= */

function createCampusTrees(scene) {

    const positions = [

        [120, 180],
        [980, 220],
        [1180, 300],
        [2800, 180],
        [2900, 600],

        [110, 720],
        [930, 720],
        [2700, 750],

        [120, 1160],
        [700, 1120],
        [1350, 1180],

        [150, 1870],
        [700, 1900],
        [1550, 1880],

        [1750, 1850],
        [2800, 1880],

        [2750, 1200],
        [2950, 1450]
    ];


    positions.forEach(
        ([x, y]) => {

            createTree(
                scene,
                x,
                y
            );
        }
    );
}


/* =========================================================
   32. TREE CREATION
   ========================================================= */

function createTree(scene, x, y) {

    const graphics =
        scene.add.graphics();


    /*
     * Shadow.
     */

    graphics.fillStyle(
        0x1e301b,
        0.3
    );

    graphics.fillEllipse(
        x,
        y + 25,
        55,
        20
    );


    /*
     * Trunk.
     */

    graphics.fillStyle(
        0x60452f,
        1
    );

    graphics.fillRect(
        x - 7,
        y,
        14,
        35
    );


    /*
     * Leaves.
     */

    graphics.fillStyle(
        0x31582d,
        1
    );

    graphics.fillCircle(
        x,
        y - 10,
        30
    );


    graphics.fillStyle(
        0x3f7137,
        1
    );

    graphics.fillCircle(
        x - 18,
        y,
        20
    );

    graphics.fillCircle(
        x + 18,
        y,
        20
    );


    campusTrees.add(
        graphics
    );
}


/* =========================================================
   33. CAMPUS DECORATIONS
   ========================================================= */

function createCampusDecorations(scene) {

    /*
     * Benches.
     */

    const benches = [

        [1050, 520],
        [1100, 560],
        [1720, 540],
        [1750, 570],
        [1300, 1400],
        [1500, 1380],
        [2500, 1400]
    ];


    benches.forEach(
        ([x, y]) => {

            createBench(
                scene,
                x,
                y
            );
        }
    );


    /*
     * Campus lights.
     */

    const lights = [

        [1050, 820],
        [1250, 820],
        [1800, 820],
        [2650, 820],

        [1050, 1180],
        [1800, 1180],
        [2650, 1180]
    ];


    lights.forEach(
        ([x, y]) => {

            createStreetLight(
                scene,
                x,
                y
            );
        }
    );
}


/* =========================================================
   34. BENCH
   ========================================================= */

function createBench(scene, x, y) {

    const graphics =
        scene.add.graphics();


    graphics.fillStyle(
        0x694832,
        1
    );

    graphics.fillRect(
        x - 35,
        y - 6,
        70,
        12
    );


    graphics.fillRect(
        x - 30,
        y + 10,
        8,
        22
    );

    graphics.fillRect(
        x + 22,
        y + 10,
        8,
        22
    );
}


/* =========================================================
   35. STREET LIGHT
   ========================================================= */

function createStreetLight(scene, x, y) {

    const graphics =
        scene.add.graphics();


    graphics.fillStyle(
        0x252525,
        1
    );

    graphics.fillRect(
        x - 3,
        y - 35,
        6,
        70
    );


    graphics.fillStyle(
        0xd8d1a5,
        1
    );

    graphics.fillCircle(
        x,
        y - 40,
        9
    );
}


/* =========================================================
   36. LOCATION LABELS
   ========================================================= */

function createCampusLabels(scene) {

    Object.values(CAMPUS_LOCATIONS)
        .forEach((location) => {

            const label =
                scene.add.text(
                    location.x +
                    location.width / 2,

                    location.y -
                    18,

                    location.name,

                    {
                        fontFamily:
                            "Arial",

                        fontSize:
                            "18px",

                        color:
                            "#ffffff",

                        stroke:
                            "#000000",

                        strokeThickness:
                            4,

                        align:
                            "center"
                    }
                );


            label.setOrigin(
                0.5,
                1
            );


            label.setDepth(10);


            campusLabels.add(
                label
            );
        });
}


/* =========================================================
   37. WORLD BOUNDARIES
   ========================================================= */

function createCampusBoundaries(scene) {

    /*
     * Invisible outer walls.
     */

    const thickness = 40;


    createCollisionRectangle(
        scene,
        WORLD_WIDTH / 2,
        -thickness / 2,
        WORLD_WIDTH,
        thickness
    );


    createCollisionRectangle(
        scene,
        WORLD_WIDTH / 2,
        WORLD_HEIGHT +
            thickness / 2,
        WORLD_WIDTH,
        thickness
    );


    createCollisionRectangle(
        scene,
        -thickness / 2,
        WORLD_HEIGHT / 2,
        thickness,
        WORLD_HEIGHT
    );


    createCollisionRectangle(
        scene,
        WORLD_WIDTH +
            thickness / 2,
        WORLD_HEIGHT / 2,
        thickness,
        WORLD_HEIGHT
    );
}


/* =========================================================
   38. COLLISION RECTANGLE
   ========================================================= */

function createCollisionRectangle(
    scene,
    x,
    y,
    width,
    height
) {

    const rectangle =
        scene.add.rectangle(
            x,
            y,
            width,
            height,
            0x000000,
            0
        );


    scene.physics.add.existing(
        rectangle,
        true
    );


    campusCollision.add(
        rectangle
    );
}


/* =========================================================
   39. LOCATION ZONES
   ========================================================= */

let locationZones = [];


function createLocationZones(scene) {

    locationZones = [];


    Object.values(CAMPUS_LOCATIONS)
        .forEach((location) => {

            const zone =
                scene.add.zone(
                    location.x +
                    location.width / 2,

                    location.y +
                    location.height / 2,

                    location.width,
                    location.height
                );


            zone.locationId =
                location.id;


            zone.locationData =
                location;


            locationZones.push(
                zone
            );
        });
}


/* =========================================================
   40. LOCATION DETECTION
   ========================================================= */

function updatePlayerLocation() {

    if (!playerSprite) {
        return;
    }


    let detectedLocation =
        null;


    for (
        const zone of locationZones
    ) {

        const inside =
            Phaser.Geom.Rectangle.Contains(
                zone.getBounds(),
                playerSprite.x,
                playerSprite.y
            );


        if (inside) {

            detectedLocation =
                zone.locationData;

            break;
        }
    }


    if (!detectedLocation) {

        if (
            gameState.location.current !==
            "University Campus"
        ) {

            setLocation(
                "University Campus",
                "Main Campus"
            );
        }

        return;
    }


    const current =
        gameState.location.current;


    if (
        current !==
        detectedLocation.name
    ) {

        setLocation(
            detectedLocation.name,
            detectedLocation.subtitle
        );
    }
}


/* =========================================================
   41. PATCH LOCATION UPDATE INTO GAME LOOP
   ========================================================= */

const originalGameUpdate =
    GameScene.prototype.update;


/*
 * We don't replace the update function.
 *
 * Instead, the original movement function will call
 * this helper once the next gameplay layer is added.
 *
 * For now we also run a lightweight timer.
 */

let locationCheckTimer = 0;


function updateLocationTimer(delta) {

    locationCheckTimer += delta;


    if (
        locationCheckTimer >= 150
    ) {

        locationCheckTimer = 0;

        updatePlayerLocation();
    }
}


/* =========================================================
   42. CAMPUS COLLISION SETUP
   ========================================================= */

function setupCampusCollision(scene) {

    if (
        !playerSprite ||
        !campusCollision
    ) {
        return;
    }


    scene.physics.add.collider(
        playerSprite,
        campusCollision
    );
}


/* =========================================================
   43. CAMPUS INITIALIZATION
   ========================================================= */

function initializeCampus(scene) {

    createCampusWorld(scene);

    setupCampusCollision(scene);

    updatePlayerLocation();
}


/* =========================================================
   44. EXTEND WORLD CREATION
   ========================================================= */

/*
 * The first part created the basic ground.
 *
 * We now add the full campus on top of it.
 */

const originalCreateWorldBackground =
    GameScene.prototype.createWorldBackground;


GameScene.prototype.createWorldBackground =
    function () {

        originalCreateWorldBackground.call(
            this
        );

        initializeCampus(
            this
        );
    };


/* =========================================================
   45. LOCATION UPDATE HELPER
   ========================================================= */

function updateCampusSystems(delta) {

    if (!gameStarted) {
        return;
    }

    if (!gameScene) {
        return;
    }

    updateLocationTimer(delta);
}


/* =========================================================
   46. CAMPUS CLOCK
   ========================================================= */

let gameClockAccumulator = 0;


function updateGameClock(delta) {

    if (!gameStarted) {
        return;
    }

    if (flags.paused) {
        return;
    }


    gameClockAccumulator += delta;


    /*
     * Phaser delta is milliseconds.
     *
     * 1000 ms = one real second.
     * One real second = one game minute.
     */

    while (
        gameClockAccumulator >=
        1000 *
        REAL_SECONDS_PER_GAME_MINUTE
    ) {

        gameClockAccumulator -=
            1000 *
            REAL_SECONDS_PER_GAME_MINUTE;


        advanceMinutes(1);


        /*
         * Slowly drain basic needs.
         */

        gameState.player.hunger =
            clamp(
                gameState.player.hunger -
                0.02,

                0,
                100
            );


        gameState.player.energy =
            clamp(
                gameState.player.energy -
                0.01,

                0,
                100
            );


        /*
         * Very low hunger eventually affects health.
         */

        if (
            gameState.player.hunger <= 10
        ) {

            gameState.player.health =
                clamp(
                    gameState.player.health -
                    0.02,

                    0,
                    100
                );
        }


        updatePlayerHUD();
    }
}


/* =========================================================
   47. WORLD SYSTEM UPDATE
   ========================================================= */

function updateWorldSystems(delta) {

    updateGameClock(delta);

    updateCampusSystems(delta);
}


/* =========================================================
   48. INITIAL CAMPUS STATE
   ========================================================= */

function prepareCampusState() {

    gameState.location.current =
        "University Campus";

    gameState.time.day =
        1;

    gameState.time.hour =
        8;

    gameState.time.minute =
        0;

    gameState.time.dayName =
        "Monday";
}


/* =========================================================
   49. PREPARE BEFORE GAME START
   ========================================================= */

const originalStartGame =
    startGame;


startGame = function (character) {

    prepareCampusState();

    originalStartGame(
        character
    );
};


/* =========================================================
   50. FINAL NOTE FOR PART 2
   ========================================================= */

/*
 * PART 2 COMPLETE.
 *
 * PART 3 WILL ADD:
 *
 * - NPC system
 * - Yusuf
 * - Aisha
 * - Tunde
 * - Chioma
 * - Ibrahim
 * - Mama
 * - NPC movement
 * - Interaction detection
 * - E-key interaction
 * - NPC proximity
 * - Interaction prompts
 *
 * DO NOT CLOSE THE IIFE.
 * PART 3 GOES DIRECTLY BELOW THIS LINE.
 */
 /* ============================================================
   OSOGBO CAMPUS LIFE
   GAME.JS — PART 3/10
   NPCs & INTERACTION
   ============================================================ */


/* =========================================================
   51. NPC DATA
   ========================================================= */

const NPC_DATA = {

    Yusuf: {
        id: "Yusuf",
        name: "Yusuf",
        role: "Student",
        color: 0x2979ff,

        x: 1080,
        y: 760,

        friendship: 0,

        dialogues: {
            freshStart: "First day? Don't worry, you'll get used to campus quickly.",
            explore: "You should explore the campus. There's more here than you think.",
            busy: "I'm trying to sort out some school work right now.",
            guide: "If you need help finding somewhere, just ask me.",
            around: "You'll find the library across the main road. The student centre is further south.",
            why: "Because campus can be confusing when you're new. Better to know your way around.",
            tease: "You look like someone who's already planning how to survive on ₦20k.",
            seeYou: "Alright, see you around campus."
        }
    },


    Aisha: {
        id: "Aisha",
        name: "Aisha",
        role: "Student",
        color: 0xe91e63,

        x: 1750,
        y: 700,

        friendship: 0,

        dialogues: {
            greeting: "Hey! I don't think I've seen you around before.",
            campus: "Campus gets really busy around lunchtime.",
            library: "The library is usually quieter in the afternoon.",
            study: "You should take your academics seriously from the beginning.",
            goodbye: "I'll see you around."
        }
    },


    Tunde: {
        id: "Tunde",
        name: "Tunde",
        role: "Student",
        color: 0xff9800,

        x: 2200,
        y: 1050,

        friendship: 0,

        dialogues: {
            greeting: "What's up? You new here?",
            work: "There are usually small jobs around campus if you know where to look.",
            money: "Student life and money don't always agree.",
            goodbye: "Catch you later."
        }
    },


    Chioma: {
        id: "Chioma",
        name: "Chioma",
        role: "Student",
        color: 0x9c27b0,

        x: 2200,
        y: 1500,

        friendship: 0,

        dialogues: {
            greeting: "Hi! Nice to meet you.",
            hostel: "Hostel life can be interesting, especially during exam season.",
            friends: "You'll meet plenty of people here.",
            goodbye: "Take care."
        }
    },


    Ibrahim: {
        id: "Ibrahim",
        name: "Ibrahim",
        role: "Student",
        color: 0x009688,

        x: 1300,
        y: 1550,

        friendship: 0,

        dialogues: {
            greeting: "Hey there.",
            class: "Don't miss your lectures. It adds up eventually.",
            study: "The library is your friend if you want good grades.",
            goodbye: "See you later."
        }
    },


    Mama: {
        id: "Mama",
        name: "Mama",
        role: "Food Vendor",
        color: 0xff7043,

        x: 1060,
        y: 1380,

        friendship: 0,

        dialogues: {
            greeting: "Come and eat, my child.",
            food: "I've got something hot and fresh for you.",
            price: "₦500. No stories.",
            goodbye: "Come back when you're hungry."
        }
    }
};


/* =========================================================
   52. NPC RUNTIME STORAGE
   ========================================================= */

const npcSprites = {};

let nearestNPC = null;


/* =========================================================
   53. NPC GROUP
   ========================================================= */

let npcGroup = null;


/* =========================================================
   54. CREATE NPC SYSTEM
   ========================================================= */

function initializeNPCSystem(scene) {

    npcGroup =
        scene.add.group();


    Object.values(NPC_DATA)
        .forEach((data) => {

            createNPC(
                scene,
                data
            );
        });
}


/* =========================================================
   55. CREATE NPC
   ========================================================= */

function createNPC(scene, data) {

    const body =
        scene.add.circle(
            data.x,
            data.y,
            22,
            data.color
        );


    body.setDepth(40);


    /*
     * Physics body.
     */

    scene.physics.add.existing(
        body
    );


    body.body.setCollideWorldBounds(
        true
    );


    body.body.setImmovable(
        true
    );


    /*
     * Name tag.
     */

    const nameTag =
        scene.add.text(
            data.x,
            data.y - 38,
            data.name,
            {
                fontFamily: "Arial",
                fontSize: "15px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4
            }
        );


    nameTag.setOrigin(
        0.5,
        0.5
    );


    nameTag.setDepth(45);


    /*
     * Small role label.
     */

    const roleTag =
        scene.add.text(
            data.x,
            data.y - 55,
            data.role,
            {
                fontFamily: "Arial",
                fontSize: "10px",
                color: "#dddddd",
                stroke: "#000000",
                strokeThickness: 3
            }
        );


    roleTag.setOrigin(
        0.5,
        0.5
    );


    roleTag.setDepth(45);


    /*
     * Runtime object.
     */

    const npc = {

        id: data.id,

        data,

        sprite: body,

        nameTag,

        roleTag,

        lastMoveTime: 0,

        targetX: data.x,

        targetY: data.y
    };


    npcSprites[data.id] =
        npc;


    npcGroup.add(
        body
    );
}


/* =========================================================
   56. NPC DEPTH
   ========================================================= */

function updateNPCDepth() {

    Object.values(npcSprites)
        .forEach((npc) => {

            if (!npc.sprite) return;

            npc.sprite.setDepth(
                40 + npc.sprite.y / 10000
            );

            npc.nameTag.setPosition(
                npc.sprite.x,
                npc.sprite.y - 38
            );

            npc.roleTag.setPosition(
                npc.sprite.x,
                npc.sprite.y - 55
            );
        });
}


/* =========================================================
   57. NPC DISTANCE
   ========================================================= */

function getDistanceToNPC(npc) {

    if (
        !playerSprite ||
        !npc ||
        !npc.sprite
    ) {
        return Infinity;
    }


    return Phaser.Math.Distance.Between(
        playerSprite.x,
        playerSprite.y,
        npc.sprite.x,
        npc.sprite.y
    );
}


/* =========================================================
   58. FIND NEAREST NPC
   ========================================================= */

function findNearestNPC() {

    if (!playerSprite) {
        return null;
    }


    let closest = null;

    let closestDistance =
        Infinity;


    Object.values(npcSprites)
        .forEach((npc) => {

            const distance =
                getDistanceToNPC(npc);


            if (
                distance < closestDistance
            ) {

                closest =
                    npc;

                closestDistance =
                    distance;
            }
        });


    /*
     * Interaction range.
     */

    if (
        closest &&
        closestDistance <= 100
    ) {

        return closest;
    }


    return null;
}


/* =========================================================
   59. INTERACTION PROMPT
   ========================================================= */

function showInteractionPrompt(
    key,
    text
) {

    const prompt =
        $("#interaction-prompt");

    if (!prompt) return;


    setText(
        "#interaction-key",
        key
    );

    setText(
        "#interaction-text",
        text
    );


    show(prompt);
}


/* =========================================================
   60. HIDE INTERACTION PROMPT
   ========================================================= */

function hideInteractionPrompt() {

    hide(
        $("#interaction-prompt")
    );
}


/* =========================================================
   61. UPDATE NPC INTERACTION
   ========================================================= */

function updateNPCInteraction() {

    if (
        flags.dialogueOpen ||
        flags.shopOpen ||
        flags.inventoryOpen ||
        flags.phoneOpen ||
        flags.paused
    ) {

        hideInteractionPrompt();

        return;
    }


    nearestNPC =
        findNearestNPC();


    if (!nearestNPC) {

        hideInteractionPrompt();

        return;
    }


    showInteractionPrompt(
        "E",
        `Talk to ${nearestNPC.data.name}`
    );
}


/* =========================================================
   62. NPC FRIENDSHIP
   ========================================================= */

function getNPCRelationship(
    npcName
) {

    const relationship =
        gameState.relationships[npcName];


    if (!relationship) {
        return null;
    }


    return relationship;
}


/* =========================================================
   63. RELATIONSHIP LEVEL
   ========================================================= */

function getRelationshipLevel(
    friendship
) {

    if (friendship >= 50) {
        return "Best Friend";
    }

    if (friendship >= 30) {
        return "Close Friend";
    }

    if (friendship >= 15) {
        return "Friend";
    }

    if (friendship >= 5) {
        return "Familiar";
    }

    if (friendship <= -10) {
        return "Enemy";
    }

    if (friendship < 0) {
        return "Disliked";
    }

    return "Stranger";
}


/* =========================================================
   64. CHANGE FRIENDSHIP
   ========================================================= */

function changeFriendship(
    npcName,
    amount
) {

    const relationship =
        getNPCRelationship(
            npcName
        );


    if (!relationship) {
        return;
    }


    relationship.friendship =
        clamp(
            relationship.friendship +
            amount,
            -100,
            100
        );


    relationship.conversations++;


    relationship.lastInteractionDay =
        gameState.time.day;


    updateRelationshipUI();
}


/* =========================================================
   65. NPC GREETING
   ========================================================= */

function getNPCGreeting(npc) {

    const data =
        npc.data;


    const relationship =
        getNPCRelationship(
            data.name
        );


    if (!relationship) {

        return (
            data.dialogues.greeting ||
            "Hello."
        );
    }


    if (
        relationship.friendship >= 30
    ) {

        return (
            data.dialogues.friends ||
            data.dialogues.greeting ||
            "Hey!"
        );
    }


    if (
        relationship.friendship < 0
    ) {

        return (
            "We need to talk."
        );
    }


    return (
        data.dialogues.greeting ||
        "Hello."
    );
}


/* =========================================================
   66. OPEN NPC INTERACTION
   ========================================================= */

function interactWithNPC(npc) {

    if (!npc) {
        return;
    }


    if (
        flags.dialogueOpen ||
        flags.interactionLocked
    ) {
        return;
    }


    flags.interactionLocked =
        true;


    hideInteractionPrompt();


    openNPCDialogue(
        npc
    );


    setTimeout(() => {

        flags.interactionLocked =
            false;

    }, 250);
}


/* =========================================================
   67. E KEY HANDLER
   ========================================================= */

function handleInteraction() {

    if (
        flags.paused ||
        flags.interactionLocked
    ) {
        return;
    }


    if (
        flags.dialogueOpen
    ) {
        return;
    }


    /*
     * NPC interaction has priority.
     */

    if (nearestNPC) {

        interactWithNPC(
            nearestNPC
        );

        return;
    }


    /*
     * Other interactions such as:
     *
     * Mama's Kitchen
     * Campus Shop
     * Library
     * Hostel
     * Bus Stop
     *
     * will be added in Part 5.
     */
}


/* =========================================================
   68. NPC MOVEMENT
   ========================================================= */

function updateNPCMovement(
    delta
) {

    /*
     * NPC movement is deliberately
     * very light for now.
     *
     * We don't want NPCs randomly
     * walking through buildings.
     */

    Object.values(npcSprites)
        .forEach((npc) => {

            npc.lastMoveTime += delta;


            if (
                npc.lastMoveTime < 5000
            ) {
                return;
            }


            npc.lastMoveTime = 0;


            /*
             * Only small idle movement.
             */

            const distance =
                Phaser.Math.Distance.Between(
                    npc.sprite.x,
                    npc.sprite.y,
                    npc.data.x,
                    npc.data.y
                );


            if (distance > 80) {

                npc.targetX =
                    npc.data.x;

                npc.targetY =
                    npc.data.y;
            } else {

                npc.targetX =
                    npc.data.x +
                    random(-45, 45);

                npc.targetY =
                    npc.data.y +
                    random(-45, 45);
            }


            sceneMoveNPC(
                npc
            );
        });
}


/* =========================================================
   69. MOVE NPC
   ========================================================= */

function sceneMoveNPC(npc) {

    if (
        !npc ||
        !npc.sprite
    ) {
        return;
    }


    const distance =
        Phaser.Math.Distance.Between(
            npc.sprite.x,
            npc.sprite.y,
            npc.targetX,
            npc.targetY
        );


    if (distance < 5) {
        return;
    }


    const angle =
        Phaser.Math.Angle.Between(
            npc.sprite.x,
            npc.sprite.y,
            npc.targetX,
            npc.targetY
        );


    const speed = 25;


    npc.sprite.body.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
    );
}


/* =========================================================
   70. STOP NPCS
   ========================================================= */

function stopNPCMovement() {

    Object.values(npcSprites)
        .forEach((npc) => {

            if (
                npc.sprite &&
                npc.sprite.body
            ) {

                npc.sprite.body.setVelocity(
                    0,
                    0
                );
            }
        });
}


/* =========================================================
   71. NPC COLLISION
   ========================================================= */

function setupNPCCollision(scene) {

    if (
        !playerSprite ||
        !npcGroup
    ) {
        return;
    }


    scene.physics.add.collider(
        playerSprite,
        npcGroup
    );
}


/* =========================================================
   72. NPC SYSTEM INITIALIZATION
   ========================================================= */

function initializeNPCs(scene) {

    initializeNPCSystem(
        scene
    );

    setupNPCCollision(
        scene
    );
}


/* =========================================================
   73. PATCH CAMPUS INITIALIZATION
   ========================================================= */

const previousInitializeCampus =
    initializeCampus;


initializeCampus = function(scene) {

    previousInitializeCampus(
        scene
    );


    initializeNPCs(
        scene
    );
};


/* =========================================================
   74. NPC SYSTEM UPDATE
   ========================================================= */

function updateNPCSystems(delta) {

    if (!gameStarted) {
        return;
    }


    if (flags.paused) {
        return;
    }


    updateNPCMovement(
        delta
    );

    updateNPCDepth();

    updateNPCInteraction();
}


/* =========================================================
   75. INTERACTION KEY UPDATE
   ========================================================= */

function updateInteractionKey() {

    if (!interactKey) {
        return;
    }


    if (
        Phaser.Input.Keyboard.JustDown(
            interactKey
        )
    ) {

        handleInteraction();
    }
}


/* =========================================================
   76. EXTEND GAME UPDATE
   ========================================================= */

const previousGameUpdate =
    GameScene.prototype.update;


GameScene.prototype.update =
    function(time, delta) {

        previousGameUpdate.call(
            this,
            time,
            delta
        );


        updateWorldSystems(
            delta
        );


        updateNPCSystems(
            delta
        );


        updateInteractionKey();
    };


/* =========================================================
   77. NPC START MESSAGE
   ========================================================= */

function showFirstCampusMessage() {

    if (!gameStarted) {
        return;
    }


    setTimeout(() => {

        notify(
            "Campus",
            "Explore the campus and meet some students."
        );

    }, 1800);
}


/* =========================================================
   78. INITIAL NPC MESSAGE
   ========================================================= */

const previousFinishLoading =
    finishLoading;


finishLoading = function() {

    previousFinishLoading();

    showFirstCampusMessage();
};


/* =========================================================
   79. PART 3 COMPLETE
   ========================================================= */

/*
 * PART 3 COMPLETE.
 *
 * CURRENTLY WE HAVE:
 *
 * ✓ Campus world
 * ✓ Buildings
 * ✓ Trees
 * ✓ Roads
 * ✓ Campus labels
 * ✓ Collision
 * ✓ Location detection
 * ✓ Yusuf
 * ✓ Aisha
 * ✓ Tunde
 * ✓ Chioma
 * ✓ Ibrahim
 * ✓ Mama
 * ✓ NPC proximity
 * ✓ E-key interaction
 * ✓ NPC friendship foundation
 * ✓ NPC movement
 *
 * PART 4 WILL BUILD:
 *
 * - Dialogue system
 * - Dialogue panel
 * - Dialogue choices
 * - Yusuf's full dialogue tree
 * - Relationship feedback
 * - Conversation consequences
 *
 * DO NOT CLOSE THE IIFE.
 * PART 4 GOES DIRECTLY BELOW THIS LINE.
 */
 /* ============================================================
   OSOGBO CAMPUS LIFE
   GAME.JS — PART 4/10
   DIALOGUE & RELATIONSHIPS
   ============================================================ */


/* =========================================================
   80. DIALOGUE STATE
   ========================================================= */

let activeNPC = null;

let activeDialogue = null;

let activeDialogueChoices = [];

let dialogueHistory = [];


/* =========================================================
   81. DIALOGUE PANEL ELEMENTS
   ========================================================= */

const dialoguePanel =
    $("#dialogue-panel");

const dialogueBody =
    $("#dialogue-body");

const dialogueChoices =
    $("#dialogue-choices");

const dialogueSpeaker =
    $("#dialogue-speaker");

const dialogueRole =
    $("#dialogue-role");

const dialogueRelationship =
    $("#dialogue-relationship");

const dialogueRelationshipLevel =
    $("#dialogue-relationship-level");

const dialogueRelationshipFill =
    $("#dialogue-relationship-fill");

const dialogueClose =
    $("#dialogue-close");


/* =========================================================
   82. RELATIONSHIP UI
   ========================================================= */

function updateRelationshipUI() {

    if (!activeNPC) {
        return;
    }


    const relationship =
        getNPCRelationship(
            activeNPC.data.name
        );


    if (!relationship) {
        return;
    }


    const friendship =
        relationship.friendship;


    const level =
        getRelationshipLevel(
            friendship
        );


    setText(
        "#dialogue-relationship",
        level
    );


    setText(
        "#dialogue-relationship-level",
        `${friendship}/100`
    );


    if (dialogueRelationshipFill) {

        /*
         * Convert -100..100 into 0..100.
         */

        const percentage =
            clamp(
                ((friendship + 100) / 200) * 100,
                0,
                100
            );


        dialogueRelationshipFill.style.width =
            `${percentage}%`;
    }


    updateRelationshipsList();
}


/* =========================================================
   83. RELATIONSHIP LIST
   ========================================================= */

function updateRelationshipsList() {

    const list =
        $("#relationships-list");


    if (!list) {
        return;
    }


    list.innerHTML = "";


    Object.keys(
        gameState.relationships
    ).forEach((name) => {

        const relationship =
            gameState.relationships[name];


        const level =
            getRelationshipLevel(
                relationship.friendship
            );


        const npc =
            NPC_DATA[name];


        if (!npc) {
            return;
        }


        const item =
            document.createElement("div");


        item.className =
            "relationship-item";


        item.innerHTML = `

            <div class="relationship-avatar"
                 style="background:#${npc.color
                    .toString(16)
                    .padStart(6, "0")}">

                ${escapeHTML(
                    name.charAt(0)
                )}

            </div>

            <div class="relationship-info">

                <div class="relationship-name">
                    ${escapeHTML(name)}
                </div>

                <div class="relationship-status">
                    ${escapeHTML(level)}
                </div>

            </div>

            <div class="relationship-score">
                ${relationship.friendship}
            </div>
        `;


        list.appendChild(
            item
        );
    });
}


/* =========================================================
   84. DIALOGUE DATA
   ========================================================= */

const DIALOGUE_DATA = {

    Yusuf: {

        greeting: {

            text:
                "Hey, I don't think I've seen you around before. You new here?",

            choices: [

                {
                    text:
                        "Yeah, today is my first day.",

                    response:
                        "Nice. Welcome to campus.",

                    friendship:
                        2,

                    next:
                        "freshStart"
                },

                {
                    text:
                        "I've been here for a while.",

                    response:
                        "Really? Maybe we've just never crossed paths.",

                    friendship:
                        1,

                    next:
                        "explore"
                },

                {
                    text:
                        "Why do you want to know?",

                    response:
                        "Easy, man. I was just asking.",

                    friendship:
                        -1,

                    next:
                        "why"
                }
            ]
        },


        freshStart: {

            text:
                "First day? Don't worry, you'll get used to campus quickly.",

            choices: [

                {
                    text:
                        "What should I know about campus?",

                    response:
                        "Start by learning where everything is. Faculty, library, hostel, food spots... it'll save you plenty of stress.",

                    friendship:
                        2,

                    next:
                        "guide"
                },

                {
                    text:
                        "I'm just going to explore.",

                    response:
                        "That's actually a good idea.",

                    friendship:
                        1,

                    next:
                        "explore"
                },

                {
                    text:
                        "I think I'll figure it out myself.",

                    response:
                        "Fair enough. See you around then.",

                    friendship:
                        0,

                    next:
                        "seeYou"
                }
            ]
        },


        explore: {

            text:
                "You should explore the campus. There's more here than you think.",

            choices: [

                {
                    text:
                        "What places should I check first?",

                    response:
                        "Try the library, student centre and food spots. You'll probably meet people there too.",

                    friendship:
                        2,

                    next:
                        "around"
                },

                {
                    text:
                        "Sounds good.",

                    response:
                        "Exactly. Get familiar with the place.",

                    friendship:
                        1,

                    next:
                        "seeYou"
                }
            ]
        },


        guide: {

            text:
                "If you need help finding somewhere, just ask me.",

            choices: [

                {
                    text:
                        "Where's the library?",

                    response:
                        "You'll find it across the main road. It's one of the bigger buildings on campus.",

                    friendship:
                        2,

                    next:
                        "around"
                },

                {
                    text:
                        "Where can I get food?",

                    response:
                        "Mama's Kitchen. Trust me, you'll be there a lot.",

                    friendship:
                        2,

                    next:
                        "around"
                },

                {
                    text:
                        "Thanks, I'll remember that.",

                    response:
                        "No problem.",

                    friendship:
                        1,

                    next:
                        "seeYou"
                }
            ]
        },


        around: {

            text:
                "You'll find the library across the main road. The student centre is further south.",

            choices: [

                {
                    text:
                        "What about places to eat?",

                    response:
                        "Mama's Kitchen. It's not fancy, but the food will save you.",

                    friendship:
                        2,

                    next:
                        "tease"
                },

                {
                    text:
                        "Got it. Thanks.",

                    response:
                        "Anytime.",

                    friendship:
                        1,

                    next:
                        "seeYou"
                }
            ]
        },


        why: {

            text:
                "Because campus can be confusing when you're new. Better to know your way around.",

            choices: [

                {
                    text:
                        "Fair enough. My bad.",

                    response:
                        "No worries.",

                    friendship:
                        2,

                    next:
                        "freshStart"
                },

                {
                    text:
                        "You could've just said that.",

                    response:
                        "And you could've just answered.",

                    friendship:
                        -2,

                    next:
                        "busy"
                }
            ]
        },


        busy: {

            text:
                "I'm trying to sort out some school work right now.",

            choices: [

                {
                    text:
                        "Alright, I'll leave you to it.",

                    response:
                        "Thanks. Catch you later.",

                    friendship:
                        1,

                    next:
                        "seeYou"
                },

                {
                    text:
                        "You always this busy?",

                    response:
                        "Depends on the day.",

                    friendship:
                        0,

                    next:
                        "tease"
                }
            ]
        },


        tease: {

            text:
                "You look like someone who's already planning how to survive on ₦20k.",

            choices: [

                {
                    text:
                        "How did you know?",

                    response:
                        "Because every student eventually learns the same lesson.",

                    friendship:
                        3,

                    next:
                        "seeYou"
                },

                {
                    text:
                        "Mind your business 😂",

                    response:
                        "Haha, alright, alright.",

                    friendship:
                        2,

                    next:
                        "seeYou"
                }
            ]
        },


        seeYou: {

            text:
                "Alright, see you around campus.",

            choices: [

                {
                    text:
                        "See you.",

                    response:
                        "",

                    friendship:
                        1,

                    next:
                        null
                }
            ]
        }
    },


    Aisha: {

        greeting: {

            text:
                "Hey! I don't think I've seen you around before.",

            choices: [

                {
                    text:
                        "I'm new here.",

                    response:
                        "Welcome! You'll get used to campus soon.",

                    friendship:
                        2,

                    next:
                        "campus"
                },

                {
                    text:
                        "Maybe you just didn't notice me.",

                    response:
                        "Maybe you're right.",

                    friendship:
                        1,

                    next:
                        "campus"
                }
            ]
        },


        campus: {

            text:
                "Campus gets really busy around lunchtime.",

            choices: [

                {
                    text:
                        "Where do you usually go?",

                    response:
                        "Usually the library or student centre.",

                    friendship:
                        2,

                    next:
                        "study"
                },

                {
                    text:
                        "Good to know.",

                    response:
                        "You'll figure out your own routine.",

                    friendship:
                        1,

                    next:
                        "goodbye"
                }
            ]
        },


        study: {

            text:
                "You should take your academics seriously from the beginning.",

            choices: [

                {
                    text:
                        "I definitely will.",

                    response:
                        "Good. Don't wait until exams to start.",

                    friendship:
                        2,

                    next:
                        "goodbye"
                },

                {
                    text:
                        "I'll try.",

                    response:
                        "That's a start.",

                    friendship:
                        1,

                    next:
                        "goodbye"
                }
            ]
        },


        goodbye: {

            text:
                "I'll see you around.",

            choices: [

                {
                    text:
                        "See you.",

                    response:
                        "",

                    friendship:
                        1,

                    next:
                        null
                }
            ]
        }
    },


    Tunde: {

        greeting: {

            text:
                "What's up? You new here?",

            choices: [

                {
                    text:
                        "Yeah.",

                    response:
                        "Nice. Welcome to campus.",

                    friendship:
                        2,

                    next:
                        "work"
                },

                {
                    text:
                        "No, I've been around.",

                    response:
                        "Then I guess we've never met.",

                    friendship:
                        1,

                    next:
                        "money"
                }
            ]
        },


        work: {

            text:
                "There are usually small jobs around campus if you know where to look.",

            choices: [

                {
                    text:
                        "I could use some money.",

                    response:
                        "Then keep your eyes open. Student Jobs has some opportunities.",

                    friendship:
                        2,

                    next:
                        "money"
                },

                {
                    text:
                        "What kind of jobs?",

                    response:
                        "Anything from helping students to small campus tasks.",

                    friendship:
                        2,

                    next:
                        "money"
                }
            ]
        },


        money: {

            text:
                "Student life and money don't always agree.",

            choices: [

                {
                    text:
                        "That's already becoming obvious.",

                    response:
                        "Haha. You'll survive.",

                    friendship:
                        2,

                    next:
                        "goodbye"
                },

                {
                    text:
                        "I'm not worried.",

                    response:
                        "Confidence. I like that.",

                    friendship:
                        1,

                    next:
                        "goodbye"
                }
            ]
        },


        goodbye: {

            text:
                "Catch you later.",

            choices: [

                {
                    text:
                        "Later.",

                    response:
                        "",

                    friendship:
                        1,

                    next:
                        null
                }
            ]
        }
    },


    Chioma: {

        greeting: {

            text:
                "Hi! Nice to meet you.",

            choices: [

                {
                    text:
                        "Nice to meet you too.",

                    response:
                        "Are you just getting settled in?",

                    friendship:
                        2,

                    next:
                        "hostel"
                },

                {
                    text:
                        "Hey.",

                    response:
                        "You seem quiet.",

                    friendship:
                        1,

                    next:
                        "friends"
                }
            ]
        },


        hostel: {

            text:
                "Hostel life can be interesting, especially during exam season.",

            choices: [

                {
                    text:
                        "I'm already preparing myself.",

                    response:
                        "Good. You'll need it.",

                    friendship:
                        2,

                    next:
                        "friends"
                },

                {
                    text:
                        "Is it really that bad?",

                    response:
                        "Sometimes. But you'll make friends there.",

                    friendship:
                        2,

                    next:
                        "friends"
                }
            ]
        },


        friends: {

            text:
                "You'll meet plenty of people here.",

            choices: [

                {
                    text:
                        "I'm looking forward to it.",

                    response:
                        "Then you'll fit in just fine.",

                    friendship:
                        2,

                    next:
                        "goodbye"
                },

                {
                    text:
                        "We'll see.",

                    response:
                        "Fair enough.",

                    friendship:
                        1,

                    next:
                        "goodbye"
                }
            ]
        },


        goodbye: {

            text:
                "Take care.",

            choices: [

                {
                    text:
                        "You too.",

                    response:
                        "",

                    friendship:
                        1,

                    next:
                        null
                }
            ]
        }
    },


    Ibrahim: {

        greeting: {

            text:
                "Hey there.",

            choices: [

                {
                    text:
                        "Hey.",

                    response:
                        "You attending class today?",

                    friendship:
                        1,

                    next:
                        "class"
                },

                {
                    text:
                        "What's up?",

                    response:
                        "Not much. Just trying to stay productive.",

                    friendship:
                        2,

                    next:
                        "study"
                }
            ]
        },


        class: {

            text:
                "Don't miss your lectures. It adds up eventually.",

            choices: [

                {
                    text:
                        "I'll attend.",

                    response:
                        "Good choice.",

                    friendship:
                        2,

                    next:
                        "study"
                },

                {
                    text:
                        "I'll decide later.",

                    response:
                        "That's usually how people end up regretting it.",

                    friendship:
                        0,

                    next:
                        "study"
                }
            ]
        },


        study: {

            text:
                "The library is your friend if you want good grades.",

            choices: [

                {
                    text:
                        "I'll keep that in mind.",

                    response:
                        "Good luck with your studies.",

                    friendship:
                        2,

                    next:
                        "goodbye"
                },

                {
                    text:
                        "I'm not really a library person.",

                    response:
                        "Then you'd better find another way to study.",

                    friendship:
                        1,

                    next:
                        "goodbye"
                }
            ]
        },


        goodbye: {

            text:
                "See you later.",

            choices: [

                {
                    text:
                        "Later.",

                    response:
                        "",

                    friendship:
                        1,

                    next:
                        null
                }
            ]
        }
    },


    Mama: {

        greeting: {

            text:
                "Come and eat, my child.",

            choices: [

                {
                    text:
                        "How much is food?",

                    response:
                        "₦500. No stories.",

                    friendship:
                        1,

                    next:
                        "food"
                },

                {
                    text:
                        "I'm not hungry yet.",

                    response:
                        "No problem. Come back when you're hungry.",

                    friendship:
                        1,

                    next:
                        "goodbye"
                }
            ]
        },


        food: {

            text:
                "I've got something hot and fresh for you.",

            choices: [

                {
                    text:
                        "I'll come back later.",

                    response:
                        "I'll be here.",

                    friendship:
                        1,

                    next:
                        "goodbye"
                },

                {
                    text:
                        "Sounds good.",

                    response:
                        "Then don't waste time.",

                    friendship:
                        2,

                    next:
                        "goodbye"
                }
            ]
        },


        goodbye: {

            text:
                "Come back when you're hungry.",

            choices: [

                {
                    text:
                        "I will.",

                    response:
                        "",

                    friendship:
                        1,

                    next:
                        null
                }
            ]
        }
    }
};


/* =========================================================
   85. GET DIALOGUE TREE
   ========================================================= */

function getDialogueTree(npcName) {

    return (
        DIALOGUE_DATA[npcName] ||
        null
    );
}


/* =========================================================
   86. GET STARTING DIALOGUE
   ========================================================= */

function getStartingDialogue(npcName) {

    const tree =
        getDialogueTree(
            npcName
        );


    if (!tree) {
        return null;
    }


    /*
     * Returning characters should
     * have a slightly different start
     * later as the relationship system
     * develops.
     */

    return (
        tree.greeting ||
        null
    );
}


/* =========================================================
   87. OPEN NPC DIALOGUE
   ========================================================= */

function openNPCDialogue(npc) {

    if (!npc) {
        return;
    }


    const tree =
        getDialogueTree(
            npc.data.name
        );


    if (!tree) {
        notify(
            npc.data.name,
            "They don't have anything to say right now."
        );

        return;
    }


    activeNPC =
        npc;


    flags.dialogueOpen =
        true;


    activeDialogue =
        getStartingDialogue(
            npc.data.name
        );


    activeDialogueChoices =
        activeDialogue?.choices ||
        [];


    dialogueHistory = [];


    stopPlayerMovement();


    show(
        dialoguePanel
    );


    renderDialogue();
}


/* =========================================================
   88. RENDER DIALOGUE
   ========================================================= */

function renderDialogue() {

    if (
        !activeNPC ||
        !activeDialogue
    ) {
        return;
    }


    const npc =
        activeNPC.data;


    setText(
        "#dialogue-speaker",
        npc.name
    );


    setText(
        "#dialogue-role",
        npc.role
    );


    const relationship =
        getNPCRelationship(
            npc.name
        );


    if (relationship) {

        setText(
            "#dialogue-relationship",
            getRelationshipLevel(
                relationship.friendship
            )
        );

        setText(
            "#dialogue-relationship-level",
            `${relationship.friendship}/100`
        );


        const percentage =
            clamp(
                ((relationship.friendship + 100) / 200) * 100,
                0,
                100
            );


        if (dialogueRelationshipFill) {

            dialogueRelationshipFill.style.width =
                `${percentage}%`;
        }
    }


    setText(
        "#dialogue-body",
        activeDialogue.text
    );


    renderDialogueChoices();
}


/* =========================================================
   89. RENDER CHOICES
   ========================================================= */

function renderDialogueChoices() {

    if (!dialogueChoices) {
        return;
    }


    dialogueChoices.innerHTML = "";


    activeDialogueChoices
        .forEach((choice, index) => {

            const button =
                document.createElement("button");


            button.className =
                "dialogue-choice";


            button.dataset.choiceIndex =
                index;


            button.textContent =
                `${index + 1}. ${choice.text}`;


            button.addEventListener(
                "click",
                () => {

                    chooseDialogueOption(
                        index
                    );
                }
            );


            dialogueChoices.appendChild(
                button
            );
        });
}


/* =========================================================
   90. CHOOSE DIALOGUE OPTION
   ========================================================= */

function chooseDialogueOption(index) {

    if (
        !activeNPC ||
        !activeDialogue
    ) {
        return;
    }


    const choice =
        activeDialogueChoices[index];


    if (!choice) {
        return;
    }


    dialogueHistory.push({
        text: choice.text,
        friendship: choice.friendship || 0
    });


    /*
     * Apply relationship change.
     */

    if (
        choice.friendship
    ) {

        changeFriendship(
            activeNPC.data.name,
            choice.friendship
        );
    }


    /*
     * Show response.
     */

    if (
        choice.response
    ) {

        setText(
            "#dialogue-body",
            choice.response
        );
    }


    /*
     * Move to next dialogue node.
     */

    if (
        choice.next
    ) {

        const tree =
            getDialogueTree(
                activeNPC.data.name
            );


        const nextDialogue =
            tree?.[choice.next];


        if (nextDialogue) {

            setTimeout(() => {

                activeDialogue =
                    nextDialogue;

                activeDialogueChoices =
                    nextDialogue.choices ||
                    [];

                renderDialogue();

            }, 500);


            return;
        }
    }


    /*
     * End conversation.
     */

    setTimeout(() => {

        closeDialogue();

    }, 650);
}


/* =========================================================
   91. CLOSE DIALOGUE
   ========================================================= */

function closeDialogue() {

    hide(
        dialoguePanel
    );


    flags.dialogueOpen =
        false;


    activeNPC =
        null;


    activeDialogue =
        null;


    activeDialogueChoices =
        [];


    dialogueHistory =
        [];


    if (playerSprite?.body) {

        playerSprite.body.setVelocity(
            0,
            0
        );
    }
}


/* =========================================================
   92. DIALOGUE CLOSE BUTTON
   ========================================================= */

if (dialogueClose) {

    dialogueClose.addEventListener(
        "click",
        closeDialogue
    );
}


/* =========================================================
   93. ESC CLOSE DIALOGUE
   ========================================================= */

function handleDialogueEscape() {

    if (
        !flags.dialogueOpen
    ) {
        return false;
    }


    closeDialogue();

    return true;
}


/* =========================================================
   94. STOP PLAYER MOVEMENT
   ========================================================= */

function stopPlayerMovement() {

    if (
        playerSprite &&
        playerSprite.body
    ) {

        playerSprite.body.setVelocity(
            0,
            0
        );
    }


    flags.mobileMovement.up =
        false;

    flags.mobileMovement.down =
        false;

    flags.mobileMovement.left =
        false;

    flags.mobileMovement.right =
        false;
}


/* =========================================================
   95. RELATIONSHIP NOTIFICATION
   ========================================================= */

function relationshipChangeNotification(
    npcName,
    amount
) {

    if (!amount) {
        return;
    }


    const direction =
        amount > 0
            ? "Relationship improved"
            : "Relationship worsened";


    const sign =
        amount > 0
            ? `+${amount}`
            : `${amount}`;


    notify(
        `${npcName}`,
        `${direction}: ${sign}`
    );
}


/* =========================================================
   96. ENHANCE FRIENDSHIP FUNCTION
   ========================================================= */

const originalChangeFriendship =
    changeFriendship;


changeFriendship = function(
    npcName,
    amount
) {

    originalChangeFriendship(
        npcName,
        amount
    );


    relationshipChangeNotification(
        npcName,
        amount
    );
};


/* =========================================================
   97. DIALOGUE RELATIONSHIP UPDATE
   ========================================================= */

function refreshDialogueRelationship() {

    if (
        !flags.dialogueOpen ||
        !activeNPC
    ) {
        return;
    }


    updateRelationshipUI();
}


/* =========================================================
   98. DIALOGUE KEYBOARD SHORTCUTS
   ========================================================= */

function handleDialogueKeyboard() {

    if (
        !flags.dialogueOpen
    ) {
        return;
    }


    for (
        let index = 0;
        index < 9;
        index++
    ) {

        const keyCode =
            Phaser.Input.Keyboard.KeyCodes
                .ONE + index;


        const key =
            gameScene?.input.keyboard
                .addKey(keyCode);


        if (
            key &&
            Phaser.Input.Keyboard
                .JustDown(key)
        ) {

            chooseDialogueOption(
                index
            );

            break;
        }
    }
}


/* =========================================================
   99. DIALOGUE SYSTEM UPDATE
   ========================================================= */

function updateDialogueSystems() {

    if (
        !flags.dialogueOpen
    ) {
        return;
    }


    refreshDialogueRelationship();
}


/* =========================================================
   100. EXTEND GAME UPDATE
   ========================================================= */

const previousDialogueUpdate =
    GameScene.prototype.update;


GameScene.prototype.update =
    function(time, delta) {

        previousDialogueUpdate.call(
            this,
            time,
            delta
        );


        updateDialogueSystems();
    };


/* =========================================================
   101. RELATIONSHIP PANEL
   ========================================================= */

function openRelationshipsPanel() {

    updateRelationshipsList();

    show(
        $("#relationships-panel")
    );
}


function closeRelationshipsPanel() {

    hide(
        $("#relationships-panel")
    );
}


const relationshipsButton =
    $("#relationships-panel");


/* =========================================================
   102. RELATIONSHIP CLOSE BUTTON
   ========================================================= */

const relationshipsClose =
    $("#relationships-close");


if (relationshipsClose) {

    relationshipsClose.addEventListener(
        "click",
        closeRelationshipsPanel
    );
}


/* =========================================================
   103. DIALOGUE PANEL INITIAL STATE
   ========================================================= */

hide(
    dialoguePanel
);


/* =========================================================
   104. PART 4 COMPLETE
   ========================================================= */

/*
 * PART 4 COMPLETE.
 *
 * WE NOW HAVE:
 *
 * ✓ NPCs
 * ✓ NPC proximity
 * ✓ E-key interaction
 * ✓ Dialogue panel
 * ✓ Dialogue choices
 * ✓ Yusuf dialogue tree
 * ✓ Aisha dialogue
 * ✓ Tunde dialogue
 * ✓ Chioma dialogue
 * ✓ Ibrahim dialogue
 * ✓ Mama dialogue
 * ✓ Friendship points
 * ✓ Relationship levels
 * ✓ Relationship notifications
 * ✓ Dialogue history
 *
 * PART 5 WILL ADD:
 *
 * - Mama's Kitchen
 * - Campus Shop
 * - Food
 * - Hunger
 * - Inventory effects
 * - Classes
 * - Studying
 * - Working
 * - Sleeping
 * - Resting
 * - Energy
 * - Happiness
 * - Academic progress
 * - Reputation
 *
 * DO NOT CLOSE THE IIFE.
 * PART 5 GOES DIRECTLY BELOW THIS LINE.
 */
 /* ============================================================
   OSOGBO CAMPUS LIFE
   GAME.JS — PART 5/10
   DAILY LIFE SYSTEMS
   ============================================================ */


/* =========================================================
   105. DAILY LIFE INTERACTION RANGE
   ========================================================= */

const INTERACTION_RANGE = 115;


/* =========================================================
   106. LIFE ACTION STATE
   ========================================================= */

let currentLifeAction = null;


/* =========================================================
   107. ACTION DEFINITIONS
   ========================================================= */

const LIFE_ACTIONS = {

    meal: {
        name: "Eat a Meal",
        cost: 500,
        minutes: 30
    },

    class: {
        name: "Attend Class",
        minutes: 90
    },

    study: {
        name: "Study",
        minutes: 60
    },

    work: {
        name: "Work",
        minutes: 120
    },

    rest: {
        name: "Rest",
        minutes: 60
    },

    sleep: {
        name: "Sleep",
        minutes: 0
    }
};


/* =========================================================
   108. FIND NEARBY LOCATION
   ========================================================= */

function getNearbyLocation() {

    if (!playerSprite) {
        return null;
    }


    let nearest = null;

    let nearestDistance =
        Infinity;


    Object.values(
        CAMPUS_LOCATIONS
    ).forEach((location) => {

        const centerX =
            location.x +
            location.width / 2;

        const centerY =
            location.y +
            location.height / 2;


        const distance =
            Phaser.Math.Distance.Between(
                playerSprite.x,
                playerSprite.y,
                centerX,
                centerY
            );


        /*
         * Only locations reasonably close
         * to the player can be interacted with.
         */

        if (
            distance <=
            Math.max(
                location.width,
                location.height
            ) / 2 +
            INTERACTION_RANGE
        ) {

            if (
                distance <
                nearestDistance
            ) {

                nearest =
                    location;

                nearestDistance =
                    distance;
            }
        }
    });


    return nearest;
}


/* =========================================================
   109. LOCATION INTERACTION TEXT
   ========================================================= */

function getLocationInteractionText(
    location
) {

    if (!location) {
        return null;
    }


    switch (location.id) {

        case "kitchen":
            return "Eat at Mama's Kitchen";

        case "shop":
            return "Open Campus Shop";

        case "lectureHall":
            return "Attend Class";

        case "library":
            return "Study at Library";

        case "lawFaculty":
            return "Go to Faculty";

        case "hostel":
            return "Rest / Sleep";

        case "jobs":
            return "Work";

        case "busStop":
            return "Open Transport";

        case "studentCentre":
            return "Enter Student Centre";

        case "residence":
            return "Enter Residence";

        default:
            return "Enter";
    }
}


/* =========================================================
   110. FIND NEAREST INTERACTABLE
   ========================================================= */

function getNearestInteractable() {

    /*
     * NPC takes priority.
     */

    if (nearestNPC) {
        return {
            type: "npc",
            object: nearestNPC
        };
    }


    const location =
        getNearbyLocation();


    if (!location) {
        return null;
    }


    return {
        type: "location",
        object: location
    };
}


/* =========================================================
   111. UPDATE GENERAL INTERACTION
   ========================================================= */

function updateGeneralInteraction() {

    if (
        flags.dialogueOpen ||
        flags.paused ||
        flags.shopOpen ||
        flags.inventoryOpen
    ) {

        return;
    }


    const interaction =
        getNearestInteractable();


    if (!interaction) {

        hideInteractionPrompt();

        return;
    }


    if (
        interaction.type ===
        "npc"
    ) {

        /*
         * NPC interaction is already
         * handled by Part 3.
         */

        return;
    }


    const location =
        interaction.object;


    showInteractionPrompt(
        "E",
        getLocationInteractionText(
            location
        )
    );
}


/* =========================================================
   112. GENERAL INTERACTION
   ========================================================= */

function handleGeneralInteraction() {

    if (
        flags.paused ||
        flags.dialogueOpen
    ) {
        return;
    }


    /*
     * NPC first.
     */

    if (nearestNPC) {

        interactWithNPC(
            nearestNPC
        );

        return;
    }


    const location =
        getNearbyLocation();


    if (!location) {
        return;
    }


    switch (location.id) {

        case "kitchen":
            openFoodPanel();
            break;

        case "shop":
            openShop();
            break;

        case "lectureHall":
            openClassPanel();
            break;

        case "library":
            openStudyPanel();
            break;

        case "hostel":
            openRestPanel();
            break;

        case "jobs":
            openWorkPanel();
            break;

        case "busStop":
            openTransportPanel();
            break;

        case "lawFaculty":

            notify(
                "Faculty of Law",
                "This is your faculty. Your academic journey starts here."
            );

            break;

        case "studentCentre":

            notify(
                "Student Centre",
                "Students gather here between classes."
            );

            break;

        case "residence":

            notify(
                "Residence",
                "This is the off-campus residential area."
            );

            break;
    }
}


/* =========================================================
   113. FOOD PANEL
   ========================================================= */

function openFoodPanel() {

    const panel =
        $("#food-panel");


    if (!panel) {

        eatAtMamaKitchen();

        return;
    }


    currentLifeAction =
        "meal";


    show(panel);


    hideInteractionPrompt();
}


function closeFoodPanel() {

    hide(
        $("#food-panel")
    );

    currentLifeAction =
        null;
}


/* =========================================================
   114. EAT AT MAMA'S KITCHEN
   ========================================================= */

function eatAtMamaKitchen() {

    if (
        gameState.player.money <
        LIFE_ACTIONS.meal.cost
    ) {

        notify(
            "Mama's Kitchen",
            "You need ₦500 to buy a meal."
        );

        return;
    }


    if (
        gameState.player.hunger >= 95
    ) {

        notify(
            "Mama's Kitchen",
            "You're not really hungry right now."
        );

        return;
    }


    if (
        !spendMoney(500)
    ) {
        return;
    }


    changeStat(
        "hunger",
        30
    );

    changeStat(
        "happiness",
        5
    );

    changeStat(
        "energy",
        5
    );


    gameState.stats.mealsTaken++;


    advanceMinutes(30);


    notify(
        "Meal",
        "You had a good meal at Mama's Kitchen."
    );


    updateQuestProgress(
        "eatMeal"
    );


    closeFoodPanel();
}


/* =========================================================
   115. CLASS PANEL
   ========================================================= */

function openClassPanel() {

    const panel =
        $("#class-panel");


    if (!panel) {

        attendClass();

        return;
    }


    currentLifeAction =
        "class";


    show(panel);

    hideInteractionPrompt();
}


function closeClassPanel() {

    hide(
        $("#class-panel")
    );

    currentLifeAction =
        null;
}


/* =========================================================
   116. ATTEND CLASS
   ========================================================= */

function attendClass() {

    if (
        gameState.player.energy <
        15
    ) {

        notify(
            "Too Tired",
            "You don't have enough energy for class."
        );

        return;
    }


    changeStat(
        "energy",
        -15
    );

    changeStat(
        "hunger",
        -8
    );

    changeStat(
        "happiness",
        -2
    );


    gameState.player.academic =
        clamp(
            gameState.player.academic + 5,
            0,
            100
        );


    gameState.player.reputation =
        clamp(
            gameState.player.reputation + 1,
            -100,
            100
        );


    gameState.stats.classesAttended++;


    advanceMinutes(90);


    notify(
        "Class Complete",
        "You attended your lecture. Academic progress +5."
    );


    updateQuestProgress(
        "attendClass"
    );


    closeClassPanel();

    updateProfileUI();
}


/* =========================================================
   117. STUDY PANEL
   ========================================================= */

function openStudyPanel() {

    const panel =
        $("#study-panel");


    if (!panel) {

        study();

        return;
    }


    currentLifeAction =
        "study";


    show(panel);

    hideInteractionPrompt();
}


function closeStudyPanel() {

    hide(
        $("#study-panel")
    );

    currentLifeAction =
        null;
}


/* =========================================================
   118. STUDY
   ========================================================= */

function study() {

    if (
        gameState.player.energy <
        10
    ) {

        notify(
            "Too Tired",
            "You need more energy before studying."
        );

        return;
    }


    changeStat(
        "energy",
        -10
    );

    changeStat(
        "hunger",
        -5
    );

    changeStat(
        "happiness",
        1
    );


    gameState.player.academic =
        clamp(
            gameState.player.academic + 4,
            0,
            100
        );


    gameState.stats.studySessions++;


    advanceMinutes(60);


    notify(
        "Study Session",
        "You spent time studying. Academic progress +4."
    );


    updateQuestProgress(
        "studyLibrary"
    );


    closeStudyPanel();

    updateProfileUI();
}


/* =========================================================
   119. WORK PANEL
   ========================================================= */

function openWorkPanel() {

    const panel =
        $("#work-panel");


    if (!panel) {

        work();

        return;
    }


    currentLifeAction =
        "work";


    show(panel);

    hideInteractionPrompt();
}


function closeWorkPanel() {

    hide(
        $("#work-panel")
    );

    currentLifeAction =
        null;
}


/* =========================================================
   120. WORK
   ========================================================= */

function work() {

    if (
        gameState.player.energy <
        20
    ) {

        notify(
            "Too Tired",
            "You don't have enough energy to work."
        );

        return;
    }


    changeStat(
        "energy",
        -20
    );

    changeStat(
        "hunger",
        -10
    );

    changeStat(
        "happiness",
        -3
    );


    gameState.player.reputation =
        clamp(
            gameState.player.reputation + 1,
            -100,
            100
        );


    const payment =
        1500;


    changeMoney(
        payment
    );


    gameState.stats.workSessions++;

    gameState.stats.moneyEarned +=
        payment;


    advanceMinutes(120);


    notify(
        "Work Complete",
        `You earned ${formatMoney(payment)}.`
    );


    updateQuestProgress(
        "firstWork"
    );


    closeWorkPanel();

    updateProfileUI();
}


/* =========================================================
   121. REST PANEL
   ========================================================= */

function openRestPanel() {

    const panel =
        $("#sleep-panel");


    if (!panel) {

        rest();

        return;
    }


    currentLifeAction =
        "rest";


    show(panel);

    hideInteractionPrompt();
}


function closeRestPanel() {

    hide(
        $("#sleep-panel")
    );

    currentLifeAction =
        null;
}


/* =========================================================
   122. REST
   ========================================================= */

function rest() {

    changeStat(
        "energy",
        25
    );

    changeStat(
        "health",
        3
    );

    changeStat(
        "happiness",
        3
    );


    advanceMinutes(60);


    notify(
        "Rest",
        "You took some time to rest."
    );


    closeRestPanel();
}


/* =========================================================
   123. SLEEP
   ========================================================= */

function sleep() {

    const currentMinutes =
        gameState.time.hour * 60 +
        gameState.time.minute;


    const targetMinutes =
        7 * 60;


    let minutesUntilWake;


    if (
        currentMinutes <
        targetMinutes
    ) {

        minutesUntilWake =
            targetMinutes -
            currentMinutes;

    } else {

        minutesUntilWake =
            1440 -
            currentMinutes +
            targetMinutes;
    }


    /*
     * Sleep.
     */

    advanceMinutes(
        minutesUntilWake
    );


    gameState.player.energy =
        100;


    gameState.player.health =
        clamp(
            gameState.player.health + 10,
            0,
            100
        );


    gameState.player.hunger =
        clamp(
            gameState.player.hunger - 15,
            0,
            100
        );


    gameState.player.happiness =
        clamp(
            gameState.player.happiness + 5,
            0,
            100
        );


    notify(
        "Good Morning",
        "You woke up feeling refreshed."
    );


    closeRestPanel();

    updatePlayerHUD();
}


/* =========================================================
   124. ACTION BUTTON HELPERS
   ========================================================= */

function connectActionButton(
    selector,
    action
) {

    const button =
        $(selector);


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        action
    );
}


/* =========================================================
   125. DAILY LIFE BUTTONS
   ========================================================= */

function setupDailyLifeButtons() {

    /*
     * Food
     */

    connectActionButton(
        "#food-confirm",
        eatAtMamaKitchen
    );


    connectActionButton(
        "#food-cancel",
        closeFoodPanel
    );


    /*
     * Class
     */

    connectActionButton(
        "#class-confirm",
        attendClass
    );


    connectActionButton(
        "#class-cancel",
        closeClassPanel
    );


    /*
     * Study
     */

    connectActionButton(
        "#study-confirm",
        study
    );


    connectActionButton(
        "#study-cancel",
        closeStudyPanel
    );


    /*
     * Work
     */

    connectActionButton(
        "#work-confirm",
        work
    );


    connectActionButton(
        "#work-cancel",
        closeWorkPanel
    );


    /*
     * Rest / sleep.
     *
     * The existing HTML gives us
     * rest-confirm, so the first
     * click performs a normal rest.
     */

    connectActionButton(
        "#rest-confirm",
        rest
    );


    connectActionButton(
        "#rest-cancel",
        closeRestPanel
    );
}


/* =========================================================
   126. SLEEP FROM HOSTEL
   ========================================================= */

function trySleepAtHostel() {

    if (
        gameState.time.hour >= 21 ||
        gameState.time.hour < 6
    ) {

        sleep();

        return;
    }


    notify(
        "Hostel",
        "It's still early. You can rest now or sleep later tonight."
    );
}


/* =========================================================
   127. HOSTEL INTERACTION OVERRIDE
   ========================================================= */

const originalOpenRestPanel =
    openRestPanel;


openRestPanel = function() {

    const panel =
        $("#sleep-panel");


    if (!panel) {

        trySleepAtHostel();

        return;
    }


    currentLifeAction =
        "rest";


    show(panel);

    hideInteractionPrompt();
};


/* =========================================================
   128. LOW STAT WARNING
   ========================================================= */

let lastLowHungerWarning =
    0;

let lastLowEnergyWarning =
    0;


function checkLowStats() {

    const now =
        Date.now();


    if (
        gameState.player.hunger <= 20 &&
        now - lastLowHungerWarning > 30000
    ) {

        lastLowHungerWarning =
            now;


        notify(
            "You're Hungry",
            "Find somewhere to eat before your health drops."
        );
    }


    if (
        gameState.player.energy <= 15 &&
        now - lastLowEnergyWarning > 30000
    ) {

        lastLowEnergyWarning =
            now;


        notify(
            "You're Tired",
            "Rest or sleep to recover your energy."
        );
    }
}


/* =========================================================
   129. DAILY LIFE UPDATE
   ========================================================= */

function updateDailyLifeSystems() {

    if (!gameStarted) {
        return;
    }


    if (flags.paused) {
        return;
    }


    checkLowStats();

    updateGeneralInteraction();
}


/* =========================================================
   130. PROFILE UI
   ========================================================= */

function updateProfileUI() {

    setText(
        "#profile-name",
        gameState.player.name
    );

    setText(
        "#profile-course",
        gameState.player.course
    );

    setText(
        "#profile-age",
        gameState.player.age
    );

    setText(
        "#profile-gender",
        capitalize(
            gameState.player.gender
        )
    );

    setText(
        "#profile-day",
        `Day ${gameState.time.day}`
    );

    setText(
        "#profile-money",
        formatMoney(
            gameState.player.money
        )
    );


    setText(
        "#academic-progress-value",
        `${Math.round(
            gameState.player.academic
        )}%`
    );


    const academicBar =
        $("#academic-progress-bar");


    if (academicBar) {

        academicBar.style.width =
            `${clamp(
                gameState.player.academic,
                0,
                100
            )}%`;
    }


    setText(
        "#reputation-value",
        Math.round(
            gameState.player.reputation
        )
    );


    const reputationBar =
        $("#reputation-bar");


    if (reputationBar) {

        /*
         * Convert -100..100
         * into 0..100 for the bar.
         */

        reputationBar.style.width =
            `${(
                (gameState.player.reputation + 100)
                / 2
            )}%`;
    }
}


/* =========================================================
   131. OPEN PROFILE
   ========================================================= */

function openProfile() {

    updateProfileUI();

    show(
        $("#profile-panel")
    );
}


function closeProfile() {

    hide(
        $("#profile-panel")
    );
}


/* =========================================================
   132. PROFILE BUTTON
   ========================================================= */

const profileButton =
    $("#hud-profile-button");


if (profileButton) {

    profileButton.addEventListener(
        "click",
        openProfile
    );
}


const profileClose =
    $("#profile-close");


if (profileClose) {

    profileClose.addEventListener(
        "click",
        closeProfile
    );
}


/* =========================================================
   133. DAILY LIFE INITIALIZATION
   ========================================================= */

function initializeDailyLife() {

    setupDailyLifeButtons();

    updateProfileUI();

    updatePlayerHUD();
}


/* =========================================================
   134. INITIALIZE DAILY LIFE
   ========================================================= */

initializeDailyLife();


/* =========================================================
   135. EXTEND GAME UPDATE
   ========================================================= */

const previousLifeUpdate =
    GameScene.prototype.update;


GameScene.prototype.update =
    function(time, delta) {

        previousLifeUpdate.call(
            this,
            time,
            delta
        );


        updateDailyLifeSystems();
    };


/* =========================================================
   136. OVERRIDE GENERAL INTERACTION
   ========================================================= */

const previousHandleInteraction =
    handleInteraction;


handleInteraction = function() {

    if (
        flags.paused
    ) {
        return;
    }


    if (
        flags.dialogueOpen
    ) {
        return;
    }


    /*
     * NPC interaction first.
     */

    if (nearestNPC) {

        interactWithNPC(
            nearestNPC
        );

        return;
    }


    handleGeneralInteraction();
};


/* =========================================================
   137. PANEL ESCAPE SUPPORT
   ========================================================= */

function closeLifePanels() {

    if (
        currentLifeAction === "meal"
    ) {

        closeFoodPanel();

    } else if (
        currentLifeAction === "class"
    ) {

        closeClassPanel();

    } else if (
        currentLifeAction === "study"
    ) {

        closeStudyPanel();

    } else if (
        currentLifeAction === "work"
    ) {

        closeWorkPanel();

    } else if (
        currentLifeAction === "rest"
    ) {

        closeRestPanel();
    }
}


/* =========================================================
   138. ESC HANDLING
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        if (
            flags.dialogueOpen
        ) {

            closeDialogue();

            return;
        }


        if (
            currentLifeAction
        ) {

            closeLifePanels();

            return;
        }


        closeProfile();
    }
);


/* =========================================================
   139. PART 5 COMPLETE
   ========================================================= */

/*
 * PART 5 COMPLETE.
 *
 * WE NOW HAVE:
 *
 * ✓ Hunger
 * ✓ Energy
 * ✓ Health
 * ✓ Happiness
 * ✓ Eating
 * ✓ Mama's Kitchen
 * ✓ Classes
 * ✓ Studying
 * ✓ Working
 * ✓ Resting
 * ✓ Sleeping
 * ✓ Academic progress
 * ✓ Reputation
 * ✓ Money earned
 * ✓ Money spent
 * ✓ Daily time progression
 * ✓ Low-stat warnings
 * ✓ Profile statistics
 *
 * PART 6 WILL ADD:
 *
 * - Inventory
 * - Campus Shop
 * - Buying items
 * - Using food
 * - Mobile data
 * - Books
 * - Clothes
 * - Inventory capacity
 * - Shop categories
 * - Shop UI
 * - Item effects
 *
 * DO NOT CLOSE THE IIFE.
 * PART 6 GOES DIRECTLY BELOW THIS LINE.
 */
 /* ============================================================
   OSOGBO CAMPUS LIFE
   GAME.JS — PART 6/10
   INVENTORY & CAMPUS SHOP
   ============================================================ */


/* =========================================================
   140. INVENTORY CONFIGURATION
   ========================================================= */

const INVENTORY_CONFIG = {

    capacity: 20,

    items: {

        food: {
            id: "food",
            name: "Snacks",
            description: "Quick food that restores hunger.",
            price: 300,
            category: "Food",
            useable: true
        },

        data: {
            id: "data",
            name: "Mobile Data",
            description: "Internet data for your phone.",
            price: 1000,
            category: "Utilities",
            useable: true
        },

        books: {
            id: "books",
            name: "School Books",
            description: "Useful books for your academic work.",
            price: 2500,
            category: "Education",
            useable: true
        },

        clothes: {
            id: "clothes",
            name: "Clothes",
            description: "New clothes that improve your appearance.",
            price: 5000,
            category: "Lifestyle",
            useable: true
        }
    }
};


/* =========================================================
   141. SHOP STATE
   ========================================================= */

let currentShopCategory =
    "all";


let selectedShopItem =
    null;


/* =========================================================
   142. INVENTORY COUNT
   ========================================================= */

function getInventoryCount() {

    return Object.values(
        gameState.inventory
    ).reduce(
        (total, amount) =>
            total + amount,
        0
    );
}


/* =========================================================
   143. INVENTORY CAPACITY
   ========================================================= */

function hasInventorySpace() {

    return (
        getInventoryCount() <
        INVENTORY_CONFIG.capacity
    );
}


/* =========================================================
   144. ADD INVENTORY ITEM
   ========================================================= */

function addInventoryItem(
    itemId,
    amount = 1
) {

    if (
        !gameState.inventory
            .hasOwnProperty(itemId)
    ) {

        return false;
    }


    if (
        getInventoryCount() +
        amount >
        INVENTORY_CONFIG.capacity
    ) {

        notify(
            "Inventory Full",
            "You don't have enough inventory space."
        );

        return false;
    }


    gameState.inventory[itemId] +=
        amount;


    updateInventoryUI();

    return true;
}


/* =========================================================
   145. REMOVE INVENTORY ITEM
   ========================================================= */

function removeInventoryItem(
    itemId,
    amount = 1
) {

    if (
        !gameState.inventory
            .hasOwnProperty(itemId)
    ) {

        return false;
    }


    if (
        gameState.inventory[itemId] <
        amount
    ) {

        return false;
    }


    gameState.inventory[itemId] -=
        amount;


    updateInventoryUI();

    return true;
}


/* =========================================================
   146. INVENTORY ITEM NAME
   ========================================================= */

function getInventoryItemName(
    itemId
) {

    return (
        INVENTORY_CONFIG.items[itemId]
            ?.name ||
        capitalize(itemId)
    );
}


/* =========================================================
   147. OPEN INVENTORY
   ========================================================= */

function openInventory() {

    updateInventoryUI();

    show(
        $("#inventory-panel")
    );


    flags.inventoryOpen =
        true;


    hideInteractionPrompt();
}


/* =========================================================
   148. CLOSE INVENTORY
   ========================================================= */

function closeInventory() {

    hide(
        $("#inventory-panel")
    );


    flags.inventoryOpen =
        false;
}


/* =========================================================
   149. INVENTORY UI
   ========================================================= */

function updateInventoryUI() {

    const inventory =
        gameState.inventory;


    setText(
        "#inventory-food",
        inventory.food
    );

    setText(
        "#inventory-data",
        inventory.data
    );

    setText(
        "#inventory-books",
        inventory.books
    );

    setText(
        "#inventory-clothes",
        inventory.clothes
    );


    setText(
        "#inventory-capacity",
        `${getInventoryCount()}/${INVENTORY_CONFIG.capacity}`
    );


    updateInventoryGrid();
}


/* =========================================================
   150. INVENTORY GRID
   ========================================================= */

function updateInventoryGrid() {

    const grid =
        $("#inventory-grid");


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    Object.entries(
        gameState.inventory
    ).forEach(
        ([itemId, amount]) => {

            const item =
                INVENTORY_CONFIG.items[itemId];


            if (!item) {
                return;
            }


            const card =
                document.createElement("div");


            card.className =
                "inventory-item";


            card.dataset.item =
                itemId;


            card.innerHTML = `

                <div class="inventory-item-name">
                    ${escapeHTML(item.name)}
                </div>

                <div class="inventory-item-count">
                    ×${amount}
                </div>

                <div class="inventory-item-description">
                    ${escapeHTML(item.description)}
                </div>

                ${
                    amount > 0
                        ? `
                            <button
                                class="inventory-use-button"
                                data-item="${escapeHTML(itemId)}">
                                Use
                            </button>
                          `
                        : ""
                }
            `;


            grid.appendChild(
                card
            );
        }
    );


    grid.querySelectorAll(
        ".inventory-use-button"
    ).forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    useInventoryItem(
                        button.dataset.item
                    );
                }
            );
        }
    );
}


/* =========================================================
   151. USE INVENTORY ITEM
   ========================================================= */

function useInventoryItem(
    itemId
) {

    if (
        !gameState.inventory
            .hasOwnProperty(itemId)
    ) {
        return;
    }


    if (
        gameState.inventory[itemId] <= 0
    ) {

        notify(
            "Inventory",
            `You don't have any ${getInventoryItemName(itemId)}.`
        );

        return;
    }


    switch (itemId) {

        case "food":

            useFoodItem();

            break;


        case "data":

            useDataItem();

            break;


        case "books":

            useBookItem();

            break;


        case "clothes":

            useClothesItem();

            break;
    }
}


/* =========================================================
   152. USE FOOD
   ========================================================= */

function useFoodItem() {

    if (
        gameState.player.hunger >= 95
    ) {

        notify(
            "Food",
            "You're already full."
        );

        return;
    }


    if (
        !removeInventoryItem(
            "food",
            1
        )
    ) {
        return;
    }


    changeStat(
        "hunger",
        15
    );


    changeStat(
        "happiness",
        2
    );


    advanceMinutes(
        10
    );


    notify(
        "Snack",
        "You ate a snack. Hunger +15."
    );


    updateInventoryUI();
}


/* =========================================================
   153. USE DATA
   ========================================================= */

function useDataItem() {

    if (
        !removeInventoryItem(
            "data",
            1
        )
    ) {
        return;
    }


    /*
     * Data is currently used as
     * a phone resource.
     *
     * Later phone features can
     * consume it for messages,
     * social apps and internet.
     */

    notify(
        "Mobile Data",
        "You activated a data bundle."
    );


    updateInventoryUI();
}


/* =========================================================
   154. USE BOOK
   ========================================================= */

function useBookItem() {

    if (
        gameState.player.energy <
        8
    ) {

        notify(
            "Too Tired",
            "You're too tired to study right now."
        );

        return;
    }


    if (
        !removeInventoryItem(
            "books",
            1
        )
    ) {
        return;
    }


    changeStat(
        "energy",
        -8
    );


    gameState.player.academic =
        clamp(
            gameState.player.academic + 6,
            0,
            100
        );


    advanceMinutes(
        45
    );


    notify(
        "Reading",
        "You studied using your book. Academic progress +6."
    );


    updateProfileUI();

    updateInventoryUI();
}


/* =========================================================
   155. USE CLOTHES
   ========================================================= */

function useClothesItem() {

    if (
        !removeInventoryItem(
            "clothes",
            1
        )
    ) {
        return;
    }


    gameState.player.reputation =
        clamp(
            gameState.player.reputation + 2,
            -100,
            100
        );


    changeStat(
        "happiness",
        4
    );


    notify(
        "New Outfit",
        "You changed into your new clothes."
    );


    updateProfileUI();

    updateInventoryUI();
}


/* =========================================================
   156. SHOP ITEMS
   ========================================================= */

const SHOP_ITEMS = [

    {
        id: "food",
        name: "Snack",
        description: "Quick food for when hunger hits.",
        price: 300,
        category: "Food"
    },

    {
        id: "data",
        name: "Mobile Data",
        description: "Stay connected with your friends.",
        price: 1000,
        category: "Utilities"
    },

    {
        id: "books",
        name: "School Books",
        description: "Useful for studying and academics.",
        price: 2500,
        category: "Education"
    },

    {
        id: "clothes",
        name: "Clothes",
        description: "Fresh clothes for your student life.",
        price: 5000,
        category: "Lifestyle"
    }
];


/* =========================================================
   157. SHOP CATEGORIES
   ========================================================= */

const SHOP_CATEGORIES = [
    "all",
    "Food",
    "Utilities",
    "Education",
    "Lifestyle"
];


/* =========================================================
   158. OPEN SHOP
   ========================================================= */

function openShop() {

    const panel =
        $("#shop-panel");


    if (!panel) {

        notify(
            "Campus Shop",
            "The shop is currently unavailable."
        );

        return;
    }


    flags.shopOpen =
        true;


    currentShopCategory =
        "all";


    updateShopUI();

    show(panel);

    hideInteractionPrompt();
}


/* =========================================================
   159. CLOSE SHOP
   ========================================================= */

function closeShop() {

    hide(
        $("#shop-panel")
    );


    flags.shopOpen =
        false;


    selectedShopItem =
        null;
}


/* =========================================================
   160. SHOP MONEY
   ========================================================= */

function updateShopMoney() {

    setText(
        "#shop-money",
        formatMoney(
            gameState.player.money
        )
    );
}


/* =========================================================
   161. SHOP CATEGORY
   ========================================================= */

function setShopCategory(
    category
) {

    currentShopCategory =
        category;


    updateShopUI();
}


/* =========================================================
   162. SHOP FILTER
   ========================================================= */

function getFilteredShopItems() {

    if (
        currentShopCategory ===
        "all"
    ) {

        return SHOP_ITEMS;
    }


    return SHOP_ITEMS.filter(
        (item) =>
            item.category ===
            currentShopCategory
    );
}


/* =========================================================
   163. SHOP UI
   ========================================================= */

function updateShopUI() {

    updateShopMoney();

    updateShopCategories();

    updateShopItems();
}


/* =========================================================
   164. SHOP CATEGORY BUTTONS
   ========================================================= */

function updateShopCategories() {

    $$(".shop-category")
        .forEach((button) => {

            const category =
                button.dataset.category ||
                button.dataset.shopCategory ||
                button.textContent.trim();


            if (
                category.toLowerCase() ===
                currentShopCategory.toLowerCase()
            ) {

                button.classList.add(
                    "active"
                );

            } else {

                button.classList.remove(
                    "active"
                );
            }
        });
}


/* =========================================================
   165. SHOP ITEM CARDS
   ========================================================= */

function updateShopItems() {

    const items =
        getFilteredShopItems();


    $$(".shop-item")
        .forEach((element) => {

            const itemId =
                element.dataset.item ||
                element.dataset.product;


            const item =
                items.find(
                    (entry) =>
                        entry.id === itemId
                );


            if (!item) {

                element.style.display =
                    "none";

                return;
            }


            element.style.display =
                "";


            updateShopItemElement(
                element,
                item
            );
        });
}


/* =========================================================
   166. SHOP ITEM ELEMENT
   ========================================================= */

function updateShopItemElement(
    element,
    item
) {

    const name =
        element.querySelector(
            ".shop-item-name"
        );


    const description =
        element.querySelector(
            ".shop-item-description"
        );


    const price =
        element.querySelector(
            ".shop-item-price"
        );


    if (name) {

        name.textContent =
            item.name;
    }


    if (description) {

        description.textContent =
            item.description;
    }


    if (price) {

        price.textContent =
            formatMoney(item.price);
    }


    const buyButton =
        element.querySelector(
            ".shop-buy-button"
        );


    if (buyButton) {

        buyButton.dataset.item =
            item.id;

        buyButton.dataset.price =
            item.price;
    }
}


/* =========================================================
   167. BUY SHOP ITEM
   ========================================================= */

function buyShopItem(
    itemId
) {

    const item =
        SHOP_ITEMS.find(
            (entry) =>
                entry.id === itemId
        );


    if (!item) {
        return;
    }


    if (
        !hasInventorySpace()
    ) {

        notify(
            "Inventory Full",
            "You can't carry any more items."
        );

        return;
    }


    if (
        !spendMoney(
            item.price
        )
    ) {
        return;
    }


    if (
        !addInventoryItem(
            item.id,
            1
        )
    ) {

        /*
         * Refund if inventory addition
         * somehow fails.
         */

        changeMoney(
            item.price
        );

        return;
    }


    notify(
        "Purchase Complete",
        `You bought ${item.name} for ${formatMoney(item.price)}.`
    );


    updateShopUI();

    updateInventoryUI();
}


/* =========================================================
   168. SHOP BUTTON SETUP
   ========================================================= */

function setupShopButtons() {

    /*
     * Close button.
     */

    const close =
        $("#shop-close");


    if (close) {

        close.addEventListener(
            "click",
            closeShop
        );
    }


    /*
     * Category buttons.
     */

    $$(".shop-category")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.category ||
                        button.dataset.shopCategory ||
                        button.textContent.trim();


                    setShopCategory(
                        category
                    );
                }
            );
        });


    /*
     * Buy buttons.
     */

    $$(".shop-buy-button")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const itemId =
                        button.dataset.item ||
                        button.dataset.product;


                    if (itemId) {

                        buyShopItem(
                            itemId
                        );
                    }
                }
            );
        });
}


/* =========================================================
   169. INVENTORY CLOSE BUTTON
   ========================================================= */

function setupInventoryButtons() {

    const close =
        $("#inventory-close");


    if (close) {

        close.addEventListener(
            "click",
            closeInventory
        );
    }
}


/* =========================================================
   170. INVENTORY OPEN BUTTONS
   ========================================================= */

function setupInventoryOpenButtons() {

    /*
     * We support several possible
     * buttons without requiring
     * an HTML change.
     */

    const buttons = [

        "#inventory-button",

        "#hud-inventory-button",

        "#mobile-inventory"
    ];


    buttons.forEach(
        (selector) => {

            const button =
                $(selector);


            if (!button) {
                return;
            }


            button.addEventListener(
                "click",
                openInventory
            );
        }
    );
}


/* =========================================================
   171. SHOP ESCAPE
   ========================================================= */

function closeShopWithEscape() {

    if (
        flags.shopOpen
    ) {

        closeShop();

        return true;
    }


    return false;
}


/* =========================================================
   172. INVENTORY ESCAPE
   ========================================================= */

function closeInventoryWithEscape() {

    if (
        flags.inventoryOpen
    ) {

        closeInventory();

        return true;
    }


    return false;
}


/* =========================================================
   173. SHOP LOCATION PROMPT
   ========================================================= */

function updateShopInteraction() {

    if (
        flags.shopOpen ||
        flags.inventoryOpen ||
        flags.dialogueOpen ||
        flags.paused
    ) {
        return;
    }


    const location =
        getNearbyLocation();


    if (
        location &&
        location.id === "shop"
    ) {

        showInteractionPrompt(
            "E",
            "Open Campus Shop"
        );
    }
}


/* =========================================================
   174. INVENTORY INITIALIZATION
   ========================================================= */

function initializeInventorySystem() {

    updateInventoryUI();

    setupInventoryButtons();

    setupInventoryOpenButtons();

    setupShopButtons();
}


/* =========================================================
   175. INITIALIZE INVENTORY
   ========================================================= */

initializeInventorySystem();


/* =========================================================
   176. EXTEND DAILY UPDATE
   ========================================================= */

const previousInventoryUpdate =
    GameScene.prototype.update;


GameScene.prototype.update =
    function(time, delta) {

        previousInventoryUpdate.call(
            this,
            time,
            delta
        );


        updateShopInteraction();
    };


/* =========================================================
   177. EXTEND ESC HANDLING
   ========================================================= */

const previousEscapeHandler =
    document.onkeydown;


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        if (
            closeShopWithEscape()
        ) {
            return;
        }


        if (
            closeInventoryWithEscape()
        ) {
            return;
        }
    }
);


/* =========================================================
   178. SHOP PURCHASE KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            !flags.shopOpen
        ) {
            return;
        }


        /*
         * Number keys can quickly
         * select the first four
         * shop products.
         */

        const key =
            event.key;


        if (
            !["1", "2", "3", "4"]
                .includes(key)
        ) {
            return;
        }


        const index =
            Number(key) - 1;


        const visibleItems =
            getFilteredShopItems();


        const item =
            visibleItems[index];


        if (item) {

            buyShopItem(
                item.id
            );
        }
    }
);


/* =========================================================
   179. INVENTORY ITEM HOTKEYS
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            !flags.inventoryOpen
        ) {
            return;
        }


        /*
         * Number keys use the
         * corresponding inventory item.
         */

        const itemKeys = {

            "1": "food",
            "2": "data",
            "3": "books",
            "4": "clothes"
        };


        const itemId =
            itemKeys[event.key];


        if (!itemId) {
            return;
        }


        useInventoryItem(
            itemId
        );
    }
);


/* =========================================================
   180. INVENTORY NOTIFICATION
   ========================================================= */

function notifyInventoryChange() {

    updateInventoryUI();

    updateShopMoney();
}


/* =========================================================
   181. INVENTORY STATE SAFETY
   ========================================================= */

function normalizeInventory() {

    Object.keys(
        INVENTORY_CONFIG.items
    ).forEach((itemId) => {

        if (
            typeof gameState.inventory[itemId] !==
            "number"
        ) {

            gameState.inventory[itemId] =
                0;
        }


        gameState.inventory[itemId] =
            Math.max(
                0,
                Math.floor(
                    gameState.inventory[itemId]
                )
            );
    });
}


/* =========================================================
   182. NORMALIZE CURRENT STATE
   ========================================================= */

normalizeInventory();


/* =========================================================
   183. PART 6 COMPLETE
   ========================================================= */

/*
 * PART 6 COMPLETE.
 *
 * WE NOW HAVE:
 *
 * ✓ Inventory
 * ✓ Inventory capacity
 * ✓ Food
 * ✓ Mobile data
 * ✓ School books
 * ✓ Clothes
 * ✓ Item usage
 * ✓ Food effects
 * ✓ Book/study effects
 * ✓ Clothes effects
 * ✓ Campus Shop
 * ✓ Shop categories
 * ✓ Shop prices
 * ✓ Buying items
 * ✓ Shop money display
 * ✓ Inventory UI
 * ✓ Inventory hotkeys
 * ✓ Shop hotkeys
 *
 * PART 7 WILL ADD:
 *
 * - Quests
 * - Quest progression
 * - Quest log
 * - Campus Welcome
 * - Meet Yusuf
 * - Eat Meal quest
 * - Attend Class quest
 * - Study Library quest
 * - First Work quest
 * - Quest rewards
 *
 * DO NOT CLOSE THE IIFE.
 * PART 7 GOES DIRECTLY BELOW THIS LINE.
 */
/* ============================================================
   OSOGBO CAMPUS LIFE
   GAME.JS — PART 7/10
   QUESTS & QUEST LOG
   ============================================================ */


/* =========================================================
   184. QUEST DEFINITIONS
   ========================================================= */

const QUEST_DATA = {

    campusWelcome: {

        id: "campusWelcome",

        title: "Welcome to Campus",

        description:
            "Take your first steps around campus.",

        type: "main",

        objective:
            "Explore the university campus.",

        reward: {
            money: 500,
            happiness: 5,
            reputation: 2
        },

        next: "meetYusuf"
    },


    meetYusuf: {

        id: "meetYusuf",

        title: "A Familiar Face",

        description:
            "Meet Yusuf and learn more about campus.",

        type: "main",

        objective:
            "Talk to Yusuf.",

        reward: {
            money: 500,
            happiness: 5,
            reputation: 2
        },

        next: "eatMeal"
    },


    eatMeal: {

        id: "eatMeal",

        title: "First Meal",

        description:
            "Find Mama's Kitchen and get something to eat.",

        type: "main",

        objective:
            "Eat a meal at Mama's Kitchen.",

        reward: {
            happiness: 5,
            reputation: 1
        },

        next: "attendClass"
    },


    attendClass: {

        id: "attendClass",

        title: "First Lecture",

        description:
            "Attend your first lecture.",

        type: "main",

        objective:
            "Attend a class at the Lecture Hall.",

        reward: {
            academic: 5,
            reputation: 2
        },

        next: "studyLibrary"
    },


    studyLibrary: {

        id: "studyLibrary",

        title: "Hit the Books",

        description:
            "Spend some time studying at the library.",

        type: "main",

        objective:
            "Study at the University Library.",

        reward: {
            academic: 5,
            happiness: 2
        },

        next: "firstWork"
    },


    firstWork: {

        id: "firstWork",

        title: "Make Some Money",

        description:
            "Find a student job and earn some money.",

        type: "main",

        objective:
            "Complete your first work session.",

        reward: {
            money: 2000,
            reputation: 3,
            happiness: 3
        },

        next: null
    }
};


/* =========================================================
   185. QUEST STATE
   ========================================================= */

function getCurrentQuest() {

    return QUEST_DATA[
        gameState.quests.current
    ] || null;
}


/* =========================================================
   186. QUEST COMPLETED CHECK
   ========================================================= */

function isQuestCompleted(
    questId
) {

    return gameState.quests.completed
        .includes(
            questId
        );
}


/* =========================================================
   187. COMPLETE QUEST CHECK
   ========================================================= */

function markQuestCompleted(
    questId
) {

    if (
        !QUEST_DATA[questId]
    ) {
        return;
    }


    if (
        isQuestCompleted(
            questId
        )
    ) {
        return;
    }


    gameState.quests.completed
        .push(
            questId
        );


    const quest =
        QUEST_DATA[questId];


    awardQuestReward(
        quest.reward
    );


    notify(
        "Quest Complete",
        quest.title
    );


    /*
     * Move to the next quest.
     */

    if (
        quest.next
    ) {

        gameState.quests.current =
            quest.next;

        gameState.quests.progress =
            0;


        const nextQuest =
            QUEST_DATA[
                quest.next
            ];


        if (nextQuest) {

            setTimeout(() => {

                notify(
                    "New Quest",
                    nextQuest.title
                );

                updateQuestUI();

            }, 800);
        }

    } else {

        gameState.quests.current =
            null;

        gameState.quests.progress =
            100;


        notify(
            "Main Story",
            "You've completed the first part of your campus journey."
        );
    }


    updateQuestUI();

    updateProfileUI();
}


/* =========================================================
   188. QUEST REWARD
   ========================================================= */

function awardQuestReward(
    reward
) {

    if (!reward) {
        return;
    }


    if (
        reward.money
    ) {

        changeMoney(
            reward.money
        );

        gameState.stats.moneyEarned +=
            reward.money;
    }


    if (
        reward.health
    ) {

        changeStat(
            "health",
            reward.health
        );
    }


    if (
        reward.energy
    ) {

        changeStat(
            "energy",
            reward.energy
        );
    }


    if (
        reward.hunger
    ) {

        changeStat(
            "hunger",
            reward.hunger
        );
    }


    if (
        reward.happiness
    ) {

        changeStat(
            "happiness",
            reward.happiness
        );
    }


    if (
        reward.academic
    ) {

        gameState.player.academic =
            clamp(
                gameState.player.academic +
                reward.academic,

                0,
                100
            );
    }


    if (
        reward.reputation
    ) {

        gameState.player.reputation =
            clamp(
                gameState.player.reputation +
                reward.reputation,

                -100,
                100
            );
    }
}


/* =========================================================
   189. QUEST PROGRESS
   ========================================================= */

function updateQuestProgress(
    action
) {

    const quest =
        getCurrentQuest();


    if (!quest) {
        return;
    }


    if (
        isQuestCompleted(
            quest.id
        )
    ) {
        return;
    }


    let validAction =
        false;


    switch (quest.id) {

        case "campusWelcome":

            /*
             * Simply moving around campus
             * counts as exploration.
             */

            if (
                action ===
                "exploreCampus"
            ) {

                validAction =
                    true;
            }

            break;


        case "meetYusuf":

            if (
                action ===
                "talkYusuf"
            ) {

                validAction =
                    true;
            }

            break;


        case "eatMeal":

            if (
                action ===
                "eatMeal"
            ) {

                validAction =
                    true;
            }

            break;


        case "attendClass":

            if (
                action ===
                "attendClass"
            ) {

                validAction =
                    true;
            }

            break;


        case "studyLibrary":

            if (
                action ===
                "studyLibrary"
            ) {

                validAction =
                    true;
            }

            break;


        case "firstWork":

            if (
                action ===
                "firstWork"
            ) {

                validAction =
                    true;
            }

            break;
    }


    if (!validAction) {
        return;
    }


    gameState.quests.progress =
        100;


    markQuestCompleted(
        quest.id
    );
}


/* =========================================================
   190. CAMPUS EXPLORATION QUEST
   ========================================================= */

function checkCampusExploration() {

    const quest =
        getCurrentQuest();


    if (!quest) {
        return;
    }


    if (
        quest.id !==
        "campusWelcome"
    ) {
        return;
    }


    /*
     * Exploring three different
     * broad areas completes the
     * welcome quest.
     */

    const locationsVisited =
        gameState.stats.locationsVisited || 0;


    if (
        locationsVisited >= 3
    ) {

        updateQuestProgress(
            "exploreCampus"
        );
    }
}


/* =========================================================
   191. LOCATION VISIT TRACKING
   ========================================================= */

function trackLocationVisit(
    locationId
) {

    if (
        !gameState.stats.visitedLocations
    ) {

        gameState.stats.visitedLocations =
            [];
    }


    if (
        !gameState.stats.visitedLocations
            .includes(locationId)
    ) {

        gameState.stats.visitedLocations
            .push(
                locationId
            );


        gameState.stats.locationsVisited =
            gameState.stats.visitedLocations.length;


        checkCampusExploration();
    }
}


/* =========================================================
   192. TRACK CURRENT LOCATION
   ========================================================= */

let lastTrackedLocation =
    "";


function updateQuestLocationTracking() {

    const current =
        gameState.location.current;


    if (
        current ===
        lastTrackedLocation
    ) {
        return;
    }


    lastTrackedLocation =
        current;


    const location =
        Object.values(
            CAMPUS_LOCATIONS
        ).find(
            (entry) =>
                entry.name === current
        );


    if (location) {

        trackLocationVisit(
            location.id
        );
    }
}


/* =========================================================
   193. QUEST UI
   ========================================================= */

function updateQuestUI() {

    const quest =
        getCurrentQuest();


    if (!quest) {

        setText(
            "#current-quest-title",
            "No Active Quest"
        );

        setText(
            "#current-quest-description",
            "Explore campus and enjoy student life."
        );


        const bar =
            $("#quest-progress-bar");


        if (bar) {

            bar.style.width =
                "100%";
        }


        setText(
            "#quest-progress-text",
            "Complete"
        );


        return;
    }


    setText(
        "#current-quest-title",
        quest.title
    );


    setText(
        "#current-quest-description",
        quest.objective
    );


    const progress =
        clamp(
            gameState.quests.progress,
            0,
            100
        );


    const progressBar =
        $("#quest-progress-bar");


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;
    }


    setText(
        "#quest-progress-text",
        `${Math.round(progress)}%`
    );
}


/* =========================================================
   194. QUEST LOG LIST
   ========================================================= */

function updateQuestLogList(
    filter = "all"
) {

    const list =
        $("#quest-log-list");


    if (!list) {
        return;
    }


    list.innerHTML = "";


    const quests =
        Object.values(
            QUEST_DATA
        );


    quests.forEach(
        (quest) => {

            const completed =
                isQuestCompleted(
                    quest.id
                );


            const active =
                gameState.quests.current ===
                quest.id;


            if (
                filter === "active" &&
                !active
            ) {
                return;
            }


            if (
                filter === "completed" &&
                !completed
            ) {
                return;
            }


            const item =
                document.createElement("div");


            item.className =
                "quest-log-item";


            if (active) {

                item.classList.add(
                    "active"
                );
            }


            if (completed) {

                item.classList.add(
                    "completed"
                );
            }


            const status =
                completed
                    ? "Completed"
                    : active
                        ? "Active"
                        : "Available";


            const progress =
                active
                    ? gameState.quests.progress
                    : completed
                        ? 100
                        : 0;


            item.innerHTML = `

                <div class="quest-log-item-header">

                    <div class="quest-log-item-title">
                        ${escapeHTML(
                            quest.title
                        )}
                    </div>

                    <div class="quest-log-item-status">
                        ${status}
                    </div>

                </div>

                <div class="quest-log-item-description">
                    ${escapeHTML(
                        quest.description
                    )}
                </div>

                <div class="quest-log-item-objective">
                    ${escapeHTML(
                        quest.objective
                    )}
                </div>

                <div class="quest-log-progress">

                    <div
                        class="quest-log-progress-bar"
                        style="width:${progress}%">
                    </div>

                </div>
            `;


            list.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   195. OPEN QUEST LOG
   ========================================================= */

function openQuestLog() {

    updateQuestLogList(
        "all"
    );


    show(
        $("#quest-log-panel")
    );
}


/* =========================================================
   196. CLOSE QUEST LOG
   ========================================================= */

function closeQuestLog() {

    hide(
        $("#quest-log-panel")
    );
}


/* =========================================================
   197. QUEST LOG BUTTON
   ========================================================= */

function setupQuestButtons() {

    const questButton =
        $("#quest-log-button");


    if (questButton) {

        questButton.addEventListener(
            "click",
            openQuestLog
        );
    }


    const closeButton =
        $("#quest-log-close");


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeQuestLog
        );
    }


    /*
     * Quest tabs.
     */

    $$(".quest-tab")
        .forEach(
            (tab) => {

                tab.addEventListener(
                    "click",
                    () => {

                        const filter =
                            tab.dataset.filter ||
                            tab.dataset.tab ||
                            "all";


                        $$(".quest-tab")
                            .forEach(
                                (other) => {

                                    other.classList
                                        .remove(
                                            "active"
                                        );
                                }
                            );


                        tab.classList.add(
                            "active"
                        );


                        updateQuestLogList(
                            filter
                        );
                    }
                );
            }
        );
}


/* =========================================================
   198. YUSUF QUEST HOOK
   ========================================================= */

const previousInteractWithNPC =
    interactWithNPC;


interactWithNPC = function(npc) {

    previousInteractWithNPC(
        npc
    );


    if (
        npc &&
        npc.data &&
        npc.data.name ===
        "Yusuf"
    ) {

        setTimeout(
            () => {

                updateQuestProgress(
                    "talkYusuf"
                );

            },
            250
        );
    }
};


/* =========================================================
   199. QUEST NOTIFICATION
   ========================================================= */

function showCurrentQuest() {

    const quest =
        getCurrentQuest();


    if (!quest) {
        return;
    }


    notify(
        "Current Quest",
        `${quest.title}: ${quest.objective}`
    );
}


/* =========================================================
   200. QUEST INITIALIZATION
   ========================================================= */

function initializeQuestSystem() {

    if (
        !gameState.quests.completed
    ) {

        gameState.quests.completed =
            [];
    }


    if (
        !gameState.quests.current
    ) {

        gameState.quests.current =
            "campusWelcome";
    }


    if (
        typeof gameState.quests.progress !==
        "number"
    ) {

        gameState.quests.progress =
            0;
    }


    updateQuestUI();

    setupQuestButtons();
}


/* =========================================================
   201. QUEST SYSTEM UPDATE
   ========================================================= */

function updateQuestSystems() {

    if (!gameStarted) {
        return;
    }


    updateQuestLocationTracking();

    updateQuestUI();
}


/* =========================================================
   202. QUEST INITIALIZATION
   ========================================================= */

initializeQuestSystem();


/* =========================================================
   203. EXTEND GAME UPDATE
   ========================================================= */

const previousQuestUpdate =
    GameScene.prototype.update;


GameScene.prototype.update =
    function(time, delta) {

        previousQuestUpdate.call(
            this,
            time,
            delta
        );


        updateQuestSystems();
    };


/* =========================================================
   204. QUEST REWARD SUMMARY
   ========================================================= */

function getQuestRewardText(
    reward
) {

    if (!reward) {
        return "No reward";
    }


    const rewards = [];


    if (reward.money) {

        rewards.push(
            formatMoney(
                reward.money
            )
        );
    }


    if (reward.academic) {

        rewards.push(
            `Academic +${reward.academic}`
        );
    }


    if (reward.happiness) {

        rewards.push(
            `Happiness +${reward.happiness}`
        );
    }


    if (reward.reputation) {

        rewards.push(
            `Reputation +${reward.reputation}`
        );
    }


    if (reward.health) {

        rewards.push(
            `Health +${reward.health}`
        );
    }


    if (reward.energy) {

        rewards.push(
            `Energy +${reward.energy}`
        );
    }


    return rewards.join(
        " • "
    );
}


/* =========================================================
   205. FIRST QUEST MESSAGE
   ========================================================= */

function showQuestIntroduction() {

    setTimeout(
        () => {

            const quest =
                getCurrentQuest();


            if (!quest) {
                return;
            }


            notify(
                "New Quest",
                `${quest.title}: ${quest.objective}`
            );

        },
        2500
    );
}


/* =========================================================
   206. QUEST STATE SAFETY
   ========================================================= */

function normalizeQuestState() {

    if (
        !Array.isArray(
            gameState.quests.completed
        )
    ) {

        gameState.quests.completed =
            [];
    }


    if (
        !QUEST_DATA[
            gameState.quests.current
        ]
    ) {

        gameState.quests.current =
            "campusWelcome";
    }


    gameState.quests.progress =
        clamp(
            Number(
                gameState.quests.progress
            ) || 0,

            0,
            100
        );
}


/* =========================================================
   207. NORMALIZE QUEST STATE
   ========================================================= */

normalizeQuestState();


/* =========================================================
   208. PART 7 COMPLETE
   ========================================================= */

/*
 * PART 7 COMPLETE.
 *
 * WE NOW HAVE:
 *
 * ✓ Main quest chain
 * ✓ Quest progression
 * ✓ Quest completion
 * ✓ Quest rewards
 * ✓ Quest tracker
 * ✓ Quest log
 * ✓ Active/completed filtering
 * ✓ Campus exploration tracking
 * ✓ Yusuf quest
 * ✓ Meal quest
 * ✓ Class quest
 * ✓ Library quest
 * ✓ Work quest
 * ✓ Academic rewards
 * ✓ Money rewards
 * ✓ Reputation rewards
 *
 * MAIN STORY:
 *
 * 1. Welcome to Campus
 *        ↓
 * 2. Meet Yusuf
 *        ↓
 * 3. Eat a Meal
 *        ↓
 * 4. Attend Class
 *        ↓
 * 5. Study at Library
 *        ↓
 * 6. Complete First Work
 *
 * PART 8 WILL ADD:
 *
 * - Phone
 * - Messages
 * - Contacts
 * - In-game notifications
 * - Phone clock
 * - NPC contacts
 * - Messages from NPCs
 *
 * DO NOT CLOSE THE IIFE.
 * PART 8 GOES DIRECTLY BELOW THIS LINE.
 */
 /* ============================================================
   PART 8/10 — PHONE, MESSAGES & CONTACTS
   ============================================================ */

/* ------------------------------------------------------------
   PHONE STATE
   ------------------------------------------------------------ */

const phoneRefs = {
    panel: $("phone-panel"),
    time: $("phone-time"),
    avatar: $("phone-avatar"),
    ownerName: $("phone-owner-name"),

    messagesPanel: $("messages-panel"),
    messagesClose: $("messages-close"),
    messageList: $("message-list"),

    contactsPanel: $("contacts-panel"),
    contactsClose: $("contacts-close"),
    contactsList: $("contacts-list")
};

const PHONE_APPS = {
    messages: "messages",
    contacts: "contacts",
    map: "map",
    profile: "profile",
    inventory: "inventory"
};

let phoneInitialized = false;
let phoneClockTimer = null;


/* ------------------------------------------------------------
   PHONE HELPERS
   ------------------------------------------------------------ */

function isPhoneOpen() {
    return !!flags.phoneOpen;
}

function closeAllPhoneScreens() {
    hide(phoneRefs.messagesPanel);
    hide(phoneRefs.contactsPanel);
}

function openPhone() {
    if (!gameStarted) return;

    closeAllPhoneScreens();

    flags.phoneOpen = true;

    show(phoneRefs.panel);

    updatePhoneUI();

    if (gameScene) {
        gameScene.input.enabled = false;
    }
}

function closePhone() {
    flags.phoneOpen = false;

    hide(phoneRefs.panel);
    closeAllPhoneScreens();

    if (gameScene) {
        gameScene.input.enabled = true;
    }
}

function togglePhone() {
    if (isPhoneOpen()) {
        closePhone();
    } else {
        openPhone();
    }
}


/* ------------------------------------------------------------
   PHONE CLOCK
   ------------------------------------------------------------ */

function updatePhoneClock() {
    if (!phoneRefs.time) return;

    phoneRefs.time.textContent = getTimeString();

    if (phoneRefs.ownerName) {
        phoneRefs.ownerName.textContent =
            gameState.player.name || "Student";
    }

    if (phoneRefs.avatar) {
        const letter = (gameState.player.name || "S")
            .charAt(0)
            .toUpperCase();

        if (phoneRefs.avatar.tagName === "IMG") {
            phoneRefs.avatar.alt = gameState.player.name || "Student";
        } else {
            phoneRefs.avatar.textContent = letter;
        }
    }
}

function startPhoneClock() {
    if (phoneClockTimer) {
        clearInterval(phoneClockTimer);
    }

    updatePhoneClock();

    phoneClockTimer = setInterval(() => {
        updatePhoneClock();
    }, 1000);
}


/* ------------------------------------------------------------
   PHONE UI
   ------------------------------------------------------------ */

function updatePhoneUI() {
    updatePhoneClock();

    if (phoneRefs.ownerName) {
        phoneRefs.ownerName.textContent =
            gameState.player.name || "Student";
    }
}


/* ------------------------------------------------------------
   PHONE APP OPENING
   ------------------------------------------------------------ */

function openPhoneApp(appName) {
    if (!appName) return;

    const normalized = String(appName)
        .toLowerCase()
        .trim();

    closeAllPhoneScreens();

    switch (normalized) {
        case PHONE_APPS.messages:
            openMessages();
            break;

        case PHONE_APPS.contacts:
            openContacts();
            break;

        case PHONE_APPS.map:
            closePhone();

            if (typeof openMapPanel === "function") {
                openMapPanel();
            }

            break;

        case PHONE_APPS.profile:
            closePhone();

            if (typeof openProfilePanel === "function") {
                openProfilePanel();
            }

            break;

        case PHONE_APPS.inventory:
            closePhone();

            if (typeof openInventory === "function") {
                openInventory();
            }

            break;

        default:
            showNotification(
                "Phone",
                "This app is not available yet.",
                "info"
            );
            break;
    }
}


/* ------------------------------------------------------------
   PHONE APP BUTTONS
   ------------------------------------------------------------ */

function detectPhoneApp(button) {
    if (!button) return "";

    if (button.dataset.app) {
        return button.dataset.app;
    }

    if (button.dataset.action) {
        return button.dataset.action;
    }

    const id = button.id || "";

    if (id.toLowerCase().includes("message")) {
        return "messages";
    }

    if (id.toLowerCase().includes("contact")) {
        return "contacts";
    }

    if (id.toLowerCase().includes("map")) {
        return "map";
    }

    if (id.toLowerCase().includes("profile")) {
        return "profile";
    }

    if (id.toLowerCase().includes("inventory")) {
        return "inventory";
    }

    const text = button.textContent
        .toLowerCase()
        .trim();

    if (text.includes("message")) return "messages";
    if (text.includes("contact")) return "contacts";
    if (text.includes("map")) return "map";
    if (text.includes("profile")) return "profile";
    if (text.includes("inventory")) return "inventory";

    return "";
}

function setupPhoneApps() {
    $$(".phone-app").forEach(button => {
        button.addEventListener("click", () => {
            const app = detectPhoneApp(button);

            if (app) {
                openPhoneApp(app);
            }
        });
    });

    const phoneButtons = [
        $("mobile-phone"),
        $("phone-button"),
        $("hud-phone-button")
    ];

    phoneButtons.forEach(button => {
        if (!button) return;

        button.addEventListener("click", () => {
            togglePhone();
        });
    });
}


/* ------------------------------------------------------------
   MESSAGES
   ------------------------------------------------------------ */

function ensureMessageState() {
    if (!Array.isArray(gameState.messages)) {
        gameState.messages = [];
    }
}

function createMessage(senderId, senderName, text, options = {}) {
    ensureMessageState();

    const message = {
        id: `msg_${Date.now()}_${random(1000, 9999)}`,
        senderId: senderId || "system",
        senderName: senderName || "System",
        text: text || "",
        day: gameState.time.day,
        time: getTimeString(),
        read: options.read === true,
        type: options.type || "normal"
    };

    gameState.messages.push(message);

    if (gameState.messages.length > 100) {
        gameState.messages =
            gameState.messages.slice(-100);
    }

    return message;
}

function countUnreadMessages() {
    ensureMessageState();

    return gameState.messages.filter(
        message => !message.read
    ).length;
}

function markMessageRead(messageId) {
    ensureMessageState();

    const message = gameState.messages.find(
        item => item.id === messageId
    );

    if (message) {
        message.read = true;
    }
}

function markAllMessagesRead() {
    ensureMessageState();

    gameState.messages.forEach(message => {
        message.read = true;
    });
}


/* ------------------------------------------------------------
   MESSAGE LIST
   ------------------------------------------------------------ */

function openMessages() {
    if (!phoneRefs.messagesPanel) return;

    flags.phoneOpen = true;

    hide(phoneRefs.contactsPanel);
    show(phoneRefs.messagesPanel);

    renderMessages();

    markAllMessagesRead();
}

function closeMessages() {
    hide(phoneRefs.messagesPanel);
}

function renderMessages() {
    if (!phoneRefs.messageList) return;

    ensureMessageState();

    phoneRefs.messageList.innerHTML = "";

    if (gameState.messages.length === 0) {
        const empty = document.createElement("div");

        empty.className = "empty-state";

        empty.textContent =
            "No messages yet.";

        phoneRefs.messageList.appendChild(empty);

        return;
    }

    const messages = [...gameState.messages]
        .reverse();

    messages.forEach(message => {
        const item = document.createElement("div");

        item.className =
            `phone-message ${message.read ? "read" : "unread"}`;

        item.dataset.messageId = message.id;

        const header = document.createElement("div");

        header.className = "phone-message-header";

        const sender = document.createElement("strong");

        sender.textContent = message.senderName;

        const time = document.createElement("span");

        time.textContent =
            `Day ${message.day} • ${message.time}`;

        header.appendChild(sender);
        header.appendChild(time);

        const body = document.createElement("div");

        body.className = "phone-message-body";

        body.textContent = message.text;

        item.appendChild(header);
        item.appendChild(body);

        item.addEventListener("click", () => {
            markMessageRead(message.id);
            item.classList.remove("unread");
            item.classList.add("read");
        });

        phoneRefs.messageList.appendChild(item);
    });
}


/* ------------------------------------------------------------
   CONTACTS
   ------------------------------------------------------------ */

function getContactData() {
    return [
        {
            id: "yusuf",
            name: "Yusuf",
            role: "Law Student",
            color: "#4A90E2"
        },
        {
            id: "aisha",
            name: "Aisha",
            role: "Student",
            color: "#E88AA5"
        },
        {
            id: "tunde",
            name: "Tunde",
            role: "Student",
            color: "#E8B04A"
        },
        {
            id: "chioma",
            name: "Chioma",
            role: "Student",
            color: "#8D6CCF"
        },
        {
            id: "ibrahim",
            name: "Ibrahim",
            role: "Student",
            color: "#56A878"
        },
        {
            id: "mama",
            name: "Mama",
            role: "Food Vendor",
            color: "#C77D4A"
        }
    ];
}

function getContactRelationship(id) {
    if (id === "mama") {
        return "Familiar";
    }

    const relationship =
        gameState.relationships &&
        gameState.relationships[id];

    if (!relationship) {
        return "Stranger";
    }

    return getRelationshipLevel(
        relationship.friendship || 0
    );
}

function openContacts() {
    if (!phoneRefs.contactsPanel) return;

    flags.phoneOpen = true;

    hide(phoneRefs.messagesPanel);
    show(phoneRefs.contactsPanel);

    renderContacts();
}

function closeContacts() {
    hide(phoneRefs.contactsPanel);
}

function renderContacts() {
    if (!phoneRefs.contactsList) return;

    phoneRefs.contactsList.innerHTML = "";

    const contacts = getContactData();

    contacts.forEach(contact => {
        const item = document.createElement("div");

        item.className = "contact-item";

        const avatar = document.createElement("div");

        avatar.className = "contact-avatar";

        avatar.textContent =
            contact.name.charAt(0);

        avatar.style.background =
            contact.color;

        const info = document.createElement("div");

        info.className = "contact-info";

        const name = document.createElement("strong");

        name.textContent = contact.name;

        const role = document.createElement("span");

        role.textContent = contact.role;

        const relationship =
            document.createElement("small");

        relationship.textContent =
            getContactRelationship(contact.id);

        info.appendChild(name);
        info.appendChild(role);
        info.appendChild(relationship);

        item.appendChild(avatar);
        item.appendChild(info);

        phoneRefs.contactsList.appendChild(item);
    });
}


/* ------------------------------------------------------------
   STARTER MESSAGES
   ------------------------------------------------------------ */

function seedStarterMessages() {
    ensureMessageState();

    if (gameState.stats.messagesSeeded) {
        return;
    }

    createMessage(
        "yusuf",
        "Yusuf",
        "Welcome to campus. If you get lost, just find me around the faculty.",
        { read: false }
    );

    createMessage(
        "aisha",
        "Aisha",
        "Hey! Welcome to campus. Hope you're settling in well.",
        { read: false }
    );

    gameState.stats.messagesSeeded = true;
}


/* ------------------------------------------------------------
   QUEST-BASED MESSAGES
   ------------------------------------------------------------ */

function sendQuestMessageIfNeeded() {
    ensureMessageState();

    if (!gameState.stats.questMessages) {
        gameState.stats.questMessages = {};
    }

    const currentQuest =
        getCurrentQuest();

    if (!currentQuest) return;

    const questId = currentQuest.id;

    if (gameState.stats.questMessages[questId]) {
        return;
    }

    let sender = null;
    let text = null;

    if (questId === "meetYusuf") {
        sender = {
            id: "yusuf",
            name: "Yusuf"
        };

        text =
            "I'm around the faculty. Come find me when you're free.";
    }

    if (questId === "eatMeal") {
        sender = {
            id: "mama",
            name: "Mama"
        };

        text =
            "My child, come and eat before you start running around campus.";
    }

    if (questId === "attendClass") {
        sender = {
            id: "yusuf",
            name: "Yusuf"
        };

        text =
            "Don't forget your class today. First day no be day to disappear.";
    }

    if (!sender || !text) return;

    createMessage(
        sender.id,
        sender.name,
        text,
        { read: false }
    );

    gameState.stats.questMessages[questId] = true;

    showNotification(
        "New Message",
        `${sender.name} sent you a message.`,
        "info"
    );
}


/* ------------------------------------------------------------
   PHONE CLOSE BUTTONS
   ------------------------------------------------------------ */

function setupPhoneCloseButtons() {
    if (phoneRefs.messagesClose) {
        phoneRefs.messagesClose.addEventListener(
            "click",
            closeMessages
        );
    }

    if (phoneRefs.contactsClose) {
        phoneRefs.contactsClose.addEventListener(
            "click",
            closeContacts
        );
    }
}


/* ------------------------------------------------------------
   PHONE KEYBOARD CONTROL
   ------------------------------------------------------------ */

function setupPhoneKeyboard() {
    document.addEventListener("keydown", event => {
        if (!gameStarted) return;

        if (
            event.key.toLowerCase() === "p" &&
            !isTypingIntoInput(event.target)
        ) {
            togglePhone();
        }

        if (
            event.key === "Escape" &&
            isPhoneOpen()
        ) {
            closePhone();
        }
    });
}

function isTypingIntoInput(target) {
    if (!target) return false;

    const tag = target.tagName;

    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
    );
}


/* ------------------------------------------------------------
   PHONE DATA INDICATOR
   ------------------------------------------------------------ */

function hasMobileData() {
    return getInventoryCount("data") > 0;
}

function requireMobileData(callback) {
    if (hasMobileData()) {
        callback();
        return true;
    }

    showNotification(
        "No Mobile Data",
        "Buy mobile data from the Campus Shop first.",
        "warning"
    );

    return false;
}


/* ------------------------------------------------------------
   MESSAGE NOTIFICATION
   ------------------------------------------------------------ */

function notifyNewMessage(senderName, messageText) {
    createMessage(
        "system",
        senderName,
        messageText,
        { read: false }
    );

    showNotification(
        "New Message",
        `${senderName}: ${messageText}`,
        "info"
    );
}


/* ------------------------------------------------------------
   PHONE INITIALIZATION
   ------------------------------------------------------------ */

function initializePhoneSystem() {
    if (phoneInitialized) {
        updatePhoneUI();
        return;
    }

    phoneInitialized = true;

    ensureMessageState();
    seedStarterMessages();

    setupPhoneApps();
    setupPhoneCloseButtons();
    setupPhoneKeyboard();

    startPhoneClock();

    closeAllPhoneScreens();
    hide(phoneRefs.panel);

    updatePhoneUI();
}


/* ------------------------------------------------------------
   PHONE UPDATE
   ------------------------------------------------------------ */

function updatePhoneSystems() {
    if (!gameStarted) return;

    updatePhoneClock();

    if (
        flags.phoneOpen &&
        phoneRefs.messagesPanel &&
        !phoneRefs.messagesPanel.classList.contains("hidden")
    ) {
        // Keep the message interface current.
        // Rendering is intentionally light because this is
        // a small single-player prototype.
    }
}


/* ------------------------------------------------------------
   SAVE PHONE STATE
   ------------------------------------------------------------ */

function normalizePhoneState() {
    ensureMessageState();

    if (!gameState.stats) {
        gameState.stats = {};
    }

    if (!gameState.stats.questMessages) {
        gameState.stats.questMessages = {};
    }

    if (
        typeof gameState.stats.messagesSeeded !==
        "boolean"
    ) {
        gameState.stats.messagesSeeded = false;
    }
}


/* ------------------------------------------------------------
   CONNECT PHONE TO GAME START
   ------------------------------------------------------------ */

const previousPhoneStartGame = startGame;

startGame = function(character) {
    previousPhoneStartGame(character);

    normalizePhoneState();
    initializePhoneSystem();
    sendQuestMessageIfNeeded();
};


/* ------------------------------------------------------------
   PHONE MESSAGE REFRESH
   ------------------------------------------------------------ */

const previousQuestUIUpdate = updateQuestUI;

updateQuestUI = function() {
    previousQuestUIUpdate();

    if (gameStarted) {
        sendQuestMessageIfNeeded();
    }
};


/* ------------------------------------------------------------
   PHONE PANEL BACK BEHAVIOUR
   ------------------------------------------------------------ */

document.addEventListener("click", event => {
    const target = event.target;

    if (!target) return;

    if (
        flags.phoneOpen &&
        target.matches(".phone-back")
    ) {
        closeAllPhoneScreens();
    }
});


/* ------------------------------------------------------------
   MOBILE PHONE BUTTON
   ------------------------------------------------------------ */

if ($("mobile-phone")) {
    $("mobile-phone").addEventListener(
        "click",
        event => {
            event.preventDefault();
            event.stopPropagation();
            togglePhone();
        }
    );
}


/* ------------------------------------------------------------
   INITIAL PHONE STATE
   ------------------------------------------------------------ */

hide(phoneRefs.messagesPanel);
hide(phoneRefs.contactsPanel);

if (phoneRefs.panel) {
    hide(phoneRefs.panel);
}


/* ============================================================
   END OF PART 8
   PART 9 CONTINUES BELOW
   ============================================================ */
 /* ============================================================
   PART 9/10 — MAP, CUSTOMIZATION, SETTINGS & POLISH
   ============================================================ */


/* ------------------------------------------------------------
   MAP SYSTEM
   ------------------------------------------------------------ */

let mapInitialized = false;

const mapRefs = {
    panel: $("map-panel"),
    close: $("map-close"),
    fullMap: $("full-map"),
    playerMarker: $("map-player-marker"),
    expandButton: $("map-expand-button")
};

function openMapPanel() {
    if (!mapRefs.panel) return;

    show(mapRefs.panel);

    flags.mapOpen = true;

    updateFullMap();

    if (gameScene) {
        gameScene.input.enabled = false;
    }
}

function closeMapPanel() {
    if (!mapRefs.panel) return;

    hide(mapRefs.panel);

    flags.mapOpen = false;

    if (gameScene && !flags.phoneOpen) {
        gameScene.input.enabled = true;
    }
}

function toggleMapPanel() {
    if (flags.mapOpen) {
        closeMapPanel();
    } else {
        openMapPanel();
    }
}


/* ------------------------------------------------------------
   MAP LOCATIONS
   ------------------------------------------------------------ */

function getMapLocations() {
    return Object.entries(CAMPUS_LOCATIONS);
}

function createMapLocationMarker(locationId, location) {
    const marker = document.createElement("div");

    marker.className = "map-location";

    marker.dataset.location = locationId;

    marker.textContent =
        location.name || capitalize(locationId);

    marker.style.left =
        `${(location.x / WORLD_WIDTH) * 100}%`;

    marker.style.top =
        `${(location.y / WORLD_HEIGHT) * 100}%`;

    marker.addEventListener("click", () => {
        if (!gameStarted) return;

        if (locationId === gameState.location) {
            showNotification(
                location.name,
                "You are already here.",
                "info"
            );

            return;
        }

        showNotification(
            location.name,
            "Use the transport system to travel here.",
            "info"
        );
    });

    return marker;
}

function buildFullMap() {
    if (!mapRefs.fullMap) return;

    mapRefs.fullMap.innerHTML = "";

    getMapLocations().forEach(([id, location]) => {
        const marker =
            createMapLocationMarker(id, location);

        mapRefs.fullMap.appendChild(marker);
    });

    if (mapRefs.playerMarker) {
        mapRefs.fullMap.appendChild(
            mapRefs.playerMarker
        );
    }
}

function updateMapPlayerMarker() {
    if (!mapRefs.playerMarker) return;

    const x =
        clamp(
            gameState.player.x || 0,
            0,
            WORLD_WIDTH
        );

    const y =
        clamp(
            gameState.player.y || 0,
            0,
            WORLD_HEIGHT
        );

    mapRefs.playerMarker.style.left =
        `${(x / WORLD_WIDTH) * 100}%`;

    mapRefs.playerMarker.style.top =
        `${(y / WORLD_HEIGHT) * 100}%`;
}

function updateFullMap() {
    updateMapPlayerMarker();
}

function initializeMapSystem() {
    if (mapInitialized) {
        updateFullMap();
        return;
    }

    mapInitialized = true;

    buildFullMap();

    if (mapRefs.close) {
        mapRefs.close.addEventListener(
            "click",
            closeMapPanel
        );
    }

    if (mapRefs.expandButton) {
        mapRefs.expandButton.addEventListener(
            "click",
            openMapPanel
        );
    }

    hide(mapRefs.panel);

    flags.mapOpen = false;
}


/* ------------------------------------------------------------
   MINIMAP
   ------------------------------------------------------------ */

const minimapRefs = {
    world: $("minimap-world"),
    player: $("minimap-player"),
    npcs: $("minimap-npcs")
};

function updateMinimapPlayer() {
    if (!minimapRefs.player) return;

    const x =
        clamp(
            gameState.player.x || 0,
            0,
            WORLD_WIDTH
        );

    const y =
        clamp(
            gameState.player.y || 0,
            0,
            WORLD_HEIGHT
        );

    minimapRefs.player.style.left =
        `${(x / WORLD_WIDTH) * 100}%`;

    minimapRefs.player.style.top =
        `${(y / WORLD_HEIGHT) * 100}%`;
}

function updateMinimapNPCs() {
    if (!minimapRefs.npcs) return;

    minimapRefs.npcs.innerHTML = "";

    Object.entries(npcSprites).forEach(
        ([id, sprite]) => {
            if (!sprite || !sprite.active) return;

            const dot =
                document.createElement("span");

            dot.className = "minimap-npc";

            dot.dataset.npc = id;

            dot.style.left =
                `${(sprite.x / WORLD_WIDTH) * 100}%`;

            dot.style.top =
                `${(sprite.y / WORLD_HEIGHT) * 100}%`;

            minimapRefs.npcs.appendChild(dot);
        }
    );
}

function updateMinimap() {
    updateMinimapPlayer();
    updateMinimapNPCs();
}


/* ------------------------------------------------------------
   CHARACTER CUSTOMIZATION
   ------------------------------------------------------------ */

let customizationInitialized = false;

const customizationRefs = {
    panel: $("customization-panel"),
    close: $("customization-close"),
    character: $("customization-character"),
    save: $("customization-save")
};

function openCustomization() {
    if (!customizationRefs.panel) return;

    show(customizationRefs.panel);

    flags.customizationOpen = true;

    renderCustomizationPreview();

    if (gameScene) {
        gameScene.input.enabled = false;
    }
}

function closeCustomization() {
    if (!customizationRefs.panel) return;

    hide(customizationRefs.panel);

    flags.customizationOpen = false;

    if (gameScene && !flags.phoneOpen) {
        gameScene.input.enabled = true;
    }
}

function renderCustomizationPreview() {
    if (!customizationRefs.character) return;

    const avatar =
        customizationRefs.character;

    avatar.innerHTML = "";

    const head =
        document.createElement("div");

    head.className = "customization-head";

    head.textContent =
        (gameState.player.name || "S")
            .charAt(0)
            .toUpperCase();

    avatar.appendChild(head);
}

function saveCustomization() {
    const selected =
        document.querySelector(
            ".appearance-option.selected"
        );

    if (selected) {
        gameState.appearance.style =
            selected.dataset.style ||
            selected.dataset.appearance ||
            selected.textContent
                .trim()
                .toLowerCase();
    }

    saveGame();

    showNotification(
        "Appearance Saved",
        "Your character appearance has been updated.",
        "success"
    );

    closeCustomization();
}

function initializeCustomization() {
    if (customizationInitialized) return;

    customizationInitialized = true;

    if (customizationRefs.close) {
        customizationRefs.close.addEventListener(
            "click",
            closeCustomization
        );
    }

    if (customizationRefs.save) {
        customizationRefs.save.addEventListener(
            "click",
            saveCustomization
        );
    }

    $$(".appearance-option").forEach(option => {
        option.addEventListener("click", () => {
            $$(".appearance-option")
                .forEach(item =>
                    item.classList.remove("selected")
                );

            option.classList.add("selected");
        });
    });

    hide(customizationRefs.panel);
}


/* ------------------------------------------------------------
   SETTINGS
   ------------------------------------------------------------ */

let settingsInitialized = false;

const settingsRefs = {
    panel: $("settings-panel"),
    close: $("settings-close"),
    sound: $("setting-sound"),
    music: $("setting-music"),
    notifications: $("setting-notifications"),
    effects: $("setting-effects"),
    quality: $("setting-quality"),
    reset: $("settings-reset")
};

function openSettings() {
    if (!settingsRefs.panel) return;

    show(settingsRefs.panel);

    flags.settingsOpen = true;

    loadSettingsUI();

    if (gameScene) {
        gameScene.input.enabled = false;
    }
}

function closeSettings() {
    if (!settingsRefs.panel) return;

    hide(settingsRefs.panel);

    flags.settingsOpen = false;

    if (gameScene && !flags.phoneOpen) {
        gameScene.input.enabled = true;
    }
}

function loadSettingsUI() {
    if (settingsRefs.sound) {
        settingsRefs.sound.checked =
            gameState.settings.sound;
    }

    if (settingsRefs.music) {
        settingsRefs.music.checked =
            gameState.settings.music;
    }

    if (settingsRefs.notifications) {
        settingsRefs.notifications.checked =
            gameState.settings.notifications;
    }

    if (settingsRefs.effects) {
        settingsRefs.effects.checked =
            gameState.settings.effects;
    }

    if (settingsRefs.quality) {
        settingsRefs.quality.value =
            gameState.settings.quality;
    }
}

function saveSettingsFromUI() {
    if (settingsRefs.sound) {
        gameState.settings.sound =
            settingsRefs.sound.checked;
    }

    if (settingsRefs.music) {
        gameState.settings.music =
            settingsRefs.music.checked;
    }

    if (settingsRefs.notifications) {
        gameState.settings.notifications =
            settingsRefs.notifications.checked;
    }

    if (settingsRefs.effects) {
        gameState.settings.effects =
            settingsRefs.effects.checked;
    }

    if (settingsRefs.quality) {
        gameState.settings.quality =
            settingsRefs.quality.value;
    }

    saveGame();
}

function resetSettings() {
    gameState.settings = {
        sound: true,
        music: true,
        notifications: true,
        effects: true,
        quality: "high"
    };

    loadSettingsUI();

    saveGame();

    showNotification(
        "Settings Reset",
        "Settings have been restored to default.",
        "success"
    );
}

function initializeSettings() {
    if (settingsInitialized) return;

    settingsInitialized = true;

    if (settingsRefs.close) {
        settingsRefs.close.addEventListener(
            "click",
            closeSettings
        );
    }

    [
        settingsRefs.sound,
        settingsRefs.music,
        settingsRefs.notifications,
        settingsRefs.effects,
        settingsRefs.quality
    ].forEach(input => {
        if (!input) return;

        input.addEventListener(
            "change",
            saveSettingsFromUI
        );
    });

    if (settingsRefs.reset) {
        settingsRefs.reset.addEventListener(
            "click",
            resetSettings
        );
    }

    hide(settingsRefs.panel);
}


/* ------------------------------------------------------------
   PAUSE MENU
   ------------------------------------------------------------ */

let pauseInitialized = false;

const pauseRefs = {
    panel: $("pause-menu"),
    resume: $("resume-button"),
    save: $("save-button"),
    settings: $("settings-button"),
    quit: $("quit-button")
};

function openPauseMenu() {
    if (!gameStarted) return;

    if (flags.phoneOpen) {
        closePhone();
    }

    show(pauseRefs.panel);

    flags.paused = true;

    if (gameScene) {
        gameScene.input.enabled = false;
    }
}

function closePauseMenu() {
    hide(pauseRefs.panel);

    flags.paused = false;

    if (gameScene) {
        gameScene.input.enabled = true;
    }
}

function togglePauseMenu() {
    if (flags.paused) {
        closePauseMenu();
    } else {
        openPauseMenu();
    }
}

function initializePauseMenu() {
    if (pauseInitialized) return;

    pauseInitialized = true;

    if (pauseRefs.resume) {
        pauseRefs.resume.addEventListener(
            "click",
            closePauseMenu
        );
    }

    if (pauseRefs.save) {
        pauseRefs.save.addEventListener(
            "click",
            () => {
                saveGame();

                showNotification(
                    "Game Saved",
                    "Your progress has been saved.",
                    "success"
                );
            }
        );
    }

    if (pauseRefs.settings) {
        pauseRefs.settings.addEventListener(
            "click",
            () => {
                openSettings();
            }
        );
    }

    if (pauseRefs.quit) {
        pauseRefs.quit.addEventListener(
            "click",
            () => {
                closePauseMenu();

                showNotification(
                    "Quit",
                    "Use the browser refresh button to restart the prototype.",
                    "info"
                );
            }
        );
    }

    hide(pauseRefs.panel);
}


/* ------------------------------------------------------------
   ESCAPE MENU SYSTEM
   ------------------------------------------------------------ */

function closeTopmostPanel() {
    if (flags.dialogueOpen) {
        closeDialogue();
        return true;
    }

    if (flags.phoneOpen) {
        closePhone();
        return true;
    }

    if (flags.mapOpen) {
        closeMapPanel();
        return true;
    }

    if (flags.customizationOpen) {
        closeCustomization();
        return true;
    }

    if (flags.settingsOpen) {
        closeSettings();
        return true;
    }

    if (flags.paused) {
        closePauseMenu();
        return true;
    }

    if (flags.inventoryOpen) {
        closeInventory();
        return true;
    }

    if (flags.shopOpen) {
        closeShop();
        return true;
    }

    return false;
}


/* ------------------------------------------------------------
   KEYBOARD PANEL CONTROL
   ------------------------------------------------------------ */

document.addEventListener("keydown", event => {
    if (!gameStarted) return;

    if (isTypingIntoInput(event.target)) {
        return;
    }

    if (event.key === "Escape") {
        if (closeTopmostPanel()) {
            event.preventDefault();
            return;
        }

        openPauseMenu();
    }

    if (
        event.key.toLowerCase() === "m" &&
        !flags.dialogueOpen &&
        !flags.phoneOpen
    ) {
        openMapPanel();
    }
});


/* ------------------------------------------------------------
   SLEEP SYSTEM IMPROVEMENT
   ------------------------------------------------------------ */

function canSleep() {
    const location =
        String(gameState.location || "")
            .toLowerCase();

    return (
        location === "hostel" ||
        location === "residence"
    );
}

function attemptSleep() {
    if (!canSleep()) {
        showNotification(
            "Cannot Sleep Here",
            "Find your hostel or residence first.",
            "warning"
        );

        return;
    }

    sleep();
}


/* ------------------------------------------------------------
   TRANSPORT SYSTEM
   ------------------------------------------------------------ */

let transportInitialized = false;

const transportRefs = {
    panel: $("transport-panel"),
    close: $("transport-close")
};

const TRANSPORT_DESTINATIONS = {
    campus: {
        name: "Campus",
        cost: 0
    },

    city: {
        name: "City",
        cost: 500
    },

    market: {
        name: "Market",
        cost: 700
    },

    residence: {
        name: "Residence",
        cost: 300
    }
};

function openTransportPanel() {
    if (!transportRefs.panel) return;

    show(transportRefs.panel);

    flags.transportOpen = true;

    if (gameScene) {
        gameScene.input.enabled = false;
    }
}

function closeTransportPanel() {
    hide(transportRefs.panel);

    flags.transportOpen = false;

    if (gameScene && !flags.phoneOpen) {
        gameScene.input.enabled = true;
    }
}

function travelTo(destinationId) {
    const destination =
        TRANSPORT_DESTINATIONS[destinationId];

    if (!destination) return;

    if (
        destination.cost > 0 &&
        !spendMoney(destination.cost)
    ) {
        return;
    }

    let targetLocation = destinationId;

    if (destinationId === "campus") {
        targetLocation = "university";
    }

    if (destinationId === "city") {
        targetLocation = "studentCentre";
    }

    if (destinationId === "market") {
        targetLocation = "shop";
    }

    if (destinationId === "residence") {
        targetLocation = "residence";
    }

    const target =
        CAMPUS_LOCATIONS[targetLocation];

    if (!target || !playerSprite) {
        return;
    }

    playerSprite.x = target.x;
    playerSprite.y = target.y;

    gameState.player.x = target.x;
    gameState.player.y = target.y;

    advanceMinutes(20);

    setLocation(
        targetLocation,
        target.name
    );

    closeTransportPanel();

    showNotification(
        "Travel Complete",
        `You arrived at ${destination.name}.`,
        "success"
    );

    saveGame();
}

function initializeTransportSystem() {
    if (transportInitialized) return;

    transportInitialized = true;

    if (transportRefs.close) {
        transportRefs.close.addEventListener(
            "click",
            closeTransportPanel
        );
    }

    $$(".transport-option").forEach(option => {
        option.addEventListener("click", () => {
            const destination =
                option.dataset.destination ||
                option.dataset.location ||
                option.dataset.place;

            if (destination) {
                travelTo(destination);
            }
        });
    });

    hide(transportRefs.panel);
}


/* ------------------------------------------------------------
   GAME SYSTEM INITIALIZATION
   ------------------------------------------------------------ */

function initializeAdvancedSystems() {
    initializeMapSystem();
    initializeCustomization();
    initializeSettings();
    initializePauseMenu();
    initializeTransportSystem();
}


/* ------------------------------------------------------------
   CONNECT ADVANCED SYSTEMS TO GAME START
   ------------------------------------------------------------ */

const previousAdvancedStartGame = startGame;

startGame = function(character) {
    previousAdvancedStartGame(character);

    initializeAdvancedSystems();

    updateMinimap();
    updateFullMap();
};


/* ------------------------------------------------------------
   WORLD POLISH
   ------------------------------------------------------------ */

function createWorldDecoration(scene) {
    if (!scene) return;

    // Decorative clouds
    for (let i = 0; i < 10; i++) {
        const x = random(100, WORLD_WIDTH - 100);
        const y = random(100, 500);

        const cloud = scene.add.graphics();

        cloud.fillStyle(0xffffff, 0.08);

        cloud.fillCircle(x, y, 28);
        cloud.fillCircle(x + 25, y - 8, 35);
        cloud.fillCircle(x + 55, y, 25);
    }
}

function createStreetDetails(scene) {
    if (!scene) return;

    for (let i = 0; i < 20; i++) {
        const x = random(100, WORLD_WIDTH - 100);
        const y = random(600, WORLD_HEIGHT - 100);

        const line = scene.add.rectangle(
            x,
            y,
            random(20, 50),
            4,
            0xffffff,
            0.08
        );

        line.setDepth(1);
    }
}


/* ------------------------------------------------------------
   PLAYER VISUAL UPDATE
   ------------------------------------------------------------ */

function updatePlayerVisual() {
    if (!playerSprite) return;

    const appearance =
        gameState.appearance || {};

    if (
        appearance.color &&
        playerSprite.setTint
    ) {
        playerSprite.setTint(
            appearance.color
        );
    }
}


/* ------------------------------------------------------------
   GAME STATE SAFETY
   ------------------------------------------------------------ */

function normalizeGameState() {
    if (!gameState.player) {
        gameState.player = {};
    }

    gameState.player.money =
        Number(gameState.player.money || 0);

    gameState.player.health =
        clamp(
            Number(gameState.player.health ?? 100),
            0,
            100
        );

    gameState.player.energy =
        clamp(
            Number(gameState.player.energy ?? 100),
            0,
            100
        );

    gameState.player.hunger =
        clamp(
            Number(gameState.player.hunger ?? 100),
            0,
            100
        );

    gameState.player.happiness =
        clamp(
            Number(gameState.player.happiness ?? 100),
            0,
            100
        );

    if (!gameState.time) {
        gameState.time = {
            minute: 480,
            day: 1,
            dayName: "Monday"
        };
    }

    if (!gameState.stats) {
        gameState.stats = {};
    }

    if (
        typeof gameState.stats.academicProgress !==
        "number"
    ) {
        gameState.stats.academicProgress = 0;
    }

    if (
        typeof gameState.stats.reputation !==
        "number"
    ) {
        gameState.stats.reputation = 0;
    }

    normalizePhoneState();
}


/* ------------------------------------------------------------
   AUTO SAVE
   ------------------------------------------------------------ */

let autoSaveTimer = null;

function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    autoSaveTimer = setInterval(() => {
        if (!gameStarted) return;

        saveGame();
    }, 30000);
}


/* ------------------------------------------------------------
   ADVANCED SYSTEM UPDATE
   ------------------------------------------------------------ */

function updateAdvancedSystems() {
    if (!gameStarted) return;

    normalizeGameState();

    updateMinimap();
    updateFullMap();
    updatePhoneSystems();
    updatePlayerVisual();
}


/* ------------------------------------------------------------
   CONNECT ADVANCED UPDATE TO QUEST UPDATE
   ------------------------------------------------------------ */

const previousFinalQuestUpdate = updateQuestUI;

updateQuestUI = function() {
    previousFinalQuestUpdate();

    updateAdvancedSystems();
};


/* ------------------------------------------------------------
   INITIAL SETUP
   ------------------------------------------------------------ */

normalizeGameState();

initializeAdvancedSystems();
initializePhoneSystem();
startAutoSave();


/* ============================================================
   END OF PART 9
   PART 10 WILL FINALIZE THE GAME
   ============================================================ */

 /* ============================================================
   PART 10/10 — SAVE, LOAD, GAME OVER & FINALIZATION
   ============================================================ */


/* ------------------------------------------------------------
   SAVE SYSTEM
   ------------------------------------------------------------ */

const SAVE_KEY = "student_life_save_v1";

function getSaveData() {
    normalizeGameState();

    return {
        version: GAME_VERSION,

        player: {
            ...gameState.player
        },

        time: {
            ...gameState.time
        },

        location: gameState.location,

        appearance: {
            ...gameState.appearance
        },

        inventory: {
            ...gameState.inventory
        },

        relationships: JSON.parse(
            JSON.stringify(
                gameState.relationships || {}
            )
        ),

        quests: JSON.parse(
            JSON.stringify(
                gameState.quests || {}
            )
        ),

        messages: JSON.parse(
            JSON.stringify(
                gameState.messages || []
            )
        ),

        stats: JSON.parse(
            JSON.stringify(
                gameState.stats || {}
            )
        ),

        settings: {
            ...gameState.settings
        },

        savedAt: Date.now()
    };
}

function saveGame() {
    try {
        const saveData = getSaveData();

        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(saveData)
        );

        showSaveIndicator();

        return true;
    } catch (error) {
        console.error(
            "Could not save game:",
            error
        );

        return false;
    }
}

function showSaveIndicator() {
    const indicator =
        $("save-indicator");

    if (!indicator) return;

    show(indicator);

    indicator.textContent =
        "Game saved";

    clearTimeout(
        showSaveIndicator.timer
    );

    showSaveIndicator.timer =
        setTimeout(() => {
            hide(indicator);
        }, 1800);
}


/* ------------------------------------------------------------
   LOAD SYSTEM
   ------------------------------------------------------------ */

function hasSavedGame() {
    try {
        return !!localStorage.getItem(
            SAVE_KEY
        );
    } catch (error) {
        return false;
    }
}

function loadGame() {
    try {
        const raw =
            localStorage.getItem(
                SAVE_KEY
            );

        if (!raw) {
            return false;
        }

        const saved =
            JSON.parse(raw);

        if (!saved || !saved.player) {
            return false;
        }

        gameState.player = {
            ...gameState.player,
            ...saved.player
        };

        gameState.time = {
            ...gameState.time,
            ...saved.time
        };

        gameState.location =
            saved.location ||
            gameState.location;

        gameState.appearance = {
            ...gameState.appearance,
            ...(saved.appearance || {})
        };

        gameState.inventory = {
            ...gameState.inventory,
            ...(saved.inventory || {})
        };

        gameState.relationships =
            saved.relationships ||
            gameState.relationships;

        gameState.quests =
            saved.quests ||
            gameState.quests;

        gameState.messages =
            saved.messages ||
            [];

        gameState.stats = {
            ...gameState.stats,
            ...(saved.stats || {})
        };

        gameState.settings = {
            ...gameState.settings,
            ...(saved.settings || {})
        };

        normalizeGameState();
        normalizePhoneState();

        if (playerSprite) {
            playerSprite.x =
                gameState.player.x;

            playerSprite.y =
                gameState.player.y;
        }

        refreshAllUI();

        updateInventoryUI();
        updateQuestUI();
        updateRelationshipUI();
        updateProfileUI();
        updateFullMap();
        updateMinimap();

        return true;

    } catch (error) {
        console.error(
            "Could not load save:",
            error
        );

        return false;
    }
}


/* ------------------------------------------------------------
   DELETE SAVE
   ------------------------------------------------------------ */

function deleteSavedGame() {
    try {
        localStorage.removeItem(
            SAVE_KEY
        );

        return true;
    } catch (error) {
        console.error(
            "Could not delete save:",
            error
        );

        return false;
    }
}


/* ------------------------------------------------------------
   LOAD GAME BUTTON SUPPORT
   ------------------------------------------------------------ */

function continueSavedGame() {
    if (!hasSavedGame()) {
        showNotification(
            "No Save Found",
            "There is no saved game to continue.",
            "warning"
        );

        return;
    }

    const loaded =
        loadGame();

    if (!loaded) {
        showNotification(
            "Load Failed",
            "The saved game could not be loaded.",
            "error"
        );

        return;
    }

    gameStarted = true;

    hide($("loading-screen"));
    hide($("character-creation"));

    show($("game-container"));

    initializeAdvancedSystems();
    initializePhoneSystem();

    if (
        game &&
        gameScene
    ) {
        gameScene.input.enabled = true;
    }

    showNotification(
        "Welcome Back",
        `Day ${gameState.time.day} — ${gameState.time.dayName}.`,
        "success"
    );
}


/* ------------------------------------------------------------
   GAME OVER SYSTEM
   ------------------------------------------------------------ */

let gameOverShown = false;

function checkGameOver() {
    if (!gameStarted) return;

    const health =
        Number(
            gameState.player.health
        );

    if (health > 0) {
        return;
    }

    if (gameOverShown) {
        return;
    }

    gameOverShown = true;

    gameState.player.health = 0;

    if (gameScene) {
        gameScene.input.enabled = false;
    }

    const gameStatus =
        $("game-status");

    if (gameStatus) {
        gameStatus.textContent =
            "You collapsed. Take care of yourself and try again.";
    }

    showNotification(
        "You Collapsed",
        "Your health reached zero. Rest and manage your needs better.",
        "error"
    );

    setTimeout(() => {
        gameOverShown = false;

        gameState.player.health = 50;
        gameState.player.energy = 50;
        gameState.player.hunger = 50;
        gameState.player.happiness = 50;

        if (playerSprite) {
            playerSprite.x = 450;
            playerSprite.y = 450;

            gameState.player.x = 450;
            gameState.player.y = 450;
        }

        setLocation(
            "hostel",
            "Student Hostel"
        );

        refreshAllUI();

        if (gameScene) {
            gameScene.input.enabled = true;
        }

        showNotification(
            "Recovered",
            "You woke up at the hostel. Try to take better care of yourself.",
            "info"
        );
    }, 2500);
}


/* ------------------------------------------------------------
   STAT SAFETY
   ------------------------------------------------------------ */

function enforceStatLimits() {
    gameState.player.health =
        clamp(
            gameState.player.health,
            0,
            100
        );

    gameState.player.energy =
        clamp(
            gameState.player.energy,
            0,
            100
        );

    gameState.player.hunger =
        clamp(
            gameState.player.hunger,
            0,
            100
        );

    gameState.player.happiness =
        clamp(
            gameState.player.happiness,
            0,
            100
        );

    gameState.stats.academicProgress =
        clamp(
            gameState.stats.academicProgress,
            0,
            100
        );

    gameState.stats.reputation =
        clamp(
            gameState.stats.reputation,
            -100,
            100
        );

    gameState.player.money =
        Math.max(
            0,
            Math.floor(
                gameState.player.money
            )
        );
}


/* ------------------------------------------------------------
   PLAYER RESPAWN
   ------------------------------------------------------------ */

function respawnPlayer() {
    const hostel =
        CAMPUS_LOCATIONS.hostel;

    if (!hostel || !playerSprite) {
        return;
    }

    playerSprite.x = hostel.x;
    playerSprite.y = hostel.y;

    gameState.player.x =
        hostel.x;

    gameState.player.y =
        hostel.y;

    setLocation(
        "hostel",
        hostel.name
    );
}


/* ------------------------------------------------------------
   FINAL WORLD STATE UPDATE
   ------------------------------------------------------------ */

function updateFinalGameSystems() {
    if (!gameStarted) return;

    enforceStatLimits();

    checkGameOver();

    if (
        gameState.player.health <= 0
    ) {
        return;
    }

    if (
        gameState.player.hunger <= 15 &&
        gameState.player.health > 0
    ) {
        if (
            Math.random() < 0.002
        ) {
            showNotification(
                "You're Very Hungry",
                "Find food before your health suffers.",
                "warning"
            );
        }
    }
}


/* ------------------------------------------------------------
   GAME RESET
   ------------------------------------------------------------ */

function resetGameState() {
    gameState =
        JSON.parse(
            JSON.stringify(
                DEFAULT_GAME_STATE
            )
        );

    gameState.player.money =
        STARTING_MONEY;

    gameState.time.minute = 480;
    gameState.time.day = 1;
    gameState.time.dayName = "Monday";

    gameState.player.x = 450;
    gameState.player.y = 450;

    gameState.location =
        "university";

    gameStarted = false;

    flags.phoneOpen = false;
    flags.mapOpen = false;
    flags.paused = false;
    flags.dialogueOpen = false;
    flags.inventoryOpen = false;
    flags.shopOpen = false;
    flags.customizationOpen = false;
    flags.settingsOpen = false;
    flags.transportOpen = false;

    deleteSavedGame();
}


/* ------------------------------------------------------------
   NEW GAME
   ------------------------------------------------------------ */

function startNewGame() {
    resetGameState();

    hide($("pause-menu"));
    hide($("game-container"));

    show($("character-creation"));

    if ($("character-form")) {
        $("character-form").reset();
    }

    gameOverShown = false;

    refreshCharacterPreview();
}


/* ------------------------------------------------------------
   BROWSER SAVE PROTECTION
   ------------------------------------------------------------ */

window.addEventListener(
    "beforeunload",
    () => {
        if (gameStarted) {
            saveGame();
        }
    }
);


/* ------------------------------------------------------------
   VISIBILITY SAVE
   ------------------------------------------------------------ */

document.addEventListener(
    "visibilitychange",
    () => {
        if (
            document.hidden &&
            gameStarted
        ) {
            saveGame();
        }
    }
);


/* ------------------------------------------------------------
   FINAL KEYBOARD SHORTCUTS
   ------------------------------------------------------------ */

document.addEventListener(
    "keydown",
    event => {
        if (!gameStarted) return;

        if (
            isTypingIntoInput(
                event.target
            )
        ) {
            return;
        }

        const key =
            event.key.toLowerCase();

        if (
            key === "i" &&
            !flags.phoneOpen &&
            !flags.dialogueOpen
        ) {
            openInventory();
        }

        if (
            key === "p" &&
            !flags.dialogueOpen
        ) {
            togglePhone();
        }

        if (
            key === "m" &&
            !flags.dialogueOpen &&
            !flags.phoneOpen
        ) {
            toggleMapPanel();
        }
    }
);


/* ------------------------------------------------------------
   FINAL GAME UPDATE WRAPPER
   ------------------------------------------------------------ */

const previousFinalUpdate =
    GameScene.prototype.update;

GameScene.prototype.update =
    function(time, delta) {

        previousFinalUpdate.call(
            this,
            time,
            delta
        );

        if (!gameStarted) {
            return;
        }

        updateFinalGameSystems();
    };


/* ------------------------------------------------------------
   FINAL GAME START WRAPPER
   ------------------------------------------------------------ */

const previousFinalStartGame =
    startGame;

startGame = function(character) {

    previousFinalStartGame(
        character
    );

    normalizeGameState();

    enforceStatLimits();

    gameState.player.x =
        gameState.player.x ||
        450;

    gameState.player.y =
        gameState.player.y ||
        450;

    if (playerSprite) {
        playerSprite.x =
            gameState.player.x;

        playerSprite.y =
            gameState.player.y;
    }

    updatePlayerVisual();

    refreshAllUI();

    updateInventoryUI();
    updateRelationshipUI();
    updateProfileUI();
    updateQuestUI();

    initializeAdvancedSystems();
    initializePhoneSystem();

    startAutoSave();

    saveGame();

    showNotification(
        "Student Life",
        `Welcome ${gameState.player.name}. Your campus life begins now.`,
        "success"
    );
};


/* ------------------------------------------------------------
   FINAL DOM INITIALIZATION
   ------------------------------------------------------------ */

function finalizeGameInitialization() {

    normalizeGameState();

    initializePhoneSystem();

    initializeAdvancedSystems();

    setupPhoneApps();
    setupPhoneCloseButtons();

    hide($("dialogue-panel"));
    hide($("inventory-panel"));
    hide($("shop-panel"));
    hide($("map-panel"));
    hide($("profile-panel"));
    hide($("relationships-panel"));
    hide($("quest-log-panel"));
    hide($("messages-panel"));
    hide($("contacts-panel"));
    hide($("transport-panel"));
    hide($("customization-panel"));
    hide($("settings-panel"));
    hide($("sleep-panel"));
    hide($("food-panel"));
    hide($("class-panel"));
    hide($("work-panel"));
    hide($("study-panel"));
    hide($("pause-menu"));

    if (!gameStarted) {
        hide($("game-container"));
    }
}


/* ------------------------------------------------------------
   START SCREEN / SAVED GAME SUPPORT
   ------------------------------------------------------------ */

function setupSavedGameSupport() {

    const continueButton =
        $("continue-button");

    if (continueButton) {
        continueButton.addEventListener(
            "click",
            continueSavedGame
        );
    }

    const newGameButton =
        $("new-game-button");

    if (newGameButton) {
        newGameButton.addEventListener(
            "click",
            startNewGame
        );
    }
}


/* ------------------------------------------------------------
   INITIAL GAME UI
   ------------------------------------------------------------ */

function initializeFinalUI() {

    if ($("game-container")) {
        hide($("game-container"));
    }

    if ($("character-creation")) {
        show($("character-creation"));
    }

    if ($("loading-screen")) {
        hide($("loading-screen"));
    }

    updatePhoneClock();
    updateTimeHUD();
    updateHUD();
}


/* ------------------------------------------------------------
   FINAL STARTUP
   ------------------------------------------------------------ */

finalizeGameInitialization();
setupSavedGameSupport();
initializeFinalUI();


/* ------------------------------------------------------------
   FINAL CONSOLE MESSAGE
   ------------------------------------------------------------ */

console.log(
    "%cStudent Life Prototype",
    "font-size:18px;font-weight:bold;"
);

console.log(
    "Game systems initialized successfully."
);

console.log(
    "Controls: WASD / Arrow Keys = Move | E = Interact | I = Inventory | P = Phone | M = Map | ESC = Pause"
);


/* ============================================================
   STUDENT LIFE GAME — END OF GAME.JS
   ============================================================ */

})();
