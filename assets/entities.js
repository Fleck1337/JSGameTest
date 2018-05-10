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
			// If we are an attacker, try to attack target
			if (this.hasMixin('Attacker')){
				this.attack(target);
				return true;
			} else {
				// If not nothing we can do, but we cannot move to the tile
				return false;
			}
		}
		// Check if we can walk on the tile and if so, walk onto it
		else if (tile.isWalkable()) {
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

// Simple Attacker Mixin
Game.Mixins.SimpleAttacker = {
	name: 'SimpleAttacker',
	groupName: 'Attacker',
	attack: function(target) {
		// Only damage the entity if they are destructible
		if (target.hasMixin('Destructible')) {
			target.takeDamage(this, 1);
		}
	}
}

// Destructible Mixin
Game.Mixins.Destructible = {
	name: 'Destructible',
	init: function() {
		this._hp = 1;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		// If we have 0 or less HP, remove ourselves from the map
		if (this._hp <= 0) {
			this.getMap().removeEntity(this);
		}
	}
}

// Player Template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor,
		Game.Mixins.SimpleAttacker, Game.Mixins.Destructible]
}

// Fungus Template
Game.FungusTemplate = {
	character: 'F',
	foreground: 'green',
	mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
}
