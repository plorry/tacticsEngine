var Unit = require('./cursor').Unit,
    getTilesInRange = require('./cursor').getTilesInRange,
    _ = require('underscore'),
    gamejs = require('gramework').gamejs,
    TextBlock = require('gramework').uielements.TextBlock,
    conf = require('./conf');


GREEN = 0;
RED = 1;
YELLOW = 2;

var ELEMENTS = {
        GREEN: GREEN,
        RED: RED,
        YELLOW: YELLOW
    },
    STRENGTHS = {
        0: RED,
        1: YELLOW,
        2: GREEN
    };

var CaravanUnit = Unit.extend({
    initialize: function(options) {
        this.image = gamejs.image.load(conf.Images.caravan);
        options.spriteSheet = this.image;
        options.stats = {speed: 3};
        CaravanUnit.super_.prototype.initialize.apply(this, arguments);
        this.type = "caravan";
        this.passengers = [];
        this.passengerDisplay = new TextBlock({
            
        });
    },

    load: function(unit) {
        // Add a unit to this caravan's list of passengers
        this.passengers.push(unit);
    },

    unload: function(unit) {
        // Deploy a unit from this caravan's list of passengers
        var index = this.passengers.indexOf(unit);
        if (index >= 0) {
            this.passengers.splice(this.passengers.indexOf(unit), 1);
        }
        var tile = _.sample(this.getTile.getNeighbours);
        unit.deploy();
    },

    checkTerrainDifficulty: function(tile) {
        return tile.growthLevel;
    }
});

var ElementalUnit = Unit.extend({
    initialize: function(options) {
        options.animations = {frames: 1};
        ElementalUnit.super_.prototype.initialize.apply(this, arguments);
    },

    checkStrength: function(target) {
        if (STRENGTHS[this.element] == target.element) {
            return 1;
        } else if (STRENGTHS[target.element] == this.element) {
            return -1;
        } else {
            return 0;
        }
    },

    attack: function(target) {
        if (this.checkStrength(target) == 1) {
            target.hit(3);
        } else if (this.checkStrength(target) == 0) {
            target.hit(2);
        } else if (this.checkStrength(target) == -1) {
            target.hit(1);
        }
    }
});

var Sage = exports.Sage = ElementalUnit.extend({
    initialize: function(options) {
        options.stats = {
            power: 0,
            defense: 3
        };
        this.image = gamejs.image.load(conf.Images.elder_01);
        options.spriteSheet = this.image;
        Sage.super_.prototype.initialize.apply(this, arguments);
        this.type = "sage";
        this.strongInfluenceRange = 2;
        this.weakInfluenceRange = 6;
        this.zoneSet = false;
        this.influenceTiles = [];
    },
    setZoneOfInfluence: function() {
        var cantPass = [];
        // Unit can't pass through enemy units
        this.player.opponents.forEach(function(opponent){
            cantPass = cantPass.concat(opponent.getOccupiedTiles());
        }, this);
        // Unit can't rest on friendly units
        var tiles = getTilesInRange(
            this.map,
            {x: this.coords[0], y: this.coords[1]},
            this.strongInfluenceRange,
            0,
            cantPass,
            []
        );
        tiles.forEach(function(tile){
            if (tile.tempProperties.influenceStrong) {
                tile.tempProperties.influenceStrong.push(this);
            } else {
                tile.tempProperties.influenceStrong = [this];
            }
        }, this);
        var tiles = getTilesInRange(
            this.map,
            {x: this.coords[0], y: this.coords[1]},
            this.weakInfluenceRange,
            0,
            cantPass,
            []
        );
        tiles.forEach(function(tile){
            if (tile.tempProperties.influenceWeak) {
                tile.tempProperties.influenceWeak.push(this);
            } else {
                tile.tempProperties.influenceWeak = [this];
            }
        }, this);
        this.influenceTiles = tiles;
        this.zoneSet = true;
    },

    update: function(dt) {
        Sage.super_.prototype.update.apply(this, arguments);
        if (!this.zoneSet) {
            this.setZoneOfInfluence();
        }
    },

    cleanInfluence: function() {
        var index;
        this.influenceTiles.forEach(function(tile){
            for (propertyKey in tile.tempProperties) {
                index = tile.tempProperties[propertyKey].indexOf(this);
                tile.tempProperties[propertyKey].splice(index, 1);
            }
        }, this);
        this.influenceTiles = [];
        this.zoneSet = false;
    },

    moveTo: function(tile) {
        Sage.super_.prototype.moveTo.apply(this, arguments);
        this.cleanInfluence();
    }
});


