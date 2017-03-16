var gamejs = require('gramework').gamejs,
    Entity = require('gramework').Entity,
    _ = require('underscore');

var FloatingText = exports.FloatingText = Entity.extend({
    initialize: function(options) {
        this.text = options.text;
        this.color = options.color || '#dd0000';
        this.fontStyle = options.fontStyle || '8px LoRes';
        this.font = new gamejs.font.Font(this.fontStyle);
        this.duration = options.duration || 1000;
        this.elapsedTime = 0;
        this.image = this.font.render(this.text, this.color);
        this.pos = options.pos || [0, 0];
        this.rect.left = this.pos[0];
        this.rect.top = this.pos[1];
        this.drift = options.drift || {x: 0, y: 0};
    },

    update: function(dt) {
        this.elapsedTime += dt;
        this.rect.top += (this.drift.y * dt)/100;
        this.rect.left += (this.drift.x * dt)/100;
        this.image.setAlpha(this.elapsedTime / this.duration);
        if (this.elapsedTime >= this.duration) {
            this.kill();
        }
    },

    draw: function(display) {
        FloatingText.super_.prototype.draw.apply(this, arguments);
    }
});
