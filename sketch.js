/*--------------------------------------------*/
/*----------GENERAL GLOBAL VARIABLES----------*/
/*--------------------------------------------*/
//DRAWING RELATED
var floorPos_y, backgroundColour, floorColour, cloudArray, mountainArray, treeArray, canyonArray, collectableArray, flagpole, flag, scrollPos, platforms, isInContact, enemies;
var headerSize, bodySize, line1, line1point5, line2, line3, line4;

//GAME CHAR RELATED (GAME CHAR IS 40PX WIDE, 60PX TALL)
var gameChar_x, gameChar_y, gameCharWorld_x, isLeft, isRight, isFalling, isPlummeting;
var jump, newJumpHeight, fallSpeed;

//GAME MECHANIC RELATED
var gameScore, restartGame, gameIsLost, gameIsWon;
var controlsText = true;

//SFX RELATED
var sfxCanyon, sfxCollectable, sfxJump, sfxRespawn, sfxTalk, sfxGameLose, sfxGameWin; //THIS IS CONSIDERED SFX
var sfxGameBG; //-----------------------------------------------------------------------THIS IS CONSIDERED MUSIC

/*-----------------------------------------*/
/*----------CUSTOMISABLE SETTINGS----------*/
/*-----------------------------------------*/
//SET NO. OF COLLECTABLES NEEDED TO WIN GAME (ALSO AFFECTS GAME'S DURATION)
var winScore = 6;
//---DEFAULT = 6
//-----RANGE = 4 OR MORE

//SET NO. OF LIVES HERE
var lives = 3;
//DEFAULT = 3

//MOVEMENT SPEED
var moveSpeed = 3;
//----DEFAULT = 3
//------RANGE = ANYTHING THAT IS NOT ZERO (HIGHER NO. = FASTER SPEED)
var initialMoveSpeed = moveSpeed; //DO NOT CHANGE

//JUMPING
var jumpSpeed = 3;
//----DEFAULT = 3
//------RANGE = ANYTHING > 0 (HIGHER NO. = FASTER JUMPS)
var jumpHeight = 150;
//-----DEFAULT = 150          (NO. OF PIXELS GAME CHAR CAN JUMP FROM FLOOR)
//-------RANGE = ANYTHING > 0 (HIGHER NO. = TALLER JUMPS)
//----------------------------(SEE "jumpHeight" COMMENT IN "function draw()")

//GRAVITY
var gravity = 2;
//--DEFAULT = 2
//----RANGE = ANYTHING > 0 (HIGHER NO. = STRONGER GRAVITY)

/*--------------------------------------*/
/*----------LOAD AND PLAY/DRAW----------*/
/*--------------------------------------*/
function preload() {
    //SFX
    sfxCanyon = loadSound("SFX/canyonPlummet.mp3");
    sfxCanyon.setVolume(0.3);

    sfxCollectable = loadSound("SFX/collectableTake.mp3");
    sfxCollectable.setVolume(0.3);

    sfxJump = loadSound("SFX/jump.mp3");
    sfxJump.setVolume(0.3);

    sfxRespawn = loadSound("SFX/respawn.mp3");
    sfxRespawn.setVolume(0.3);

    sfxTalk = loadSound("SFX/talking.mp3");
    sfxTalk.setVolume(0.3);

    sfxGameLose = loadSound("SFX/gameLose.mp3");
    sfxGameLose.setVolume(0.3);

    sfxGameWin = loadSound("SFX/gameWin.mp3");
    sfxGameWin.setVolume(0.3);

    sfxEnemyHit = loadSound("SFX/enemyHit.mp3");
    sfxEnemyHit.setVolume(0.3);

    //MUSIC
    sfxGameBG = loadSound("SFX/gameBG.mp3");
    sfxGameBG.setVolume(0.1);
}

function setup() {
    createCanvas(1024, 576);

    //SET AS DEFAULT THROUGHOUT CODING
    noStroke();
    textAlign(CENTER);

    //--DEFAULT TEXT SIZES
    headerSize = width * (4 / 100) + height * (6 / 100);
    bodySize = width * (1.2 / 100) + height * (1.2 / 100);

    //--DEFUALT TEXT POSITIONS
    line1 = height * (35 / 100);
    line2 = height * (45 / 100);
    line3 = height * (55 / 100);
    line4 = height * (65 / 100);

    //--FOR drawWin/LoseGame BACKGROUND AND TEXT
    line1point5 = height * (40 / 100);
    line2point5 = height * (50 / 100);

    //FLOOR    = HEIGHT * PERCENTAGE OF SKY
    floorPos_y = height * (75 / 100);

    //SET BOOLEANS AND DRAWING ARRAYS
    startGame();
}

//MORE CUSTOMISABLE SETTINGS HERE
function startGame() {
    //DO NOT CHANGE BELOW

    //--RESET CONTROLS TO DEFAULT
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    jump = false;

    //--RESET STATUS TO DEFAULT
    restartGame = false;
    gameIsLost = false;
    gameIsWon = false;
    gameScore = 0;
    //DO NOT CHANGE ABOVE

    //SET BACKGROUND AND FLOOR COLOUR (RGB)
    backgroundColour = color(29, 71, 79);
    floorColour = color(100, 64, 34);

    //CLOUD
    cloudArray = [];
    for (var i = 0; i < winScore * 3; i++) {
        cloudArray.push({
            pos_x: -1100 + i * 250,
            pos_y: random(200),
            widthScale: random(50, 150) / 100,
            heightScale: random(50, 150) / 100,
            speed: random(0.1, 0.8),
        });
    }

    //MOUNTAIN
    //--RECOMMENDED pos_x: ALTERNATE WITH TREE
    //--2ND LAST MOUNTAIN IS SPECIAL
    mountainArray = [];
    for (var i = 0; i < winScore + winScore / 2; i++) {
        var doNotDraw = ceil(winScore - winScore / 2);

        //DO NOT DRAW 2ND LAST MOUNTAIN (LET USER FOCUS)
        if (i == doNotDraw) {
            //DO NOTHING
        } else {
            mountainArray.push({
                pos_x: -700 + i * 800,
                pos_y: floorPos_y,
                widthScale: random(80, 130) / 100,
                heightScale: random(80, 130) / 100,
            });
        }
    }

    //TREE
    //--RECOMMENDED pos_x: ALTERNATE WITH MOUNTAIN
    //--3RD LAST TREE IS SPECIAL
    treeArray = [];
    for (var i = 0; i < winScore + winScore / 2 + 1; i++) {
        var doNotDraw = floor(winScore - winScore / 2 + 1);

        //DO NOT DRAW 3RD LAST TREE (LET USER FOCUS)
        if (i == doNotDraw) {
            //DO NOTHING
        } else {
            treeArray.push({
                pos_x: -1100 + i * 800,
                pos_y: floorPos_y,
                widthScale: random(60, 120) / 100,
                heightScale: random(60, 120) / 100,
            });
        }
    }

    //PLATFORM (x, y, length)
    //--3RD LAST / 2ND LAST / VERY LAST / PLATFORMS ARE SPECIAL
    platforms = [];
    for (var i = 0; i < winScore; i++) {
        if (i == winScore - 3) {
            //3RD LAST PLATFORM
            platforms.push(
                createPlatforms(
                    520 + i * 400, //x
                    floorPos_y - 60, //y
                    50 //length
                )
            );
        } else if (i == winScore - 2) {
            //2ND LAST PLATFORM
            platforms.push(
                createPlatforms(
                    250 + i * 400, //x
                    floorPos_y - 200, //y
                    50 //length
                )
            );
        } else if (i == winScore - 1) {
            //VERY LAST PLATFORM
            platforms.push(
                createPlatforms(
                    -80 + i * 400, //x
                    floorPos_y - 50, //y
                    220 //length
                )
            );
        } else {
            //EVERY OTHER PLATFORM
            platforms.push(
                createPlatforms(
                    random(-200, -50) + i * 400, //x
                    random(floorPos_y - 50, floorPos_y - 80), //y
                    random(30, 90) //length
                )
            );
        }
    }

    //CANYON
    //--RECOMMENDED pos_x: 400PX APART
    //--RECOMMENDED width: 60 TO 200, ELSE TOO SMALL OR IMPOSSIBLE TO JUMP ACROSS (WITH DEFAULT SETTINGS)
    //--2ND LAST / VERY LAST / CANYONS ARE SPECIAL
    canyonArray = [];
    for (var i = 0; i < winScore; i++) {
        //DO NOT DRAW 2ND LAST CANYON (MORE SPACE FOR LAST CANYON)
        if (i == winScore - 2) {
            //DO NOTHING
        } else if (i == winScore - 1) {
            //LAST CANYON WILL BE HUGE
            canyonArray.push({
                pos_x: -100 + i * 400,
                width: 600,
            });
        } else {
            //EVERY OTHER CANYON IS NORMAL
            canyonArray.push({
                pos_x: -100 + i * 400,
                width: random(60, 200),
            });
        }
    }

    //ENEMY (x, y, range, speed)
    //--3RD ENEMY IS SPECIAL
    enemies = [];
    for (var i = 0; i < winScore - 1; i++) {
        //3RD ENEMY WILL ALWAYS BE ABOVE GAME CHAR
        if (i == 2) {
            enemies.push(
                new Enemy(
                    -300 + i * 400, //x
                    random(floorPos_y - 200, floorPos_y - 120), //y
                    120, //range
                    2 //speed
                )
            );
        } else {
            enemies.push(
                new Enemy(
                    -300 + i * 400, //x
                    random(floorPos_y - 200, floorPos_y), //y
                    120, //range
                    random(1, 3.5) //speed
                )
            );
        }
    }

    //COLLECTABLE
    //--RECOMMENDED pos_x: 400PX APART
    //--RECOMMENDED pos_y: floorPos_y-25 TO floorPos_y-215, ELSE INSIDE FLOOR OR UNREACHABLE (WITH DEFAULT SETTINGS, JUMPING FROM FLOOR)
    //--2ND LAST / VERY LAST / COLLECTABLES ARE SPECIAL
    collectableArray = [];
    for (var i = 0; i < winScore; i++) {
        //2ND LAST AND LAST COLLECTABLE ARE HARDER TO TAKE
        if (i == winScore - 2 || i == winScore - 1) {
            collectableArray.push({
                pos_x: 75 + i * 400,
                pos_y: floorPos_y - random(380, 400),
                scale: 120 / 100,
                isFound: false,
            });
        } else {
            //EVERY OTHER COLLECTABLE IS NORMAL
            collectableArray.push({
                pos_x: random(-400, -200) + i * 400,
                pos_y: floorPos_y - random(125, 200),
                scale: random(50, 80) / 100,
                isFound: false,
            });
        }
    }

    //FLAGPOLE & FLAG
    flagpole = {
        pos_x: -100 + winScore * 400, //DO NOT CHANGE (THIS REPLACES WHAT WOULD'VE BEEN THE NEXT CANYON)
        height: floorPos_y - 240, //DEFAULT: floorPos_y - 180
        bottomWidth: 20, //DEFAULT: 20
        bottomHeight: 10, //DEFAULT: 10
        isReached: false,
    };

    flag = {
        pos_x: flagpole.pos_x + 3, //DO NOT CHANGE
        height: flagpole.height, //DO NOT CHANGE
        length: 80, //DEFAULT: 80
    };

    //GAME CHAR
    gameChar_x = width * (50 / 100);
    gameChar_y = floorPos_y;
    gameCharWorld_x = gameChar_x;
}

