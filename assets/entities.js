// Create our Mixins namespace
Game.Mixins = {};

// Define our Movable Mixin
Game.Mixins.Moveable = {
	name: 'Moveable',
	tryMove: function(x, y, z, map) {
		var map = this.getMap();
		// Must use starting z
		var tile = map.getTile(x, y, this.getZ());
		var target = map.getEntityAt(x, y, this.getZ());
		// If our z level has changed, check if we are on stair
		if (z < this.getZ()) {
			if (tile != Game.Tile.stairsUpTile) {
				Game.sendMessage(this, "You can't go up here!");
			} else {
				Game.sendMessage(this, "You ascend to level %d!", [z + 1]);
				this.setPosition(x, y, z);
			}
		} else if (z > this.getZ()) {
			if (tile != Game.Tile.stairsDownTile) {
				Game.sendMessage(this, "You can't go down here!");
			} else {
				this.setPosition(x, y, z);
				Game.sendMessage(this, "You descend to level %d!", [z + 1]);
			}
		}
		// If an entity was present at the tile, we cannot move there
		else if (target) {
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
			this.setPosition(x, y, z);
			return true;
		// Check if tile is diggable and if so, try to dig it
		} else if (tile.isDiggable()) {
			map.dig(x, y, z);
			return true;
		}
		return false;
	}
};

// Main player's Actor Mixin
Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function() {
		// Detect if the game is over
		if (this.getHp() < 1) {
			Game.Screen.playScreen.setGameEnded(true);
			// Send a last message to the player
			Game.sendMessage(this, 'You have died... Press [Enter] to continue!');
		}
		// Re-render the screen
		Game.refresh();
		// Lock the engine and wait asynchronously for player to press a key
		this.getMap().getEngine().lock();
		// Clear the message queue
		this.clearMessages();
	}
};

// Fungus Actor Mixin
Game.Mixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	init: function() {
		this._growthsRemaining = 5;
	},
	act: function() { 
		// Check if we are going to try growing this turn
		if (this._growthsRemaining > 0) {
			if (Math.random() <= 0.02) {
				// Generate the coordinates of a random adjacent square by generating an offset between [-1, 0, 1]
				// for both the x and y directions. To do this, we generate a number from 0-2 then subtract 1
				var xOffset = Math.floor(Math.random() * 3) - 1;
				var yOffset = Math.floor(Math.random() * 3) - 1;
				// Make we aren't trying to spawn on the same tile as us
				if (xOffset != 0 || yOffset != 0) {
					// Check if we can actually spawn at this location, and if so then we grow!
					if (this.getMap().isEmptyFloor(this.getX() + xOffset, this.getY() + yOffset, this.getZ())) {
						var entity = new Game.Entity(Game.FungusTemplate);
						entity.setPosition(this.getX() + xOffset,
								  this.getY() + yOffset, this.getZ());
						this.getMap().addEntity(entity);
						this._growthsRemaining--;
						
						// Send a message nearby!
						Game.sendMessageNearby(this.getMap(), 
								       entity.getX(), entity.getY(), entity.getZ(),
								       'The fungus is spreading');
					}
				}
			}
		}
	}
};

// Wander Actor Mixin
Game.Mixins.WanderActor = {
	name: 'WanderActor',
	groupName: 'Actor',
	act: function() {
		// Flip a coin to determine if moving by 1 in positive or negative direction
		var moveOffset = (Math.round(Math.random()) === 1) ? 1: -1;
		// Flip coin to determine if moving in x or y direction
		if (Math.round(Math.random()) === 1) {
			this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
		} else {
			this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
		}
	}
};

// Simple Attacker Mixin
Game.Mixins.Attacker = {
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template) {
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function() {
		return this._attackValue;
	},
	attack: function(target) {
		// If target is destructible, calculate the damage based on attack and defense value
		if (target.hasMixin('Destructible')) {
			var attack = this.getAttackValue();
			var defense = target.getDefenseValue();
			var max = Math.max(0, attack - defense);
			var damage = 1 + Math.floor(Math.random() * max);
			
			Game.sendMessage(this, 'You strike the %s for %d damage!', [target.getName(), damage]);
			Game.sendMessage(target, 'The %s strikes you for %d damage!', [this.getName(), damage]);
			
			target.takeDamage(this, damage);
		}
	}
};

// Destructible Mixin
Game.Mixins.Destructible = {
	name: 'Destructible',
	init: function(template) {
		this._maxHp = template['maxHp'] || 10;
		// We allow taking in health from the template in case we want the entity 
		// to start with a different amount of HP than the max specified.
		this._hp = template['hp'] || this._maxHp;
		this._defenseValue = template['defenseValue'] || 0;
	},
	getDefenseValue: function() {
		return this._defenseValue;
	},
	getHp: function() {
		return this._hp;
	},
	getMaxHp: function() {
		return this._maxHp;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		// If we have 0 or less HP, remove ourselves from the map
		if (this._hp <= 0) {
			Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
			// Check if the player has died, and if so call their act method to prompt the user.
			if (this.hasMixix(Game.Mixins.PlayerActor)) {
				this.act();
			} else {
				this.getMap().removeEntity(this);
			}
		}
	}
};

// Message Recipient Mixin
Game.Mixins.MessageRecipient = {
	name: 'MessageRecipient',
	init: function(template) {
		this._messages = [];
	},
	receiveMessage: function(message) {
		this._messages.push(message);
	},
	getMessages: function() {
		return this._messages;
	},
	clearMessages: function() {
		this._messages = [];
	}
};

// Sight Mixin
Game.Mixins.Sight = {
	name: 'Sight',
	groupName: 'Sight',
	init: function(template) {
		this._sightRadius = template['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	}
};

// Send Message Function
Game.sendMessage = function(recipient, message, args) {
	// Make sure the recipient can receive the message before doing anything
	if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
		// If args were passed, then format the message, else no formatting necessary
		if (args) {
			message = vsprintf(message, args);
		}
		recipient.receiveMessage(message);
	}
};

// Send Message to Nearby entities
Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) { 
	// If args were passed, we format the message, else no formatting necessary
	if (args) {
		message = vsprintf(message, args);
	}
	// Get nearby entities
	entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
	// Iterate through nearby entities, sending message if they can receive it.
	for (var i = 0; i < entities.length; i++) {
		if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
			entities[i].receiveMessage(message);
		}
	}
};

// Player Template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	maxHp: 40,
	attackValue: 10,
	sightRadius: 6,
	mixins: [Game.Mixins.PlayerActor,
		Game.Mixins.Attacker, Game.Mixins.Destructible,
		Game.Mixins.Sight, Game.Mixins.MessageRecipient]
};

// Fungus Template
Game.FungusTemplate = {
	name: 'fungus',
	character: 'F',
	foreground: 'green',
	maxHp: 10,
	mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
};

// Bat Template
Game.BatTemplate = {
	name: 'bat',
	character: 'B',
	foreground: 'white',
	maxHp: 5,
	attackValue: 4,
	mixins: [Game.Mixins.WanderActor,
		Game.Mixins.Attacker, Game.Mixins.Destructible]
};

// Newt Template
Game.NewtTemplate = {
	name: 'newt',
	character: ':',
	foreground: 'yellow',
	maxHp: 3,
	attackValue: 2,
	mixins: [Game.Mixins.WanderActor,
		Game.Mixins.Attacker, Game.Mixins.Destructible]
};
