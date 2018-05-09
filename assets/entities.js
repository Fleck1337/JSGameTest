// Create our Mixins namespace
Game.Mixins = {};

// Define our Movable Mixin
Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, map) {
		var tile = map.getTile(x, y);
		var target = map.getEntityAt(x, y);
		// If an entity was present at the tile, we cannot move there
		if (target) {
			return false;
		}
		// Check if we can walk on the tile and if so, walk onto it
		if (tile.isWalkable()) {
			// Update entity's position
			this._x = x;
			this._y = y;
			return true;
		// Check if tile is diggable and if so, try to dig it
		} else if (tile.isDiggable()) {
			map.dig(x, y);
			return true;
		}
		return false;
	}
}

// Main player's Actor Mixin
Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		// Re-render the screen
		Game.refresh();
		// Lock the engine and wait asynchronously for player to press a key
		this.getMap().getEngine().lock();
	}
}

// Fungus Actor Mixin
Game.Mixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	act: function() {  }
}

// Player Template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor]
}

// Fungus Template
Game.FungusTemplate = {
	character: 'F',
	foreground: 'green',
	mixins: [Game.Mixins.FungusActor]
}