function draw() {
    //IF controlsText IS TRUE...
    if (controlsText) {
        //...THEN SHOW introGame SCREEN
        introGame();
        //...AND return IF controlsText STILL TRUE
        return;
    }

    //DRAWING (NOT PART OF SCROLLING)
    drawSkyAndFloor();

    //jumpHeight LINE (ONLY FOR REFERENCE WHILE CODING)
    //strokeWeight(5);
    //stroke(255, 50);
    //line(0, newJumpHeight, width, newJumpHeight);
    //noStroke();

    //SCROLLING: START
    scrollPos_x = gameCharWorld_x - gameChar_x;
    push();
    translate(-scrollPos_x, 0);

    //DRAWING (PART OF SCROLLING)
    drawAndMoveCloudArray();
    drawMountainArray();
    drawTreeArray();
    drawPlatformArray();
    drawAndTakeCollectable();
    drawCanyonArray();
    canyonPlummet(); //--LOSE CONDITION HERE
    drawEnemyAndContacted(); //--LOSE CONDITION HERE
    drawFlagpoleAndWhenActivated(); //--WIN CONDITION HERE
    activatingFlagpole();

    //SCROLLING: END
    pop();

    //GAME CHAR: DRAW, MOVE, LIMIT
    drawGameChar();
    moveGameChar();
    limitGameChar();

    //LIVES & SCORE
    drawLivesAndScore();

    //MUSIC AND SFX BOX AT TOP-LEFT CORNER
    drawAudioSettings();

    //WIN / LOSE SCREEN AT LATEST LAYER
    drawLoseGame();
    drawWinGame();
}

/*-------------------------------*/
/*----------GAME STATES----------*/
/*-------------------------------*/
function introGame() {
    //DRAWINGS
    drawSkyAndFloor();
    drawAudioSettings();

    //DRAW GAME CHAR AND ALLOW MOVEMENT TOO
    drawGameChar();
    moveGameChar();

    //SCROLLING: START
    scrollPos_x = gameCharWorld_x - gameChar_x;
    push();
    translate(-scrollPos_x, 0);

    drawPlatformArray();

    //DRAW controlsText RIGHT OFF THE BAT
    fill(255);
    if (frameCount > 0) {
        var leftSide = width * (35 / 100);
        var rightSide = width * (55 / 100);

        textSize(headerSize);
        text("Controls", width / 2, line1);

        textSize(bodySize);
        textAlign(LEFT);

        //--LEFT SIDE TEXT
        text("Move left", leftSide, line2);
        text("Move right", leftSide, line3);
        text("Jump", leftSide, line4);

        //--RIGHT SIDE TEXT
        text("A   /   Left arrow", rightSide, line2);
        text("D   /   Right arrow", rightSide, line3);
        text("W   /   Up arrow   /   Space", rightSide, line4);

        //--TOP LEFT CORNER TEXT
        textSize(bodySize * 0.8);
        text("Audio settings (it's clickable!)", width * (1 / 100), height * (9 / 100));

        //--SET TO "DEFAULT" ALIGNMENT
        textSize(bodySize);
        textAlign(CENTER);

        //--TO CREATE BLINKING EFFECT
        if (frameCount % 90 < 45) {
            text("Press Enter to continue", width / 2, height * (85 / 100));
        }
    }

    //SCROLLING: END
    pop();
}

function drawLoseGame() {
    //THE COUNTER FOR LIVES BECOMES "-1" FOR ONE FRAME, SO THIS WORKS
    if (lives == -1) {
        sfxGameLose.play();
        sfxGameBG.stop();
    }

    //"&& gameIsLost" NEEDED, SO THAT LOSING SCREEN DOES NOT CONSTANTLY APPEAR
    if (lives < 0 && gameIsLost) {
        //DISABLE CONTROLS
        moveSpeed = 0;
        isLeft = false;
        isRight = false;
        jump = false;

        //TRANSLUCENT BLACK BACKGROUND
        rectMode(CENTER);
        fill(0, 150);
        rect(width / 2, line1point5, headerSize * 6, bodySize * 12, 50, 50, 50, 50);
        //--SET BACK TO DEFAULT
        rectMode(CORNER);

        //BIG TEXT
        fill(255);
        textSize(headerSize);
        text("Game Over!", width / 2, line1);

        //SMALL TEXT
        textSize(bodySize);
        text("Press spacebar to practice", width / 2, line2);
        text("or", width / 2, line2point5);
        text("Refresh page to restart", width / 2, line3);

        //OTHERS
        restartGame = true;
        return;
    }
}

function drawWinGame() {
    if (gameIsWon) {
        //AUDIO
        if (!sfxGameWin.isPlaying()) {
            sfxGameBG.stop();
            sfxGameWin.play();
        }

        //TRANSLUCENT BLACK BACKGROUND
        rectMode(CENTER);
        fill(0, 150);
        rect(width / 2, line1point5, headerSize * 8, bodySize * 12, 50, 50, 50, 50);
        //--SET BACK TO DEFAULT
        rectMode(CORNER);

        //BIG TEXT
        fill(255);
        textSize(headerSize);
        text("Level Complete!", width / 2, line1);

        //SMALL TEXT
        textSize(bodySize);
        text("Press spacebar to replay level", width / 2, line2point5);
        text("with your current Lives Remaining", width / 2, line3);

        //OTHERS
        restartGame = true;
        return;
    }
}

/*---------------------------------*/
/*----------DRAWING STUFF----------*/
/*---------------------------------*/
function drawSkyAndFloor() {
    //BACKGROUND AKA. SKY
    background(backgroundColour);

    //FLOOR
    fill(floorColour);
    rect(0, floorPos_y, width, height - floorPos_y);
}

function drawAndMoveCloudArray() {
    for (var i = 0; i < cloudArray.length; i++) {
        //WHITES
        fill(210);
        //LEFT MOST
        ellipse(cloudArray[i].pos_x - 80 * cloudArray[i].widthScale, cloudArray[i].pos_y + 10 * cloudArray[i].heightScale, 40 * cloudArray[i].widthScale, 60 * cloudArray[i].heightScale);
        //LEFT
        ellipse(cloudArray[i].pos_x - 40 * cloudArray[i].widthScale, cloudArray[i].pos_y + 5 * cloudArray[i].heightScale, 80 * cloudArray[i].widthScale, 100 * cloudArray[i].heightScale);
        //MID
        ellipse(cloudArray[i].pos_x, cloudArray[i].pos_y, 80 * cloudArray[i].widthScale, 120 * cloudArray[i].heightScale);
        //RIGHT
        ellipse(cloudArray[i].pos_x + 40 * cloudArray[i].widthScale, cloudArray[i].pos_y + 5 * cloudArray[i].heightScale, 100 * cloudArray[i].widthScale, 100 * cloudArray[i].heightScale);
        //RIGHT MOST
        ellipse(cloudArray[i].pos_x + 60 * cloudArray[i].widthScale, cloudArray[i].pos_y + 5 * cloudArray[i].heightScale, 120 * cloudArray[i].widthScale, 60 * cloudArray[i].heightScale);

        //GREYS
        fill(180);
        //LEFT MOST
        ellipse(cloudArray[i].pos_x - 80 * cloudArray[i].widthScale, cloudArray[i].pos_y + 15 * cloudArray[i].heightScale, 35 * cloudArray[i].widthScale, 50 * cloudArray[i].heightScale);
        //LEFT
        ellipse(cloudArray[i].pos_x - 40 * cloudArray[i].widthScale, cloudArray[i].pos_y + 10 * cloudArray[i].heightScale, 75 * cloudArray[i].widthScale, 90 * cloudArray[i].heightScale);
        //MID
        ellipse(cloudArray[i].pos_x, cloudArray[i].pos_y + 5 * cloudArray[i].heightScale, 75 * cloudArray[i].widthScale, 110 * cloudArray[i].heightScale);
        //RIGHT
        ellipse(cloudArray[i].pos_x + 40 * cloudArray[i].widthScale, cloudArray[i].pos_y + 10 * cloudArray[i].heightScale, 95 * cloudArray[i].widthScale, 90 * cloudArray[i].heightScale);
        //RIGHT MOST
        ellipse(cloudArray[i].pos_x + 60 * cloudArray[i].widthScale, cloudArray[i].pos_y + 10 * cloudArray[i].heightScale, 115 * cloudArray[i].widthScale, 50 * cloudArray[i].heightScale);

        //MOVEMENT
        cloudArray[i].pos_x += cloudArray[i].speed;

        //CLOUD LABEL
        //fill(0);
        //textAlign(CENTER);
        //textSize(12);
        //text("cloud" + [i], cloudArray[i].pos_x, cloudArray[i].pos_y + 14);
        //ellipse(cloudArray[i].pos_x, cloudArray[i].pos_y, 2.5);
    }
}

