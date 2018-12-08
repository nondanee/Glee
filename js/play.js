const playBar = document.getElementById("playbar")
const mediainfo = document.getElementById("mediainfo")
const timeline = document.getElementById("timeline")
const progressbar = document.getElementById("progressbar")
const playlist = document.getElementById("playlist")

// mediainfo.onclick = function(){
// 	playBar.className = "extend"
// }
// btn.fold.onclick = function(){
// 	playBar.className = ""
// }
// btn.list.onclick = function(){
// 	if (playBar.getAttribute("class")!="extend list"){
// 		playBar.setAttribute("class","extend list")
// 		var entryPlaying = playlist.getElementsByClassName("entry playing")
// 		if(entryPlaying.length==1)
// 			playlist.scrollTop = entryPlaying[0].offsetTop
// 	}
// 	else if(playBar.getAttribute("class")=="extend list"){
// 		playBar.setAttribute("class","extend")
// 	}
// }
// btn.download.onclick = function(){
// 	var songId = player.list[player.index]
// 	songDownload(songId)
// 	this.className = "download ing"
// }
// btn.fullscreen.onclick = function(){
// 	if(this.className=="fullscreen"){
// 		current_window.setFullScreen(true)
// 		this.className = "fullscreen on"
// 	}
// 	else{
// 		current_window.setFullScreen(false)
// 		this.className = "fullscreen"
// 	}
// }

const player = (() => {
	const audio = new Audio()
	let list = []
	let index = 0
	let random = false
	let cycle = 0

	const button = {
		previous: createElement('button','previous'),
		play: createElement('button','play'),
		next: createElement('button','next'),
		random: createElement('button','random'),
		cycle: createElement('button','cycle'),
		fold: createElement('button','fold'),
		list: createElement('button','list'),
		download: createElement('button','download'),
		fullscreen: createElement('button','fullscreen')
	}

	const controller = createElement('div', 'controller')
	['previous', 'play', 'next', 'random', 'cycle'].forEach(key => {
		controller.appendChild(button[key])
	})

	const extra = createElement('div', 'extra')
	['list', 'download', 'fullscreen'].forEach(key => {
		extra.appendChild(button[key])
	})

	const control = {
		pause: () => audio.pause(),
		resume: () => audio.play(),
		previous: () => {
			if(audio.currentTime > 2){
				audio.currentTime = 0
			}
			else if(index == 0 && cycle == 0){
				audio.currentTime = 0
				audio.pause()
			}
			else{
				index = (index - 1 + list.length) % list.length
				// playSong()
			}
		},
		next: () => {
			index = (index + 1) % list.length
			// playSong()
		},
		locate: progress => {
			audio.currentTime = audio.duration * progress
			// if (this.audio.seekable.length!=0){
			// 	var seekAble = 0
			// 	for (var x=0;x<this.audio.seekable.length;x++){
			// 		if(expectTime >= this.audio.seekable.start(x)&&expectTime <= this.audio.seekable.end(x)){
			// 			this.audio.currentTime = expectTime
			// 			return
			// 		}
			// 	}
			// 	this.audio.currentTime = this.audio.buffered.end(this.audio.buffered.length-1)
			// } 
		},
		add: () => {

		},
		random: () => {
			random = !random
			button.random.title = random ? '随机播放:打开' : '随机播放:关闭'
			button.random.className = 'random' + ' ' + (random ? 'on' : 'off')
		},
		cycle: () => {
			cycle = (cycle + 1) % 3
			button.cycle.title = ['重复播放:关闭', '重复播放:全部', '重复播放:单曲'][cycle]
			btn.cycle.className = 'cycle' + ' ' +  ['off', 'all', 'single'][cycle]
		},
		play: () => {

		}
	}

	audio.addEventListener('play', () => {
		button.play.className = 'pause'
	}, false)
	audio.addEventListener('pause', () => {
		button.play.className = 'play'
	}, false)
	audio.addEventListener('ended', () => {
		if(cycle == 2){
			playSong()
		}
		else if(random == true){
			while(true){
				let choice = Math.floor(Math.random() * list.length)
				if(choice != index)
					break
			}
			index = choice
			playSong()
		}
		else if(cycle == 0){
			if(index + 1 != list.length){
				control.next()
			}
			else{
				audio.currentTime = 0
			}
		}
		else if(cycle == 1){
			control.next()
		}
	},false)

	button.play.onclick = () => {
		if(!audio.src) return
		audio.paused ? control.resume() : control.pause()
	}
	button.previous.onclick = () => {
		control.previous()
	}
	button.next.onclick = () => {
		control.next()
	}
	button.cycle.onclick = () => {
		control.cycle()
	}
	button.random.onclick = () => {
		control.random()
	}

})()


		
// 		// var entries = playlist.getElementsByClassName("entry")
// 		// if(entries.length!=player.list.length)
// 		// 	return // create now
// 		// for(var x=0;x<entries.length;x++){
// 		// 	if(player.index!=x)
// 		// 		entries[x].setAttribute("class","entry")
// 		// 	else
// 		// 		entries[x].setAttribute("class","entry playing")
// 		// }
// 		let songId = this._list[this._index]
// 		let entries = document.getElementsByClassName("entry")
// 		for(let i=0;i<entries.length;i++){
// 			if(entries[i].getAttribute("songId")==songId)
// 				entries[i].className = "entry playing"
// 			else if(entries[i].className == "entry playing")
// 				entries[i].className = "entry"
// 		}
// 	}
// });





