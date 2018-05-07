Game.Map = function(tiles) {
	this._tiles = tiles;
	// Cache the width and height based on length
	// of the dimensions of the tiles array
	this._width = tiles.length;
	this._height = tiles[0].length;
};

// Standard Getter
Game.Map.prototype.getWidth = function() {
	return this._width;
};
Game.Map.prototype.getHeight = function() {
	return this._height;
};

// gets the tile for a given coordinate set
Game.Map.prototype.getTile = function(x, y) {
	// Make sure we are inside the bounds. If not then return null tile.
	if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
		return Game.Tile.nullTile;
	} else {
		return this._tiles[x][y] || Game.Tile.nullTile;
	}
};