function drawMountainArray() {
    for (var i = 0; i < mountainArray.length; i++) {
        //ROOF LEFT
        fill(38, 58, 58);
        triangle(
            mountainArray[i].pos_x - 20 * mountainArray[i].widthScale, //  TIP X
            mountainArray[i].pos_y - 300 * mountainArray[i].heightScale, //TIP Y
            mountainArray[i].pos_x - 30 * mountainArray[i].widthScale,
            mountainArray[i].pos_y - 250 * mountainArray[i].heightScale,
            mountainArray[i].pos_x - 10 * mountainArray[i].widthScale,
            mountainArray[i].pos_y - 250 * mountainArray[i].heightScale
        );

        //ROOF MID
        triangle(
            mountainArray[i].pos_x, //									   TIP X
            mountainArray[i].pos_y - 320 * mountainArray[i].heightScale, //TIP Y
            mountainArray[i].pos_x - 10 * mountainArray[i].widthScale,
            mountainArray[i].pos_y - 250 * mountainArray[i].heightScale,
            mountainArray[i].pos_x + 10 * mountainArray[i].widthScale,
            mountainArray[i].pos_y - 250 * mountainArray[i].heightScale
        );

        //ROOF RIGHT
        triangle(
            mountainArray[i].pos_x + 20 * mountainArray[i].widthScale, //  TIP X
            mountainArray[i].pos_y - 300 * mountainArray[i].heightScale, //TIP Y
            mountainArray[i].pos_x + 10 * mountainArray[i].widthScale,
            mountainArray[i].pos_y - 250 * mountainArray[i].heightScale,
            mountainArray[i].pos_x + 30 * mountainArray[i].widthScale,
            mountainArray[i].pos_y - 250 * mountainArray[i].heightScale
        );

        //MID
        fill(22, 42, 42);
        rect(mountainArray[i].pos_x - 40 * mountainArray[i].widthScale, mountainArray[i].pos_y - 255 * mountainArray[i].heightScale, 80 * mountainArray[i].widthScale, 40 * mountainArray[i].heightScale);

        //BOTTOM
        fill(2, 22, 22);
        rect(mountainArray[i].pos_x - 50 * mountainArray[i].widthScale, mountainArray[i].pos_y - 220 * mountainArray[i].heightScale, 100 * mountainArray[i].widthScale, 220 * mountainArray[i].heightScale);

        //MOUNTAIN LABEL
        //fill(255);
        //textAlign(CENTER);
        //textSize(12);
        //text("mountain" + [i], mountainArray[i].pos_x, mountainArray[i].pos_y + 14);
        //ellipse(mountainArray[i].pos_x, mountainArray[i].pos_y, 2.5);
    }
}

function drawTreeArray() {
    for (var i = 0; i < treeArray.length; i++) {
        //TRUNK
        fill(120, 84, 54);
        //LEFT TRUNK
        triangle(treeArray[i].pos_x - 70 * treeArray[i].widthScale, treeArray[i].pos_y - 110 * treeArray[i].heightScale, treeArray[i].pos_x - 5 * treeArray[i].widthScale, treeArray[i].pos_y - 90 * treeArray[i].heightScale, treeArray[i].pos_x - 5 * treeArray[i].widthScale, treeArray[i].pos_y - 80 * treeArray[i].heightScale);
        //MID TRUNK
        triangle(treeArray[i].pos_x - 10 * treeArray[i].widthScale, treeArray[i].pos_y - 140 * treeArray[i].heightScale, treeArray[i].pos_x - 10 * treeArray[i].widthScale, treeArray[i].pos_y, treeArray[i].pos_x + 15 * treeArray[i].widthScale, treeArray[i].pos_y);
        //RIGHT TRUNK
        triangle(treeArray[i].pos_x + 55 * treeArray[i].widthScale, treeArray[i].pos_y - 140 * treeArray[i].heightScale, treeArray[i].pos_x, treeArray[i].pos_y - 85 * treeArray[i].heightScale, treeArray[i].pos_x, treeArray[i].pos_y - 65 * treeArray[i].heightScale);

        //LEAVES
        fill(0, 90, 0);
        //LEFT LEAVES
        ellipse(treeArray[i].pos_x - 70 * treeArray[i].widthScale, treeArray[i].pos_y - 110 * treeArray[i].heightScale, 70 * treeArray[i].widthScale, 40 * treeArray[i].heightScale);
        //MID LEAVES
        fill(0, 100, 0);
        ellipse(treeArray[i].pos_x - 20 * treeArray[i].widthScale, treeArray[i].pos_y - 140 * treeArray[i].heightScale, 90 * treeArray[i].widthScale, 60 * treeArray[i].heightScale);
        //RIGHT LEAVES
        fill(0, 110, 0);
        ellipse(treeArray[i].pos_x + 50 * treeArray[i].widthScale, treeArray[i].pos_y - 140 * treeArray[i].heightScale, 90 * treeArray[i].widthScale, 60 * treeArray[i].heightScale);

        //TREE LABEL
        //fill(255);
        //textAlign(CENTER);
        //textSize(12);
        //text("tree" + [i], treeArray[i].pos_x, treeArray[i].pos_y - 6);
        //ellipse(treeArray[i].pos_x, treeArray[i].pos_y, 2.5);
    }
}

function createPlatforms(x, y, length) {
    var p = {
        x: x,
        y: y,
        length: length,

        draw: function () {
            fill(floorColour);
            rect(this.x, this.y - 4, this.length, 12);
        },

        checkContact: function (gc_x, gc_y) {
            var condPlatform1 = gc_x + 15 > this.x; //               LEFT LIMIT
            var condPlatform2 = gc_x - 15 < this.x + this.length; //RIGHT LIMIT

            //IF GAME CHAR IS WITHIN RANGE TO STAND ON PLATFORM...
            if (condPlatform1 && condPlatform2) {
                var d = this.y - gc_y;

                //...AND IF GAME CHAR IS ON (OR SLIGHTLY ABOVE) PLATFORM...
                if (d >= 0 && d < 5) {
                    //...THEN RETURN TRUE
                    return true;
                }
            }

            //FUNCTION RETURNS FALSE BY DEFAULT
            return false;
        },
    };

    //RETURN EITHER TRUE OR FALSE
    return p;
}

function drawPlatformArray() {
    for (var i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }
}

function drawCanyonArray() {
    for (var i = 0; i < canyonArray.length; i++) {
        //GAP
        fill(backgroundColour);
        rect(canyonArray[i].pos_x - canyonArray[i].width / 2, floorPos_y, canyonArray[i].width, height - floorPos_y);

        //FIRE ORANGE DARK
        fill(250, 80, 0);
        beginShape();
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 2, height);
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 2, floorPos_y * (130 / 100));
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 3, floorPos_y * (110 / 100)); //TIP LEFT
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 5, floorPos_y * (120 / 100));
        vertex(canyonArray[i].pos_x, floorPos_y * (105 / 100)); //						     TIP MID
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 5, floorPos_y * (120 / 100));
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 3, floorPos_y * (110 / 100)); //TIP RIGHT
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 2, floorPos_y * (125 / 100));
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 2, height);
        endShape(CLOSE);

        //FIRE ORANGE MID
        fill(255, 160, 0);
        beginShape();
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 2, height);
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 2, floorPos_y * (135 / 100));
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 3, floorPos_y * (115 / 100)); //TIP LEFT
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 5, floorPos_y * (125 / 100));
        vertex(canyonArray[i].pos_x, floorPos_y * (110 / 100)); //							 TIP MID
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 5, floorPos_y * (125 / 100));
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 3, floorPos_y * (115 / 100)); //TIP RIGHT
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 2, floorPos_y * (130 / 100));
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 2, height);
        endShape(CLOSE);

        //FIRE ORANGE LIGHT
        fill(255, 180, 0);
        beginShape();
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 2, height);
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 2, floorPos_y * (140 / 100));
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 3, floorPos_y * (120 / 100)); //TIP LEFT
        vertex(canyonArray[i].pos_x - canyonArray[i].width / 5, floorPos_y * (130 / 100));
        vertex(canyonArray[i].pos_x, floorPos_y * (115 / 100)); //TIP MID
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 5, floorPos_y * (130 / 100));
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 3, floorPos_y * (120 / 100)); //TIP RIGHT
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 2, floorPos_y * (135 / 100));
        vertex(canyonArray[i].pos_x + canyonArray[i].width / 2, height);
        endShape(CLOSE);

        //CANYON LABEL
        //fill(255);
        //textAlign(CENTER);
        //textSize(12);
        //text("canyon" + [i], canyonArray[i].pos_x, floorPos_y + 14);
        //ellipse(canyonArray[i].pos_x, floorPos_y, 2.5);
    }
}

