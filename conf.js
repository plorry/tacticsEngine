var DROPBOX_ROOT = exports.DROPBOX_ROOT = './assets/remote/';

var Images = exports.Images = {
	cursor: 'units/cursor.png',
    caravan: 'units/caravan.png',
    /* PLANT UNITS */
    red_grunt: 'units/plant_red_grunt.png',
    green_grunt: 'units/plant_green_grunt.png',
    yellow_grunt: 'units/plant_yellow_grunt.png',
    /* ATOM UNITS - L0 */
    green_atom: 'units/p1_green_atom.png',
    red_atom: 'units/p1_red_atom.png',
    yellow_atom: 'units/p1_yellow_atom.png',
    /* BANTAM UNITS - L1 */
    green_bantam: 'units/p1_green_bantam.png',
    red_bantam: 'units/p1_red_bantam.png',
    //yellow_bantam: './units/p1_yellow_bantam.png',
    /* TEEN UNITS - L2 */
    green_teen: 'units/p1_green_teen.png',
    red_teen: 'units/p1_red_teen.png',
    yellow_teen: 'units/p1_yellow_teen.png',
    /* ELDER UNITS */
    elder_01: 'units/p1_elder01.png',
    elder_02: 'units/p1_elder02.png',
    elder_03: 'units/p1_elder03.png',

    /* MAP TILES */
    map_tiles: 'maps/map_tiles.png',
    map_tileset: 'maps/map-tileset.png',
    checkerboard: 'maps/checkerboard.png',
    darken: 'maps/darken.png',

    /* UI IMAGES */
    sample_border: 'UI/sample_border.png'
};

for (key in Images) {
    Images[key] = DROPBOX_ROOT + Images[key];
}

var Fonts = exports.Fonts = {
    loRes: './assets/fonts/lo-res.TTF'
};

var TILESIZE = exports.TILESIZE = 16;

var globals = exports.globals = {
    fps: 30
};