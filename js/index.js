const {remote} = require('electron')
// const BrowserWindow = require('electron').remote.BrowserWindow
// const storage = require('electron-json-storage')

const current_window = remote.BrowserWindow.getFocusedWindow()

// document.getElementById('minimize').onclick = function(){
// 	current_window.minimize()
// }
// document.getElementById('close').onclick = function(){
// 	current_window.close()
// 	// remote.app.exit()
// }
// document.getElementById('maximize').onclick = function(){
// 	current_window.isMaximized() ?
// 	current_window.restore() :
// 	current_window.maximize();
// }


// store
// window.onbeforeunload = function(event){
// 	event.returnValue = false
// 	storage.set('player', { "list": player.list,"index":player.index,"random":player.random,"cycle":player.cycle }, function(error) {
// 		window.onbeforeunload = null
// 		current_window.close()
// 	})
// }

// restore
// storage.get('player', function(error, reserve) {
// 	if (error) throw error
// 	if ("list" in reserve&&"index" in reserve&&"random" in reserve&&"cycle" in reserve){
// 		player.list = reserve.list
// 		player.index = reserve.index
// 		player.random = reserve.random
// 		player.cycle = reserve.cycle
// 		if(player.list.length!=0){
// 			playSong({playNow:0})
// 		}
// 	}
// })


const container = document.getElementsByTagName("container")[0]
const maintab = document.getElementById("maintab")
const subtab = document.getElementById("subtab")
const mainTabs = maintab.getElementsByTagName("li")

let reachBottom = () => {}
let loading = false

container.onscroll = () => {
	if (container.scrollHeight - 640 < container.scrollTop + container.offsetHeight) {
		reachBottom()
	}
}


const Container = (interface, parameter) => {
	// this.items = []
	// this.loadMoreFunc = loadMoreFunc
	// this.loadMoreFuncParams = loadMoreFuncParams
	// this.more = 1
	// this.scroll = 0
	// this.extend = null
	// this.dataType = dataType
	// this.add = function(value) {
	// 	for (var x=0;x<this.items.length;x++){
	// 		if(this.items[x]==value)
	// 			return
	// 	}
	// 	this.items.push(value)
	// }
	// this.refresh = function() {
	// 	var records = document.querySelectorAll("container>."+this.dataType)
	// 	var details = document.querySelectorAll("container>.detail")
	// 	// while(Math.floor(this.items.length/4)+1>details.length){
	// 	// 	var detail = newDetailDom()
	// 	// 	container.appendChild(detail)
	// 	// 	details = document.querySelectorAll("container>.detail")
	// 	// }
	// 	for (var x=records.length;x<this.items.length;x++){
	// 		var detailIndex = Math.floor(x/4)
	// 		var recipe = newRecordDom(this,x,dataType)
	// 		container.insertBefore(recipe,details[detailIndex])
	// 	}
	// }

	let source = null
	let data = []

	const init = () => {
		source = interface.apply(this, parameter || [])
	}

	const more = () => {
		if(loading) return
		loading = true
		source.next().then(part => {
			loading = false
			if(part.length > 0){
				container.appendChild(render(part))
				data = data.concat(part)
			}
		})
	}

	const render = data => {
		let fragemnt = document.createDocumentFragment()
		data.forEach(item => {
			let record = fragemnt.appendChild(createElement('div', item.type))
			let cover = record.appendChild(createElement('div', 'cover'))
			cover.style.backgroundImage = `url(${item.cover}?param=158y158)`
			cover.onclick = event => event.stopPropagation()
			record.appendChild(createElement('div', 'name', item.name))
			record.appendChild(createElement('div', 'description', item.description))

			cover.appendChild(createElement('button', 'play')).onclick = event => {
				event.stopPropagation()
				track[item.type](item.id).then(songs => console.log(songs))
			}
			cover.appendChild(createElement('button', 'add')).onclick = event => {
				event.stopPropagation()
				console.log('add', item.type, item.id)
			}
		})
		return fragemnt
	}

	init()

	return {
		recover: () => {
			reachBottom = () => {}
			container.appendChild(render(data))
			reachBottom = more
			if(!data.length) more()
		},
		reload: () => {
			reachBottom = () => {}
			init()
			reachBottom = more
			more()
		},
		hide: () => {
			container.innerHTML = ''
		}
	}
}

// function foldDetail(detailDom){
// 	var speed = 3200
// 	var heightbefore = parseInt(detailDom.style.height.slice(0,-2))
// 	if (heightbefore == 0)
// 		var heightafter = detailDom.scrollHeight
// 	else
// 		var heightafter = 0
// 	var duration = (Math.abs(heightafter-heightbefore))/speed
// 	detailDom.style.transitionDuration = duration+"s"
// 	detailDom.style.height = heightafter+"px"
// }


