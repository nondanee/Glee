const playBar = document.getElementById("playbar")
const timeline = document.getElementById("timeline")
const progressbar = document.getElementById("progressbar")
const playlist = document.getElementById("playlist")

const btn = {
	previous:document.getElementById("controller").children[0],
	play:document.getElementById("controller").children[1],
	next:document.getElementById("controller").children[2],
	random:document.getElementById("controller").children[3],
	cycle:document.getElementById("controller").children[4],
	extend:playBar.getElementsByClassName("cover")[0],
	fold:playBar.getElementsByClassName("fold")[0],
	list:document.getElementById("extra").getElementsByClassName("list")[0],
	download:document.getElementById("extra").getElementsByClassName("download")[0]
}

btn.extend.onclick = function(){
	playBar.setAttribute("class","extend")
}
btn.fold.onclick = function(){
	playBar.setAttribute("class","")
}
btn.list.onclick = function(){
	if (playBar.getAttribute("class")!="extend list"){
		playBar.setAttribute("class","extend list")
		var entryPlaying = playlist.getElementsByClassName("entry playing")
		if(entryPlaying.length==1)
			playlist.scrollTop = entryPlaying[0].offsetTop
	}
	else if(playBar.getAttribute("class")=="extend list"){
		playBar.setAttribute("class","extend")
	}
}
btn.download.onclick = function(){
	var songId = player.list[player.index]
	songDownload(songId)
}


const player = {
	audio:new Audio(),
	_list:[],
	_index:0,
	_random:0,
	_cycle:0,
	pause:function(){
		this.audio.pause()
	},
	play:function(){
		this.audio.play()
	},
	previous:function(){
		if(this.audio.currentTime>2){
		this.audio.currentTime = 0
		}
		else if(this._index==0&&this._cycle==0){
			this.audio.currentTime = 0
			this.audio.pause()
		}
		else{
			this.index = (this._index-1+this._list.length)%this._list.length
			readyPlay()
		}
	},
	next:function(){
		this.index = (this._index+1)%this._list.length
		readyPlay()
	},
	setProgress:function(progressValue){
		var expectTime = this.audio.duration * progressValue
		if (this.audio.seekable.length!=0){
			var seekAble = 0
			for (var x=0;x<this.audio.seekable.length;x++){
				if(expectTime >= this.audio.seekable.start(x)&&expectTime <= this.audio.seekable.end(x)){
					this.audio.currentTime = expectTime
					return
				}
			}
			this.audio.currentTime = this.audio.buffered.end(this.audio.buffered.length-1)
		} 
	}
}
Object.defineProperty(player,"paused",{
	get : function(){
		return this.audio.paused
	}
});
Object.defineProperty(player,"duration",{
	get : function(){
		return this.audio.duration
	}
});
Object.defineProperty(player,"src",{
	set : function(value){
		this.audio.src = value
	},
	get : function(){
		return this.audio.src
	}
});
Object.defineProperty(player,"list",{
	get: function(){
		return this._list;
	},
	set : function(value){
		this._list = value
		rebuildPlayList()
	}
});
Object.defineProperty(player,"index",{
	get: function(){
		return this._index;
	},
	set : function(value){
		if(value>this.list.length-1){
			this._index = 0
		}
		else{
			this._index = value
		}
		
		var entries = playlist.getElementsByClassName("entry")
		if(entries.length!=player.list.length)
			return // create now
		for(var x=0;x<entries.length;x++){
			if(player.index!=x)
				entries[x].setAttribute("class","entry")
			else
				entries[x].setAttribute("class","entry playing")
		}
		//sync playlist
	}
});
Object.defineProperty(player,"random",{
	get: function(){
		return this._random;
	},
	set : function(value){
		if(value!=0&&value!=1)
			return
		this._random = value
		if (this._random==0){
			btn.random.setAttribute("title","循环播放:关闭")
			btn.random.setAttribute("class","random off")
		}
		else if(this._random==1){
			btn.random.setAttribute("title","循环播放:打开")
			btn.random.setAttribute("class","random on")
		}
	}
});
Object.defineProperty(player,"cycle",{
	get: function(){
		return this._cycle;
	},
	set : function(value){
		if(value!=0&&value!=1&&value!=2)
			return
		this._cycle = value
		if (this._cycle==0){
			btn.cycle.setAttribute("title","重复播放:关闭")
			btn.cycle.setAttribute("class","cycle off")
		}
		else if(this._cycle==1){
			btn.cycle.setAttribute("title","重复播放:全部")
			btn.cycle.setAttribute("class","cycle all")
		}
		else if(this._cycle==2){
			btn.cycle.setAttribute("title","重复播放:单曲")
			btn.cycle.setAttribute("class","cycle single")
		}
	}
});


