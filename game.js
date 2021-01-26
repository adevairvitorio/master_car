var FPS = 30;
var CANVAS_WIDTH = 500, CANVAS_HEIGHT = 600;
var KEY_CODE_UP = 38, KEY_CODE_DOWN = 40, KEY_CODE_LEFT = 37, KEY_CODE_RIGHT = 39, KEY_CODE_SPACE = 32, KEY_CODE_ENTER = 13;
var MOVE_X = 50;
var SPEED_MOVE = 0.5, SPEED_OBSTACLES = 2.5, SPEED_OBSTACLES_MAX = 10;
var TYPE_COMPONENT_IMAGE = 'IMAGE', TYPE_COMPONENT_TEXT = 'TEXT', TYPE_COMPONENT_ELEMENT = 'ELEMENT';
var LOCAL_STORAGE_SCORE_MAX = 'SCORE_MAX';
var SPRITE_CAR_TIME = 15;
var SCORE_MAX = localStorage.getItem(LOCAL_STORAGE_SCORE_MAX);



var obstacle = {
    width: 32,
    height: 80,
    type: [
        {
            name: 'CAR',
            src: 'images/car_green.png',
        },
        {
            name: 'HOLE',
            src: 'images/car_detailed.png',
        }
    ],
    cars: [
        'images/vehicles/mini_truck.png',
        'images/vehicles/car.png',
        'images/vehicles/taxi.png',
        'images/vehicles/ambulance.png'
    ],
    typeComponent: TYPE_COMPONENT_IMAGE
}

var roads = {
    one: 100,
    two: 150,
    three: 200,
    four: 250,
    five: 300,
    getRoads: function () {
        return [this.one, this.two, this.three, this.four, this.five];
    }
}

var car = {
    width: 30,
    height: 80,
    sprite: [
        'images/vehicles/car_police/1.png',
        'images/vehicles/car_police/2.png',
        'images/vehicles/car_police/3.png'
    ],
    
    x: roads.three + 15,
    y: CANVAS_HEIGHT - 130,
    type: TYPE_COMPONENT_IMAGE
}

var properties = {
    sounds: {
        theme: 'sounds/C3 Racing - Traceillusion - Forth.mp3',
        colision: 'sounds/OOGAhorn.mp3'
    },
    scene: 'images/road.png',
    points: 'images/points.png',
    score: 'images/score.png',
    icon: 'images/icon.png',
    bandStreet: 'images/band_street.png',
    audio: {
        on: 'images/audio_on.png',
        off: 'images/audio_off.png'
    },
    font: {
        size: '18px',
        name: 'Consolas',
        color: 'Black'
    }
}

var sceneGame;
var carGame;
var obstaclesGame = [];
var scoreGame;
var pointsGame;
var sceneGame;
var scoreTextGame;
var pointsTextGame;
var levelTextGame;
var timeTextGame;
var scoreMaxTextGame;
var iconGame;
var bandStreetLeftGame, bandStreetRightGame;

var soundColision;
var soundTheme;
var stage;

var btnAction = document.getElementById('btnAction');

window.requestAnimationFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || function (callback) { window.setTimeout(callback, 1000 / 60); };



var game = {
    active: false,
    canvas: document.createElement('canvas'),
    context: function () {
        return this.canvas.getContext('2d');
    },
    start: function () {
        this.active = true;
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.context = this.canvas.getContext('2d');
        this.frameNo = 0;
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, FPS);

        SCORE_MAX = localStorage.getItem(LOCAL_STORAGE_SCORE_MAX) ? localStorage.getItem(LOCAL_STORAGE_SCORE_MAX) : 0;

        
        window.addEventListener('keyup', keypressHandler, false);

        
        sceneGame = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT, 0, 0, 'http://spiralforums.biz/uploads/post-53-1139607373.jpg');
        sceneGame.context = this.context;

        
        btnAction.innerText = 'Pause';
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        this.active = false;
        clearInterval(this.interval);
        soundTheme.stop();
        btnAction.innerText = 'Play';
    },
    play: function () {
        if (!hasColision()) {
            this.active = true;
            this.interval = setInterval(updateGameArea, FPS);
            soundTheme.play();
            btnAction.innerText = 'Pause';
        } else {
            location.reload();
        }
    },
    toogle: function () {
        if (this.active) {
            this.stop();
        } else {
            this.play();
        }
    }
}


