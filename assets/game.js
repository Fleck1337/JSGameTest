window.onload = function() {
  
  // Check if rot.js is supported
  if (!ROT.isSupported()) {
    alert("The rot.js library is not supported in this broswer!");
  } else {
    
    // Create a display 80 chars wide and 20 chars high
    var display = new ROT.Display({width:80, height:20});
    var container = display.getContainer();
    
    // Add container to HTML page
    document.body.appendChild(container);
    var foreground, background, colors;
    
    for (var i = 0; i < 15; i++) {
      // Calculate the foreground colour, getting progressively darker
      // and the background colour, getting progressively lighter.
      foreground = ROT.Color.toRGB([255 - (i*20), 255 - (i*20), 255 - (i*20)]);
      background = ROT.Color.toRGB([i*20, i*20, i*20]);

      // Create the colour format specifier
      colors = "%c{" + foreground + "}%b{" + background + "}";
      
      // Draw the rect two colums in and at the row specified by i
      display.drawText(2, i, colors + "Hello World!");
    }
    
    
  }
}