// function showDetail(params){

// 	const id = params.id
// 	const dataType = params.dataType
// 	// const detailDom = params.detailDom

// 	if (dataType=="album"){
// 		if (albumInfo[id]["musicTrack"] == null){
// 			loadAlbumSongs(id,showDetail,params)
// 			return
// 		}
// 	}
// 	else if (dataType=="recipe"){
// 		if (recipeInfo[id]["musicTrack"] == null){
// 			loadRecipeSongs(id,showDetail,params)
// 			return
// 		}
// 	}
// 	else if (dataType=="chart"){
// 		if (recipeInfo[id]["musicTrack"] == null){
// 			loadRecipeSongs(id,showDetail,params)
// 			return
// 		}
// 	}
// 	else if (dataType=="artist"){
// 		if (artistInfo[id]["musicTrack"] == null){
// 			loadArtistSongs(id,showDetail,params)
// 			return
// 		}
// 	}

// 	fillDetailDom(params)
	
// }

// function fillDetailDom(params){

// 	const id = params.id
// 	const dataType = params.dataType
// 	const detailDom = params.detailDom

// 	const sizeControl = "?param=360y360"
	
// 	if (dataType=="album"){
// 		var coverUrl = albumInfo[id]["coverUrl"] + sizeControl
// 		var titleText = albumInfo[id]["albumName"]
// 		var ownerText = artistInfo[albumInfo[id]["artistId"]]["artistName"]
// 		var musicTrack = albumInfo[id]["musicTrack"]
// 	}
// 	else if (dataType=="recipe"){
// 		var coverUrl = recipeInfo[id]["coverUrl"] + sizeControl
// 		var titleText = recipeInfo[id]["recipeName"]
// 		var ownerText = "@" + recipeInfo[id]["creator"]
// 		var musicTrack = recipeInfo[id]["musicTrack"]
// 	}
// 	else if (dataType=="chart"){
// 		var coverUrl = recipeInfo[id]["coverUrl"] + sizeControl
// 		var titleText = recipeInfo[id]["recipeName"]
// 		var ownerText = recipeInfo[id]["updateTime"]
// 		var musicTrack = recipeInfo[id]["musicTrack"]
// 	}
// 	else if (dataType=="artist"){
// 		var coverUrl = artistInfo[id]["artistImage"] + sizeControl
// 		var titleText = artistInfo[id]["artistName"]
// 		var ownerText = artistInfo[id]["description"]
// 		var musicTrack = artistInfo[id]["musicTrack"]
// 	}

// 	// getExceptedColor(coverUrl,function(textColor){

// 	let image = new Image()
// 	image.src = coverUrl

// 	image.onload = function() {

// 		var colorThief = new ColorThief()
// 		var textColor = colorThief.getColor(this).toString()

// 		var cover = detailDom.getElementsByClassName("cover")[0]
// 		cover.style.backgroundImage = "url(" + coverUrl + ")"

// 		var title = detailDom.getElementsByClassName("title")[0]
// 		title.innerHTML = titleText
		
// 		var owner = detailDom.getElementsByClassName("owner")[0]
// 		owner.innerHTML = ownerText
// 		owner.style.color = "rgb(" + textColor + ")"
		
// 		var track = detailDom.getElementsByClassName("track")[0]
// 		track.innerHTML = ''

// 		for(var x=0;x<musicTrack.length;x++){
// 			var songId = musicTrack[x]
// 			var songName = songInfo[songId]["songName"]
// 			var songDuration = secondReadable(songInfo[songId]["duration"]/1000)
// 			var artistName = artistInfo[songInfo[songId]["artistId"]]["artistName"]
// 			// var albumName = albumInfo[songInfo[songId]["albumId"]]["albumName"]
// 			var entry = document.createElement('div')
// 			entry.setAttribute("songId",songId)
// 			entry.style.color = "rgb(" + textColor + ")"
// 			// var button = document.createElement('button')
// 			// button.style.color = "rgb(" + textColor + ")"
// 			if (checkSongUrlStatus(songId)>=-1){
// 				if(songId==player.list[player.index])
// 					entry.setAttribute("class","entry playing")
// 				else
// 					entry.setAttribute("class","entry")
// 				// button.setAttribute("class","play")
// 				// entry.appendChild(button)
// 				entry.ondblclick = function(){
// 					var songId = this.getAttribute("songId")
// 					addToPlayList(musicTrack,1)
// 					player.index = inPlayList(songId)
// 					playSong()
// 				}
// 			}
// 			else{
// 				entry.setAttribute("class","entry unable")
// 			}
// 			var index = document.createElement('a')
// 			index.setAttribute("class","index")
// 			index.setAttribute("text",x+1)
// 			// index.innerHTML = x+1
			
