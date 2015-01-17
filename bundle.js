(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/projects/sim/lib/main.js":[function(require,module,exports){
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
},{"fd-vec2":"/Users/jason/dev/projects/sim/node_modules/fd-vec2/index.js"}],"/Users/jason/dev/projects/sim/node_modules/fd-vec2/Vec2.js":[function(require,module,exports){
module.exports = Vec2;

var sqrt    = Math.sqrt,
    cos     = Math.cos,
    sin     = Math.sin,
    atan2   = Math.atan2;

function Vec2(x, y) {
    this.x = x;
    this.y = y;
}

//
// Clone

Vec2.prototype.clone = function() {
    return new Vec2(this.x, this.y);
}

//
// Operations returning new vectors

Vec2.prototype.add = function(rhs) {
    return new Vec2(this.x + rhs.x, this.y + rhs.y);
}

Vec2.prototype.sub = function(rhs) {
    return new Vec2(this.x - rhs.x, this.y - rhs.y);
}

Vec2.prototype.mul = function(rhs) {
    return new Vec2(this.x * rhs, this.y * rhs);
}

Vec2.prototype.div = function(rhs) {
    return new Vec2(this.x / rhs, this.y / rhs);
}

Vec2.prototype.normalize = function() {
    var mag = this.magnitude();
    return new Vec2(this.x / mag, this.y / mag);
}

Vec2.prototype.limit = function(max) {
    var mag = this.magnitude();
    if (mag < max) {
        return this;
    } else {
        return new Vec2( (this.x / mag) * max, (this.y / mag) * max );
    }
}

Vec2.prototype.midpoint = function() {
    return new Vec2(this.x/2, this.y/2);
}

Vec2.prototype.adjust = function(rhs, amount) {
    return new Vec2(
        this.x + rhs.x * amount,
        this.y + rhs.y * amount
    );
}

//
// Modify in place

Vec2.prototype.add_ = function(rhs) {
    this.x += rhs.x;
    this.y += rhs.y;
}

Vec2.prototype.sub_ = function(rhs) {
    this.x -= rhs.x;
    this.y -= rhs.y;
}

Vec2.prototype.mul_ = function(rhs) {
    this.x *= rhs;
    this.y *= rhs;
}

Vec2.prototype.div_ = function(rhs) {
    this.x /= rhs;
    this.y /= rhs;
}

Vec2.prototype.normalize_ = function() {
    var mag = this.magnitude();
    this.x /= mag;
    this.y /= mag;
}

Vec2.prototype.limit_ = function(max) {
    var mag = this.magnitude();
    if (mag < max) {
        return;
    } else {
        this.x = (this.x / mag) * max;
        this.y = (this.y / mag) * max;
    }
}

Vec2.prototype.midpoint_ = function() {
    this.x /= 2;
    this.y /= 2;
}

Vec2.prototype.adjust_ = function(rhs, amount) {
    this.x += rhs.x * amount;
    this.y += rhs.y * amount;
}

//
// Scalar

Vec2.prototype.eq = function(rhs) {
    return this.x === rhs.x && this.y === rhs.y;
}

Vec2.prototype.distance = function(rhs) {
    var dx = this.x - rhs.x,
        dy = this.y - rhs.y;
    return sqrt(dx*dx + dy*dy);
}

Vec2.prototype.distancesq = function(rhs) {
    var dx = this.x - rhs.x,
        dy = this.y - rhs.y;
    return dx*dx + dy*dy;
}

Vec2.prototype.magnitude = function() {
    return sqrt(this.x*this.x + this.y*this.y);
}

Vec2.prototype.magnitudesq = function() {
    return this.x*this.x + this.y*this.y;
}

Vec2.prototype.cross = function(rhs) {
    return this.x*rhs.y - this.y*rhs.x;
}

Vec2.prototype.dot = function(rhs) {
    return this.x*rhs.x + this.y*rhs.y;
}

// returns angle through which this vector must be rotated to equal rhs
Vec2.prototype.angle = function(rhs) {
    return atan2(rhs.cross(this), rhs.dot(this));
}
},{}],"/Users/jason/dev/projects/sim/node_modules/fd-vec2/index.js":[function(require,module,exports){
var sqrt    = Math.sqrt,
    cos     = Math.cos,
    sin     = Math.sin,
    atan2   = Math.atan2;

//
// Smart constructor

module.exports = exports = smartConstructor;
function smartConstructor(x, y) {
    switch (arguments.length) {
        case 0: return zero();
        case 1: return clone(x);
        case 2: return make(x, y);
        default: throw new Error("invalid number of arguments to vec2 smart constructor");
    }
}

//
// Class

var Vec2 = require('./Vec2');
exports.Vec2 = Vec2;

//
// Constructors

exports.zero = zero;
function zero() {
    return new Vec2(0, 0);
}

exports.clone = clone;
function clone(vec) {
    return new Vec2(vec.x, vec.y);
}

exports.make = make;
function make(x, y) {
    return new Vec2(x, y);
}

//
// Library

exports.eq = function(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y;
}

exports.add = function(v1, v2, out) {
    out.x = v1.x + v2.x;
    out.y = v1.y + v2.y;
}

exports.sub = function(v1, v2, out) {
    out.x = v1.x - v2.x;
    out.y = v1.y - v2.y;
}

exports.mul = function(v, s, out) {
    out.x = v.x * s;
    out.y = v.y * s;
}

exports.div = function(v, s, out) {
    out.x = v.x / s;
    out.y = v.y / s;
}

exports.normalize = function(v, out) {
    var mag = sqrt(v.x * v.x + v.y * v.y);
    out.x = v.x / mag;
    out.y = v.y / mag;
}

exports.limit = function(v, max, out) {
    var mag = sqrt(v.x * v.x + v.y * v.y);
    if (mag < max) {
        out.x = v.x;
        out.y = v.y;
    } else {
        out.x = (v.x / mag) * max;
        out.y = (v.y / mag) * max;
    }
}

// exports.transform = function(vec, pos, rotation, out) {
//     var nx = pos.x + (Math.cos(rotation) * vec.x - Math.sin(rotation) * vec.y);
//     out.y = pos.y + (Math.sin(rotation) * vec.x - Math.sin(rotation) * vec.y);
//     out.x = nx;
// }

exports.distance = function(v1, v2) {
    var dx = v1.x - v2.x, dy = v1.y - v2.y;
    return Math.sqrt(dx*dx + dy*dy);
}

exports.distancesq = function(v1, v2) {
    var dx = v1.x - v2.x, dy = v1.y - v2.y;
    return dx*dx + dy*dy;
}

exports.magnitude = magnitude;
function magnitude(v) {
    return sqrt(v.x*v.x + v.y*v.y);
}

exports.magnitudesq = function(v) {
    return v.x*v.x + v.y*v.y;
}

exports.midpoint = function(v, out) {
    out.x = v.x / 2;
    out.y = v.y / 2;
}

exports.adjust = function(v, delta, amount, out) {
    out.x = v.x + delta.x * amount;
    out.y = v.y + delta.y * amount;
}

exports.cross = cross;
function cross(v1, v2) {
    return v1.x*v2.y - v1.y*v2.x;
}

exports.dot = dot;
function dot(v1, v2) {
    return v1.x*v2.x + v1.y*v2.y;
}

// returns angle through which v1 must be rotated to equal v2
exports.angle = function(v1, v2) {
    return atan2(cross(v2, v1), dot(v2, v1));
}

},{"./Vec2":"/Users/jason/dev/projects/sim/node_modules/fd-vec2/Vec2.js"}]},{},["/Users/jason/dev/projects/sim/lib/main.js"]);
