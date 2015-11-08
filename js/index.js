/*global paper:false */
(function(paper) {
	'use strict';
	
	var view = paper.view;

	var Ball = function(opts) {
		this.shape = opts.shape || null;
		this.type = opts.type || 'killer';
		this.speed = opts.speed || 1;
		this.view = opts.view;
		this.maxSpeed = opts.maxSpeed || 100;
		this.defaultSpeedIncrement = opts.defaultSpeedIncrement || 1;
		this.active = opts.active || true;
		this.inc = {
			x: 1,
			y: 1
		};

		if(this.type === 'killer') {
			this._initialiseKiller();
		} else if(this.type === 'filler') {
			this._initialiseFiller();
		}
	};

	Ball.prototype._initialiseKiller = function() {
		var self = this;

		this.shape.on('frame', function() {
			var inc = {
				x: self.inc.x,
				y: self.inc.y
			};

			if(!self.active) {
				return;
			}
			if(self.shape.position.y + self.shape.radius >= self.view.bounds.bottom) {
				inc.y = -1 * self.speed;
			}
			if(self.shape.position.x + self.shape.radius >= self.view.bounds.right) {
				inc.x = -1 * self.speed;
			}
			if(self.shape.position.y - self.shape.radius <= 0) {
				inc.y = 1 * self.speed;
			}
			if(self.shape.position.x - self.shape.radius <= 0) {
				inc.x = 1 * self.speed;
			}
			if(inc.x !== self.inc.x || inc.y !== self.inc.y) {
				self.inc.x = inc.x;
				self.inc.y = inc.y;
				self.increaseSpeed();
			}
			self.shape.position += new paper.Point(self.inc.x, self.inc.y);
		});
	};

	Ball.prototype._initialiseFiller = function() {
		var self = this;

		this.shape.on('frame', function() {
			if(!self.active) {
				return;
			}
		});
	};

	Ball.prototype.remove = function() {
		this.shape.remove();
	};

	Ball.prototype.increaseSpeed = function(inc) {
		inc = inc || this.defaultSpeedIncrement;

		if(this.speed === this.maxSpeed) {
			return;
		}

		if(this.speed + inc > this.maxSpeed) {
			this.speed = this.maxSpeed;
			return;
		}

		this.speed += inc;
	};

	Ball.prototype.decreaseSpeed = function(inc) {
		return this.increaseSpeed(inc * -1);
	};

	Ball.prototype.collidesWith = function(ball) {
		var dist = this.shape.position.getDistance(ball.shape.position);
		return dist < this.shape.radius + ball.shape.radius && dist !== 0;
	};

	var randomiseNumber = function(minimum, maximum) {
		return (Math.random() * (maximum - minimum) + minimum);
	};

	var config = {
		killerBalls: [],
		fillerBalls: [],
		killers: {
			count: 2,
			speed: 1,
			maxSpeed: 8,
			speedIncrement: 1,
			radius: 20,
			fillColor: 'hotpink',
			strokeColor: '#678',
			getSpawnLocation: function() {
				var minSpawnX = (view.bounds.left + config.killers.radius);
				var maxSpawnX = (view.bounds.right - config.killers.radius);
				var minSpawnY = (view.bounds.top + config.killers.radius);
				var maxSpawnY = (view.bounds.bottom - config.killers.radius);
				
				var spawnX = randomiseNumber(minSpawnX, maxSpawnX);
				var spawnY = randomiseNumber(minSpawnY, maxSpawnY);
				
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
			var killer = new Ball({
				type: 'killer',
				view: view,
				speed: config.killers.speed,
				maxSpeed: config.killers.maxSpeed,
				defaultSpeedIncrement: config.killers.speedIncrement,
				shape: new paper.Shape.Circle({
					center: config.killers.getSpawnLocation(),
					radius: config.killers.radius,
					strokeColor: config.killers.strokeColor,
					fillColor: config.killers.fillColor
				})
			});
			
			config.killerBalls.push(killer);
		})();
	}

	view.on('frame', function() {
		if (newFiller) {
			var newRadius = newFiller.shape.radius * config.fillers.growthRate;

			if(newFiller.shape.position.x - newRadius < 0 || newFiller.shape.position.y - newRadius < 0) {
				return;
			}
			if(newFiller.shape.position.x + newRadius > view.right || newFiller.shape.position.y + newRadius > view.bottom) {
				return;
			}
			if(config.killerBalls.some(function(item) {
				return item.collidesWith(newFiller);
			})) {
				newFiller.remove();
				config.fillerBalls.splice(config.fillerBalls.indexOf(newFiller), 1);
				newFiller = null;
				return;
			}
			if(config.fillerBalls.some(function(item) {
				return item.collidesWith(newFiller);
			})) {
				return;
			}
			newFiller.shape.radius *= config.fillers.growthRate;
		}
	});

	view.on('mousemove', function(e) {
		if(newFiller) {
			if(e.point.x - newFiller.shape.radius < 0 || e.point.y - newFiller.shape.radius < 0) {
				return;
			}
			if(e.point.x + newFiller.shape.radius > view.right || e.point.y + newFiller.shape.radius > view.bottom) {
				return;
			}
			if(config.fillerBalls.some(function(item) {
				return item.collidesWith(newFiller);
			})) {
				return;
			}
			newFiller.shape.position = e.point;
		}
	});

	view.on('mousedown', function(e) {
		var killerCollision = config.killerBalls.some(function(item) {
				return item.shape.contains(e.point);
			}),
			fillerCollision = config.fillerBalls.some(function(item) {
				return item.shape.contains(e.point);
			});

		if(killerCollision || fillerCollision) {
			return;
		}
		newFiller = new Ball({
			type: 'filler',
			view: view,
			shape: new paper.Shape.Circle({
				center: e.point,
				radius: 10,
				strokeColor: config.fillers.strokeColor,
				fillColor: config.fillers.fillColor
			})
		});
		config.fillerBalls.push(newFiller);
	});

	view.on('mouseup', function() {
		newFiller = null;
	});
})(paper);
