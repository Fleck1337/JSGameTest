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
    	enter: function() {
		console.log("Entered play screen.");
		var map = [];
	    	// Create a map based on our size parameters
	    	var mapWidth = 100;
	    	var mapHeight = 50;
	    	
		for (var x = 0; x < mapWidth; x++) {
			// Create the nested array for y values
			map.push([]);
			// Add all the tiles
			for (var y = 0; y < mapHeight; y++) {
				map[x].push(Game.Tile.nullTile);
			}
		}
		
		// Setup Cellular Map Generator
		var generator = new ROT.Map.Cellular(mapWidth, mapHeight);
		generator.randomize(0.5);
		var totalIterations = 3;
		// Iteratively smoothen the map
		for (var i = 0; i < totalIterations - 1; i++) {
			generator.create();
		}
		// Smoothen one last time and update map
		generator.create(function(x, y, v) {
			if (v === 1) {
				map[x][y] = Game.Tile.floorTile;
			} else {
				map[x][y] = Game.Tile.wallTile;
			}
		});
		
		
		/*
		// Setup Uniform Map Generator
		var generator = new ROT.Map.Uniform(mapWidth, mapHeight, {timeLimit: 5000});

		// Smoothen one last time and update map
		generator.create(function(x, y, v) {
			if (v === 0) {
				map[x][y] = Game.Tile.floorTile;
			} else {
				map[x][y] = Game.Tile.wallTile;
			}
		});
		*/
		
		// Create map from tiles and player
		this._player = new Game.Entity(Game.PlayerTemplate);
		this._map = new Game.Map(map, this._player);
		
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
		
		// Iterate through all visible map cells
		for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
				// Fetch the glyph for the tile and render to screen
				// at the offset position
				var tile = this._map.getTile(x, y);
				display.draw(
					x - topLeftX, 
					y - topLeftY, 
					tile.getChar(), 
					tile.getForeground(), 
					tile.getBackground());
			}
		}
		
		// Render the Entities
		var entities = this._map.getEntities();
		for (var i = 0; i < entities.length; i++) {
			var entity = entities[i];
			// Only render if the entity is on screen
			if (entity.getX() >= topLeftX && entity.getY() >= topLeftY &&
			    entity.getX() < topLeftX + screenWidth &&
			    entity.getY() < topLeftY + screenHeight) {
				display.draw(
					entity.getX() - topLeftX,
					entity.getY() - topLeftY,
					entity.getChar(),
					entity.getForeground(),
					entity.getBackground()
				);
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
					this.move(-1, 0);
				} else if (inputData.keyCode === ROT.VK_RIGHT || inputData.keyCode === ROT.VK_NUMPAD6) {
					this.move(1, 0);
				} else if (inputData.keyCode === ROT.VK_UP || inputData.keyCode === ROT.VK_NUMPAD8) {
					this.move(0, -1);
				} else if (inputData.keyCode === ROT.VK_DOWN || inputData.keyCode === ROT.VK_NUMPAD2) {
					this.move(0, 1);
				} else if (inputData.keyCode === ROT.VK_NUMPAD7) {
					this.move(-1, -1);
				} else if (inputData.keyCode === ROT.VK_NUMPAD9) {
					this.move(1, -1);
				} else if (inputData.keyCode === ROT.VK_NUMPAD1) {
					this.move(-1, 1);
				} else if (inputData.keyCode === ROT.VK_NUMPAD3) {
					this.move(1, 1);
				}
				// Unlock the engine
				this._map.getEngine().unlock();
			}
		
        	}    
    	},
	move: function(dX, dY) {
		var newX = this._player.getX() + dX;
		var newY = this._player.getY() + dY;
		// Try to move to the new cell
		this._player.tryMove(newX, newY, this._map);
	}
}

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
}

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
}
