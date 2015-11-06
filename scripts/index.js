
var config = {
	killerBalls: [],
	fillerBalls: [],
	killers: {
		count: 2,
		speed: 1,
		speedIncrement: 1,
		radius: 20,
		fillColor: 'hotpink',
		strokeColor: '#678',
		increaseSpeed: function(killer) {
			killer.speed += config.killers.speedIncrement;
		},
		getSpawnLocation: function() {
			var minSpawnX = (view.bounds.top - config.killers.radius);
			var minSpawnY = (view.bounds.left - config.killers.radius);
			var maxSpawnX = (view.bounds.bottom + config.killers.radius);
			var maxSpawnY = (view.bounds.right + config.killers.radius);
			
			var spawnX = (Math.random() * (maxSpawnX - minSpawnX) + minSpawnX);
			var spawnY = (Math.random() * (maxSpawnY - minSpawnY) + minSpawnY);
			
			return [spawnX, spawnY];
		}
	},
	fillers: {
		fillColor: 'orange',
		strokeColor: '#678',
		growthRate: 1.03
	}
};

var newFiller;

for(var i = 0; i < config.killers.count; i++) {
	(function() {
		var killer = {
			ball: new Shape.Circle({
				center: config.killers.getSpawnLocation(),
				radius: config.killers.radius,
				strokeColor: config.killers.strokeColor,
				fillColor: config.killers.fillColor
			}),
			incX: 1,
			incY: 1,
			speed: config.killers.speed
		};
		 
		killer.ball.on('frame', function() {
			if(killer.ball.position.y + killer.ball.radius >= view.bounds.bottom) {
				killer.incY = -1 * killer.speed;
				config.killers.increaseSpeed(killer);
			}
			if(killer.ball.position.x + killer.ball.radius >= view.bounds.right) {
				killer.incX = -1 * killer.speed;
				config.killers.increaseSpeed(killer);
			}
			if(killer.ball.position.y - killer.ball.radius <= 0) {
				killer.incY = 1 * killer.speed;
				config.killers.increaseSpeed(killer);
			}
			if(killer.ball.position.x - killer.ball.radius <= 0) {
				killer.incX = 1 * killer.speed;
				config.killers.increaseSpeed(killer);
			}
			killer.ball.position += new Point(killer.incX, killer.incY);
		});
		
		config.killerBalls.push(killer);
	})();
}

view.on('frame', function() {
	if (newFiller) {
		newFiller.radius *= config.fillers.growthRate;
	}
});

view.on('mousedown', function(event) {
	newFiller = new Shape.Circle(new Point(event.point.x, event.point.y), 10)
	newFiller.strokeColor = config.fillers.strokeColor;
	newFiller.fillColor = config.fillers.fillColor;
});

view.on('mouseup', function(event) {
	newFiller = null;
});