const storage = require('electron-json-storage')
storage.get('player', function(error, reserve) {
	if (error) throw error;
	if ("list" in reserve&&"index" in reserve&&"random" in reserve&&"cycle" in reserve){
		player.list = reserve.list
		player.index = reserve.index
		player.random = reserve.random
		player.cycle = reserve.cycle
		if(player.list.length!=0){
			readyPlay(0)
		}
	}
	console.log(reserve);
});

btn.play.onclick = function(){
	if(player.paused==true)
		player.play()
	else if(player.paused==false)
		player.pause()
}
btn.previous.onclick = function(){
	player.previous()
}
btn.next.onclick = function(){
	player.next()
}
btn.cycle.onclick = function(){
	player.cycle = (player.cycle+1)%3
}
btn.random.onclick = function(){
	player.random = !player.random
}


player.audio.addEventListener('play',function(){
	btn.play.setAttribute("class","pause")
},false);
player.audio.addEventListener('pause',function(){
	btn.play.setAttribute("class","play")
},false);
player.audio.addEventListener('ended',function(){
	if(player.cycle==2){//single cycle priority
		readyPlay()
	}
	else if(player.random==1){//random play
		while(true){
			var nextIndex = Math.floor(Math.random()*player.list.length)
			if(nextIndex!=player.index)
				break
		}
		player.index = nextIndex
		readyPlay()
	}
	else if(player.cycle==0){//cycle off
		if(player.index+1!=player.list.length){
			player.index = player.index+1
			readyPlay()
		}
		else{
			this.currentTime = 0
		}
	}
	else if(player.cycle==1){//all cycle
		player.index = (player.index+1)%player.list.length
		readyPlay()
	}
},false);
player.audio.addEventListener('canplaythrough',function(){
	let totalTime = timeline.getElementsByClassName("time total")[0]
	totalTime.innerHTML = secondReadable(this.duration)
	if (!("duration" in songInfo[player.list[player.index]])){
		songInfo[player.list[player.index]]["duration"] = Math.floor(this.duration*1000)
	}
},false);
player.audio.addEventListener('timeupdate',function(){
	let playedTime = timeline.getElementsByClassName("time played")[0]
	let playedFiller = progressbar.getElementsByClassName("filler played")[0]
	let cursor = progressbar.getElementsByClassName("cursor")[0]

	if (!isNaN(this.duration)) {
		var progressValue = this.currentTime/this.duration;
		if(progressValue == 1){
			progressValue = 0 ;
		}
		playedFiller.style.width = "calc(" + progressValue + " * (100% - " + cursor.offsetWidth + "px))"
		playedTime.innerHTML = secondReadable(this.currentTime)
	};
},false);


