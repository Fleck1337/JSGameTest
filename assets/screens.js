// Screens
Game.Screen = {};

// Define our Initial Start Screen
Game.Screen.startScreen = {
  enter: function() { console.log("Entered start screen"); },
  exit: function() { console.log("Exited start screen") },
  render: function(display) {
    // Render prompt to Screen
    display.drawText(1, 1, "%c{yellow}Javascript Roguelike");
    display.drawText(1, 2, "Press [Enter] to start!");
  },
  handleInput: function(inputType, inputData) {
    // When [Enter] is pressed, go to the play screen
    if (inputType === 'keydown') {
      if (inputData.keycode === ROT.VK_RETURN) {
        Game.switchScreen(Game.Screen.playScreen);
      }
    }
  }
}

// Define our Playing Screen
Game.Screen.playScreen = {
  enter: function() { console.log("Entered play screen"); },
  exit: function() { console.log("Exited play screen") },
  render: function(display) {
    display.drawText(3, 5, "%c{red}%b{white}This game is so much fun!");
    display.drawText(4, 6, "Press [Enter] to win, or [Esc] to lose!");
  },
  handleInput: function(inputType, inputData) {
    // When [Enter] is pressed, go to the play screen
    if (inputType === 'keydown') {
      if (inputData.keycode === ROT.VK_RETURN) {
        Game.switchScreen(Game.Screen.winScreen);
      } else if (inputData.keycode === ROT.VK_ESCAPE) {
        Game.switchScreen(Game.Screen.loseScreen);
      }
    }
  }
}

// Define our Winning Screen
Game.Screen.startScreen = {
  enter: function() { console.log("Entered win screen"); },
  exit: function() { console.log("Exited win screen") },
  render: function(display) {
    // Render prompt to Screen
    var r = Math.round(Math.random() * 255);
    var g = Math.round(Math.random() * 255);
    var b = Math.round(Math.random() * 255);
    var background = ROT.Color.toRGB([r, g, b]);

    display.drawText(2, i + 1, "%b{" + background + "}You win!");
  },
  handleInput: function(inputType, inputData) {
    // Nothing to Do!
  }
}

// Define our Lose Screen
Game.Screen.startScreen = {
  enter: function() { console.log("Entered lose screen"); },
  exit: function() { console.log("Exited lose screen") },
  render: function(display) {
    // Render prompt to Screen
    for (var i = 0; i < 22; i++) {
      display.drawText(2, i + 1, "%b{red}You lose! :(");
    }
  },
  handleInput: function(inputType, inputData) {
    // Nothing to Do!
  }
}
