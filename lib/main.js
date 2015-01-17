var vec2	= require('fd-vec2');

var canvas			= null;
var ctx 			= null;
var canvasWidth		= null;
var canvasHeight	= null;
var mousePos		= vec2.zero();

function randf1(max) {
	return Math.random() * max;
}

function randf2(min, max) {
	return min + (Math.random() * (max - min));
}

function Thing() {
	this.position = vec2.make(randf1(canvasWidth), randf1(canvasHeight / 3));
	this.velocity = vec2.make(0, 0);
	this.acceleration = vec2.zero();
	this.mass = 1.5 + Math.random() * 4;
}

var forceScratch = vec2.make();
Thing.prototype.applyForce = function(force) {
	vec2.div(force, this.mass, forceScratch);
	vec2.add(this.acceleration, forceScratch, this.acceleration);
}

Thing.prototype.update = function() {

	// var toMouse = mousePos.sub(this.position);
	// vec2.mul(toMouse, toMouse.magnitude() / 20000, this.acceleration);


	// vec2.sub(mousePos, this.position, this.acceleration);
	// this.acceleration.normalize_();
	// this.acceleration.mul_(0.5);


	// this.acceleration = vec2.make(randf2(-1,1), randf2(-1, 1));
	// this.acceleration.mul_(randf1(2));

	this.velocity.add_(this.acceleration);
	this.velocity.limit_(20);
	this.position.add_(this.velocity);
	
	if (this.position.x > canvasWidth) {
		this.position.x -= canvasWidth;
	} else if (this.position.x < 0) {
		this.position.x += canvasWidth;
	}

	if (this.position.y > canvasHeight) {
		this.velocity.y *= -1;
		this.position.y = canvasHeight;
	}

	// if (this.position.y > canvasHeight) {
	// 	this.position.y -= canvasHeight;
	// } else if (this.position.y < 0) {
	// 	this.position.y += canvasHeight;
	// }

	this.acceleration.x = 0;
	this.acceleration.y = 0;

}

Thing.prototype.draw = function() {
	ctx.beginPath();
	ctx.globalAlpha = this.mass / 5;
	ctx.arc(this.position.x, this.position.y, 5 * this.mass, 0, Math.PI * 2, false);
	ctx.fill();
}

var things = [];

window.init = function() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	canvas.addEventListener('mousemove', function(evt) {
		mousePos.x = evt.offsetX;
		mousePos.y = evt.offsetY;
	});

	for (var i = 0; i < 20; ++i) {
		things.push(new Thing());
	}
	
	setInterval(update, 40);
}

function update() {
	
	var wind = vec2.make(0.01, 0);
	var gravity = vec2.zero();
	var airFriction = vec2.zero();
	var fluidFriction = vec2.zero();
	var fluidDragCoefficient = 0.2;

	things.forEach(function(thing) {
		
		thing.applyForce(wind);
		
		gravity.y = thing.mass * 0.5;
		thing.applyForce(gravity);

		if (thing.velocity.x != 0 || thing.velocity.y != 0) {
			if (thing.position.y < canvasHeight / 2) {
				vec2.mul(thing.velocity, -1, airFriction);
				airFriction.normalize_();
				airFriction.mul_(0.01);
				thing.applyForce(airFriction);	
			} else {
				var dragMag = fluidDragCoefficient * thing.velocity.magnitudesq();
				vec2.mul(thing.velocity, -1, fluidFriction);
				fluidFriction.normalize_();
				fluidFriction.mul_(dragMag);
				thing.applyForce(fluidFriction);
			}
		}

		thing.update();

	});

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = '#505050';
	ctx.fillRect(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
	ctx.fillStyle = 'black';

	things.forEach(function(thing) {

		thing.draw();
	});
}