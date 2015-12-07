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

	Ball.prototype.collidesWith = function(point, radius) {
		if(arguments.length === 1 && point instanceof Ball) {
			radius = point.shape.radius;
			point = point.shape.position;
		}
		var dist = this.shape.position.getDistance(point);
		return dist < this.shape.radius + radius && dist !== 0;
	};

	Ball.prototype.grow = function(rate) {
		var radius = this.shape.radius * rate,
			point = new paper.Point(this.shape.position);

		if(!this.isBoundX(point, radius) || !this.isBoundY(point, radius)) {
			return false;
		}

		this.shape.radius *= rate;
	};

	Ball.prototype.moveTo = function(point) {
		this.shape.position = this.boundPosition(point);
	};

	Ball.prototype.isBoundX = function(point, radius) {
		radius = radius || this.shape.radius;

		return point.x - radius >= 0 && point.x + radius <= this.view.bounds.right;
	};

	Ball.prototype.isBoundY = function(point, radius) {
		radius = radius || this.shape.radius;

		return point.y - radius >= 0 && point.y + radius <= this.view.bounds.bottom;
	};

	Ball.prototype.boundPosition = function(point, radius) {
		radius = radius || this.shape.radius;

		if(!this.isBoundX(point, radius)) {
			point.x = this.shape.position.x;
		}
		if(!this.isBoundY(point, radius)) {
			point.y = this.shape.position.y;
		}
		return point;
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
			/*
			 * TODO
			 * Maybe this will cause it to grow into a collision?
			 * We only check for collisions before growing by the looks of it
			 */
			newFiller.grow(config.fillers.growthRate);
		}
	});

	var tool = new paper.Tool();

	tool.on('mousemove', function(e) {
		if(newFiller) {
			var point = newFiller.boundPosition(e.point);

			if(!config.fillerBalls.some(function(item) {
				return item !== newFiller && item.collidesWith(point, newFiller.shape.radius);
			})) {
				newFiller.moveTo(point);
			}
		}
	});

	view.on('mousedown', function(e) {
		var radius = 10;
		var killerCollision = config.killerBalls.some(function(item) {
				return item.shape.contains(e.point) || item.collidesWith(e.point, radius);
			}),
			fillerCollision = config.fillerBalls.some(function(item) {
				return item.shape.contains(e.point) || item.collidesWith(e.point, radius);
			});

		if(killerCollision || fillerCollision) {
			return;
		}

		newFiller = new Ball({
			type: 'filler',
			view: view,
			shape: new paper.Shape.Circle({
				center: e.point,
				radius: radius,
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
