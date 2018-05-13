Game.Builder = function(width, height, depth) {
	this._width = width;
	this._height = height;
	this._depth = depth;
	this._tiles = new Array(depth);
	this._regions = new Array(depth);
};