progressbar.onmousedown = function(event){

	let cursor = progressbar.getElementsByClassName("cursor")[0]
	let playedTime = timeline.getElementsByClassName("time played")[0]
	let playedFiller = this.getElementsByClassName("filler played")[0]

	// let startY = event.clientY
	let startX = event.clientX
	let maxWidth = this.offsetWidth - cursor.offsetWidth
	let offsetLeft = this.offsetLeft + timeline.offsetLeft

	var reviseWidth = event.clientX - offsetLeft - cursor.offsetWidth/2
	var reviseProgressValue = reviseWidth/maxWidth

	// playedTime.innerHTML = secondReadable(player.duration*reviseProgressValue)
	// playedFiller.style.width = "calc(" + reviseProgressValue + " * (100% - " + cursor.offsetWidth + "px))"

	var alreadyPause = true
	if(!player.paused){
		player.pause()
		alreadyPause = false
	}
	
	document.onmousemove = function(event){
		// if (Math.abs(event.clientY - startY) <= 36){
			reviseWidth = event.clientX - offsetLeft - cursor.offsetWidth/2
			if (reviseWidth>maxWidth)
				reviseProgressValue = 1
			else if(reviseWidth<0)
				reviseProgressValue = 0
			else
				reviseProgressValue = reviseWidth/maxWidth

			playedTime.innerHTML = secondReadable(player.duration*reviseProgressValue)
			playedFiller.style.width = "calc(" + reviseProgressValue + " * (100% - " + cursor.offsetWidth + "px))"
		// }
	}
	document.onmouseup = function(event){

		player.setProgress(reviseProgressValue)
		if(!alreadyPause){
			player.play()
		}

		document.onmousemove = null
		document.onmouseup = null
	}
}

function secondReadable(secondValue){
	if(isNaN(secondValue)){
		return "0:00"
	}
	var minutes = Math.floor(secondValue/60)
	var seconds = Math.floor(secondValue - minutes*60)
	seconds = (seconds < 10) ? "0"+seconds.toString() : seconds.toString()
	return minutes.toString() + ":" + seconds
}

function rebuildPlayList(){

	while(playlist.childNodes.length!=0){
		playlist.removeChild(playlist.childNodes[0]);
	}
	
	for (var x=0;x<player.list.length;x++){
		var songId = player.list[x]
		if (!(songId in songInfo)){
			getSongInfo(songId,rebuildPlayList)
			return
		}
		var songName = songInfo[songId]["songName"]
		var songDuration = secondReadable(songInfo[songId]["duration"]/1000)
		var artistName = artistInfo[songInfo[songId]["artistId"]]["artistName"]
		var albumName = albumInfo[songInfo[songId]["albumId"]]["albumName"]
		var entry = document.createElement('div')
		entry.setAttribute("class","entry")
		var song = document.createElement('a')
		song.setAttribute("class","song")
		song.innerHTML = songName
		var play = document.createElement('button')
		play.setAttribute("class","play")
		play.setAttribute("index",x)
		play.onclick = function (){
			player.index = parseInt(this.getAttribute("index"))
			readyPlay()
		}
		var remove = document.createElement('button')
		remove.setAttribute("class","remove")
		remove.setAttribute("index",x)
		remove.onclick = function (){
			index = this.getAttribute("index")
			list = player.list
			list.splice(index,1)//slice on origin array can not touch set func
			player.list = list
			if(index==player.index)
				readyPlay()
		}
		entry.appendChild(song)
		entry.appendChild(play)
		entry.appendChild(remove)
		var related = document.createElement('span')
		related.setAttribute("class","related")

		var artist = document.createElement('a')
		artist.setAttribute("class","artist")
		artist.innerHTML = artistName
		var album = document.createElement('a')
		album.setAttribute("class","album")
		album.innerHTML = albumName
		var duration = document.createElement('a')
		duration.setAttribute("class","duration")
		duration.innerHTML = songDuration
		related.appendChild(artist)
		related.appendChild(album)
		related.appendChild(duration)
		entry.appendChild(related)
		if (x==player.index)
		entry.setAttribute("class","entry playing")
		playlist.appendChild(entry)
	}
}



