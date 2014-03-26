var inherits = require('gramework').inherits,
    gamejs = require('gramework').gamejs;

var Player = exports.Player = function(options) {
    this.units = new gamejs.sprite.Group();

    this._isDone = false;
    this._selected = undefined;

    this.initialize(options);
};

Player.prototype.startTurn = function() {
    this._isDone = false;
    this.units.forEach(function(unit){
        unit.wake();
    }, this);
};

Player.prototype.endTurn = function() {
    this._isDone = true;
}

Player.prototype.initialize = function(options) {
    this._human = options.human || false;
    this._name = options.name || undefined;
};

Player.prototype.isHuman = function(){
    return this._human;
};

Player.prototype.isDone = function() {
    return this._isDone;
};

Player.prototype.addUnit = function(unit) {
    this.units.add(unit);
};

Player.prototype.action = function(tile) {
    if (this.hasUnitSelected()){
        this.getSelectedUnit().action(tile);
    } else if (this.allyOnTile(tile) !== false){
        this.select(this.allyOnTile(tile));
        console.log(this.getSelectedUnit());
    }

};

Player.prototype.checkAlly = function(unit) {
    var _ally = false;
    this.units.forEach(function(checkUnit){
        if (checkUnit == unit) {
            _ally = true;
        }
    }, this);
    return _ally;
};

Player.prototype.hasUnitSelected = function() {
    if (this._selected) {
        return true;
    }
    return false;
};

Player.prototype.getSelectedUnit = function() {
    return this._selected;
};

Player.prototype.allyOnTile = function(tile) {
    var _ally = false;
    tile.contents.forEach(function(unit){
        if (this.checkAlly(unit)){
            _ally = unit;
        }
    }, this);
    return _ally;
 };

Player.prototype.select = function(unit){
    this._selected = unit;
};

Player.prototype.deselect = function() {
    this._selected = undefined;
};