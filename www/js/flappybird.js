//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    // Set board size to fill window with 30px margin on all sides
    function resizeBoard() {
        boardWidth = window.innerWidth - 60;
        boardHeight = window.innerHeight - 60;
        board.width = boardWidth;
        board.height = boardHeight;
    }
    resizeBoard();
    window.addEventListener('resize', resizeBoard);
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // every 1.5 seconds

    
    document.addEventListener("keydown", handleInput);
    board.addEventListener("pointerdown", handleInput); // covers mouse & stylus & touch (where supported)
    // fallback for older browsers / ensure touch works
    board.addEventListener("touchstart", handleInput, { passive: false });
}
function handleInput(e) {
        // keyboard
        if (e.type === 'keydown') {
            if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
                velocityY = -6;
                if (gameOver) {
                    bird.y = birdY;
                    pipeArray = [];
                    score = 0;
                    gameOver = false;
                }
            }
            return;
        }

        // pointer / mouse / touch
        if (e.type === 'touchstart') e.preventDefault(); // stop mobile scrolling
        velocityY = -6;
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }
    //score (right side, 20px, gray border)
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.textBaseline = "top";

    let scoreText = String(score);
    let padding = 8;
    let textWidth = context.measureText(scoreText).width;
    let boxWidth = textWidth + padding * 2;
    let boxHeight = 20 + padding * 2; // 20px font height + vertical padding

    let boxX = board.width - boxWidth - 5; // 5px margin from right edge
    let boxY = 5; // 5px from top

    context.strokeStyle = "gray";
    context.lineWidth = 2;
    context.strokeRect(boxX, boxY, boxWidth, boxHeight);

    context.fillText(scoreText, boxX + padding, boxY + padding);

    if (gameOver) {
         // dim the game behind the modal
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(0, 0, board.width, board.height);

            // modal dimensions and position (centered)
            const modalWidth = Math.min(280, board.width - 40);
            const modalHeight = 160; // increased to fit button
            const modalX = (board.width - modalWidth) / 2;
            const modalY = (board.height - modalHeight) / 2;

            // modal background (white) with 50% transparency and border
            context.fillStyle = "rgba(255, 255, 255, 0.7)"; // 50% transparent white
            context.strokeStyle = "gray";
            context.lineWidth = 2;
            context.fillRect(modalX, modalY, modalWidth, modalHeight);
            context.strokeRect(modalX, modalY, modalWidth, modalHeight);

            // text styling
            context.fillStyle = "black";
            context.textAlign = "center";

            // title
            context.font = "24px sans-serif";
            context.textBaseline = "middle";
            context.fillText("GAME OVER", modalX + modalWidth / 2, modalY + modalHeight * 0.22);

            // score under title
            context.font = "20px sans-serif";
            const displayScore = Math.round(score); // show integer score
            context.fillText("Score: " + displayScore, modalX + modalWidth / 2, modalY + modalHeight * 0.48);

            // retry button
            const buttonWidth = Math.min(160, modalWidth - 40);
            const buttonHeight = 38;
            const buttonX = modalX + (modalWidth - buttonWidth) / 2;
            const buttonY = modalY + modalHeight - buttonHeight - 12;

            // draw button (rounded-ish rectangle)
            context.fillStyle = "#f0f0f0";
            context.strokeStyle = "gray";
            context.lineWidth = 2;
            context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

            // button text
            context.fillStyle = "black";
            context.font = "18px sans-serif";
            context.textBaseline = "middle";
            context.fillText("Retry", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

            // add click handler once to detect Retry clicks
            if (!board.gameOverListenerAdded) {
                const handler = function (e) {
                const rect = board.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                if (clickX >= buttonX && clickX <= buttonX + buttonWidth &&
                    clickY >= buttonY && clickY <= buttonY + buttonHeight) {
                    // restart game
                    bird.y = birdY;
                    pipeArray = [];
                    score = 0;
                    gameOver = false;

                    // cleanup listener
                    board.removeEventListener("mousedown", handler);
                    board.gameOverListenerAdded = false;
                }
                };
                board.addEventListener("mousedown", handler);
                board.gameOverListenerAdded = true;
            }}
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
