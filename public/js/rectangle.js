var socket = io();
socket.emit("generateId");
socket.on("players", function(players) {
    Game.enemy.update(players);
});
socket.on("die", function(id) {
    if(Game.player.id === id){
        alert('die');
    }
});

socket.on("join", function(player) {
    Game.player.id = player.id;
    Game.player.x = player.x;
    Game.player.y = player.y;
    Game.player.r = player.r;
});

var Key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    }
};
        
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

var Game = {
    fps: 60,
    width: 600,
    height: 400,
    difPos: 5,
    difRad: 0.01
};

Game._onEachFrame = (function() {
    var requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

    if (requestAnimationFrame) {
        return function(cb) {
        var _cb = function() { cb(); requestAnimationFrame(_cb); }
        _cb();
        };
    } else {
        return function(cb) {
        setInterval(cb, 1000 / Game.fps);
        }
    }
})();

Game.start = function() {
    Game.canvas = document.createElement("canvas");
    Game.canvas.width = Game.width;
    Game.canvas.height = Game.height;
    Game.canvas.style.border = '1px solid #000';
    
    Game.context = Game.canvas.getContext("2d");

    document.body.appendChild(Game.canvas);

    Game.enemy = new Enemy();
    Game.player = new Player();

    Game._onEachFrame(Game.run);
};

Game.run = (function() {

    var loops = 0; 
    var skipTicks = 1000 / Game.fps;
    var maxFrameSkip = 10;
    var nextGameTick = (new Date).getTime();
    var lastGameTick;

    return function() {
        loops = 0;

        while ((new Date).getTime() > nextGameTick) {
            Game.update();
            nextGameTick += skipTicks;
            loops++;
        }

        if (loops) Game.draw();
    }
})();

Game.draw = function() {
    Game.context.clearRect(0, 0, Game.width, Game.height);
    // checkCollision();
    // console.log(Game.player);
    // Game.player.draw(Game.context);
    Game.enemy.draw(Game.context);
};

Game.update = function() {
    // socket.emit('move', {
    //     id: Game.player.id,
    //     x: Game.player.x,
    //     y: Game.player.y
    // })
    Game.player.update();
};

function Player() {
    this.id = 10;
    this.x = 10;
    this.y = 10;
    this.r = 10;
}

Player.prototype.moveLeft = function() {
    socket.emit('move', {
        id: this.id,
        dir: 'left'
    });
};

Player.prototype.moveRight = function() {
    socket.emit('move', {
        id: this.id,
        dir: 'right'
    });
};

Player.prototype.moveUp = function() {
    socket.emit('move', {
        id: this.id,
        dir: 'up'
    });
};

Player.prototype.moveDown = function() {
    socket.emit('move', {
        id: this.id,
        dir: 'down'
    });
};

Player.prototype.update = function() {
    if (Key.isDown(Key.UP)) this.moveUp();
    if (Key.isDown(Key.LEFT)) this.moveLeft();
    if (Key.isDown(Key.DOWN)) this.moveDown();
    if (Key.isDown(Key.RIGHT)) this.moveRight();
};

function Enemy() {
    this.players = [];
}
Enemy.prototype.update = function(players) {
    this.players = players;
}


Enemy.prototype.draw = function(context) {
    Game.enemy.players.forEach(enemy => {
        context.beginPath();
        context.arc(enemy.x, enemy.y, enemy.r, 0, 2 * Math.PI, false);
        context.fillStyle = 'black';
        context.fill();
    });
};

function checkCollision(){
    Game.enemy.players = Game.enemy.players.filter(enemy => 
        Math.pow(enemy.x - Game.player.x, 2)
            + Math.pow(enemy.y - Game.player.y, 2)
            >= Math.pow(enemy.r + Game.player.r, 2)
    );
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}