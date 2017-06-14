//Get Child Process
var spawn = require('child_process').spawn; 

class VLC_RC {
	constructor(options) {
		this.options = options || {};
		this.outData = "";
		this.commandAnswer = [];
		this.activeCommand = {callback:undefined};
		this.commandQueue = []; //{command, callback}
		this.startTime = undefined;
		this.passedTime = undefined;
		this.playing = false;

		/*if(!this.options.hasOwnProperty('verbose')) {
	   	this.options.verbose=false;
	   }
	   if(!this.options.hasOwnProperty('debug')) {
	   	this.options.debug=false;
	   }*/

		var args = [
			"-I rc", //Remote Control Interface
			"--play-and-pause", //Pause at end of Movie
			//"--fullscreen" //Start in Fullscreen
		];

		this.vlc_process = spawn('cvlc', args);
		if(options.verbose) {
			console.log("\x1b[37m\x1b[1m","VLC Process created","\x1b[21m");
			console.log("Options:");
			console.log("\x1b[44m\x1b[37m",this.options,"\x1b[0m");
		}
		if(options.debug) {
			this.debug = true;
			if(options.manual) {
				process.stdin.on("data", (data)=>{
					this.vlc_process.stdin.write(data);
				});
			}
		} else {
			this.debug = false;
		}

		this.vlc_process.stdout.on("data", this.onStdOut.bind(this));
	}

	onStdOut(data) {
		if(this.debug) process.stdout.write(data);
		this.outData += data;
		var line = "";
		for(let i = 0; i < this.outData.length; i++){
			if(this.outData[i] == "\n") { //New Line
				if(line.length <= 0) continue;
				this.commandAnswer.push(line);
				line = "";
			} else {
				line += this.outData[i];
			}
		}
		if(line[0] == ">") { //Neuer Befehr erwartet
			if(this.activeCommand){
				if(this.activeCommand.callback) this.activeCommand.callback(this.commandAnswer.slice(0));
				this.activeCommand = undefined;
			}
			this.commandAnswer = [];
			line = "";
			this.nextCommand();
		}
		this.outData = line;
	}

	nextCommand(){
		if(this.activeCommand != undefined) return;
		if(this.commandQueue.length < 1) return;
		var c = this.commandQueue[0];
		this.activeCommand = c;
		this.vlc_process.stdin.write(c.command + "\n");
		if(this.debug) process.stdout.write(c.command + "\n");
		this.commandQueue.splice(0, 1);
	}

	runCommand(command, callback){
		this.commandQueue.push({command:command, callback:callback});
		this.nextCommand();
	}

	test() {
		console.log(this);
	}

	loadFile(path, callback) {
		//ToDo remove all other files
		this.runCommand("playlist", (data)=>{
			data.forEach(function(element) {
				var d = element.replace(/\D/g,'');
				if(d.length < 1) return;
				this.runCommand("delete " + d[0]);
			}, this);
			this.runCommand("enqueue " + path, callback);
		});
	}

	play(callback) {
		this.runCommand("play", ()=>{
			this.playing = true;
			if(this.passedTime) {
				this.startTime = new Date().getTime() - this.passedTime();
			} else {
				this.startTime = new Date().getTime();
			}
		});
	}

	getTime(callback) {
		this.getOrigTime((data)=>{
			if(!this.startTime) return data;
			var dif =  new Date().getTime() - this.startTime;
			var difr = Math.floor(dif/1000);
			if(difr != data){
				this.startTime = new Date().getTime() - data*1000;
				return callback(data);
			}
			return callback(dif);
		});
	} 

	getOrigTime(callback) {
		this.runCommand("get_time", (data)=>{
			callback(Number(data));
		});
	}

	pause(callback) {
		this.runCommand("pause", ()=>{
			this.passedTime = new Date().getTime() - this.startTime;
			this.startTime = undefined;
			callback();
		});
	}

	stop(callback) {
		this.runCommand("stop", callback);
		this.startTime = undefined;
		this.passedTime = undefined;
	}

	getState(callback){
		this.getOrigTime((time)=>{
			this.runCommand("get_length", (data)=>{
				if(time >= Number(data[0])) this.playing = false;
				else this.playing = true;
				callback(this.playing);
			});
		});
	}
}

module.exports.VLC_RC = VLC_RC;