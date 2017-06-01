//Get Child Process
var spawn = require('child_process').spawn; 
var VLC_RC = function(options) {
	this.options = options || {};
	if(!this.options.hasOwnProperty('verbose')) {
		this.options.verbose=false;
	}
	if(!this.options.hasOwnProperty('debug')) {
		this.options.debug=false;
	}
	var args = [
		"-I rc", //Remote Control Interface
		"--play-and-pause", //Pause at end of Movie
		"--fullscreen" //Start in Fullscreen
	];
	this.vlc_process = spawn('vlc', args);
	if(options.verbose) {
		console.log("\x1b[37m\x1b[1m","VLC Process created","\x1b[21m");
		console.log("Options:");
		console.log("\x1b[44m\x1b[37m",this.options,"\x1b[0m");
	}
	if(options.debug) {
		this.vlc_process.stdout.pipe(process.stdout);
		this.vlc_process.stderr.pipe(process.stderr);
	}
}
VLC_RC.prototype.hello = function() {
	//console.log(this.options);
}
module.exports.VLC_RC = VLC_RC;