player.audio.addEventListener('timeupdate', () => {
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
}, false);


progressbar.onmousedown = event => {

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

const secondReadable = value => {
	if(isNaN(value)) return '0:00'
	var minute = Math.floor(value / 60)
	var second = Math.floor(value - minutes * 60)
	second = (second < 10) ? '0' + second.toString() : second.toString()
	return minute.toString() + ':' + second
}

const build = part => {
	let fragemnt = document.createDocumentFragment()
	part.forEach((song, number) => {
		let entry = fragemnt.appendChild(createElement('div', 'entry'))
		
		let back = entry.appendChild(createElement('div', 'back'))
		back.onclick = () => {
			index = number
			// playSong()
		}
		let front = entry.appendChild(createElement('div', 'front'))
		let song = front.appendChild(createElement('a', 'song'))
		let name = song.appendChild(createElement('a', 'name', song.name))
		
		let play = song.appendChild(createElement('button', 'play'))
		play.onclick = () => {
			index = number
			// playSong()
		}
		let remove = song.appendChild(createElement('button', 'remove'))
		remove.onclick = event => {
			list.splice(number, 1)
			// if(x==player.index&&player.paused==false){
			// 	player.index = x
			// 	playSong()
			// }
		}
		
		let artist = front.appendChild(document.createElement('a', 'artist', ''))
		let album = front.appendChild(document.createElement('a', 'album', song.album.name))
		front.appendChild(document.createElement('a', 'duration', secondReadable(song.duration)))
	})
}



const play = () => {

	const name = createElement('a', 'name')
	const related = createElement('a', 'related')
	const blur = createElement('div', 'blur')
	const cover = createElement('div', 'cover')

	name.setAttribute('name', song.name)
	related.setAttribute('artist', song.artist.map(artist => artist.name).join('/'))
	related.setAttribute('album', song.album.name)

	totalTime.innerHTML = secondReadable(songInfo[songId]["duration"]/1000)

	// player.src = songInfo[songId]["songUrl"]
	// btn.download.title = `下载(${songInfo[songId]["bitRate"]/1000}kbps)`

	pickColor(coverUrl).then(paletteItem => {
		let rgbColor = paletteItem.toString().slice(5, -4)
		let hslColor = paletteItem.getHsl()
		cover.style.backgroundImage = `url(${coverUrl})`
		blur.style.backgroundImage = "-webkit-linear-gradient(90deg, rgba(" + rgbColor + ",0.6), rgba(255, 255, 255, 0),rgba(" + rgbColor + ",0.3)),url(" +coverUrl + ")"
		bar.style.backgroundColor = `hsla(${hslColor[0]}, ${(hslColor[1] - 0.2) * 100}%, ${hslColor[2] * 100}%, 0.8)`
	})
}

const pickColor = url => {
	const image = new Image()
	image.width = 480
	image.height = 480
	image.src = url
	return new Promise((resolve,reject) => {
		image.onload = () => {
			Palette.generate([this]).done(
				palette => {
					let accentColors = palette.getAccentColors()
					let color = (accentColors.vibrant || accentColors.muted || accentColors.darkVibrant || accentColors.darkMuted || accentColors.lightVibrant || accentColors.lightMuted)
					// console.log("%c%s","color:" + accentColors.darkVibrant.toHex(),"DarkVibrant ▇")
					resolve(color)
				},
				error => {
					reject(error)
				}
			)
		}
	})
}

document.addEventListener('keydown', event => {
	if (event.keyCode == 27){
		event.preventDefault()
		// if(current_window.isFullScreen()){
		// 	current_window.setFullScreen(false)
		// 	btn.fullscreen.className = "fullscreen"
		// }
	}
	else if (event.keyCode == 32){// space
		event.preventDefault()
		btn.play.click()
	}
	else if (event.ctrlKey && event.keyCode == 37){// ctrl + left
		event.preventDefault()
		btn.previous.click()
	}
	else if (event.ctrlKey && event.keyCode == 39){// ctrl + right
		event.preventDefault()
		btn.next.click()
	}
}, false)