//--LOSE CONDITION HERE
function canyonPlummet() {
    for (var i = 0; i < canyonArray.length; i++) {
        //CONDITIONS REQUIRED
        var condCanyon1 = gameCharWorld_x - 15 > canyonArray[i].pos_x - canyonArray[i].width / 2; //LEFT LIMIT
        var condCanyon2 = gameCharWorld_x + 15 < canyonArray[i].pos_x + canyonArray[i].width / 2; //RIGHT LIMIT
        var condCanyon3 = gameChar_y >= floorPos_y; //TOP LIMIT

        //IF CONDITIONS ARE MET...
        if (condCanyon1 && condCanyon2 && condCanyon3) {
            //...THEN DISABLE CONTROLS WHEN PLUMMETING
            isLeft = false;
            isRight = false;
            jump = false;

            //...AND ACTUALLY PLUMMET
            isPlummeting = true;
            gameChar_y += gravity * fallSpeed * 3;
        }

        //AUDIO - WHEN PLUMMET INTO CANYON
        //IF GAME CHAR PASSES CERTAIN POINT INSIDE FLOOR...
        //"if (isPlummeting)" DOESN'T WORK AS AUDIO WILL OCCUR EVERY FRAME
        if (gameChar_y > floorPos_y + 10 && gameChar_y < floorPos_y + 20) {
            //...AND IF CANYON SFX IS NOT PLAYING... (THIS PREVENTS AUDIO FROM OCCURING EVERY FRAME)
            if (!sfxCanyon.isPlaying()) {
                //...THEN PLAY CANYON SFX
                sfxCanyon.play();
            }
        }
    }

    //IF GAME CHAR FALLS BELOW CANVAS...
    //--"HEIGHT + NUMBER" TO ADD A SENSE OF DELAY
    if (gameChar_y > height + 1500) {
        //...THEN -1 TO LIFE
        lives -= 1;

        //... AND IF STILL ENOUGH LIVES TO PLAY AGAIN...
        if (lives >= 0) {
            //...PLAY AUDIO AND startGame AGAIN
            sfxRespawn.play();
            startGame();
        } else {
            gameIsLost = true;
        }
    }
}

function Enemy(x, y, range, speed) {
    this.x = x;
    this.y = y;
    this.range = range;

    this.speed = speed;
    this.currentX = x;

    //ENEMY - MOVEMENT
    this.movement = function () {
        this.currentX += this.speed;

        if (this.currentX > this.x + this.range) {
            this.speed *= -1;
        } else if (this.currentX < this.x - this.range) {
            this.speed *= -1;
        }
    };

    //ENEMY - DRAWING
    this.draw = function () {
        fill(255, 130, 255);

        //SPIKE VERTICAL
        beginShape();
        vertex(this.currentX, this.y - 20);
        vertex(this.currentX - 5, this.y);
        vertex(this.currentX, this.y + 20);
        vertex(this.currentX + 5, this.y);
        endShape(CLOSE);

        //SPIKE HORIZONTAL
        beginShape();
        vertex(this.currentX - 20, this.y);
        vertex(this.currentX, this.y - 5);
        vertex(this.currentX + 20, this.y);
        vertex(this.currentX, this.y + 5);
        endShape(CLOSE);

        //ANCHOR
        fill(255);
        ellipse(this.currentX, this.y, 6);
        this.movement();
    };

    //ENEMY - GAME CHAR CONTACT REQUIREMENT
    this.checkContact = function (gc_x, gc_y) {
        var d = dist(gc_x, gc_y, this.currentX, this.y);

        if (d < 36) {
            return true;
        }

        return false;
    };
}

//--LOSE CONDITION HERE
function drawEnemyAndContacted() {
    //DRAW ENEMY HERE
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();

        //ENEMY CONTACTED HERE
        var isContacted = enemies[i].checkContact(gameCharWorld_x, gameChar_y - 30);
        //SAME CONCEPT AS CANYON'S LOSE CONDITION
        if (isContacted) {
            lives -= 1;

            //WHENEVER CONTACTED WITH ENEMY, PLAY AUDIO ONCE
            if (!sfxEnemyHit.isPlaying()) {
                sfxEnemyHit.play();
            }

            if (lives >= 0) {
                sfxRespawn.play();
                startGame();
            } else {
                gameIsLost = true;
            }
        }
    }
}

function drawCollectableArray(collectableIndex) {
    //GUN HORIZONTAL BODY
    fill(165, 134, 99);
    rect(collectableIndex.pos_x - 35 * collectableIndex.scale, collectableIndex.pos_y, collectableIndex.scale * 60, collectableIndex.scale * 10, 0, collectableIndex.scale * 10, 0, 0);
    //GUN VERTICAL HANDLE
    rect(collectableIndex.pos_x + 15 * collectableIndex.scale, collectableIndex.pos_y + 8 * collectableIndex.scale, collectableIndex.scale * 10, collectableIndex.scale * 20);
    //GUN TIP
    fill(240);
    triangle(collectableIndex.pos_x - 35 * collectableIndex.scale, collectableIndex.pos_y + 3 * collectableIndex.scale, collectableIndex.pos_x - 65 * collectableIndex.scale, collectableIndex.pos_y + 5 * collectableIndex.scale, collectableIndex.pos_x - 35 * collectableIndex.scale, collectableIndex.pos_y + 7 * collectableIndex.scale);

    //CONNECTOR
    fill(220);
    rect(collectableIndex.pos_x, collectableIndex.pos_y - 5 * collectableIndex.scale, collectableIndex.scale * 10, collectableIndex.scale * 5);

    //JUICE COVER, BOTTOM
    fill(120, 30, 30);
    rect(collectableIndex.pos_x - 5 * collectableIndex.scale, collectableIndex.pos_y - 10 * collectableIndex.scale, collectableIndex.scale * 20, collectableIndex.scale * 5, 0, 0, collectableIndex.scale * 5, collectableIndex.scale * 5);
    //JUICE COVER, TOP
    rect(collectableIndex.pos_x - 5 * collectableIndex.scale, collectableIndex.pos_y - 35 * collectableIndex.scale, collectableIndex.scale * 20, collectableIndex.scale * 5, collectableIndex.scale * 5, collectableIndex.scale * 5, 0, 0);
    //JUICE COVER, TOP CIRCLE
    ellipse(collectableIndex.pos_x + 5 * collectableIndex.scale, collectableIndex.pos_y - 35 * collectableIndex.scale, collectableIndex.scale * 7);

    //JUICE
    fill(80, 0, 0);
    rect(collectableIndex.pos_x - 5 * collectableIndex.scale, collectableIndex.pos_y - 30 * collectableIndex.scale, collectableIndex.scale * 20, collectableIndex.scale * 20);

    //WHITE REFLECTION
    fill(240);
    rect(collectableIndex.pos_x + 10 * collectableIndex.scale, collectableIndex.pos_y - 33 * collectableIndex.scale, collectableIndex.scale * 2.5, collectableIndex.scale * 25, collectableIndex.scale * 2.5, collectableIndex.scale * 2.5, collectableIndex.scale * 2.5, collectableIndex.scale * 2.5);

    //COLLECTABLE LABEL
    //fill(255);
    //textAlign(CENTER);
    //text("collectable" + [i], collectableArray[i].pos_x+(90*collectableArray[i].scale), collectableArray[i].pos_y+(6*collectableArray[i].scale));
    //ellipse(collectableArray[i].pos_x, collectableArray[i].pos_y, 2.5);
}

function takeCollectable(collectableIndex) {
    var d = dist(gameCharWorld_x, gameChar_y - 26, collectableIndex.pos_x, collectableIndex.pos_y);

    if (d < collectableIndex.scale * 80) {
        collectableIndex.isFound = true;
        sfxCollectable.play(0, random(1, 3));
        gameScore += 1; //MUST PUT "IF" FUNCTION OUT OF "FOR" LOOP, OR ELSE SCORE ADDS CONSTANTLY
    }
}

function drawAndTakeCollectable() {
    for (var i = 0; i < collectableArray.length; i++) {
        //IF COLLECTABLE IS NOT FOUND...
        if (collectableArray[i].isFound == false) {
            //...THEN DRAW COLLECTABLE
            drawCollectableArray(collectableArray[i]);
            //...AND CHECK IF THEY HAVE BEEN FOUND, SO THAT SCORE CAN +1
            takeCollectable(collectableArray[i]);
        }
    }
}

function drawFlag() {
    var customTextSize = flag.length / 8;

    fill(35);
    rect(flag.pos_x, flag.height, flag.length, flag.length * (60 / 100));

    fill(212, 183, 111);
    textSize(10);
    textSize(customTextSize);
    text("WELCOME", flag.pos_x + flag.length / 2, flag.height + flag.length * (2 / 3) * (1 / 4));
    text("TO", flag.pos_x + flag.length / 2, flag.height + flag.length * (2 / 3) * (2 / 4));
    text("RAPTURE", flag.pos_x + flag.length / 2, flag.height + flag.length * (2 / 3) * (3 / 4));
}

function drawFlagpole() {
    //POLE
    stroke(25);
    strokeWeight(5);
    line(flagpole.pos_x, floorPos_y - flagpole.bottomHeight, flagpole.pos_x, flagpole.height);
    noStroke();

    //POLE BOTTOM (RECT)
    fill(182, 153, 81);
    rect(flagpole.pos_x - flagpole.bottomWidth / 2, floorPos_y - flagpole.bottomHeight, flagpole.bottomWidth, flagpole.bottomHeight);

    //POLE TOP (CIRCLE)
    fill(182, 153, 81);
    ellipse(flagpole.pos_x, flagpole.height - 5, 10);
}

