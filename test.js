var i = require("./index.js");
var vlc = new i.VLC_RC({verbose:false, debug:true, manual:true});
vlc.loadFile("/home/fabian/Downloads/testv.mp4");
vlc.loadFile("/home/fabian/Downloads/t2.mp4");
//vlc.pause();
//vlc.play();