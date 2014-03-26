var availableTiles = exports.availableTiles = function(map, x, y, maxDistance, minDistance) {
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

