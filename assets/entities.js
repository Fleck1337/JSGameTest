// Player Template
Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	maxHp: 40,
	attackValue: 10,
	sightRadius: 6,
	inventorySlots: 22,
	mixins: [Game.EntityMixins.PlayerActor,
		Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
		Game.EntityMixins.InventoryHolder, Game.EntityMixins.FoodConsumer,
		Game.EntityMixins.Sight, Game.EntityMixins.MessageRecipient,
		Game.EntityMixins.Equipper]
};

// Create our central entity repository
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
	name: 'fungus',
	character: 'F',
	foreground: 'green',
	maxHp: 10,
	speed: 250,
	mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: 'B',
	foreground: 'white',
	maxHp: 5,
	attackValue: 4,
	speed: 2000,
	mixins: [Game.EntityMixins.TaskActor, 
		 Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
		 Game.EntityMixins.CorpseDropper]
});

Game.EntityRepository.define('newt', {
	name: 'newt',
	character: ':',
	foreground: 'yellow',
	maxHp: 3,
	attackValue: 2,
	mixins: [Game.EntityMixins.TaskActor, 
		 Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
		 Game.EntityMixins.CorpseDropper]
});

Game.EntityRepository.define('kobold', {
	name: 'kobold',
	character: 'k',
	foreground: 'white',
	maxHp: 6,
	attackValue: 4,
	sightRadius: 5,
	taskS: ['hunt', 'wander'],
	mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
		 Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
		 Game.EntityMixins.CorpseDropper]
});

/*
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
*/