function activatingFlagpole() {
    //CONDITIONS REQUIRED TO WIN
    var cond1 = flagpole.isReached == false;
    var cond2 = abs(gameCharWorld_x - flagpole.pos_x) < 25;
    var cond3 = gameScore >= winScore;

    //IF CONDITIONS ARE MET...
    if (cond1 && cond2 && cond3) {
        //...THEN FLAGPOLE CONSIDERED REACHED
        flagpole.isReached = true;
    } else if (cond1 && cond2) {
        //ELSE IF NOT ENOUGH SCORE TO WIN...
        //...THEN TEXT APPEARS
        fill(199, 186, 143);
        textSize(bodySize);
        textStyle(ITALIC);
        text("i need to get more ADAM Synringes...", gameCharWorld_x, gameChar_y - 80);
    }

    //AUDIO - GAME CHAR GOES TO FLAGPOLE AND CANNOT WIN
    //IF NOT ENOUGH SCORE...
    if (!cond3) {
        //...AND IF NEAR FLAGPOLE
        if (abs(gameCharWorld_x - flagpole.pos_x) > 20 && abs(gameCharWorld_x - flagpole.pos_x) < 25) {
            //TO PREVENT AUDIO FROM OCCURING EVERY FRAME
            if (!sfxTalk.isPlaying()) {
                //...THEN PLAY TALK SFX
                sfxTalk.play();
            }
        }
    }
}

//--WIN CONDITION HERE
function drawFlagpoleAndWhenActivated() {
    //IF FLAGPOLE NOT CONSIDERED REACHED...
    if (!flagpole.isReached) {
        //...THEN DRAW FLAG AT TOP
        drawFlagpole();
        drawFlag();
    } else {
        //ELSE IF FLAGPOLE CONSIDERED REACHED...
        //...THEN STARTING FROM THE TOP...
        drawFlagpole();
        drawFlag();

        //(THIS PREVENTS FLAG FROM GOING ANY LOWER)
        if (flag.height < floorPos_y - flagpole.bottomHeight - flag.length * (2 / 3)) {
            //...MOVE FLAG TO THE BOTTOM
            flag.height += 3;
        }

        //...DISABLE CONTROLS AND WIN GAME
        isLeft = false;
        isRight = false;
        jump = false;
    }

    //ACTIVATE STATUS MOMENTARILY
    if (flag.height > flagpole.height && flag.height < flagpole.height + 5) {
        gameIsWon = true;
    }
}

function drawLivesAndScore() {
    //TO REMOVE BUG WHEN LIVES BECOME NEGATIVE
    if (lives >= 0) {
        fill(255);
        textSize(20);
        text("Lives Remaining: " + lives, width / 2, height - 60);
        text("Score: " + gameScore + " / " + winScore, width / 2, height - 30);
    }
}

//TO CHANGE BETWEEN RED AND GREEN
function drawAudioSettings() {
    //OPTIONS - MUSIC
    var musicText = {
        pos_x: width * (3.5 / 100),
        pos_y: height * (4.5 / 100),

        boxWidth: width * (5 / 100),
        boxHeight: height * (3.5 / 100),
    };

    //IF MUSIC IS PLAYING...
    if (sfxGameBG.isPlaying()) {
        //...THEN SHOW GREEN BOX AND TEXT
        fill(80, 255, 80);
        rect(musicText.pos_x - musicText.boxWidth / 2, musicText.pos_y - bodySize * 0.8, musicText.boxWidth, musicText.boxHeight);

        fill(0);
        textStyle(BOLD);
        textSize(bodySize * 0.8);
        text("Music", musicText.pos_x, musicText.pos_y);
    }

    if (!sfxGameBG.isPlaying()) {
        //ELSE IF MUSIC IS STOPPED...
        //...THEN SHOW RED BOX AND TEXT
        fill(255, 80, 80);
        rect(musicText.pos_x - musicText.boxWidth / 2, musicText.pos_y - bodySize * 0.8, musicText.boxWidth, musicText.boxHeight);

        fill(0);
        textStyle(BOLD);
        textSize(bodySize * 0.8);
        text("Music", musicText.pos_x, musicText.pos_y);
    }

    //OPTIONS - SFX
    var sfxText = { adjustment: width * (6 / 100) };

    //IF SFX IS AUDBLE...
    if (sfxCanyon.setVolume().value > 0) {
        //...THEN SHOW GREEN BOX AND TEXT
        fill(80, 255, 80);
        rect(musicText.pos_x - musicText.boxWidth / 2 + sfxText.adjustment, musicText.pos_y - bodySize * 0.8, musicText.boxWidth, musicText.boxHeight);

        fill(0);
        textStyle(BOLD);
        textSize(bodySize * 0.8);
        text("SFX", musicText.pos_x + sfxText.adjustment, musicText.pos_y);
    } else {
        //ELSE IF SFX IS INAUDIBLE...
        //...THEN SHOW RED BOX AND TEXT
        fill(255, 80, 80);
        rect(musicText.pos_x - musicText.boxWidth / 2 + sfxText.adjustment, musicText.pos_y - bodySize * 0.8, musicText.boxWidth, musicText.boxHeight);

        fill(0);
        textStyle(BOLD);
        textSize(bodySize * 0.8);
        text("SFX", musicText.pos_x + sfxText.adjustment, musicText.pos_y);
    }

    /*--------------------------------------*/
    /*----------MOUSE HOVER EFFECT----------*/
    /*--------------------------------------*/
    //FOR MUSIC BOX
    var condMusic1 = mouseX > width * (1 / 100); //    LEFT LIMIT
    var condMusic2 = mouseX < width * (6 / 100); //    RIGHT LIMIT
    var condMusic3 = mouseY > height * (1.5 / 100); // TOP LIMIT
    var condMusic4 = mouseY < height * (5 / 100); //   BOTTOM LIMIT

    //IF INSIDE MUSIC BOX...
    if (condMusic1 && condMusic2 && condMusic3 && condMusic4) {
        //...THEN BOX BECOMES DARKER
        fill(40, 120);
        rect(musicText.pos_x - musicText.boxWidth / 2, musicText.pos_y - bodySize * 0.8, musicText.boxWidth, musicText.boxHeight);

        //...AND TEXT IS WHITE
        fill(255);
        textStyle(BOLD);
        textSize(bodySize * 0.8);
        text("Music", musicText.pos_x, musicText.pos_y);
    }

    //FOR SFX BOX
    var condSFX1 = mouseX > width * (7 / 100); //    LEFT LIMIT
    var condSFX2 = mouseX < width * (12 / 100); //    RIGHT LIMIT
    var condSFX3 = mouseY > height * (1.5 / 100); // TOP LIMIT
    var condSFX4 = mouseY < height * (5 / 100); //   BOTTOM LIMIT

    //IF INSIDE SFX BOX...
    if (condSFX1 && condSFX2 && condSFX3 && condSFX4) {
        //...THEN BOX BECOMES DARKER
        fill(40, 120);
        rect(musicText.pos_x - musicText.boxWidth / 2 + sfxText.adjustment, musicText.pos_y - bodySize * 0.8, musicText.boxWidth, musicText.boxHeight);

        //...AND TEXT IS WHITE
        fill(255);
        textStyle(BOLD);
        textSize(bodySize * 0.8);
        text("SFX", musicText.pos_x + sfxText.adjustment, musicText.pos_y);
    }

    textStyle(NORMAL);
}