function everyInterval(n) {
    if ((game.frameNo / n) % 1 == 0) { return true; }
    return false;
}


function Stage(levelInit) {
    this.levelActual = (levelInit && levelInit > 0) ? levelInit : 1;
    this.levelMax = 5;
    this.totalObstacles = this.levelActual;
    this.interval = 150;
    this.level = {
        one: { score: 1, obstacles: 1 },
        two: { score: 50, obstacles: 2 },
        three: { score: 150, obstacles: 3 },
        four: { score: 300, obstacles: 4 },
        five: { score: 500, obstacles: 4 }
    };
    this.up = function (score) {
        if (this.levelActual < this.levelMax) {
            switch (score) {
                case this.level.one.score:
                    this.totalObstacles = this.level.one.obstacles;
                    this.levelActual = 1;
                    this.interval = 80;
                    SPEED_OBSTACLES = 2;
                    return false;
                case this.level.two.score:
                    this.totalObstacles = this.level.two.obstacles;
                    this.levelActual = 2;
                    this.interval = 70;
                    SPEED_OBSTACLES = 4;
                    return;
                case this.level.three.score:
                    this.totalObstacles = this.level.three.obstacles;
                    this.levelActual = 3;
                    SPEED_OBSTACLES = 6;
                    this.interval = 60;
                    return false;
                case this.level.four.score:
                    this.totalObstacles = this.level.four.obstacles;
                    this.levelActual = 4;
                    SPEED_OBSTACLES = 8;
                    this.interval = 40;
                    return false;
                case this.level.five.score:
                    this.totalObstacles = this.level.five.obstacles;
                    this.levelActual = 5;
                    SPEED_OBSTACLES = 10;
                    this.interval = 30;
                    return false;
            }
        }
    }
}


function Component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.angle = 0;
    this.image = null;
    this.tag = 0;
    this.update = function () {
        var ctx = game.context;
        if (this.type == TYPE_COMPONENT_TEXT) {
            ctx.font = this.width + ' ' + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else if (this.type == TYPE_COMPONENT_IMAGE) {
            if (!this.image) {
                this.image = new Image();
                this.image.src = color;
            }

            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width, this.height);
        } else if (this.type == TYPE_COMPONENT_ELEMENT) {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPosition = function () {
        this.x = this.speedX;
        this.y += this.speedY;
    }
    this.crashWith = function (element) {
        var crash = false;
        var axisX = this.x;
        var width = ((this.width / 2) + 6) + this.x;
        var axisY = this.y;
        var height = this.y + this.height;

        var elementAxisX = element.x;
        var elementWidth = ((element.width / 2) + 6) + element.x;
        var elementAxisY = element.y;
        var elementHeight = element.y + element.height;

        if (axisX => elementAxisX && axisX <= elementWidth) {
            if (axisX < elementWidth && width > elementAxisX) {
                if (elementHeight >= axisY && elementAxisY <= height) {
                    crash = true;
                }
            }
        }

        return crash;
    }
    this.moveUp = function () {
        this.speedY -= SPEED_MOVE;
    }
    this.moveDown = function () {
        this.speedY += SPEED_MOVE;
    }
    this.moveLeft = function () {
        if (this.x > roads.one)
            this.speedX -= 50;
    }
    this.moveRight = function () {
        if (this.x < roads.five)
            this.speedX += 50;
    }
    this.changeImage = function (src) {
        var ctx = game.context;
        if (this.type == TYPE_COMPONENT_IMAGE) {
            this.image = new Image();
            this.image.src = src;
            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width, this.height);
        }
    }
}



