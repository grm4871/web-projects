// --BOILERPLATE--
var canvas = document.querySelector('canvas');
cw = window.innerWidth;
canvas.width = cw;
ch = window.innerHeight;
canvas.height = ch;
var globalXRes = 40;
var globalYRes = 25;
var c = canvas.getContext('2d');


// --GAME LOGIC STATE--
var direction = 1; // int 1-2-3-4 mod 4

// the snake is a linked list of blocks, when it moves we add a block to the 
// beginning and take one from the end. when it grows we add 5 overlapping
// blocks to the end.
class Snake {
    constructor(next, x, y) {
        this.next = next;
        this.x = x;
        this.y = y;
    }
}

// --GAME LOGIC FUNCTIONS--

// snake behavior
function moveSnake(direction, snake) {
    // get direction
    var x = 0;
    var y = 0;
    switch(direction) {
        case 1: x = 1;
            break;
        case 2: y = 1;
            break;
        case 3: x = -1;
            break;
        case 4: y = -1;
    }
    // wrap around screen
    if(snake.x + x >= globalXRes) {
        x = -globalXRes + 1;
    } else if(snake.x + x < 0) {
        x = globalXRes - 1;
    } else if(snake.y + y >= globalYRes) {
        y = -globalYRes + 1;
    } else if(snake.y + y < 0) {
        y = globalYRes - 1;
    }
    // add head
    snake = new Snake(snake, snake.x + x, snake.y + y);
    // remove tail
    var snaketail = snake;
    if(snake.next != null) {
        while(snaketail.next.next != null) {
            snaketail = snaketail.next;
        }
        snaketail.next = null;
    }
    // return new snake head
    return snake;
}

function growSnake(snake) {
    // find the tail
    var snaketail = snake;
    while(snaketail.next != null) {
        snaketail = snaketail.next;
    }
    // add 5 to the end
    for(var i = 0; i < 5; i++) {
        var next = new Snake(null, snaketail.x, snaketail.y);
        snaketail.next = next;
        snaketail = next;
    }
}

function isInSnake(x, y, snake) {
    var snaketail = snake;
    while(snaketail != null) {
        if(snaketail.x == x && snaketail.y == y) {
            return true;
        }
        snaketail =  snaketail.next;
    }
    return false;
}

// add key listeners for direction changing
document.addEventListener('keydown', changeDirection);

function changeDirection(e) {
    if(e.code == "ArrowRight") {
        direction += 1;
    } else if(e.code == "ArrowLeft") {
        direction -= 1;
    } 
    // reset the game by pressing space, if you're dead
    else if(isDead && e.code == "Space") {
        initialize();
    }
    direction = direction % 4;
    if(direction == 0) direction = 4; 
}

// --JRAFIKS--
c.fillStyle = "#FFFFFF";

function drawSquare(x, y) { // x, y => 'game coordinates'
    var width = (cw / globalXRes); // width of 1 square
    var height = (ch / globalYRes); // height of 1 square
    var xcor = x * width; // convert to 'real coordinates'
    var ycor = y * height; 
    c.fillRect(xcor, ycor, width, height); // draw
}

function drawSnake(snake) {
    var snaketail = snake;
    while(snaketail != null) {
        drawSquare(snaketail.x, snaketail.y);
        snaketail =  snaketail.next;
    }
}

// --ANIMATION CODE--
t = Date.now();

var snake;
var isDead;
var food;
var score;

function initialize() {
    snake = new Snake(null, 5, 5);
    isDead = false;
    food = [Math.floor(Math.random()*globalXRes),Math.floor(Math.random()*globalYRes)];
    c.fillStyle = "#FFFFFF";
    score = 0;
}

initialize();

function animate() {
    requestAnimationFrame(animate);
    dt = Date.now() - t;

    if(isDead) {
        c.clearRect(0, 0, cw, ch);
        c.fillStyle = "#FF0000";
        drawSnake(snake);
    }

    else if(dt > 100) { // 1 game tick
        c.clearRect(0, 0, cw, ch);
        
        drawSnake(snake); // draw snake
        
        // update snake
        snake = moveSnake(direction, snake);
        
        // collision detection - food
        if(snake.x == food[0] && snake.y == food[1]) {
            growSnake(snake);
            // new food
            while(true) {
                food = [Math.floor(Math.random()*globalXRes),Math.floor(Math.random()*globalYRes)];
                if(!isInSnake(food[0], food[1], snake)) {
                    break;
                }
            }
            score += 1000;
        }

        // collision detection - snake
        else if(isInSnake(snake.x, snake.y, snake.next)) {
            isDead = true;
        }

        // draw food
        c.fillStyle = "#00FF00";
        drawSquare(food[0], food[1]);
        c.fillStyle = "#FFFFFF";
        t = Date.now(); // reset frame clock
    }
}

animate();
