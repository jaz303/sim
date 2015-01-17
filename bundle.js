(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/jason/dev/projects/sim/lib/main.js":[function(require,module,exports){
var canvas			= null;
var ctx 			= null;
var canvasWidth		= null;
var canvasHeight	= null;

window.init = function() {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;

	console.log("boot!");
}
},{}]},{},["/Users/jason/dev/projects/sim/lib/main.js"]);
