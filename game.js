var gamejs = require('gramework').gamejs,
  conf = require('./conf'),
  MapScene = require('./Tactics/map_scenes').MapScene,
  Cursor = require('./Tactics/units').Cursor,
  units = require('./plant_units'),
  GameController = require('gramework').input.GameController,
  availableTiles = require('./Tactics/tiles').availableTiles,
  HumanPlayer = require('./Tactics/player').HumanPlayer,
  PlantPlayer = require('./Tactics/player').PlantPlayer,
  plant_tiles = require('./plant_tiles'),
  SmartTile = require('./Tactics/tiles').SmartTile,
  SmartMap = require('./Tactics/tiles').SmartMap,
  load_units = require('./plant_units').load_units,
  UNIT_DATA = require('./unit_data').UNIT_DATA,
  PLANT_UNIT_DATA = require('./unit_data').PLANT_UNIT_DATA,
  _ = require('underscore');

var TILESIZE = 16,
  
  SCROLLREGION = {
    width: 16,
    height: 16
  },
  
  SCROLLSPEED = 2;

// Container for the entire game.
var Game = exports.Game = function () {
  this.cont = new GameController();

  this.paused = false;
  this.turnQueue = [];
  this.currentPlayer;
  this.displayWidth = 266;
  this.displayHeight = 200;

  this.scene = new MapScene({
    camHeight: this.displayHeight,
    camWidth: this.displayWidth,
    pixelScale: 3,
    map: new plant_tiles.PlantMap(
      gamejs.utils.uri.resolve(document.location.href, './assets/remote/test_map.tmx'), {
      tileModel: plant_tiles.PlantTile
    })
  });

  this.initialize();
};

_.extend(Game.prototype, {
  initialize: function(options) {
    var player1 = new HumanPlayer({ human: true, scene: this.scene });
    var player2 = new PlantPlayer({ scene: this.scene });

    this.highlitTiles = [];
    this.scroll = {x: 0, y: 0};

    var player_units = load_units(UNIT_DATA, player1, this.scene);
    var plant_units = load_units(PLANT_UNIT_DATA, player2, this.scene);

    this.cursor = new Cursor({
      width: TILESIZE,
      height: TILESIZE,
      x: 0,
      y: 0,
      tile_size: TILESIZE,
      spriteSheet: gamejs.image.load(conf.Images.cursor),
      animations: { frames: [0], rate: 12, loop: true },
      scene: this.scene
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
        var tile = game.scene.map.getTile(game.cursor.coords[0], game.cursor.coords[1]);
        if (game.currentPlayer.isHuman()) {
          game.currentPlayer.action(tile);
        }
      },
      mouseTileCoords: function(pos) {
        var coords = [];
        coords[0] = Math.floor((pos[0] + (game.scene.camera.rect.left * game.scene.getPixelScale())) / (game.cursor.tile_size * game.scene.camera.zoom * game.scene.getPixelScale()));
        coords[1] = Math.floor((pos[1] + (game.scene.camera.rect.top * game.scene.getPixelScale())) / (game.cursor.tile_size * game.scene.camera.zoom * game.scene.getPixelScale()));
        return coords;
      },
      mousePos: function(pos) {
        pos[0] = Math.floor(pos[0] / game.scene.getPixelScale());
        pos[1] = Math.floor(pos[1] / game.scene.getPixelScale());
        return pos;
      },
      menu: function() {
        if (game.scene.isPaused()) {
          game.scene.hideText();
        } else {
          game.scene.showText();
        }
      },
      cancel: function() {
        game.currentPlayer.deselect();
      }
    };

    player1.addOpponent(player2);
    player2.addOpponent(player1);

    this.turnQueue.push(player1);
    this.turnQueue.push(player2);
  },

  draw: function(surface) {
    this.scene.draw(surface);
  },

  event: function(ev) {
    
    var key = this.cont.handle(ev);

    if (key) {
      if (key.action == 'keyDown') {
        this.controlMap[key.label]();
      }
      
      if (key.action == 'mouseMotion') {
        var coords = this.controlMap.mouseTileCoords(key.value);
        this.cursor.setTilePos(coords);
        var pos = this.controlMap.mousePos(key.value);
        this.manageScrolling(pos);
      }

      if (key.action == 'mouseClick') {
        if (key.value === 0) {
          this.controlMap.action();
        } else if (key.value === 2) {
          this.controlMap.cancel();
        }
      }
    }
  },

  cycleTurn: function(currentPlayer) {
    this.turnQueue.push(currentPlayer);
    this.setCurrentPlayer(this.turnQueue.shift());
    this.currentPlayer.startTurn();
  },

  scrollRight: function() {
    this.scroll.x = SCROLLSPEED;
  },
  scrollLeft: function() {
    this.scroll.x = -SCROLLSPEED;
  },
  scrollUp: function() {
    this.scroll.y = -SCROLLSPEED;
  },
  scrollDown: function() {
    this.scroll.y = SCROLLSPEED;
  },
  stopScrollX: function() {
    this.scroll.x = 0;
  },
  stopScrollY: function() {
    this.scroll.y = 0;
  },

  manageScrolling: function(mousePos) {
    if (mousePos[0] < SCROLLREGION.width) {
      this.scrollLeft();
    } else if (mousePos[0] > this.displayWidth - SCROLLREGION.width) {
      this.scrollRight();
    } else {
      this.stopScrollX();
    }
    if (mousePos[1] < SCROLLREGION.height) {
      this.scrollUp();
    } else if (mousePos[1] > this.displayHeight - SCROLLREGION.height) {
      this.scrollDown();
    } else {
      this.stopScrollY();
    }
    if (mousePos[0] > this.displayWidth || mousePos[1] > this.displayHeight) {
      // Mouse is outside game extents - stop scrolling
      this.stopScrollY();
      this.stopScrollX();
    }
  },

  update: function(dt) {
    //Manage the turn sequence if we have to
    if (this.currentPlayer === undefined){
      this.setCurrentPlayer(this.turnQueue.shift());
      this.currentPlayer.startTurn();
    }
    this.currentPlayer.update(dt);
    if (this.currentPlayer.getAwakeAllyCount() == 0) {
      this.currentPlayer.endTurn();
    }
    if (this.currentPlayer.isDone()){
      this.cycleTurn(this.currentPlayer);
    }

    this.scene.camera.setSpeed(this.scroll);

    if (dt > 1000 / 3) dt = 1000 / 3;
    this.scene.update(dt);
  },

  setCurrentPlayer: function(player) {
    this.currentPlayer = player;
  }
});
