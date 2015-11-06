var c = new Shape.Circle(new Point(100, 100), 60);
var growthRate = 1.03;
var ballStroke = '#678';
var ballFill = 'orange'; 
var newBall;
c.strokeColor = '#678';
c.fillColor = 'hotpink';

var incx = incy = 1;
var speed = 1;

view.on('frame', function() {
	if(c.position.y + c.radius >= view.bounds.bottom) {
		incy = -1 * speed;
		speed++;
	}
	if(c.position.x + c.radius >= view.bounds.right) {
		incx = -1 * speed;
		speed++;
	}
	if(c.position.y - c.radius <= 0) {
		incy = 1 * speed;
		speed++;
	}
	if(c.position.x - c.radius <= 0) {
		incx = 1 * speed;
		speed++;
	}
	c.position += new Point(incx, incy);
});

view.on('frame', function() {
	if (newBall) {
		newBall.radius *= growthRate;
	}
});

view.on('mousedown', function(event) {
	console.log(event);
	newBall = new Shape.Circle(new Point(event.point.x, event.point.y), 10)
	newBall.strokeColor = ballStroke;
	newBall.fillColor = ballFill;
});

view.on('mouseup', function(event) {
	newBall = null;
});