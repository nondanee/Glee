const player = (() => {
	const audio = new Audio()
	let list = []
	let index = 0
	let random = false
	let cycle = 0

	const sync = pairs =>
		Object.entries(pairs).forEach(pair =>
			localStorage.setItem(pair[0], typeof(pair[1]) === 'object' ? JSON.stringify(pair[1]) : pair[1])
		)

	const recover = () => {
		control.add(JSON.parse(localStorage.getItem('list') || '[]'), false)
		index = parseInt(localStorage.getItem('index'))
		control.play(false)
		if(localStorage.getItem('random') == 'true') button.random.click()
		Array.from(Array(parseInt(localStorage.getItem('cycle')) || 0).keys()).forEach(() => button.cycle.click())
	}

	const element = {
		playBar: createElement('div', 'playbar'),
		mediaInfo: createElement('div', 'mediainfo'),
		timeLine: createElement('div', 'timeline'),
		progressBar: createElement('div', 'progressbar'),
		playList: createElement('div', 'playlist'),

		name: createElement('a', 'name'),
		related: createElement('a', 'related'),
		blur: createElement('div', 'blur'),
		cover: createElement('div', 'cover'),
		cursor: createElement('div', 'cursor'),

		time: {
			played: createElement('div', 'time played', '--:--'),
			total: createElement('div', 'time total', '--:--'),
		},
		filler: {
			played: createElement('div', 'filler played'),
			unplayed: createElement('div', 'filler unplayed'),
		},

		controller: createElement('div', 'controller'),
		drag: createElement('div', 'drag'),

	}

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

	const build = offset => {
		let fragemnt = document.createDocumentFragment()
		list.slice(offset).forEach((song, number) => {
			let entry = fragemnt.appendChild(createElement('div', 'entry'))
			
			let mat = entry.appendChild(createElement('div', 'mat'))
			mat.onclick = () => {
				index = Array.from(element.playList.children).indexOf(entry)
				control.play()
			}
			let content = entry.appendChild(createElement('div', 'content'))
			let item = content.appendChild(createElement('div', 'song'))
			let name = item.appendChild(createElement('div', 'text', song.name))
			
			let play = item.appendChild(createElement('button', 'play'))
			play.onclick = event => {
				index = Array.from(element.playList.children).indexOf(entry)
				control.play()
			}
			let remove = item.appendChild(createElement('button', 'remove'))
			remove.onclick = event => {
				let postition = Array.from(element.playList.children).indexOf(entry)
				control.remove(postition)
			}
			let artist = content.appendChild(createElement('div', 'artist'))
			song.artists.forEach(item => {
				item = artist.appendChild(createElement('div', 'text', item.name))
				item.onclick = () => {}
			})
			let album = content.appendChild(createElement('div', 'album')).appendChild(createElement('div', 'text', song.album.name))
			album.onclick = () => {}
			
			content.appendChild(createElement('div', 'duration').appendChild(createElement('div', 'text', secondFormatter(song.duration))))
		})
		return fragemnt
	}

	const control = {
		pause: () => {
			if(audio.src && !audio.paused) audio.pause()
		},
		resume: () => {
			if(audio.src && audio.paused) audio.play()
		},
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
				control.play()
			}
		},
		next: () => {
			index = (index + 1) % list.length
			control.play()
		},
		locate: progress => {
			let expectTime = audio.duration * progress
			let seekable = Array.from(Array(audio.seekable.length).keys()).some(index => audio.seekable.start(index) <= expectTime && expectTime <= audio.seekable.end(index))
			if(seekable) audio.currentTime = expectTime
		},
		reset: () => {
			list = []
			index = 0
			element.playList.innerHTML = ''
			sync({list, index})
		},
		add: (part, cover = true) => {
			if(cover) control.reset()
			part = part.filter(item => item.state)
			let length = list.length
			list = list.concat(part)
			element.playList.appendChild(build(length))
			if(cover) control.play()
			sync({list})
		},
		remove: postition => {
			list.splice(postition, 1)
			element.playList.removeChild(element.playList.children[postition])
			if(postition < index) index -= 1
			else if(postition == index) control.play()
			sync({list})
		},
		random: () => {
			random = !random
			button.random.title = random ? '随机播放:打开' : '随机播放:关闭'
			button.random.className = 'random' + ' ' + (random ? 'on' : 'off')
			sync({random})
		},
		cycle: () => {
			cycle = (cycle + 1) % 3
			button.cycle.title = ['重复播放:关闭', '重复播放:全部', '重复播放:单曲'][cycle]
			button.cycle.className = 'cycle' + ' ' +  ['off', 'all', 'single'][cycle]
			sync({cycle})
		},
		play: (immediate = true) => {
			if(!list.length)  return
			let song = list[index]
			track.url(song.id).then(meta => {
				Array.from(element.playList.children).forEach(item => item.classList.remove('playing'))
				element.playList.children[index].classList.add('playing')

				element.name.setAttribute('name', song.name)
				element.related.setAttribute('artist', song.artists.map(artist => artist.name).join('/'))
				element.related.setAttribute('album', song.album.name)
				element.time.played.innerHTML = secondFormatter()
				element.time.total.innerHTML = secondFormatter(song.duration)

				if('mediaSession' in navigator){
					navigator.mediaSession.metadata = new MediaMetadata({
						title: song.name,
						artist: song.artists.map(artist => artist.name).join(' / '),
						album: song.album.name,
						artwork: [{src: song.cover + '?param=200y200',  sizes: '200x200', type: 'image/jpeg'}]
					})
				}

				song.url = meta.url.replace(/(m\d+?)(?!c)\.music\.126\.net/, '$1c.music.126.net')
				audio.src = song.url
				if(immediate) audio.play()

				let cover = song.cover + '?param=360y360'
				loadImage(cover)
				.then(image => {
					let canvas = createElement('canvas')
					canvas.height = image.naturalHeight
					canvas.width = image.naturalWidth
					StackBlur.image(image, canvas, 20)
					element.blur.style.backgroundImage = `url(${canvas.toDataURL()})`
					return pickColor(image)
				})
				.then(color => {
					// let hslColor = color.getHsl()
					let hslColor = colorConverter.rgbToHsl(color)
					hslColor[1] = hslColor[1] > 0.8 ? 0.8 : hslColor[1]
					hslColor[2] = hslColor[2] > 0.6 ? 0.6 : hslColor[2]
					let rgbColor = colorConverter.hslToRgb(hslColor)
					element.cover.style.backgroundImage = `url(${cover})`
					element.playBar.style.setProperty('--theme-color', rgbColor.join(', '))
					// let context = element.canvas.getContext('2d')
					// let gradient = context.createLinearGradient(0, 0, 0, element.canvas.height)
					// gradient.addColorStop(0, `rgba(${rgbColor.join(',')}, 0.3)`)
					// gradient.addColorStop(0.5, `transparent`)
					// gradient.addColorStop(1, `rgba(${rgbColor.join(',')}, 0.6)`)
					// context.fillStyle = gradient
					// context.fillRect(0, 0, element.canvas.width, element.canvas.height)
				})
				sync({index})
			}).catch(() => control.remove(index))
		},
		download: () => {
			if(!list.length) return
			if(button.download.classList.contains('ing')) return
			let song = list[index]
			button.download.classList.add('ing')
			require('./js/download.js')(song).catch().then(() => button.download.classList.remove('ing'))
		}
	}

	audio.onplay = () => button.play.className = 'pause'
	audio.onpause = () => button.play.className = 'play'
	audio.onended = () => {
		if(cycle == 2){
			control.play()
		}
		else if(random){
			while(true){
				let choice = Math.floor(Math.random() * list.length)
				if(choice != index)
					break
			}
			index = choice
			control.play()
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
	}
	const throttle = (() => {
		let previous = NaN
		return time => {
			time = parseInt(time)
			let judge = time == previous
			previous = time
			return judge
		}
	})()
	audio.ontimeupdate = () => {
		if(!isNaN(audio.duration) && !audio.paused){
			let currentTime = audio.currentTime
			if(!throttle(currentTime)) element.time.played.innerHTML = secondFormatter(currentTime)
			let progress = currentTime / audio.duration
			element.progressBar.style.setProperty(`--progress-value`, progress % 1)
		}
	}
	if('mediaSession' in navigator){
		navigator.mediaSession.setActionHandler('play', () => audio.play())
		navigator.mediaSession.setActionHandler('pause', () => audio.pause())
		navigator.mediaSession.setActionHandler('previoustrack', () => control.previous())
		navigator.mediaSession.setActionHandler('nexttrack', () => control.next())
	}

	element.mediaInfo.onclick = () => {
		element.playBar.classList.contains('list') ? element.playBar.classList.remove('list') : element.playBar.classList.add('extend')
	}
	button.fold.onclick = () => {
		element.playBar.classList.remove('extend', 'list')
	}
	button.list.onclick = function(){
		if(!element.playBar.classList.contains('list')){
			element.playBar.classList.add('list')
			let playing = element.playList.querySelector('.playing')
			if(playing) element.playList.scrollTop = playing.offsetTop
		}
		else if(element.playBar.classList.contains('list')){
			element.playBar.classList.remove('list')
		}
	}
	button.download.onclick = () => {
		control.download()
	}
	button.fullscreen.onclick = () => {
		const focusedWindow = BrowserWindow.getFocusedWindow()
		focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
	}
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
	element.progressBar.onmousedown = event => {
		let cursorWidth = element.cursor.offsetWidth
		let maxWidth = element.progressBar.offsetWidth - cursorWidth
		let offsetLeft = element.progressBar.offsetLeft + element.timeLine.offsetLeft
		let progress = null
		
		const follow = clientX => {
			progress = (clientX - offsetLeft - cursorWidth / 2) / maxWidth
			progress = progress > 1 ? 1 : progress
			progress = progress < 0 ? 0 : progress

			element.time.played.innerHTML = secondFormatter(audio.duration * progress)
			element.progressBar.style.setProperty(`--progress-value`, progress)
		}

		let paused = true
		if(!audio.paused){
			control.pause()
			paused = false
		}

		follow(event.clientX)
		
		document.onmousemove = event => follow(event.clientX)
		document.onmouseup = () => {
			control.locate(progress)
			if(!paused) control.resume()
			document.onmousemove = null
			document.onmouseup = null
		}
	}
	document.addEventListener('keydown', event => {
		if(event.keyCode == 27){
			event.preventDefault()
			const focusedWindow = BrowserWindow.getFocusedWindow()
			if(focusedWindow.isFullScreen()) button.fullscreen.click()
		}
		else if(event.keyCode == 32){
			event.preventDefault()
			button.play.click()
		}
		else if(event.ctrlKey && event.keyCode == 37){
			event.preventDefault()
			button.previous.click()
		}
		else if(event.ctrlKey && event.keyCode == 39){
			event.preventDefault()
			button.next.click()
		}
	}, false)

	init = () => {
		const text = Array.from(['name' ,'related']).reduce((item, key) => (item.appendChild(element[key]), item), createElement('div', 'text'))
		Array.from([element.cover, text]).forEach(item => element.mediaInfo.appendChild(item))
		Array.from([element.filler.played, element.cursor, element.filler.unplayed]).forEach(item => element.progressBar.appendChild(item))
		Array.from([element.time.played, element.progressBar, element.time.total]).forEach(item => element.timeLine.appendChild(item))
		Array.from(['previous', 'play', 'next', 'random', 'cycle', 'list', 'download', 'fullscreen']).forEach(key => element.controller.appendChild(button[key]))
		Array.from(['fold']).forEach(key => element.drag.appendChild(button[key]))
		Array.from([element.blur, element.mediaInfo, element.timeLine, element.controller, element.playList, element.drag]).forEach(item => element.playBar.appendChild(item))
		document.body.appendChild(element.playBar)

		const focusedWindow = BrowserWindow.getFocusedWindow()
		focusedWindow.on('enter-full-screen', () => button.fullscreen.classList.add('on'))
		focusedWindow.on('leave-full-screen', () => button.fullscreen.classList.remove('on'))

		recover()
	}

	init()

	return {add: control.add, debug: () => list}
	
})()

const loadImage = url => {
	const image = new Image()
	image.width = 480
	image.height = 480
	image.src = url
	return new Promise((resolve, reject) => image.onload = () => resolve(image))
}

const pickColor = image =>
	new Promise((resolve, reject) => {
		// Palette.generate([image]).done(
		// 	palette => {
		// 		let accentColors = palette.getAccentColors()
		// 		let color = (accentColors.vibrant || accentColors.muted || accentColors.darkVibrant || accentColors.darkMuted || accentColors.lightVibrant || accentColors.lightMuted)
		// 		resolve(color)
		// 	},
		// 	error => {
		// 		reject(error)
		// 	}
		// )
		const color = (new ColorThief()).getColor(image)
		resolve(color)
	})