function readyPlay(playNow=1,songId=player.list[player.index]){

	if (!(songId in songInfo)){
		getSongInfo(songId,readyPlay,playNow,songId)
		return
	}

	var playStatus = checkSongUrlStatus(songId)
	if (playStatus==0){
		getSongUrl(songId,readyPlay,playNow,songId)
		return;
	}
	else if(playStatus==-1){
		showDialog(20,"收费的听不了额","好吧","哦",noOperation,null,noOperation,null)
		return;
	}
	else if(playStatus==-2){
		showDialog(20,"貌似是下架了额","好吧","哦",noOperation,null,noOperation,null)
		return;
	}

	var songName = songInfo[songId]["songName"]
	var artistId = songInfo[songId]["artistId"]
	var artistName = artistInfo[artistId]["artistName"]
	var albumId = songInfo[songId]["albumId"]
	var albumName = albumInfo[albumId]["albumName"]
	var coverUrl = albumInfo[albumId]["coverUrl"]

	var img = document.createElement('img');
	img.width = 480
	img.height = 480
	img.setAttribute("src",coverUrl)

	let song = playBar.getElementsByClassName("song")[0]
	let artist = playBar.getElementsByClassName("related")[0].getElementsByClassName("artist")[0]
	let album = playBar.getElementsByClassName("related")[0].getElementsByClassName("album")[0]
	let totalTime = timeline.getElementsByClassName("time total")[0]
	
	song.innerHTML = songName
	artist.innerHTML = artistName
	album.innerHTML = albumName

	if ("duration" in songInfo[songId]){
		totalTime.innerHTML = secondReadable(songInfo[songId]["duration"]/1000)
	}
	else{
		totalTime.innerHTML = "0:00"
	}

	player.src = songInfo[songId]["songUrl"]

	if (playNow==1){
		console.log("PlaySong",songId,songInfo[songId]["songName"])
		player.play()
	}
	else if(playNow==0){
		console.log("readyplaySong",songId,songInfo[songId]["songName"])
		player.pause()
	}

	img.onload = function(){
		// var vibrant = new Vibrant(this)
		// var swatches = vibrant.swatches()
		// if(swatches.Vibrant){
		// 	var rgbArray = swatches.Vibrant.getRgb()
		// }
		// else if(swatches.Muted){
		// 	var rgbArray = swatches.Muted.getRgb()
		// }
		// else if(swatches.DarkVibrant){
		// 	var rgbArray = swatches.DarkVibrant.getRgb()
		// }
		// else if(swatches.DarkMuted){
		// 	var rgbArray = swatches.DarkMuted.getRgb()
		// }
		// else if(swatches.LightVibrant){
		// 	var rgbArray = swatches.LightVibrant.getRgb()
		// }
		// else if(swatches.LightMuted){
		// 	var rgbArray = swatches.LightMuted.getRgb()
		// }


		// if(swatches.Vibrant){
		// 	console.log("%c%s","color:" + swatches.Vibrant.getHex(),"Vibrant ▇▇")
		// }
		// if(swatches.Muted){
		// 	console.log("%c%s","color:" + swatches.Muted.getHex(),"Muted ▇▇")
		// }
		// if(swatches.DarkVibrant){
		// 	console.log("%c%s","color:" + swatches.DarkVibrant.getHex(),"DarkVibrant ▇▇")
		// }
		// if(swatches.DarkMuted){
		// 	console.log("%c%s","color:" + swatches.DarkMuted.getHex(),"DarkMuted ▇▇")
		// }
		// if(swatches.LightVibrant){
		// 	console.log("%c%s","color:" + swatches.LightVibrant.getHex(),"LightVibrant ▇▇")
		// }
		// if(swatches.LightMuted){
		// 	console.log("%c%s","color:" + swatches.LightMuted.getHex(),"LightMuted ▇▇")
		// }

		// var colorThief = new ColorThief()
		// var rgbArray = colorThief.getColor(this)
		// var alternative = colorThief.getPalette(this,8)
		// for (var i=0;i<alternative.length;i++){
		// 	console.log("%c%s","color:rgb(" + alternative[i][0] + "," + alternative[i][1] + "," + alternative[i][2] + ")","▇▇")
		// 	var hsv = rgb2hsv(alternative[i][0], alternative[i][1], alternative[i][2])
		// 	console.log(hsv)
		// }		

		// var rgbColor = Math.floor(rgbArray[0]) + "," + Math.floor(rgbArray[1]) + "," + Math.floor(rgbArray[2])

		// let cover = playBar.getElementsByClassName("cover")[0]
		// let bgBlur = playBar.getElementsByClassName("bgblur")[0]

		// cover.style.backgroundImage = "url("+coverUrl+")"
		// bgBlur.style.backgroundImage = "-webkit-linear-gradient(90deg, rgba(" + rgbColor + ",0.6), rgba(255, 255, 255, 0),rgba(" + rgbColor + ",0.3)),url(" +coverUrl + ")"
		// playBar.style.backgroundColor = "rgba(" + rgbColor + ",0.97)"

		Palette.generate([this]).done(function(palette) {
				var accentColors = palette.getAccentColors()
				if(accentColors.vibrant){
					console.log("%c%s","color:" + accentColors.vibrant.toHex(),"Vibrant ▇▇")
					var rgbColor = accentColors.vibrant.toString().slice(5,-4)
				}
				else if(accentColors.muted){
					console.log("%c%s","color:" + accentColors.muted.toHex(),"Muted ▇▇")
					var rgbColor = accentColors.muted.toString().slice(5,-4)
				}
				else if(accentColors.darkVibrant){
					console.log("%c%s","color:" + accentColors.darkVibrant.toHex(),"DarkVibrant ▇▇")
					var rgbColor = accentColors.darkVibrant.toString().slice(5,-4)
				}
				else if(accentColors.darkMuted){
					console.log("%c%s","color:" + accentColors.darkMuted.toHex(),"DarkMuted ▇▇")
					var rgbColor = accentColors.darkMuted.toString().slice(5,-4)
				}
				else if(accentColors.lightVibrant){
					console.log("%c%s","color:" + accentColors.lightVibrant.toHex(),"LightVibrant ▇▇")
					var rgbColor = accentColors.lightVibrant.toString().slice(5,-4)
				}
				else if(accentColors.lightMuted){
					console.log("%c%s","color:" + accentColors.lightMuted.toHex(),"LightMuted ▇▇")
					var rgbColor = accentColors.lightMuted.toString().slice(5,-4)
				}

				let cover = playBar.getElementsByClassName("cover")[0]
				let bgBlur = playBar.getElementsByClassName("bgblur")[0]

				cover.style.backgroundImage = "url("+coverUrl+")"
				bgBlur.style.backgroundImage = "-webkit-linear-gradient(90deg, rgba(" + rgbColor + ",0.6), rgba(255, 255, 255, 0),rgba(" + rgbColor + ",0.3)),url(" +coverUrl + ")"
				playBar.style.backgroundColor = "rgba(" + rgbColor + ",0.97)"

			}, function(error) {
				console.error(error);
			}
		)
	}

}





