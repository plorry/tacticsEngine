var tiles = require('./Tactics/tiles'),
    gamejs = require('gramework').gamejs,
    _ = require('underscore');

var PlantTile = tiles.SmartTile.extend({
    initialize: function(options) {
      this.growthLevel = 0;
      this.hasHole = false;
      PlantTile.super_.prototype.initialize.apply(this, arguments);
    },

    grow: function() {
        this.setGrowth(this.growthLevel + 1);
    },

    setGrowth: function(growthLevel) {
        this.growthLevel = growthLevel;
    },

    containsAlly: function containsAlly(unit) {
      // True iff this tile contains an ally unit to argument unit
      return this.getContents().some(function(x) {
        x.isAlly(unit);
      });
    },

    containsEnemy: function containsEnemy(unit) {
      // True iff this tile contains an enemy unit to argument unit
      return this.getContents().some(function(x) {
        x.isEnemy(unit);
      });
    },
});

var PlantMap = tiles.SmartMap.extend({
    initialize: function(options) {
        PlantMap.super_.prototype.initialize.apply(this, arguments);
        this.getAllTiles().forEach(function(tile) {
            if (tile.properties) {
                // tile.growthLevel = tile.properties.growthLevel;
            }
        }, this);
    },

    draw: function(display, camera) {
        PlantMap.super_.prototype.draw.apply(this, arguments);

        this.getAllTiles().forEach(function(tile) {
            if (tile.growthLevel > 0) {
                gamejs.draw.rect(display, "rgba(0,0,0,"+ (tile.growthLevel / 6) +")", tile.rect, 0);
            }
        });
    },

    getAllGrownTiles: function() {
        var grownTiles = [];
        this.getAllTiles().forEach(function(tile) {
            if (tile.growthLevel > 0) {
                grownTiles.push(tile);
            }
        }, this);

        return grownTiles;
    }
});

module.exports = {
    PlantTile: PlantTile,
    PlantMap: PlantMap
};