function Scene(width, height, x, y, background) {
    Component.call(this);//inheritance Component

    this.lastRepaintTime = window.performance.now();
    this.init = false;
    this.context;
    this.drawBackground = function () {
        this.image = new Image;
        this.image.src = background;

        var framegap = 100 - this.lastRepaintTime;
        this.lastRepaintTime = 100;

        var translateY = 100 * (framegap / 1000);
        this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.context.fillStyle = this.context.createPattern(this.image, "repeat-y");

        this.context.rect(0, translateY, this.image.width, this.image.height);
        this.context.fill();

        this.context.translate(0, +2);
        this.init = true;

        requestAnimationFrame(this.drawBackground.bind(this))
    }
}


function Sound(src) {
    this.sound = document.createElement('audio');
    this.sound.src = src;
    this.sound.setAttribute('preload', 'auto');
    this.sound.setAttribute('controls', 'none');
    this.sound.style.display = 'none';
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}


function keypressHandler(event) {
    switch (event.keyCode) {
        case KEY_CODE_UP:
            break;
        case KEY_CODE_DOWN:
            break;
        case KEY_CODE_LEFT:
            carGame.moveLeft();
            break;
        case KEY_CODE_RIGHT:
            carGame.moveRight();
            break;
        case KEY_CODE_ENTER:
            break;
        case KEY_CODE_SPACE:
            btnAction.onclick();
            break;
    }
}


function startGame() {
    stage = new Stage(2);

    
    sceneGame = new Scene(CANVAS_WIDTH, CANVAS_HEIGHT, 0, 0, properties.scene);

    
    bandStreetLeftGame = new Component(10, 700, properties.bandStreet, roads.one, 0, TYPE_COMPONENT_IMAGE);
    bandStreetRightGame = new Component(10, 700, properties.bandStreet, 380, 0, TYPE_COMPONENT_IMAGE);

    carGame = new Component(car.width, car.height, car.sprite[1], car.x, car.y, car.type);
    carGame.speedX = car.x;

    
    scoreGame = new Component(150, 100, properties.score, CANVAS_WIDTH - 150, 0, TYPE_COMPONENT_IMAGE);
    iconGame = new Component(40, 40, properties.icon, 8, 18, TYPE_COMPONENT_IMAGE);
    pointsGame = new Component(150, 100, properties.points, 0, 0, TYPE_COMPONENT_IMAGE);

    
    scoreTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, CANVAS_WIDTH - 80, 78, TYPE_COMPONENT_TEXT);
    scoreMaxTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, CANVAS_WIDTH - 90, 45, TYPE_COMPONENT_TEXT);
    pointsTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, 60, 45, TYPE_COMPONENT_TEXT);
    levelTextGame = new Component(properties.font.size, properties.font.name, properties.font.color, 30, 78, TYPE_COMPONENT_TEXT);
    timeTextGame = new Component('12px', properties.font.name, 'white', CANVAS_WIDTH - 98, CANVAS_HEIGHT - 10, TYPE_COMPONENT_TEXT);

    levelTextGame.text = stage.levelActual;
    timeTextGame.text = '';

    
    soundColision = new Sound(properties.sounds.colision);
    soundTheme = new Sound(properties.sounds.theme);
    soundTheme.play();

    game.start();
}

function updateGameArea() {
    if (hasColision()) {
        game.stop();
        btnAction.innerText = 'Restart';
    } else {
        game.clear();
        game.frameNo += 1;

        createObstacles();
        bandStreetLeftGame.update();
        bandStreetRightGame.update();

        score();
        scoreGame.update();
        scoreTextGame.update();
        scoreMaxTextGame.update();

        pointsGame.update();
        pointsTextGame.update();

        levelTextGame.text = stage.levelActual;
        levelTextGame.update();

        timeTextGame.update();

        iconGame.update();
        animateCarGame();
    }
}


