var gamejs = require('gramework').gamejs,
    conf = require('./conf'),
    TileMap = require('gramework').tilemap.TileMap,
    Scene = require('gramework').Scene,
    Cursor = require('./cursor').Cursor,
    Unit = require('./cursor').Unit,
    GameController = require('gramework').input.GameController,
    availableTiles = require('./tiles').availableTiles,
    Player = require('./player').Player;

// Container for the entire game.
var Game = exports.Game = function () {
    this.cont = new GameController();

    this.paused = false;
    this.turnQueue = [];
    this.currentPlayer;

    this.scene = new Scene({
        width: 800,
        height: 600
    });
    this.map = new TileMap(gamejs.utils.uri.resolve(document.location.href, './assets/images/maps/test_map.tmx'), {});

    this.initialize();
};

Game.prototype.initialize = function() {
    var player1 = new Player({ human: true });
    var player2 = new Player({});

    this.highlitTiles = [];

    this.cursor = new Cursor({
        width: 32,
        height: 32,
        x: 0,
        y: 0,
        tile_size: 32
    });

    var elf = new Unit({
        width: 32,
        height: 32,
        x: 0,
        y: 0,
        tile_size: 32,
        spriteSheet: conf.Images.elf,
        animations: { frames: 2 },
        map: this.map
    });
    var elf2 = new Unit({
        width: 32,
        height: 32,
        x: 1,
        y: 0,
        tile_size: 32,
        spriteSheet: conf.Images.elf,
        animations: { frames: 2 },
        map: this.map
    });
    var game = this;
    this.controlMap = {
        left: function () {
            game.cursor.slide([-1, 0]);
        },
        up: function () {
            game.cursor.slide([0, -1]);
        },
        right: function () {
            game.cursor.slide([1, 0]);
        },
        down: function () {
            game.cursor.slide([0, 1]);
        },
        action: function() {
            game.map.deselectAll();
            var tile = game.map.getTile(game.cursor.tile[0], game.cursor.tile[1]);
            if (game.currentPlayer.isHuman()) {
                game.currentPlayer.action(tile);
            }
        },
        mousePos: function(pos) {
            pos[0] = Math.floor(pos[0] / (game.cursor.tile_size * game.scene.camera.zoom));
            pos[1] = Math.floor(pos[1] / (game.cursor.tile_size * game.scene.camera.zoom));
            game.cursor.setTilePos(pos);
        },
        cancel: function() {
            game.map.deselectAll();
            game.currentPlayer.deselect();
        }
    };

    this.scene.entities.forEach(function(entity){
        this.map.getTile(entity.tile[0], entity.tile[1]).addOccupant(entity);
    }, this);
    this.scene.pushEntity(this.cursor);
    this.scene.pushEntity(elf);
    this.scene.pushEntity(elf2);
    player1.addUnit(elf);
    player1.addUnit(elf2);
    elf.setTile(this.map.getTile(0,0));
    elf2.setTile(this.map.getTile(1,0));
    this.scene.pushLayer(this.map);

    this.turnQueue.push(player1);
    this.turnQueue.push(player2);
};

Game.prototype.draw = function(surface) {
    this.scene.draw(surface);
};

Game.prototype.event = function(ev) {
    var key = this.cont.handle(ev);
    if (key) {
        if (key.keyDown) {
            this.controlMap[key.label]();
            console.log(this.highlitTiles);
        }
        if (key.mousePos) {
            this.controlMap.mousePos(key.mousePos);
        }
    }
};

Game.prototype.update = function(dt) {
    //Manage the turn sequence if we have to
    this.map.deselectAll();
    if (this.currentPlayer === undefined){
        this.setCurrentPlayer(this.turnQueue.shift());
        this.currentPlayer.startTurn();
    }
    if (this.currentPlayer.isDone()){
        this.turnQueue.push(this.currentPlayer);
        this.setCurrentPlayer(this.turnQueue.shift());
        this.currentPlayer.startTurn();
    }
    if (this.currentPlayer.hasUnitSelected()) {
        var unit = this.currentPlayer.getSelectedUnit();
        this.highlitTiles = unit.availableTiles;
        this.highlitTiles.forEach(function(tile) {
            tile.glow();
        }, this);
    }
    if (dt > 1000 / 3) dt = 1000 / 3;
    this.scene.update(dt);
};

Game.prototype.setCurrentPlayer = function(player) {
    this.currentPlayer = player;
};