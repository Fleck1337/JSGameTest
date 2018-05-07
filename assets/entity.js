Game.Entity = function(properties) {
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.Glyph.call(this, properties);
	// Instantiate any properties from the passed object
	this._name = properties['name'] || '';
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
}

// Make all entities inherit all the functionality from glyphs
Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.setName = function(name) {
	
}