function animateCarGame() {
    carGame.newPosition();

    if (!carGame.tag.update) {
        carGame.tag = {
            update: true,
            actualSprite: 0,
            sprite: {
                start: game.frameNo,
                end: game.frameNo + SPRITE_CAR_TIME
            }
        }
    }

    if (game.frameNo > carGame.tag.sprite.start && game.frameNo <= carGame.tag.sprite.end) {
        carGame.changeImage((carGame.tag.actualSprite == 1) ? car.sprite[0] : car.sprite[2]);
        if (game.frameNo == carGame.tag.sprite.end) {
            carGame.tag.actualSprite = (carGame.tag.actualSprite == 1) ? 0 : 1;
            carGame.tag.sprite.start = game.frameNo + 1;
            carGame.tag.sprite.end = game.frameNo + SPRITE_CAR_TIME;
        }
    }


    carGame.update();
}

function score() {
    var text = '';
    var calc = Math.floor(game.frameNo / 5);
    var points = ((game.frameNo / 5) / 100).toFixed(1);

    if (calc > 0) {
        scoreTextGame.text = text + calc;
    } else {
        scoreTextGame.text = text + 0;
    }

    pointsTextGame.text = points;
    scoreMaxTextGame.text = SCORE_MAX;
    if (calc > SCORE_MAX) {
        scoreMaxTextGame.text = calc;
        localStorage.setItem(LOCAL_STORAGE_SCORE_MAX, calc);
    }

    stage.up(calc);
}

function createObstacles() {
    var x, y;
    var srcObstacle;

    if (game.frameNo == 1 || everyInterval(stage.interval)) {
        var roadsUsed = [];
        var obstacleUsed = [];
        var totalObstaclesRandom = Math.round(Math.random() * stage.totalObstacles);

        
        for (var indexObstacle = 0; indexObstacle < totalObstaclesRandom; indexObstacle++) {
            var roadBefore = (indexObstacle > 0) ? obstaclesGame[indexObstacle - 1].tag : 1;
            var newRoad = randomIndex(roads.getRoads().length, roadsUsed);
            var newObstacle = randomIndex(obstacle.cars.length, obstacleUsed);

            roadsUsed.push(newRoad);

            x = roads.getRoads()[newRoad] + 14;
            y = Math.round(Math.random() * 50) * -1;

            var typeObstacle = Math.floor(Math.round(Math.random() * 1));

            srcObstacle = obstacle.cars[newObstacle];
            var newObstacle = new Component(obstacle.width, obstacle.height, srcObstacle, x, y, obstacle.typeComponent);
            newObstacle.tag = newRoad;

            obstaclesGame.push(newObstacle);
        }
    }
    for (i = 0; i < obstaclesGame.length; i++) {
        if (obstaclesGame[i].y >= CANVAS_HEIGHT) {
            obstaclesGame.splice(i, 1);
        } else {
            obstaclesGame[i].y += SPEED_OBSTACLES;
            obstaclesGame[i].update();
        }
    }
}

function hasColision() {
    for (i = 0; i < obstaclesGame.length; i++) {
        if (carGame.crashWith(obstaclesGame[i])) {
            soundColision.play();
            return true;
        }
    }
    return false;
}

function randomIndex(lengthOfArray, itemsExclude) {
    var rand = null;  

    do {
        rand = Math.round(Math.random() * (lengthOfArray - 1));
    } while (itemsExclude.indexOf(rand) != -1);

    return rand;
}

var seconds = 0, minutes = 0, hours = 0;
setInterval(function () {
    if (!hasColision() && game.active) {
        var secondsFormat, minutesFormat, hoursFormat;

        if (seconds >= 60) {
            minutes++;
            seconds = 0;
        }
        if (minutes >= 60) {
            hours++;
            minutes = 0;
        }

        if (seconds < 10) secondsFormat = '0' + seconds;
        else secondsFormat = '' + seconds;

        if (minutes < 10) minutesFormat = '0' + minutes;
        else minutesFormat = '' + minutes;

        if (hours < 10) hoursFormat = '0' + hours;
        else hoursFormat = '' + hours;

        timeTextGame.text = 'Time ' + hoursFormat + ':' + minutesFormat + ':' + secondsFormat;

        seconds++;
    }
}, 1000);