// 			var song = document.createElement('a')
// 			song.setAttribute("class","song")
// 			song.innerHTML = songName
// 			var artist = document.createElement('a')
// 			artist.setAttribute("class","artist")
// 			artist.innerHTML = artistName
// 			// var album = document.createElement('a')
// 			// album.setAttribute("class","album")
// 			// album.innerHTML = albumName
// 			var duration = document.createElement('a')
// 			duration.setAttribute("class","duration")
// 			duration.innerHTML = songDuration
// 			entry.appendChild(index)
// 			entry.appendChild(song)
// 			entry.appendChild(artist)
// 			// entry.appendChild(album)
// 			entry.appendChild(duration)
// 			track.appendChild(entry)
// 		}

// 		var speed = 3200
// 		var heightbefore = parseInt(detailDom.style.height.slice(0,-2))
// 		var heightafter = track.offsetTop + track.offsetHeight + 28
// 		var duration = (Math.abs(heightafter-heightbefore))/speed
// 		detailDom.style.transitionDuration = duration+"s"
// 		detailDom.style.height = heightafter+"px"

// 	}
// 	// })

// }

// function newDetailDom(){
// 	var detail = document.createElement('div')
// 	detail.setAttribute("class","detail")
// 	var point = document.createElement('div')
// 	point.setAttribute("class","point")
// 	var cover = document.createElement('div')
// 	cover.setAttribute("class","cover")
// 	var title = document.createElement('div')
// 	title.setAttribute("class","title")
// 	var owner = document.createElement('div')
// 	owner.setAttribute("class","owner")
// 	var track = document.createElement('div')
// 	track.setAttribute("class","track")
// 	detail.appendChild(point)
// 	detail.appendChild(cover)
// 	detail.appendChild(title)
// 	detail.appendChild(owner)
// 	detail.appendChild(track)
// 	detail.style.height = '0px'
// 	return detail
// }

// function playRecord(params){

// 	const id = params.id
// 	const dataType = params.dataType

// 	let musicTrack = []

// 	if (dataType=="recipe"){
// 		if (recipeInfo[id]["musicTrack"] == null){
// 			loadRecipeSongs(id,playRecord,params)
// 			return
// 		}
// 		musicTrack = recipeInfo[id]["musicTrack"]
// 	}
// 	else if (dataType=="chart"){
// 		if (recipeInfo[id]["musicTrack"] == null){
// 			loadRecipeSongs(id,playRecord,params)
// 			return
// 		}
// 		musicTrack = recipeInfo[id]["musicTrack"]
// 	}
// 	else if (dataType=="album"){
// 		if (albumInfo[id]["musicTrack"] == null){
// 			loadAlbumSongs(id,playRecord,params)
// 			return
// 		}
// 		musicTrack = albumInfo[id]["musicTrack"]
// 	}
// 	else if (dataType=="artist"){
// 		if (artistInfo[id]["musicTrack"] == null){
// 			loadArtistSongs(id,playRecord,params)
// 			return
// 		}
// 		musicTrack = artistInfo[id]["musicTrack"]
// 	}

// 	if (addToPlayList(musicTrack,1) == false){
// 		// showDialog(5,"一首都听不了欸","好吧","哦",noOperation,null,noOperation,null)
// 		return
// 	}
	
// 	playSong()

// }


window.onload = function(){
	// for(let i=0;i<favoriteArtists.length;i++){
	// 	tabs["mainTabs"][2]["subTabs"].push({
	// 		"text":favoriteArtists[i]["name"],
	// 		"containerInstance":new Container("album",loadArtistAlbum,{artistId:favoriteArtists[i]["id"]})
	// 	})
	// }
	mainTabs[0].click()
}

