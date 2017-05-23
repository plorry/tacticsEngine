var Scene = require('gramework').Scene,
    _ = require('underscore'),
    TextBlock = require('gramework').uielements.TextBlock,
    conf = require('../conf');


var MapScene = exports.MapScene = Scene.extend({
    initialize: function(options) {
        this.map = options.map;
        this.pushLayer(this.map);

        var size = this.map.layerViews[0].surface.getSize();

        options.width = size[0];
        options.height = size[1];

        MapScene.super_.prototype.initialize.apply(this, arguments);

        this.textBlock = new TextBlock({
            width: 200,
            height: 150,
            x: 25,
            y: 25,
            font: '8px elogic',
            rolling: true,
            text: "help peter this is the real andrew trapped in the game; i've been replaced by a replicant in the real world.",
            lineHeight: 10,
            borderImage: conf.Images.sample_border,
            borderImageSlice: 8,
            borderWidth: 8,
            color: [0, 0, 0],
            lineNum: 8
        });

        this.pushElement(this.textBlock);
    },

    showText: function() {
        this.textBlock.initText();
        this.textBlock.update(0);
        this.textBlock.show();
        this.pause();
    },

    hideText: function() {
        this.textBlock.hide();
        this.unpause();
    },

    pushEntity: function(entity) {
        MapScene.super_.prototype.pushEntity.apply(this, arguments);
      entity.scene = this;
      if (entity.setMap) {
        entity.setMap(this.map);
      }  
    },

    loadMap: function() {

    }
});