/*-----------------------------------*/
/*----------GAME CHAR STUFF----------*/
/*-----------------------------------*/
function drawGameChar() {
    //GAME CHAR STATE: IN GENERAL
    if (isLeft && isFalling) {
        //LEG LEFT
        fill(63, 61, 32);
        ellipse(gameChar_x - 5, gameChar_y - 18, 8, 16); //CALF
        fill(189, 176, 133);
        ellipse(gameChar_x - 8, gameChar_y - 22, 6, 8); //KNEE
        arc(gameChar_x - 4, gameChar_y - 8, 14, 12, PI, TWO_PI - QUARTER_PI); //FEET
        //HIP
        fill(58, 47, 35);
        ellipse(gameChar_x, gameChar_y - 26, 15);
        //LEG RIGHT
        fill(83, 81, 52);
        ellipse(gameChar_x + 4, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x + 5, gameChar_y - 10, 8, 16); //CALF
        fill(209, 196, 153);
        ellipse(gameChar_x + 2, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x + 6, gameChar_y, 14, 12, PI, TWO_PI - QUARTER_PI); //FEET
        //TORSO
        fill(144, 131, 103);
        ellipse(gameChar_x, gameChar_y - 40, 25, 35);
        //BACKPACK
        fill(80);
        ellipse(gameChar_x + 14, gameChar_y - 45, 8, 18);
        ellipse(gameChar_x + 14, gameChar_y - 55, 2, 10);
        fill(180, 40, 40);
        ellipse(gameChar_x + 14, gameChar_y - 58, 10, 2);
        //ARM RIGHT
        fill(83, 81, 52);
        ellipse(gameChar_x + 7, gameChar_y - 45, 8); //SHOULDER
        beginShape();
        vertex(gameChar_x + 3, gameChar_y - 45);
        vertex(gameChar_x + 11, gameChar_y - 45);
        vertex(gameChar_x + 6, gameChar_y - 60);
        vertex(gameChar_x - 2, gameChar_y - 60);
        endShape(CLOSE);
        fill(199, 186, 143);
        ellipse(gameChar_x + 1.5, gameChar_y - 62, 10); //HAND (NORMAL)
        //FACE
        fill(199, 186, 143);
        ellipse(gameChar_x - 6, gameChar_y - 45, 16, 20);
        //EYES
        fill(255);
        ellipse(gameChar_x - 10, gameChar_y - 50, 4, 4); //TOP R
        ellipse(gameChar_x - 11, gameChar_y - 45, 4, 5); //MIDDLE R
        ellipse(gameChar_x - 10, gameChar_y - 40, 4, 4); //BOTTOM R
        ellipse(gameChar_x - 5, gameChar_y - 45, 5); //SIDE R
        //ANCHOR POINT
        //fill(255);
        //ellipse(gameChar_x, gameChar_y, 2.5);
        //textAlign(CENTER);
        //text("gameChar", gameChar_x, gameChar_y + 12);
    } else if (isRight && isFalling) {
        //LEG RIGHT
        fill(63, 61, 32);
        ellipse(gameChar_x + 5, gameChar_y - 18, 8, 16); //CALF
        fill(189, 176, 133);
        ellipse(gameChar_x + 8, gameChar_y - 22, 6, 8); //KNEE
        arc(gameChar_x + 4, gameChar_y - 8, 14, 12, PI + QUARTER_PI, TWO_PI); //FEET
        //HIP
        fill(58, 47, 35);
        ellipse(gameChar_x, gameChar_y - 26, 15);
        //LEG LEFT
        fill(83, 81, 52);
        ellipse(gameChar_x - 4, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x - 5, gameChar_y - 10, 8, 16); //CALF
        fill(209, 196, 153);
        ellipse(gameChar_x - 2, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x - 6, gameChar_y, 14, 12, PI + QUARTER_PI, TWO_PI); //FEET
        //ARM RIGHT
        fill(83, 81, 52);
        ellipse(gameChar_x - 7, gameChar_y - 45, 8); //SHOULDER
        beginShape();
        vertex(gameChar_x - 3, gameChar_y - 45);
        vertex(gameChar_x - 11, gameChar_y - 45);
        vertex(gameChar_x - 6, gameChar_y - 60);
        vertex(gameChar_x + 2, gameChar_y - 60);
        endShape(CLOSE);
        fill(199, 186, 143);
        ellipse(gameChar_x - 1.5, gameChar_y - 62, 10); //HAND (NORMAL)
        //TORSO
        fill(144, 131, 103);
        ellipse(gameChar_x, gameChar_y - 40, 25, 35);
        //BACKPACK
        fill(80);
        ellipse(gameChar_x - 14, gameChar_y - 45, 8, 18);
        ellipse(gameChar_x - 14, gameChar_y - 55, 2, 10);
        fill(180, 40, 40);
        ellipse(gameChar_x - 14, gameChar_y - 58, 10, 2);
        //ARM LEFT
        fill(83, 81, 52);
        ellipse(gameChar_x - 7, gameChar_y - 44, 8); //SHOULDER
        beginShape(); //ARM
        vertex(gameChar_x - 3, gameChar_y - 44);
        vertex(gameChar_x - 11, gameChar_y - 44);
        vertex(gameChar_x - 13, gameChar_y - 30);
        vertex(gameChar_x - 5, gameChar_y - 30);
        endShape(CLOSE);
        fill(150);
        triangle(
            gameChar_x - 14.5,
            gameChar_y - 30, //HAND (DRILL)
            gameChar_x - 3.5,
            gameChar_y - 30,
            gameChar_x - 9,
            gameChar_y - 10
        );
        stroke(40);
        strokeWeight(1);
        line(gameChar_x - 15, gameChar_y - 28, gameChar_x - 4.5, gameChar_y - 26);
        line(gameChar_x - 14, gameChar_y - 24, gameChar_x - 5.5, gameChar_y - 22);
        line(gameChar_x - 13, gameChar_y - 20, gameChar_x - 6.5, gameChar_y - 18);
        line(gameChar_x - 12, gameChar_y - 16, gameChar_x - 7.5, gameChar_y - 14);
        strokeWeight(0);
        //FACE
        fill(199, 186, 143);
        ellipse(gameChar_x + 6, gameChar_y - 45, 16, 20);
        //EYES
        fill(255);
        ellipse(gameChar_x + 10, gameChar_y - 50, 4, 4); //TOP L
        ellipse(gameChar_x + 11, gameChar_y - 45, 4, 5); //MIDDLE L
        ellipse(gameChar_x + 10, gameChar_y - 40, 4, 4); //BOTTOM L
        ellipse(gameChar_x + 5, gameChar_y - 45, 5); //SIDE L
        //ANCHOR POINT
        //fill(255);
        //ellipse(gameChar_x, gameChar_y, 2.5);
        //textAlign(CENTER);
        //text("gameChar", gameChar_x, gameChar_y + 12);
    } else if (isLeft) {
        //LEG LEFT
        fill(63, 61, 32);
        ellipse(gameChar_x - 6, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x - 5, gameChar_y - 10, 8, 16); //CALF
        fill(189, 176, 133);
        ellipse(gameChar_x - 8, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x - 4, gameChar_y, 14, 12, PI, TWO_PI - QUARTER_PI); //FEET
        //HIP
        fill(58, 47, 35);
        ellipse(gameChar_x, gameChar_y - 26, 15);
        //LEG RIGHT
        fill(83, 81, 52);
        ellipse(gameChar_x + 4, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x + 5, gameChar_y - 10, 8, 16); //CALF
        fill(209, 196, 153);
        ellipse(gameChar_x + 2, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x + 6, gameChar_y, 14, 12, PI, TWO_PI - QUARTER_PI); //FEET
        //TORSO
        fill(144, 131, 103);
        ellipse(gameChar_x, gameChar_y - 40, 25, 35);
        //BACKPACK
        fill(80);
        ellipse(gameChar_x + 14, gameChar_y - 45, 8, 18);
        ellipse(gameChar_x + 14, gameChar_y - 55, 2, 10);
        fill(180, 40, 40);
        ellipse(gameChar_x + 14, gameChar_y - 58, 10, 2);
        //ARM RIGHT
        fill(83, 81, 52);
        ellipse(gameChar_x + 7, gameChar_y - 44, 8); //SHOULDER
        beginShape(); //ARM
        vertex(gameChar_x + 3, gameChar_y - 44);
        vertex(gameChar_x + 11, gameChar_y - 44);
        vertex(gameChar_x + 13, gameChar_y - 30);
        vertex(gameChar_x + 5, gameChar_y - 30);
        endShape(CLOSE);
        fill(199, 186, 143);
        ellipse(gameChar_x + 9.5, gameChar_y - 27, 10); //HAND (NORMAL)
        //FACE
        fill(199, 186, 143);
        ellipse(gameChar_x - 6, gameChar_y - 45, 16, 20);
        //EYES
        fill(255);
        ellipse(gameChar_x - 10, gameChar_y - 50, 4, 4); //TOP R
        ellipse(gameChar_x - 11, gameChar_y - 45, 4, 5); //MIDDLE R
        ellipse(gameChar_x - 10, gameChar_y - 40, 4, 4); //BOTTOM R
        ellipse(gameChar_x - 5, gameChar_y - 45, 5); //SIDE R
        //ANCHOR POINT
        //fill(255);
        //ellipse(gameChar_x, gameChar_y, 2.5);
        //textAlign(CENTER);
        //text("gameChar", gameChar_x, gameChar_y + 12);
    } else if (isRight) {
        //LEG RIGHT
        fill(63, 61, 32);
        ellipse(gameChar_x + 6, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x + 5, gameChar_y - 10, 8, 16); //CALF
        fill(189, 176, 133);
        ellipse(gameChar_x + 8, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x + 4, gameChar_y, 14, 12, PI + QUARTER_PI, TWO_PI); //FEET
        //HIP
        fill(58, 47, 35);
        ellipse(gameChar_x, gameChar_y - 26, 15);
        //LEG LEFT
        fill(83, 81, 52);
        ellipse(gameChar_x - 4, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x - 5, gameChar_y - 10, 8, 16); //CALF
        fill(209, 196, 153);
        ellipse(gameChar_x - 2, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x - 6, gameChar_y, 14, 12, PI + QUARTER_PI, TWO_PI); //FEET
        //TORSO
        fill(144, 131, 103);
        ellipse(gameChar_x, gameChar_y - 40, 25, 35);
        //BACKPACK
        fill(80);
        ellipse(gameChar_x - 14, gameChar_y - 45, 8, 18);
        ellipse(gameChar_x - 14, gameChar_y - 55, 2, 10);
        fill(180, 40, 40);
        ellipse(gameChar_x - 14, gameChar_y - 58, 10, 2);
        //ARM LEFT
        fill(83, 81, 52);
        ellipse(gameChar_x - 7, gameChar_y - 44, 8); //SHOULDER
        beginShape(); //ARM
        vertex(gameChar_x - 3, gameChar_y - 44);
        vertex(gameChar_x - 11, gameChar_y - 44);
        vertex(gameChar_x - 13, gameChar_y - 30);
        vertex(gameChar_x - 5, gameChar_y - 30);
        endShape(CLOSE);
        fill(150);
        triangle(
            gameChar_x - 14.5,
            gameChar_y - 30, //HAND (DRILL)
            gameChar_x - 3.5,
            gameChar_y - 30,
            gameChar_x - 9,
            gameChar_y - 10
        );
        stroke(40);
        strokeWeight(1);
        line(gameChar_x - 15, gameChar_y - 28, gameChar_x - 4.5, gameChar_y - 26);
        line(gameChar_x - 14, gameChar_y - 24, gameChar_x - 5.5, gameChar_y - 22);
        line(gameChar_x - 13, gameChar_y - 20, gameChar_x - 6.5, gameChar_y - 18);
        line(gameChar_x - 12, gameChar_y - 16, gameChar_x - 7.5, gameChar_y - 14);
        strokeWeight(0);
        //FACE
        fill(199, 186, 143);
        ellipse(gameChar_x + 6, gameChar_y - 45, 16, 20);
        //EYES
        fill(255);
        ellipse(gameChar_x + 10, gameChar_y - 50, 4, 4); //TOP L
        ellipse(gameChar_x + 11, gameChar_y - 45, 4, 5); //MIDDLE L
        ellipse(gameChar_x + 10, gameChar_y - 40, 4, 4); //BOTTOM L
        ellipse(gameChar_x + 5, gameChar_y - 45, 5); //SIDE L
        //ANCHOR POINT
        //fill(255);
        //ellipse(gameChar_x, gameChar_y, 2.5);
        //textAlign(CENTER);
        //text("gameChar", gameChar_x, gameChar_y + 12);
    } else if (isFalling || isPlummeting) {
        //BACKPACK
        fill(80);
        ellipse(gameChar_x + 8, gameChar_y - 50, 14, 12);
        ellipse(gameChar_x + 8, gameChar_y - 55, 2, 10);
        fill(180, 40, 40);
        ellipse(gameChar_x + 8, gameChar_y - 58, 10, 2);
        //LEG RIGHT
        fill(73, 71, 42);
        ellipse(gameChar_x + 6, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x + 7, gameChar_y - 10, 8, 16); //CALF
        fill(199, 186, 143);
        ellipse(gameChar_x + 7, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x + 7, gameChar_y, 10, 12, PI, TWO_PI); //FEET
        //ARM LEFT
        fill(73, 71, 42);
        ellipse(gameChar_x - 11, gameChar_y - 44, 8); //SHOULDER
        beginShape(); //ARM
        vertex(gameChar_x - 8, gameChar_y - 45);
        vertex(gameChar_x - 15, gameChar_y - 45);
        vertex(gameChar_x - 20, gameChar_y - 30);
        vertex(gameChar_x - 13, gameChar_y - 30);
        endShape(CLOSE);
        fill(150);
        triangle(
            gameChar_x - 22,
            gameChar_y - 30, //HAND (DRILL)
            gameChar_x - 11,
            gameChar_y - 30,
            gameChar_x - 16.5,
            gameChar_y - 10
        );
        stroke(40);
        strokeWeight(1);
        line(gameChar_x - 22, gameChar_y - 28, gameChar_x - 12.5, gameChar_y - 26);
        line(gameChar_x - 21, gameChar_y - 24, gameChar_x - 13.5, gameChar_y - 22);
        line(gameChar_x - 20, gameChar_y - 20, gameChar_x - 14.5, gameChar_y - 18);
        line(gameChar_x - 19, gameChar_y - 16, gameChar_x - 15.5, gameChar_y - 14);
        strokeWeight(0);
        //ARM RIGHT
        fill(73, 71, 42);
        ellipse(gameChar_x + 11, gameChar_y - 45, 8); //SHOULDER
        beginShape(); //ARM
        vertex(gameChar_x + 8, gameChar_y - 45);
        vertex(gameChar_x + 15, gameChar_y - 45);
        vertex(gameChar_x + 20, gameChar_y - 60);
        vertex(gameChar_x + 13, gameChar_y - 60);
        endShape(CLOSE);
        fill(199, 186, 143);
        ellipse(gameChar_x + 17, gameChar_y - 63, 10); //HAND (NORMAL)
        //HIP
        fill(58, 47, 35);
        ellipse(gameChar_x, gameChar_y - 26, 22, 15);
        //TORSO
        fill(144, 131, 103);
        ellipse(gameChar_x, gameChar_y - 40, 25, 35);
        //LEG LEFT
        fill(73, 71, 42);
        ellipse(gameChar_x - 7, gameChar_y - 18, 8, 16); //CALF
        fill(199, 186, 143);
        ellipse(gameChar_x - 7, gameChar_y - 22, 6, 8); //KNEE
        arc(gameChar_x - 7, gameChar_y - 8, 10, 12, PI, TWO_PI); //FEET
        //FACE
        fill(199, 186, 143);
        ellipse(gameChar_x, gameChar_y - 45, 20, 20);
        //EYES
        fill(255);
        ellipse(gameChar_x - 3, gameChar_y - 51, 5, 4); //TOP L
        ellipse(gameChar_x + 3, gameChar_y - 51, 5, 4); //TOP R
        ellipse(gameChar_x - 3, gameChar_y - 45, 5); //MIDDLE L
        ellipse(gameChar_x + 3, gameChar_y - 45, 5); //MIDDLE R
        ellipse(gameChar_x - 3, gameChar_y - 39, 5, 4); //BOTTOM L
        ellipse(gameChar_x + 3, gameChar_y - 39, 5, 4); //BOTTOM R
        ellipse(gameChar_x - 8, gameChar_y - 45, 3, 5); //SIDE L
        ellipse(gameChar_x + 8, gameChar_y - 45, 3, 5); //SIDE R
        //ANCHOR POINT
        //fill(255);
        //ellipse(gameChar_x, gameChar_y, 2.5);
        //textAlign(CENTER);
        //text("gameChar", gameChar_x, gameChar_y + 12);
    } else {
        //BACKPACK
        fill(80);
        ellipse(gameChar_x + 8, gameChar_y - 50, 14, 12);
        ellipse(gameChar_x + 8, gameChar_y - 55, 2, 10);
        fill(180, 40, 40);
        ellipse(gameChar_x + 8, gameChar_y - 58, 10, 2);
        //LEG LEFT
        fill(73, 71, 42);
        ellipse(gameChar_x - 6, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x - 7, gameChar_y - 10, 8, 16); //CALF
        fill(199, 186, 143);
        ellipse(gameChar_x - 7, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x - 7, gameChar_y, 10, 12, PI, TWO_PI); //FEET
        //LEG RIGHT
        fill(73, 71, 42);
        ellipse(gameChar_x + 6, gameChar_y - 20, 10, 16); //THIGH
        ellipse(gameChar_x + 7, gameChar_y - 10, 8, 16); //CALF
        fill(199, 186, 143);
        ellipse(gameChar_x + 7, gameChar_y - 14, 6, 8); //KNEE
        arc(gameChar_x + 7, gameChar_y, 10, 12, PI, TWO_PI); //FEET
        //ARM LEFT
        fill(73, 71, 42);
        ellipse(gameChar_x - 11, gameChar_y - 44, 8); //SHOULDER
        beginShape(); //ARM
        vertex(gameChar_x - 8, gameChar_y - 45);
        vertex(gameChar_x - 15, gameChar_y - 45);
        vertex(gameChar_x - 20, gameChar_y - 30);
        vertex(gameChar_x - 13, gameChar_y - 30);
        endShape(CLOSE);
        fill(150);
        triangle(
            gameChar_x - 22,
            gameChar_y - 30, //HAND (DRILL)
            gameChar_x - 11,
            gameChar_y - 30,
            gameChar_x - 16.5,
            gameChar_y - 10
        );
        stroke(40);
        strokeWeight(1);
        line(gameChar_x - 22, gameChar_y - 28, gameChar_x - 12.5, gameChar_y - 26);
        line(gameChar_x - 21, gameChar_y - 24, gameChar_x - 13.5, gameChar_y - 22);
        line(gameChar_x - 20, gameChar_y - 20, gameChar_x - 14.5, gameChar_y - 18);
        line(gameChar_x - 19, gameChar_y - 16, gameChar_x - 15.5, gameChar_y - 14);
        strokeWeight(0);
        //ARM RIGHT
        fill(73, 71, 42);
        ellipse(gameChar_x + 11, gameChar_y - 44, 8); //SHOULDER
        beginShape(); //ARM
        vertex(gameChar_x + 8, gameChar_y - 45);
        vertex(gameChar_x + 15, gameChar_y - 45);
        vertex(gameChar_x + 20, gameChar_y - 30);
        vertex(gameChar_x + 13, gameChar_y - 30);
        endShape(CLOSE);
        fill(199, 186, 143);
        ellipse(gameChar_x + 17, gameChar_y - 27, 10); //HAND (NORMAL)
        //HIP
        fill(58, 47, 35);
        ellipse(gameChar_x, gameChar_y - 26, 22, 15);
        //TORSO
        fill(144, 131, 103);
        ellipse(gameChar_x, gameChar_y - 40, 25, 35);
        //FACE
        fill(199, 186, 143);
        ellipse(gameChar_x, gameChar_y - 45, 20, 20);
        //EYES
        fill(255);
        ellipse(gameChar_x - 3, gameChar_y - 51, 5, 4); //TOP L
        ellipse(gameChar_x + 3, gameChar_y - 51, 5, 4); //TOP R
        ellipse(gameChar_x - 3, gameChar_y - 45, 5); //MIDDLE L
        ellipse(gameChar_x + 3, gameChar_y - 45, 5); //MIDDLE R
        ellipse(gameChar_x - 3, gameChar_y - 39, 5, 4); //BOTTOM L
        ellipse(gameChar_x + 3, gameChar_y - 39, 5, 4); //BOTTOM R
        ellipse(gameChar_x - 8, gameChar_y - 45, 3, 5); //SIDE L
        ellipse(gameChar_x + 8, gameChar_y - 45, 3, 5); //SIDE R
        //ANCHOR POINT
        //fill(255);
        //ellipse(gameChar_x, gameChar_y, 2.5);
        //textAlign(CENTER);
        //text("gameChar", gameChar_x, gameChar_y + 12);
    }

    //GAME CHAR STATE: WHEN JUMPING AKA. isFalling
    isInContact = false;

    //IF GAME CHAR IS ABOVE FLOOR...
    if (gameChar_y < floorPos_y) {
        for (var i = 0; i < platforms.length; i++) {
            //... AND IF GAME CHAR IS IN CONTACT WITH PLATFORM...
            if (platforms[i].checkContact(gameCharWorld_x, gameChar_y)) {
                //...THEN IT IS TRUE
                isInContact = true;
                //...AND isFalling IS NOT SHOWN
                isFalling = false;
                //...AND CODE STOPS HERE
                return;
            } else {
                //ELSE IF GAME CHAR IS NOT IN CONTACT OF PLATFORM...
                //...THEN isFalling IS SHOWN
                isFalling = true;
            }
        }
    } else {
        //ELSE IF GAME CHAR IS ON FLOOR...
        //...THEN isFalling IS NOT SHOWN
        isFalling = false;
    }
}

