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