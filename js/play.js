const playBar = document.getElementById("playbar")
const mediainfo = document.getElementById("mediainfo")
const timeline = document.getElementById("timeline")
const progressbar = document.getElementById("progressbar")
const playlist = document.getElementById("playlist")

const btn = {
	previous:document.getElementById("controller").children[0],
	play:document.getElementById("controller").children[1],
	next:document.getElementById("controller").children[2],
	random:document.getElementById("controller").children[3],
	cycle:document.getElementById("controller").children[4],
	fold:playBar.getElementsByClassName("fold")[0],
	list:document.getElementById("extra").getElementsByClassName("list")[0],
	download:document.getElementById("extra").getElementsByClassName("download")[0],
	fullscreen:document.getElementById("extra").getElementsByClassName("fullscreen")[0]
}

mediainfo.onclick = function(){
	playBar.className = "extend"
}
btn.fold.onclick = function(){
	playBar.className = ""
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
	this.className = "download ing"
}
btn.fullscreen.onclick = function(){
	if(this.className=="fullscreen"){
		current_window.setFullScreen(true)
		this.className = "fullscreen on"
	}
	else{
		current_window.setFullScreen(false)
		this.className = "fullscreen"
	}
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
			playSong()
		}
	},
	next:function(){
		this.index = (this._index+1)%this._list.length
		playSong()
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
		
		// var entries = playlist.getElementsByClassName("entry")
		// if(entries.length!=player.list.length)
		// 	return // create now
		// for(var x=0;x<entries.length;x++){
		// 	if(player.index!=x)
		// 		entries[x].setAttribute("class","entry")
		// 	else
		// 		entries[x].setAttribute("class","entry playing")
		// }
		let songId = this._list[this._index]
		let entries = document.getElementsByClassName("entry")
		for(let i=0;i<entries.length;i++){
			if(entries[i].getAttribute("songId")==songId)
				entries[i].className = "entry playing"
			else if(entries[i].className == "entry playing")
				entries[i].className = "entry"
				// removeClass(entries[i],"playing")
		}
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
			btn.random.className = "random off"
		}
		else if(this._random==1){
			btn.random.setAttribute("title","循环播放:打开")
			btn.random.className = "random on"
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
			btn.cycle.className = "cycle off"
		}
		else if(this._cycle==1){
			btn.cycle.setAttribute("title","重复播放:全部")
			btn.cycle.className = "cycle all"
		}
		else if(this._cycle==2){
			btn.cycle.setAttribute("title","重复播放:单曲")
			btn.cycle.className = "cycle single"
		}
	}
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
	btn.play.className = "pause"
},false);
player.audio.addEventListener('pause',function(){
	btn.play.className = "play"
},false);
player.audio.addEventListener('ended',function(){
	if(player.cycle==2){//single cycle priority
		playSong()
	}
	else if(player.random==1){//random play
		while(true){
			var nextIndex = Math.floor(Math.random()*player.list.length)
			if(nextIndex!=player.index)
				break
		}
		player.index = nextIndex
		playSong()
	}
	else if(player.cycle==0){//cycle off
		if(player.index+1!=player.list.length){
			player.index = player.index+1
			playSong()
		}
		else{
			this.currentTime = 0
		}
	}
	else if(player.cycle==1){//all cycle
		player.index = (player.index+1)%player.list.length
		playSong()
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

	cleanDomChilds(playlist)
	
	for (let x=0;x<player.list.length;x++){
		var songId = player.list[x]
		if (!(songId in songInfo)){
			getSongsInfo(player.list,rebuildPlayList)
			return
		}
		var songName = songInfo[songId]["songName"]
		var songDuration = secondReadable(songInfo[songId]["duration"]/1000)
		var artistName = artistInfo[songInfo[songId]["artistId"]]["artistName"]
		var albumName = albumInfo[songInfo[songId]["albumId"]]["albumName"]
		var entry = document.createElement('div')
		entry.className = "entry"
		entry.setAttribute("songId",songId)
		

		var back = document.createElement('div')
		back.className = "back"
		back.onclick = function (){
			player.index = x
			playSong()
		}
		entry.appendChild(back)

		var front = document.createElement('div')
		front.className = "front"

		var song = document.createElement('a')
		song.className = "song"
		var name = document.createElement('a')
		name.className = "name"
		name.innerHTML = songName
		var play = document.createElement('button')
		play.className = "play"
		play.onclick = function (event){
			player.index = x
			playSong()
		}
		var remove = document.createElement('button')
		remove.className = "remove"
		remove.onclick = function (event){
			let list = player.list
			list.splice(x,1)
			player.list = list
			if(x==player.index&&player.paused==false){
				player.index = x
				playSong()
			}
		}
		song.appendChild(name)
		song.appendChild(play)
		song.appendChild(remove)
		
		front.appendChild(song)
		var artist = document.createElement('a')
		artist.className = "artist"
		artist.innerHTML = artistName
		var album = document.createElement('a')
		album.className = "album"
		album.innerHTML = albumName
		var duration = document.createElement('a')
		duration.className = "duration"
		duration.innerHTML = songDuration
		front.appendChild(artist)
		front.appendChild(album)
		front.appendChild(duration)
		entry.appendChild(front)

		if (x==player.index)
			entry.className = "entry playing"
		playlist.appendChild(entry)
	}
}



function playSong(params){

	if(typeof(params) == "undefined"){
		var playNow = 1
		// var songId = player.list[player.index]
	}
	else{
		var playNow = params.playNow ? 1 : 0
		// var songId = params.songId ? params.songId : player.list[player.index]
	}

	// params = {"playNow":playNow,"songId":songId}

	params = {"playNow":playNow}

	var songId = player.list[player.index]

	if (!(songId in songInfo)){
		getSongsInfo([songId],playSong,params)
		return
	}

	var playStatus = checkSongUrlStatus(songId)

	if (playStatus==0){
		getSongUrl(songId,playSong,params)
		return
	}
	else if (playStatus==-1){
		trySongUrl(songId,playSong,params)
		return
	}
	else if(playStatus==-2){
		showDialog(20,"听不了额","好吧","哦",noOperation,null,noOperation,null)
		return
	}

	var songName = songInfo[songId]["songName"]
	var artistId = songInfo[songId]["artistId"]
	var artistName = artistInfo[artistId]["artistName"]
	var albumId = songInfo[songId]["albumId"]
	var albumName = albumInfo[albumId]["albumName"]
	var coverUrl = albumInfo[albumId]["coverUrl"]

	let bgBlur = playBar.getElementsByClassName("bgblur")[0]
	let cover = mediainfo.getElementsByClassName("cover")[0]
	let song = mediainfo.getElementsByClassName("song")[0]
	let related = mediainfo.getElementsByClassName("related")[0]
	// let artist = mediainfo.getElementsByClassName("related")[0].getElementsByClassName("artist")[0]
	// let album = mediainfo.getElementsByClassName("related")[0].getElementsByClassName("album")[0]
	let totalTime = timeline.getElementsByClassName("time total")[0]
	
	// song.innerHTML = songName
	// artist.innerHTML = artistName
	// album.innerHTML = albumName

	song.setAttribute("name",songName)
	related.setAttribute("artist",artistName)
	related.setAttribute("album",albumName)

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

	getExceptedColor(coverUrl,function(rgbColor){
		cover.style.backgroundImage = "url(" + coverUrl + ")"
		bgBlur.style.backgroundImage = "-webkit-linear-gradient(90deg, rgba(" + rgbColor + ",0.6), rgba(255, 255, 255, 0),rgba(" + rgbColor + ",0.3)),url(" +coverUrl + ")"
		playBar.style.backgroundColor = "rgba(" + rgbColor + ",0.97)"
	})

}


document.addEventListener("keydown", function(e) {
	if (e.keyCode == 27){// esc
		e.preventDefault()
		if(current_window.isFullScreen()){
			current_window.setFullScreen(false)
			btn.fullscreen.className = "fullscreen"
		}
	}
	if (e.keyCode == 32){// space
		e.preventDefault()
		btn.play.click()
	}
	else if (e.ctrlKey&&e.keyCode == 37){// ctrl + left
		e.preventDefault()
		btn.previous.click()
	}
	else if (e.ctrlKey&&e.keyCode == 39){// ctrl + right
		e.preventDefault()
		btn.next.click()
	}
}, false);



function addClass(dom, className) {
	let allClass = getAllClass(dom)
	let classIndex = hasClass(allClass, className)
	if (classIndex == -1){
		allClass.push(className)
		dom.className = toClassName(allClass)
	}
}
function removeClass(dom, className) {
	let allClass = getAllClass(dom)
	let classIndex = hasClass(allClass, className)
	if (classIndex != -1){
		allClass.splice(classIndex,1)
		dom.className = toClassName(allClass)
	}
}
function getAllClass(dom){
	let allClass = dom.className
	return allClass.split(/\s+/)
}
function hasClass(allClass, className){
	for(let i in allClass) {
		if(allClass[i] == className){
			return i
		}
	}
	return -1
}
function toClassName(allClass){
	let className = allClass.toString()
	return className.replace(/,/g," ")
}

function getExceptedColor(imgSrc,callBack){
	let image = new Image()
	image.width = 480
	image.height = 480
	image.src = imgSrc
	image.onload = function(){
		Palette.generate([this]).done(function(palette){
			let accentColors = palette.getAccentColors()
			let rgbColor
			if(accentColors.vibrant){
				// console.log("%c%s","color:" + accentColors.vibrant.toHex(),"Vibrant ▇")
				rgbColor = accentColors.vibrant.toString().slice(5,-4)
			}
			else if(accentColors.muted){
				// console.log("%c%s","color:" + accentColors.muted.toHex(),"Muted ▇")
				rgbColor = accentColors.muted.toString().slice(5,-4)
			}
			else if(accentColors.darkVibrant){
				// console.log("%c%s","color:" + accentColors.darkVibrant.toHex(),"DarkVibrant ▇")
				rgbColor = accentColors.darkVibrant.toString().slice(5,-4)
			}
			else if(accentColors.darkMuted){
				// console.log("%c%s","color:" + accentColors.darkMuted.toHex(),"DarkMuted ▇")
				rgbColor = accentColors.darkMuted.toString().slice(5,-4)
			}
			else if(accentColors.lightVibrant){
				// console.log("%c%s","color:" + accentColors.lightVibrant.toHex(),"LightVibrant ▇")
				rgbColor = accentColors.lightVibrant.toString().slice(5,-4)
			}
			else if(accentColors.lightMuted){
				// console.log("%c%s","color:" + accentColors.lightMuted.toHex(),"LightMuted ▇")
				rgbColor = accentColors.lightMuted.toString().slice(5,-4)
			}
			callBack(rgbColor)
		}, function(error){
			console.error(error)
		})
	}
}