// var test = "http://p1.music.126.net/v3v6EV9jj3WBH8_fyF__Mg==/1652565976554623.jpg"


// function vibrantTest(url){
// 	var img = document.createElement('img');
// 	img.setAttribute("src",url)
// 	img.onload = function(){

// 		var vibrant = new Vibrant(this);
// 		var swatches = vibrant.swatches()
	
// 		for (var swatch in swatches)
// 			if (swatches.hasOwnProperty(swatch) && swatches[swatch])
// 				console.log(swatch, swatches[swatch].getHex())
// 	}
// }



function rgb2hsv () {
	var rr, gg, bb,
		r = arguments[0] / 255,
		g = arguments[1] / 255,
		b = arguments[2] / 255,
		h, s,
		v = Math.max(r, g, b),
		diff = v - Math.min(r, g, b),
		diffc = function(c){
			return (v - c) / 6 / diff + 1 / 2;
		};

	if (diff == 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rr = diffc(r);
		gg = diffc(g);
		bb = diffc(b);

		if (r === v) {
			h = bb - gg;
		}else if (g === v) {
			h = (1 / 3) + rr - bb;
		}else if (b === v) {
			h = (2 / 3) + gg - rr;
		}
		if (h < 0) {
			h += 1;
		}else if (h > 1) {
			h -= 1;
		}
	}
	return [
		Math.round(h * 360),
		Math.round(s * 100),
		Math.round(v * 100)
	]
}