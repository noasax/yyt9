var socket = io();
socket.emit("generateId");
socket.on("players", function(players) {
    if(Jungle.enemy)
        Jungle.enemy.update(players);
});
socket.on("die", function(id) {
    if(Jungle.player.id === id){
        alert('YOU ARE WEAK');
    }
});

socket.on("join", function(jungle) {
    Jungle.height = jungle.height;
    Jungle.width = jungle.width;
    Jungle.start();
    Jungle.player.id = jungle.id;
    Jungle.player.x = jungle.x;
    Jungle.player.y = jungle.y;
    Jungle.player.r = jungle.r;
});

var Key = {
    pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    isDown: function(keyCode) {
        return this.pressed[keyCode];
    },

    onKeydown: function(event) {
        this.pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this.pressed[event.keyCode];
    }
};
        
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

var Jungle = {
    fps: 60
};

Jungle.frame = (function() {
    var requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

    if (requestAnimationFrame) {
        return function(cb) {
            var _cb = function() { 
                cb(); requestAnimationFrame(_cb); 
            }
            _cb();
        };
    } else {
        return function(cb) {
            setInterval(cb, 1000 / Jungle.fps);
        }
    }
})();

Jungle.start = function() {
    Jungle.canvas = document.createElement("canvas");
    Jungle.canvas.width = Jungle.width;
    Jungle.canvas.height = Jungle.height;
    Jungle.canvas.style.border = '1px solid #000';
    
    Jungle.context = Jungle.canvas.getContext("2d");

    document.body.appendChild(Jungle.canvas);

    Jungle.enemy = new Enemy();
    Jungle.player = new Player();

    Jungle.frame(Jungle.run);
};

Jungle.run = (function() {

    var loops = 0; 
    var skipTicks = 1000 / Jungle.fps;
    var nextGameTick = (new Date).getTime();

    return function() {
        loops = 0;

        while ((new Date).getTime() > nextGameTick) {
            Jungle.update();
            nextGameTick += skipTicks;
            loops++;
        }

        if (loops) Jungle.draw();
    }
})();

Jungle.draw = function() {
    Jungle.context.clearRect(0, 0, Jungle.width, Jungle.height);
    Jungle.enemy.draw(Jungle.context);
};

Jungle.update = function() {
    Jungle.player.update();
};

function Player() {
    this.id = 0;
    this.x = 0;
    this.y = 0;
    this.r = 0;
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
    Jungle.enemy.players.forEach(enemy => {
        context.beginPath();
        context.arc(enemy.x, enemy.y, enemy.r, 0, 2 * Math.PI, false);
        context.fillStyle = 'black';
        context.fill();
    });
};