var KidUnit = ElementalUnit.extend({
    initialize: function(options) {
        KidUnit.super_.prototype.initialize.apply(this, arguments);
    }
});


var Atom = KidUnit.extend({
});


var Bantam = KidUnit.extend({
});


var GreenAtom = exports.GreenAtom = Atom.extend({
  initialize: function(options) {
    this.image = gamejs.image.load(conf.Images.green_atom);
    options.spriteSheet = this.image;
    KidSlash.super_.prototype.initialize.apply(this, arguments);
    this.type = "green";
    this.element = ELEMENTS.GREEN;
  },
  /*
  activityPhase: function() {
    console.log('dig');
    this.nextPhase();
  }
  */
});


var KidSlash = exports.KidSlash = Bantam.extend({
  initialize: function(options) {
    this.image = gamejs.image.load(conf.Images.green_bantam);
    options.spriteSheet = this.image;
    KidSlash.super_.prototype.initialize.apply(this, arguments);
    this.type = "slash";
    this.element = ELEMENTS.GREEN;
  },
  /* 
  activityPhase: function() {
    let diggableTiles = this.getDiggableTiles();
    diggableTiles.forEach((tile) => tile.highlight([22, 45, 45]));
    // console.log(diggableTiles);
    this.nextPhase();
  },

  getDiggableTiles: function() {
    let tiles = getTilesInRange(
      this,
      this.map,
      {x: this.coords[0], y: this.coords[1]},
      1,
      [],
      [this.map.getTile(this.coords[0], this.coords[1])]
    );
    return tiles;
  },*/
});

var KidFire = exports.KidFire = Bantam.extend({
    initialize: function(options) {
        this.image = gamejs.image.load(conf.Images.red_bantam);
        options.spriteSheet = this.image;
        KidFire.super_.prototype.initialize.apply(this, arguments);
        this.type = "fire";
        this.element = ELEMENTS.RED;
    }
});

var KidPoison = exports.KidPoison = Bantam.extend({
    initialize: function(options) {
        this.image = gamejs.image.load(conf.Images.yellow_teen);
        options.spriteSheet = this.image;
        KidPoison.super_.prototype.initialize.apply(this, arguments);
        this.type = "poison";
        this.element = ELEMENTS.YELLOW;
    }
});

var PlantUnit = exports.PlantUnit = ElementalUnit.extend({
    initialize: function(options) {
        options.stats = {
            speed: 3,
        };
        PlantUnit.super_.prototype.initialize.apply(this, arguments);
        this.type = "Plant Unit";
        this.color = "#dd0000";
    },

    wake: function() {
        this.currentSlides = this.maxSlides;
        PlantUnit.super_.prototype.wake.apply(this, arguments);
    },

    select: function() {
        PlantUnit.super_.prototype.select.apply(this, arguments);
        var targetOpponent = _.sample(this.player.opponents);
        var target = _.sample(targetOpponent.units.sprites());
        this.setTarget(target);
        this._isTakingTurn = true;
    },

    exhaust: function() {
        this._isTakingTurn = false;
        PlantUnit.super_.prototype.exhaust.apply(this, arguments);
    },

    setTarget: function(target) {
        this._target = target;
    },

    getTarget: function() {
        return this._target;
    },

    update: function(dt) {
        PlantUnit.super_.prototype.update.apply(this, arguments);
    }
});

var PlantPoison = exports.PlantPoison = PlantUnit.extend({
    initialize: function(options) {
        this.image = gamejs.image.load(conf.Images.yellow_grunt);
        options.spriteSheet = this.image;
        options.maxHitPoints = 3;
        PlantPoison.super_.prototype.initialize.apply(this, arguments);
        this.type = "poison";
        this.element = ELEMENTS.YELLOW;
    }
});

var PlantSlash = exports.PlantSlash = PlantUnit.extend({
    initialize: function(options) {
        options.maxHitPoints = 3;
        this.image = gamejs.image.load(conf.Images.green_grunt);
        options.spriteSheet = this.image;
        PlantSlash.super_.prototype.initialize.apply(this, arguments);
        this.type = "slash";
        this.element = ELEMENTS.GREEN;
    }
});

var PlantFire = exports.PlantFire = PlantUnit.extend({
    initialize: function(options) {
        options.maxHitPoints = 3;
        this.image = gamejs.image.load(conf.Images.red_grunt);
        options.spriteSheet = this.image;
        PlantFire.super_.prototype.initialize.apply(this, arguments);
        this.type = "fire";
        this.element = ELEMENTS.RED;
    }
});

