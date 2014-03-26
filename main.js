var gamejs = require('gramework').gamejs,
    Game = require('./game').Game,
    Dispatcher = require('gramework').Dispatcher,
    gramework = require('gramework'),
    conf = require('./conf');

var main = function() {

    var dispatch = new Dispatcher();
    var game = new Game();
    dispatch.push(game);

    // Play area.
    var mainSurface = gamejs.display.setMode([800, 600], gamejs.display.DISABLE_SMOOTHING);

    gamejs.onTick(function(dt) {
        dispatch.update(dt);
        dispatch.draw(mainSurface);
    }, this, conf.globals.fps);

    gamejs.onEvent(function(ev) {
        dispatch.event(ev);
    });
};

var images = Object.keys(conf.Images).map(function(img) {
    return conf.Images[img];
});
gramework.init();
gamejs.preload(images);
gamejs.ready(main);