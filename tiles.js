var tilemap = require('gramework').tilemap,
    gamejs = require('gramework').gamejs,
    _ = require('underscore');

var SmartTile = tilemap.Tile.extend({
    initialize: function(options){
        this.contents = new gamejs.sprite.Group();
        this.highlightColour = false;
        this.highlightCycle = 5 * this.coords[0] + 5 * this.coords[1];
        this._isAvailable = true;
        // A tile's tempProperties are destroyed at the end of the draw cycle
        this.tempProperties = {};
    },
    
    isAvailable: function() {
        return this._isAvailable;
    },  

    notAvailable: function() {
        this._isAvailable = false;
    },

    getContents: function() {
        return this.contents._sprites;
    },

    isOccupied: function() {
        return this.getContents().length > 0;
    },

    addContent: function(content) {
        this.contents.add(content);
    },

    removeContent: function(content) {
        this.contents.remove(content);
    },

    highlight: function(colour) {
        this.highlightColour = colour;
    },

    dehighlight: function() {
        this.highlightColour = false;
        this.highlightCycle = 0;
    },

    update: function(dt) {
        this.highlightCycle += 20;
        if (this.highlightCycle > 720) {
            this.highlightCycle -= 720;
        }

        this.opac = ((Math.sin(tile.highlightCycle / (180)) * 0.15) + 0.4) / 2;
    }
});

var SmartMap = tilemap.TileMap.extend({
    initialize: function(options) {
        this.contents = new gamejs.sprite.Group();
    },

    addContent: function(content) {
        this.contents.add(content);

        tile = this.getTile(content.coords[0], content.coords[1]);
        tile.addContent(content);

    },

    highlightTile: function(x, y) {
        tile = this.getTile(x, y);
        tile.highlight([100,200,50]);
    },

    dehighlightTile: function(x, y) {
        tile = this.getTile(x, y);
        tile.dehighlight();
    },

    dehighlightAll: function() {
        this.tiles.forEach(function(tileRow) {
            tileRow.forEach(function(tile) {
                tile.dehighlight();
            });
        });
    },

    getContents: function() {
        return this.contents;
    },

    update: function(dt) {
        this.tiles.forEach(function(tileRow) {
            tileRow.forEach(function(tile) {
                tile.update(dt);
            }, this);
        }, this);
    },

    draw: function(display, camera) {
        SmartMap.super_.prototype.draw.apply(this, arguments);

        this.tiles.forEach(function(tileRow) {
            tileRow.forEach(function(tile) {
                if (tile.highlightColour) {
                    gamejs.draw.rect(display, "rgba(" + tile.highlightColour.join() + "," + tile.opac + ")", tile.rect, 0);
                }
                if (tile.tempProperties.influenceWeak && tile.tempProperties.influenceWeak.length > 0) {
                    gamejs.draw.rect(display, "rgba(" + [25,80,40] + "," + tile.opac + ")", tile.rect, 0);
                }
                if (tile.tempProperties.influenceStrong && tile.tempProperties.influenceStrong.length > 0) {
                    gamejs.draw.rect(display, "rgba(" + [100,170,110] + "," + tile.opac + ")", tile.rect, 0);
                }
            }, this);
        }, this);
    },

    getAllTiles: function() {
        var allTiles = [];
        this.tiles.forEach(function(row) {
            row.forEach(function(tile) {
                allTiles.push(tile);
            }, this);
        }, this);

        return allTiles;
    }
});

var availableTiles = function(map, x, y, maxDistance, minDistance) {
    if (maxDistance === 0) {
        return;
    }

    var negate = [ ];
    if (!minDistance) {
        var minDistance = 0;
    } else if (minDistance > 0){
        negate = availableTiles(map, x, y, minDistance);
    }

    var tiles = [];
    var homeTile = map.getTile(x, y);
    var neighbours = map.getNeighbours(x, y);

    neighbours.forEach(function(tile) {
        if (tile.properties.solid === true) {
            tile.notAvailable();
        }
        if (tile.isAvailable()) {
            tiles.push(tile);
            var availableNeighbours = availableTiles(map, tile.coords[0], tile.coords[1], maxDistance - 1, minDistance - 1);
            if (availableNeighbours){
                availableNeighbours.forEach(function(neighbour){
                    tiles.push(neighbour);
                });
            }
        }
    });

    return tiles;
};

module.exports = {
    availableTiles: availableTiles,
    SmartTile: SmartTile,
    SmartMap: SmartMap
}