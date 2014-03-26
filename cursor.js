var _ = require('underscore'),
    gamejs = require('gramework').gamejs,
    conf = require('./conf'),
	Entity = require('gramework').Entity,
	animate = require('gramework').animate,
	inherits = require('gramework').inherits,
    availableTiles = require('./tiles').availableTiles;

var TileSprite = exports.TileSprite = Entity.extend({
	initialize: function(options) {
        this.tile = [options.x, options.y];
        this.tile_size = options.tile_size;
        if (options.spriteSheet){
            this.spriteSheet = new animate.SpriteSheet(options.spriteSheet, options.tile_size, options.tile_size);
        }
        if (options.animations) {
            this.anim = new animate.Animation(this.spriteSheet, "static", {
                static: {frames: _.range(options.animations.frames), rate: 4}
            });
            this.image = this.anim.update(0);
        }

    },

    update: function(dt) {
        this.setPos(this.tile[0] * this.tile_size, this.tile[1] * this.tile_size);
        if (this.anim) {
            this.image = this.anim.update(dt);
        }
    },

    slide: function(vec) {
        this.tile[0] += vec[0];
        this.tile[1] += vec[1];
    },

    setTilePos: function(pos) {
        this.tile[0] = pos[0];
        this.tile[1] = pos[1];
    },

    setTile: function(tile) {
        this.tile[0] = tile.coords[0];
        this.tile[1] = tile.coords[1];
        tile.addContent(this);
    },

    draw: function(display) {
        if (this.image) {
            Entity.super_.prototype.draw.call(this, display);
        } else {
            gamejs.draw.rect(display, "#000", this.rect, 1);
        }
    }
});

var Cursor = exports.Cursor = TileSprite.extend({

});

var Unit = exports.Unit = TileSprite.extend({
    initialize: function(options) {
        TileSprite.prototype.initialize.apply(this, arguments);

        this.phaseOrder = ['move', 'action', 'done'];
        this._selected = false;
        this.speed = options.speed || 4;
        this.currentPhase = 0;
        this._canMove = true;
        this._exhausted = false;
        this.availableTiles = [];
        this.map = options.map;
    },

    select: function() {
        this._selected = true;
    },

    deselect: function() {
        this.currentPhase = 0;
        this._selected = false;
    },

    isSelected: function() {
        return this._selected;
    },

    isExhausted: function() {
        return this._exhausted;
    },

    wait: function() {
        this._exhausted = true;
    },

    wake: function(){
        this._exhausted = false;
    },

    action: function(tile) {
        this._action[this.phaseOrder[this.currentPhase]](this, tile);
    },

    moveTo: function(tile) {
        this.map.getTile(this.tile[0], this.tile[1]).removeContent(this);
        this.setTile(tile);
    },

    _action: {
        move: function(unit, tile) {
            if (unit.availableTiles.indexOf(tile) > -1) {
                unit.moveTo(tile);
                unit._canMove = false;
                //unit.currentPhase += 1;
            }
        }
    },

    update: function(dt) {
        TileSprite.prototype.update.apply(this, arguments);

        if (this.phaseOrder[this.currentPhase] == 'move'){
            //Move phase - highlight available tiles
            this.availableTiles = availableTiles(this.map, this.tile[0], this.tile[1], this.speed);
        }
    }

});