function moveGameChar() {
    //GAME CHAR MOVE - LEFT AND RIGHT
    if (isLeft == true) {
        gameCharWorld_x -= moveSpeed;
    }

    if (isRight == true) {
        gameCharWorld_x += moveSpeed;
    }

    /*--------------------*/
    /*--GRAVITY FUNCTION--*/
    /*--------------------*/
    //IF NOT JUMPING, SAVE THE VALUE OF (current gameChar_y - jumpHeight), SO THAT THE LIMIT IS APPLIED WHETHER JUMPING FROM FLOOR, OR PLATFORMS
    if (!jump) {
        newJumpHeight = gameChar_y - jumpHeight;
    }

    //IF JUMPING, AND IF GAME CHAR BELOW JUMP LIMIT... (SO THAT GAME CHAR DOES NOT JUMP FOREVER)
    if (jump && gameChar_y > newJumpHeight) {
        //...AND IF GAME CHAR ON FLOOR, OR ON PLATFORMS... (SO THAT GAME CHAR DOES NOT JUMP IN MID-AIR)
        if (gameChar_y >= floorPos_y || isInContact) {
            //...THEN ALLOWED TO JUMP
            fallSpeed = -jumpSpeed;

            //AUDIO
            sfxJump.playMode("restart");
            sfxJump.play();
        }
    } else {
        //ELSE IF NOT JUMPING, OR REACHED LIMIT...
        //...THEN FALL DOWN
        fallSpeed = gravity;

        //...AND STAY FALLING DOWN (PREVENTS HOLDING JUMP BUTTON TO CONSTANTLY JUMP, WHICH HELPS REMOVE A BUG TOO)
        jump = false;
    }

    //IF NOT JUMPING, AND ON FLOOR... OR IF NOT JUMPING, AND ON PLATFORM
    if ((!jump && gameChar_y >= floorPos_y) || (!jump && isInContact)) {
        //...THEN STAY STILL (TO PREVENT FALLING)
        gameChar_y = gameChar_y;
    } else {
        //ELSE IF JUMPING, OR ABOVE FLOOR, OR NOT ON PLATFORM...
        //...THEN FALL (THIS IS THE "GRAVITY" CODE)
        gameChar_y += gravity * fallSpeed;
    }
}

