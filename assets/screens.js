// Screens
Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() {    console.log("Entered start screen."); },
    exit: function() { console.log("Exited start screen."); },
    render: function(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{yellow}Javascript Roguelike");
        display.drawText(1,2, "Press [Enter] to start!");
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
}

// Define our playing screen
Game.Screen.playScreen = {
	_map: null,
	_player: null,
	_gameEnded: false,
    	enter: function() {
		console.log("Entered play screen.");
	    	// Create a map based on our size parameters
	    	var width = 100;
	    	var height = 50;
		var depth = 6;
		
		// Create map from tiles and player
		var tiles = new Game.Builder(width, height, depth).getTiles();
		this._player = new Game.Entity(Game.PlayerTemplate);
		this._map = new Game.Map(tiles, this._player);
		
		// Start the map's engine
		this._map.getEngine().start();
	},
    	exit: function() { console.log("Exited play screen."); },
    	render: function(display) {
        	//display.drawText(3,5, "%c{red}%b{white}This game is so much fun!");
        	//display.drawText(4,6, "Press [Enter] to win, or [Esc] to lose!");
		
		var screenWidth = Game.getScreenWidth();
		var screenHeight = Game.getScreenHeight();
		// Make sure the x-axis does not go to the left of the left bound
		var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
		// Make sure there is enough space to fit entire game screen
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		// Make sure the y-axis does not go above top bound
		var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
		// Make sure there is enough space to fit entire game screen
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
		
		// This object will keep track of all visible map cells
		var visibleCells = {};
		// Store this._map and player's z to prevent losing it in callbacks
		var map = this._map;
		var currentDepth = this._player.getZ();
		
		// Find all visible cells and update the object
		this._map.getFov(this._player.getZ()).compute(
			this._player.getX(), this._player.getY(),
			this._player.getSightRadius(),
			function(x, y, radius, visibility) {
				visibleCells[x + "," + y] = true;
				// Mark cell as explored
				map.setExplored(x, y, currentDepth, true);
			});
		
		// Iterate through all visible map cells
		for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
				if (map.isExplored(x, y, currentDepth)) {
					// Fetch the glyph for the tile and render to screen
					// at the offset position
					var glyph = this._map.getTile(x, y, currentDepth);
					// The foreground colour becomes dark gray if the tile has been explored but is not visible
					var foreground = glyph.getForeground();
					// If we are at a cell that is in the FoV, we need to check if there are items or entites
					if(visibleCells[x + ',' + y]) {
						// Check for items first, since we want to draw entities over items.
						var items = map.getItemsAt(x, y, currentDepth);
						// If we have items, we want to render the top most item
						if (items) {
							glyph = items[items.length - 1];
						}
						// Check if we have an entity at the position
						if (map.getEntityAt(x, y, currentDepth)) {
							glyph = map.getEntityAt(x, y, currentDepth);
						}
						// Update the foreground colour in case our glyph changed
						foreground = glyph.getForeground();
					} else {
						// Since the tile was previously explored but not visible, 
						// we want to change the foreground to dark gray.
						foreground = 'darkGray';
					}
					display.draw(
						x - topLeftX, 
						y - topLeftY, 
						tile.getChar(), 
						foreground, 
						tile.getBackground());
				}
			}
		}
		
		// Render the Entities
		var entities = this._map.getEntities();
		for (var key in entities) {
			var entity = entities[key];
			// Only render if the entity is on screen
			if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
			    entity.getX() < topLeftX + screenWidth &&
			    entity.getY() < topLeftY + screenHeight &&
			    entity.getZ() == this._player.getZ()) {
				if (visibleCells[entity.getX() + ',' + entity.getY()]) {
					display.draw(
						entity.getX() - topLeftX,
						entity.getY() - topLeftY,
						entity.getChar(),
						entity.getForeground(),
						entity.getBackground()
					);
				}
			}
		}
		
		// Get the messages in the player's queue and render them
		var messages = this._player.getMessages();
		var messageY = 0;
		for (var i = 0; i < messages.length; i++) {
			// Draw each message, adding the number of lines
			messageY += display.drawText(0, messageY, '%c{white}%b{black}' + messages[i]);
		}
		// Render Player HP
		var stats = '%c{white}%b{black}';
		stats += vsprintf('HP: %d/%d ', [this._player.getHp(), this._player.getMaxHp()]);
		display.drawText(0, screenHeight, stats);
    	},
    	handleInput: function(inputType, inputData) {
		// If the game is over, enter will bring the user to the losing screen
		if (this._gameEnded) {
			if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.loseScreen);
			}
			// Return to make sure the user can't still play
			return;
		}
        	if (inputType === 'keydown') {
            		// If enter is pressed, go to the win screen
            		// If escape is pressed, go to Start screen
            		if (inputData.keyCode === ROT.VK_RETURN) {
                		Game.switchScreen(Game.Screen.winScreen);
            		} else if (inputData.keyCode === ROT.VK_ESCAPE) {
                		Game.switchScreen(Game.Screen.startScreen);
            		} else {
				// Movement
				if (inputData.keyCode === ROT.VK_LEFT || inputData.keyCode === ROT.VK_NUMPAD4) {
					this.move(-1, 0, 0);
				} else if (inputData.keyCode === ROT.VK_RIGHT || inputData.keyCode === ROT.VK_NUMPAD6) {
					this.move(1, 0, 0);
				} else if (inputData.keyCode === ROT.VK_UP || inputData.keyCode === ROT.VK_NUMPAD8) {
					this.move(0, -1, 0);
				} else if (inputData.keyCode === ROT.VK_DOWN || inputData.keyCode === ROT.VK_NUMPAD2) {
					this.move(0, 1, 0);
				} else if (inputData.keyCode === ROT.VK_NUMPAD7) {
					this.move(-1, -1, 0);
				} else if (inputData.keyCode === ROT.VK_NUMPAD9) {
					this.move(1, -1, 0);
				} else if (inputData.keyCode === ROT.VK_NUMPAD1) {
					this.move(-1, 1, 0);
				} else if (inputData.keyCode === ROT.VK_NUMPAD3) {
					this.move(1, 1, 0);
				}
				// Unlock the engine
				this._map.getEngine().unlock();
			}
        	} else if (inputType == 'keypress') {
			var keyChar = String.fromCharCode(inputData.charCode);
			if (keyChar === '>') {
				this.move(0, 0, 1);
			} else if (keyChar === '<') {
				this.move(0, 0, -1);
			} else {
				// Not a valid key
				return;
			}
			// Unlock the engine
			this._map.getEngine().unlock();
		}
    	},
	move: function(dX, dY, dZ) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		var newZ = this._player.getZ() + dZ;
		// Try to move to the new cell
		this._player.tryMove(newX, newY, newZ, this._map);
	},
	setGameEnded: function(gameEnded) {
		this._gameEnded = gameEnded;
	}
};

// Define our winning screen
Game.Screen.winScreen = {
    	enter: function() {    console.log("Entered win screen."); },
    	exit: function() { console.log("Exited win screen."); },
    	render: function(display) {
        	// Render our prompt to the screen
        	for (var i = 0; i < 22; i++) {
            	// Generate random background colors
            	var r = Math.round(Math.random() * 255);
            	var g = Math.round(Math.random() * 255);
            	var b = Math.round(Math.random() * 255);
            	var background = ROT.Color.toRGB([r, g, b]);
            	display.drawText(2, i + 1, "%b{" + background + "}You win!");
        	}
    	},
    	handleInput: function(inputType, inputData) {
        // Nothing to do here      
    }
};

// Define our winning screen
Game.Screen.loseScreen = {
    	enter: function() {    console.log("Entered lose screen."); },
    	exit: function() { console.log("Exited lose screen."); },
    	render: function(display) {
        	// Render our prompt to the screen
        	for (var i = 0; i < 22; i++) {
            		display.drawText(2, i + 1, "%b{red}You lose! :(");
        	}
    	},
    	handleInput: function(inputType, inputData) {
        // Nothing to do here      
    	}
};
