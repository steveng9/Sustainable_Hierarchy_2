// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

var isRunning = true;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                if (isRunning) {
                    window.setTimeout(callback, 1000 / 60);
                }
            };
})();


class Timer {
    constructor() {
        this.gameTime = 0;
        this.maxStep = 0.05;
        this.wallLastTimestamp = 0;
        this.ticks = [];
    }
    tick() {
        var wallCurrent = performance.now();
        var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
        this.wallLastTimestamp = wallCurrent;

        var gameDelta = Math.min(wallDelta, this.maxStep);
        this.gameTime += gameDelta;

        this.ticks.push(wallDelta);

        let index = this.ticks.length - 1;
        let sum = 0;
        while (sum <= 1 && index >= 0) {
            sum += this.ticks[index--];
        }
        index++;

        this.ticks.splice(0, index);

        return gameDelta;
    }
};


class GameEngine {
    constructor() {
        this.entities = [];
        this.graphs = [];
        this.ctx = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;

        
        // Track updates per second
        this.updateCount = 0;
        this.updatesPerSecond = 0;
        this.lastSecond = performance.now();
    }
    init(ctx) {
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.timer = new Timer();
    }
    start() {
        console.log("starting game");
        var that = this;
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();
    }
    startInput() {
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    addGraph(graph) {
        this.graphs.push(graph);
    }
    draw() {
        if (this.automata.generation % PARAMS.reportingPeriod === 0) {
            this.ctx.clearRect(0, 0, PARAMS.width, PARAMS.height); // clear sim square only
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].draw(this.ctx);
            }
        
//        this.ctx.clearRect(0, 0, this.ctx.canvas.height, this.ctx.canvas.width); // clear sim square only
//        for (var i = 0; i < this.entities.length; i++) {
//            this.entities[i].draw(this.ctx);
//        }
            this.ctx.clearRect(0, PARAMS.height, this.ctx.canvas.width, this.ctx.canvas.height - PARAMS.height); // clear graphs only
            for (var i = 0; i < this.graphs.length; i++) {
                this.graphs[i].draw(this.ctx);
            }

            this.selection?.draw(this.ctx);
        }
    }


    update() {
        var entitiesCount = this.entities.length;

        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);;
            }
        }
    }

    loop() {
        var timeSinceLastTick = 0;
        if (isRunning) {
            this.clockTick = this.timer.tick();
            var loops = PARAMS.updatesPerDraw;
            while (loops-- > 0) {
                this.update();
                this.updateCount++;
            }
            this.draw();
            


            if (PARAMS.show_timing) {
                const now = performance.now();
                const delta = now - this.lastSecond;
                if (delta >= PARAMS.timing_update_interval) {
                    this.updatesPerSecond = this.updateCount / (delta / 1000);
                    this.updateCount = 0;
                    this.lastSecond = now;
                }
            }
        }
    }
};