function limitGameChar() {
    fill(199, 186, 143);
    textSize(bodySize);
    textStyle(ITALIC);

    //LIMIT ON LEFT SIDE
    var limitL1 = -500;
    var limitL2 = -700;
    var limitL3 = -900;

    //--TEXTS
    if (gameCharWorld_x < limitL3) {
        text("alright, i need to go towards the right now", width / 2, gameChar_y - 80);
        isLeft = false;
        moveSpeed = 0; //NEED THIS TO REMOVE BUG
    } else if (gameCharWorld_x < limitL2) {
        text("yeah i don't see anything at all...", width / 2, gameChar_y - 80);
    } else if (gameCharWorld_x < limitL1) {
        text("looks like there's nothing towards the left...", width / 2, gameChar_y - 80);
    }

    //--AUDIO
    //TO PREVENT AUDIO FROM OCCURING EVERY FRAME
    if (!sfxTalk.isPlaying()) {
        if (gameCharWorld_x < limitL3 + 5 && gameCharWorld_x > limitL3) {
            sfxTalk.play();
        } else if (gameCharWorld_x < limitL2 + 5 && gameCharWorld_x > limitL2) {
            sfxTalk.play();
        } else if (gameCharWorld_x < limitL1 + 5 && gameCharWorld_x > limitL1) {
            sfxTalk.play();
        }
    }

    //LIMIT ON RIGHT SIDE
    var limitR1 = 350;
    var limitR2 = 600;
    var limitR3 = 800;

    //--TEXTS
    if (gameCharWorld_x > flagpole.pos_x + limitR3) {
        text("alright, i need to go towards the left now", width / 2, gameChar_y - 80);
        isRight = false;
        moveSpeed = 0; //NEED THIS TO REMOVE BUG
    } else if (gameCharWorld_x > flagpole.pos_x + limitR2) {
        text("yeah i don't see anything at all...", width / 2, gameChar_y - 80);
    } else if (gameCharWorld_x > flagpole.pos_x + limitR1) {
        text("looks like there's nothing towards the right...", width / 2, gameChar_y - 80);
    }

    //--AUDIO
    //TO PREVENT AUDIO FROM OCCURING EVERY FRAME
    if (!sfxTalk.isPlaying()) {
        if (gameCharWorld_x > flagpole.pos_x + (limitR3 - 5) && gameCharWorld_x < flagpole.pos_x + limitR3) {
            sfxTalk.play();
        } else if (gameCharWorld_x > flagpole.pos_x + (limitR2 - 5) && gameCharWorld_x < flagpole.pos_x + limitR2) {
            sfxTalk.play();
        } else if (gameCharWorld_x > flagpole.pos_x + (limitR1 - 5) && gameCharWorld_x < flagpole.pos_x + limitR1) {
            sfxTalk.play();
        }
    }

    textStyle(NORMAL);

    //AFTER SETTING isLeft/Right TO FALSE, ALLOW GAME CHAR TO MOVE AGAIN
    if (isLeft || isRight) {
        moveSpeed = initialMoveSpeed;
    }
}

/*-------------------------------------*/
/*----------USER INTERACTIONS----------*/
/*-------------------------------------*/
function keyPressed() {
    //MOVE LEFT: A / LEFT ARROW
    if (key == "A" || keyCode == 37) {
        isLeft = true;
    }

    //MOVE RIGHT: D / RIGHT ARROW
    if (key == "D" || keyCode == 39) {
        isRight = true;
    }

    //JUMP: W / SPACEBAR / UP ARROW
    if (key == "W" || keyCode == 32 || keyCode == 38) {
        jump = true;
    }

    //RESTART GAME: SPACEBAR
    if (restartGame == true && keyCode == 32) {
        startGame();
    }

    //INTRO CONTROLS SCREEN DONE: ENTER
    //NEED "&& controlsText" TO STOP ENTER KEY'S FUNCTION ONCE GAME STARTS
    if (keyCode == 13 && controlsText) {
        //REMOVES controlsText
        controlsText = false;

        //FORCE GAME CHAR TO START AT INITIAL POSITION, ELSE MAY IMMEDIATELY PLUMMET
        startGame();

        //PREVENT AUDIO FROM OCCURING EVERY FRAME
        if (!sfxGameBG.isPlaying()) {
            sfxGameBG.play();
            sfxGameBG.loop();
        }
    }

    //console.log("keyPressed: " + keyCode + " or " + key);
}

function keyReleased() {
    //MOVE LEFT: A / LEFT ARROW
    if (key == "A" || keyCode == 37) {
        isLeft = false;
    }

    //MOVE RIGHT: D / RIGHT ARROW
    if (key == "D" || keyCode == 39) {
        isRight = false;
    }

    //JUMP: W / SPACEBAR / UP ARROW
    if (key == "W" || keyCode == 32 || keyCode == 38) {
        jump = false;
    }

    //console.log("keyReleased: " + keyCode + " or " + key);
}

//MAINLY FOR TOP-LEFT CORNER AUDIO SETTINGS TO CHANGE BETWEEN PLAY AND STOP
function mousePressed() {
    //FOR MUSIC BOX
    var condMusic1 = mouseX > width * (1 / 100); //    LEFT LIMIT
    var condMusic2 = mouseX < width * (6 / 100); //    RIGHT LIMIT
    var condMusic3 = mouseY > height * (1.5 / 100); // TOP LIMIT
    var condMusic4 = mouseY < height * (5 / 100); //   BOTTOM LIMIT

    //IF INSIDE MUSIC BOX...
    if (condMusic1 && condMusic2 && condMusic3 && condMusic4) {
        //...AND IF MUSIC IS PLAYING...
        if (sfxGameBG.isPlaying()) {
            //...THEN STOP MUSIC
            sfxGameBG.stop();
        } else {
            //ELSE IF MUSIC IS STOPPED...
            //...THEN PLAY MUSIC
            sfxGameBG.play();
            sfxGameBG.loop();
        }
    }

    //FOR SFX BOX
    var condSFX1 = mouseX > width * (7 / 100); //    LEFT LIMIT
    var condSFX2 = mouseX < width * (12 / 100); //    RIGHT LIMIT
    var condSFX3 = mouseY > height * (1.5 / 100); // TOP LIMIT
    var condSFX4 = mouseY < height * (5 / 100); //   BOTTOM LIMIT

    //IF INSIDE SFX BOX...
    if (condSFX1 && condSFX2 && condSFX3 && condSFX4) {
        //...AND IF VOLUME IS ZERO...
        if (sfxCanyon.setVolume().value == 0) {
            //...THEN SET TO AUDIBLE
            sfxCanyon.setVolume(0.3);
            sfxCollectable.setVolume(0.3);
            sfxJump.setVolume(0.3);
            sfxRespawn.setVolume(0.3);
            sfxTalk.setVolume(0.3);
            sfxEnemyHit.setVolume(0.3);
            sfxGameLose.setVolume(0.3);
            sfxGameWin.setVolume(0.3);
        } else {
            //ELSE IF VOLUME IS AUDIBLE...
            //...THEN SET IT TO ZERO
            sfxCanyon.setVolume(0);
            sfxCollectable.setVolume(0);
            sfxJump.setVolume(0);
            sfxRespawn.setVolume(0);
            sfxTalk.setVolume(0);
            sfxEnemyHit.setVolume(0);
            sfxGameLose.setVolume(0);
            sfxGameWin.setVolume(0);
        }
    }
}