var PlantGeneral = exports.PlantGeneral = PlantUnit.extend({
    initialize: function(options) {
        options.stats = {speed: 0};
        PlantGeneral.super_.prototype.initialize.apply(this, arguments);
    }
});

var Grower = exports.Grower = PlantUnit.extend({
    initialize: function(options) {
        Grower.super_.prototype.initialize.apply(this, arguments);
        this.type = "Grower";
        this._exhausted = false;
        this.availableTiles = [];
        this.defaultStats = {
            defense: 5
        };
        this.parent = options.parent || undefined;
        this.superParent = options.superParent || this;
        this.children = [];

        if (this.parent) {
            this.parent.children.push(this);
        }
    },

    getParent: function(){
        return this.parent;
    },

    getChildren: function() {
        var children = [this];
        this.children.forEach(function(child){
            children = children.concat(child.getChildren());
        });
        return children;
    },

    wake: function(){
        this._exhausted = false;
    },

    select: function() {
        this._selected = true;
    },

    AIMove: function() {
        var target = this.player.getTarget();
        var direction = this.getDirectionTo(target);
        var closest = this.getClosestToTarget(target);
        closest.grow(direction);
        this.exhaust();
        this.deselect();
    },

    update: function(dt) {
        Grower.super_.prototype.update.apply(this, arguments);
    },

    takeTurn: function() {
        
    },

    getClosestToTarget: function(target) {
        /*
        Should only ever be executed by the superParent (root)
        */
        var closest;
        var smallestDistance;
        this.getChildren().forEach(function(unit) {
            var distance = Math.abs(target.coords[0] - unit.coords[0]) + Math.abs(target.coords[1] - unit.coords[1]);
            if (smallestDistance == undefined || distance < smallestDistance) {
                smallestDistance = distance;
                closest = unit;
            }
        });
        return closest;
    },

    grow: function(direction) {
        var new_coords = [this.coords[0], this.coords[1]];

        if (direction == DIRECTIONS.UP) {
            new_coords[1]--;
        } else if (direction == DIRECTIONS.RIGHT) {
            new_coords[0]++;
        } else if (direction == DIRECTIONS.DOWN) {
            new_coords[1]++;
        } else if (direction == DIRECTIONS.LEFT) {
            new_coords[0]--;
        }

        var new_tail = new Grower({
            height: TILESIZE,
            width: TILESIZE,
            x: new_coords[0],
            y: new_coords[1],
            tile_size: TILESIZE,
            map: this.map,
            color: this.activeColor,
            scene: this.scene,
            hitPoints: 30,
            image: conf.Images.root,
            parent: this,
            superParent: this.superParent
        });

        new_tail.update();
    },

    isExhausted: function() {
        return this._exhausted;
    },

    isAwake: function() {
        return !this.isExhausted();
    },

    exhaust: function() {
        this._exhausted = true;
        this.availableTiles = [];
        if (this.parent && this.parent.isAwake()) {
            this.parent.exhaust();
        }
        if (this.children) {
            this.children.forEach(function(child) {
                if (child.isAwake()) {
                    child.exhaust();
                }
            }, this);
        }
    },

    kill: function() {
        this.getChildren().forEach(function(child){
            child.kill();
        });
        this.player.units.remove(this);

        Grower.super_.prototype.kill.apply(this, arguments);
    }
});


var PlantGeneral = exports.PlantGeneral = PlantUnit.extend({
    initialize: function() {

    }
});

var UNIT_MAP = {
    'caravan': CaravanUnit,
    'kid_green': KidSlash,
    'kid_red': KidFire,
    'kid_yellow': KidPoison,
    'plant_green': PlantSlash,
    'plant_red': PlantFire,
    'plant_yellow': PlantPoison,
    'green_atom': GreenAtom
};

const DEFAULT_OPTIONS = {
  height: 16,
  width: 16,
  tile_size: 16,
};

var load_units = exports.load_units = function(units_data, player, scene) {
    var units = [], unit, unit_type;

    units_data.forEach(function(unit_data) {
        unit_type = UNIT_MAP[unit_data.type];

        _.extend(unit_data, {player: player, scene: scene});
        unit = new unit_type(Object.assign(DEFAULT_OPTIONS, unit_data));
        units.push(unit);
    });

    return units;
};
