Game.Item = function(properties) {
	properties = properties || {};
	// Call the dynamic glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);
};
// Make items inherit all the functionality from dynamic glyphs
Game.Item.extend(Game.DynamicGlyph);

Game.Item.prototype.describe = function() {
	return this._name;
};
Game.Item.prototype.describeA = function(capitalize) {
	// Optional parameter to capitalize the a/an.
	var prefixes = capitalize ? ['A','An'] : ['a','an'];
	var string = this.describe();
	var firstLetter = string.charAt(0).toLowerCase();
	// If word starts by a vowel, use an, else use a. Note that this is not perfect.
	var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
	
	return prefixes[prefix] + ' ' + string;
};