const tabs = {
	"mainTabs":[
		// playlist 0 
		{
			"subTabs":[
				{
					"text":"自建",
					"containerInstance": Container(display.playlist.user, [userId, true])
				},
				{
					"text":"收藏",
					"containerInstance": Container(display.playlist.user, [userId, false])
				},
				{
					"text":"推荐",
					"containerInstance": Container(display.playlist.recommend)
				},
				{
					"text":"精选",
					"containerInstance": Container(display.playlist.awesome)
				},
				{
					"text":"热门",
					"containerInstance": Container(display.playlist.hot)
				},
				{
					"text":"榜单",
					"containerInstance": Container(display.playlist.chart)
				},
			],
			"focus": 2,
		},
		//album 1
		{
			"subTabs":[
				// {
				// 	"text":"我收藏的",
				// 	"containerInstance":""
				// },
				{
					"text":"热门",
					"containerInstance": Container(display.album.hot)
				},
				{
					"text":"全部",
					"containerInstance": Container(display.album.new, ['ALL'])
				},
				{
					"text":"华语",
					"containerInstance": Container(display.album.new, ['ZH'])
				},
				{
					"text":"欧美",
					"containerInstance": Container(display.album.new, ['EA'])
				},
				{
					"text":"韩国",
					"containerInstance": Container(display.album.new, ['KR'])
				},
				{
					"text":"日本",
					"containerInstance": Container(display.album.new, ['JP'])
				},
				
			],
			"focus": 0,
		},
		//artist 2
		{
			"subTabs":[
				{
					"text":"入驻歌手",
					"containerInstance": Container(display.artist.all, [5001])
				},
				{
					"text":"热门",
					"containerInstance": Container(display.artist.top)
				},
			],
			"focus": 0,
		}
	],
	"focus":0
}

for (let i=0;i<mainTabs.length;i++){
	mainTabs[i].onclick = function(){
		unfoucsTabs(maintab)
		this.setAttribute("class","focus")
		var mainTabFocusBeforeIndex = tabs["focus"]
		// if(i == mainTabFocusBeforeIndex){
		// 	return
		// }
		tabs["focus"] = i
		var mainTabFocusBefore = tabs["mainTabs"][mainTabFocusBeforeIndex]
		var mainTabFocusNow = tabs["mainTabs"][i]

		var subTabFocusBeforeIndex = mainTabFocusBefore["focus"]
		var subTabFocusBefore = mainTabFocusBefore["subTabs"][subTabFocusBeforeIndex]
		subTabFocusBefore["containerInstance"].hide()
		// console.log("hide",subTabFocusBefore)
		subtab.innerHTML

		for(let j = 0;j<mainTabFocusNow["subTabs"].length;j++){
			var subTab = document.createElement('li')
			subTab.innerHTML = mainTabFocusNow["subTabs"][j]["text"]
			var separator = document.createElement('span')
			separator.innerHTML = "/"
			subTab.onclick = function(){
				unfoucsTabs(subtab)
				this.setAttribute("class","focus")
				var subTabFocusBeforeIndex = mainTabFocusNow["focus"]
				var subTabFocusBefore = mainTabFocusNow["subTabs"][subTabFocusBeforeIndex]
				// if(j == subTabFocusBeforeIndex){
				// 	return
				// }
				subTabFocusBefore["containerInstance"].hide()
				// console.log("hide",subTabFocusBefore)
				mainTabFocusNow["focus"] = j
				var subTabFocusNow = mainTabFocusNow["subTabs"][j]
				// console.log("recover",subTabFocusNow)
				subTabFocusNow["containerInstance"].recover()		
			}
			subTab.oncontextmenu = function(){
				if (mainTabFocusNow["focus"] == j){
					var subTabFocusNow = mainTabFocusNow["subTabs"][j]
					// console.log("reload",subTabFocusNow)
					subTabFocusNow["containerInstance"].reload()
				}
			}
			subtab.appendChild(subTab)
			if(j!=mainTabFocusNow["subTabs"].length-1)
				subtab.appendChild(separator)
		}

		var subTabs = subtab.getElementsByTagName("li")
		var subTabFocusNowIndex = mainTabFocusNow["focus"]
		subTabs[subTabFocusNowIndex].setAttribute("class","focus")
		mainTabFocusNow["subTabs"][subTabFocusNowIndex]["containerInstance"].recover()
	}
}

function unfoucsTabs(dom){
	let domTabs = dom.getElementsByTagName("li")
	for(let i=0;i<domTabs.length;i++){
		domTabs[i].setAttribute("class","")
	}
}



function inPlayList(songId){
	for(let i=0;i<player.list.length;i++){
		if(player.list[i]==songId)
			return i
	}
	return -1
}


function addToPlayList(songIds,cover=0){
	let checked = []
	for(let i=0;i<songIds.length;i++){
		if (checkSongUrlStatus(songIds[i])>=-1){
			checked.push(songIds[i])
		}
	}
	if(checked.length==0){
		return false
	}
	else if(cover==1){
		player.list = checked
		player.index = 0
	}
	else if(cover==0){
		player.list = player.list.concat(checked)
	}
	return true
}