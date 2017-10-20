const BrowserWindow = require('electron').remote.BrowserWindow
const Encrypt = require('./js/crypto.js')
const storage = require('electron-json-storage')

var current_window = BrowserWindow.getFocusedWindow()
var loading = 0

document.getElementById('minimize').onclick = function(){
	current_window.minimize()
}
document.getElementById('close').onclick = function(){
	current_window.close()
}
// document.getElementById('maximize').onclick = function(){
// 	current_window.isMaximized() ?
// 	current_window.restore() :
// 	current_window.maximize();
// }


// store
var storeScene = false
window.onbeforeunload = function(event){
	if(storeScene==0){
		event.returnValue = false
		storage.set('player', { "list": player.list,"index":player.index,"random":player.random,"cycle":player.cycle }, function(error) {
			current_window.close()
			storeScene = true
		})
	}
}

// restore
storage.get('player', function(error, reserve) {
	if (error) throw error
	if ("list" in reserve&&"index" in reserve&&"random" in reserve&&"cycle" in reserve){
		player.list = reserve.list
		player.index = reserve.index
		player.random = reserve.random
		player.cycle = reserve.cycle
		if(player.list.length!=0){
			playSong({playNow:0})
		}
	}
})


const container = document.getElementsByTagName("container")[0]
const maintab = document.getElementById("maintab")
const subtab = document.getElementById("subtab")
const mainTabs = maintab.getElementsByTagName("li")


function Container(dataType,loadMoreFunc,loadMoreFuncParams) {
	this.items = []
	this.loadMoreFunc = loadMoreFunc
	this.loadMoreFuncParams = loadMoreFuncParams
	this.more = 1
	this.scroll = 0
	this.extend = null
	this.dataType = dataType
	this.add = function(value) {
		for (var x=0;x<this.items.length;x++){
			if(this.items[x]==value)
				return
		}
		this.items.push(value)
	}
	this.refresh = function() {
		var records = document.querySelectorAll("container>."+this.dataType)
		var details = document.querySelectorAll("container>.detail")
		while(Math.floor(this.items.length/4)+1!=details.length){
			var detail = newDetailDom()
			container.appendChild(detail)
			var details = document.querySelectorAll("container>.detail")
		}
		for (var x=records.length;x<this.items.length;x++){
			var detailIndex = Math.floor(x/4)
			var recipe = newRecordDom(this,x,dataType)
			container.insertBefore(recipe,details[detailIndex])
		}
	}
	this.recover = function(){
		loading = 0
		if(this.items.length==0){
			this.loadMoreFunc(this,this.loadMoreFuncParams)
		}
		else{
			this.refresh()
			var lastExtend = this.extend
			if (lastExtend != null){
				this.extend = null
				this.extendControl(lastExtend)
			}
			var lastScroll = this.scroll
			container.scrollTop = lastScroll
		}
		if(this.more==1){
			setScrollLoad(this.loadMoreFunc,this,this.loadMoreFuncParams)
		}
		else{
			setScrollLoad(noOperation,this,null)
		}
	}
	this.reload = function(){
		this.items = []
		this.more = 1
		this.extend = null
		loadMoreFunc(this,loadMoreFuncParams)
	}
	this.getOffset = function(){
		return this.items.length
	}
	this.scrollStop = function(){
		this.more = 0
		setScrollLoad(noOperation,this,null)
	}
	this.play = function(index){
		var id = this.items[index]
		playRecord({id:id,dataType:this.dataType})
	}
	this.extendControl = function(index){

		var targetIndex = Math.floor(index/4)
		var targetDom = document.querySelectorAll("container>.detail")[targetIndex]
		
		if (this.extend!=null){
			var beforeIndex = Math.floor(this.extend/4)
			var beforeDom = document.querySelectorAll("container>.detail")[beforeIndex]
			foldDetail(beforeDom)//scrollTop !!!
			if (this.extend == index){
				this.extend = null
				return
			}
		}

		this.extend = index
		var id = this.items[index]
		var pointIndex = index%4
		var point = targetDom.getElementsByClassName("point")[0]
		if (pointIndex==0)
			point.setAttribute("class","point first")
		else if (pointIndex==1)
			point.setAttribute("class","point second")
		else if (pointIndex==2)
			point.setAttribute("class","point third")
		else if (pointIndex==3)
			point.setAttribute("class","point fourth")

		showDetail({detailDom:targetDom,id:id,dataType:this.dataType})
	}
	this.hide = function(){
		this.scroll = container.scrollTop
		cleanDomChilds(container)
	}
}


function setScrollLoad(loadMoreFunc,containerInstance,loadMoreFuncParams){
	container.onscroll = function(){
		if (container.scrollHeight-640<container.scrollTop+container.offsetHeight) {
			loadMoreFunc(containerInstance,loadMoreFuncParams)
		}
	}
}

function foldDetail(detailDom){
	var speed = 3200
	var heightbefore = parseInt(detailDom.style.height.slice(0,-2))
	if (heightbefore == 0)
		var heightafter = detailDom.scrollHeight
	else
		var heightafter = 0
	var duration = (Math.abs(heightafter-heightbefore))/speed
	detailDom.style.transitionDuration = duration+"s"
	detailDom.style.height = heightafter+"px"
}


function showDetail(params){

	const id = params.id
	const dataType = params.dataType
	// const detailDom = params.detailDom

	if (dataType=="album"){
		if (albumInfo[id]["musicTrack"] == null){
			loadAlbumSongs(id,showDetail,params)
			return
		}
	}
	else if (dataType=="recipe"){
		if (recipeInfo[id]["musicTrack"] == null){
			loadRecipeSongs(id,showDetail,params)
			return
		}
	}
	else if (dataType=="chart"){
		if (recipeInfo[id]["musicTrack"] == null){
			loadRecipeSongs(id,showDetail,params)
			return
		}
	}
	else if (dataType=="artist"){
		if (artistInfo[id]["musicTrack"] == null){
			loadArtistSongs(id,showDetail,params)
			return
		}
	}

	fillDetailDom(params)
	
}

function fillDetailDom(params){

	const id = params.id
	const dataType = params.dataType
	const detailDom = params.detailDom

	const sizeControl = "?param=360y360"
	
	if (dataType=="album"){
		var coverUrl = albumInfo[id]["coverUrl"] + sizeControl
		var titleText = albumInfo[id]["albumName"]
		var ownerText = artistInfo[albumInfo[id]["artistId"]]["artistName"]
		var musicTrack = albumInfo[id]["musicTrack"]
	}
	else if (dataType=="recipe"){
		var coverUrl = recipeInfo[id]["coverUrl"] + sizeControl
		var titleText = recipeInfo[id]["recipeName"]
		var ownerText = "@" + recipeInfo[id]["creator"]
		var musicTrack = recipeInfo[id]["musicTrack"]
	}
	else if (dataType=="chart"){
		var coverUrl = recipeInfo[id]["coverUrl"] + sizeControl
		var titleText = recipeInfo[id]["recipeName"]
		var ownerText = recipeInfo[id]["updateTime"]
		var musicTrack = recipeInfo[id]["musicTrack"]
	}
	else if (dataType=="artist"){
		var coverUrl = artistInfo[id]["artistImage"] + sizeControl
		var titleText = artistInfo[id]["artistName"]
		var ownerText = artistInfo[id]["description"]
		var musicTrack = artistInfo[id]["musicTrack"]
	}


	var img = document.createElement('img')
	img.setAttribute("src",coverUrl)

	// albumColors = new AlbumColors(coverUrl)
	// albumColors.getColors(function(colors) 

	img.onload = function() {

		var colorThief = new ColorThief()
		var textColor = colorThief.getColor(this).toString()

		var cover = detailDom.getElementsByClassName("cover")[0]
		cover.style.backgroundImage = "url(" + coverUrl + ")"

		var title = detailDom.getElementsByClassName("title")[0]
		title.innerHTML = titleText
		
		var owner = detailDom.getElementsByClassName("owner")[0]
		owner.innerHTML = ownerText
		owner.style.color = "rgb(" + textColor + ")"
		
		var track = detailDom.getElementsByClassName("track")[0]
		cleanDomChilds(track)

		for(var x=0;x<musicTrack.length;x++){
			var songId = musicTrack[x]
			var songName = songInfo[songId]["songName"]
			var songDuration = secondReadable(songInfo[songId]["duration"]/1000)
			var artistName = artistInfo[songInfo[songId]["artistId"]]["artistName"]
			// var albumName = albumInfo[songInfo[songId]["albumId"]]["albumName"]
			var entry = document.createElement('div')
			entry.setAttribute("songId",songId)
			
			// var button = document.createElement('button')
			// button.style.color = "rgb(" + textColor + ")"
			if (checkSongUrlStatus(songId)>=0){
				entry.setAttribute("class","entry")
				// button.setAttribute("class","play")
				// entry.appendChild(button)
				entry.ondblclick = function(){
					var songId = this.getAttribute("songId")
					// var musicTrack = this.parentNode.getAttribute("list").split(',')
					addToPlayList(musicTrack,1)// can direct read!
					player.index = inPlayList(songId)
					playSong()
				}
			}
			else{
				entry.setAttribute("class","entry unable")
			}
			var index = document.createElement('a')
			index.setAttribute("class","index")
			index.innerHTML = x+1
			
			var song = document.createElement('a')
			song.setAttribute("class","song")
			song.innerHTML = songName
			var artist = document.createElement('a')
			artist.setAttribute("class","artist")
			artist.innerHTML = artistName
			// var album = document.createElement('a')
			// album.setAttribute("class","album")
			// album.innerHTML = albumName
			var duration = document.createElement('a')
			duration.setAttribute("class","duration")
			duration.innerHTML = songDuration
			entry.appendChild(index)
			entry.appendChild(song)
			entry.appendChild(artist)
			// entry.appendChild(album)
			entry.appendChild(duration)
			track.appendChild(entry)
		}

		var speed = 3200
		var heightbefore = parseInt(detailDom.style.height.slice(0,-2))
		var heightafter = track.offsetTop + track.offsetHeight + 28
		var duration = (Math.abs(heightafter-heightbefore))/speed
		detailDom.style.transitionDuration = duration+"s"
		detailDom.style.height = heightafter+"px"

	}

}

function newDetailDom(){
	var detail = document.createElement('div')
	detail.setAttribute("class","detail")
	var point = document.createElement('div')
	point.setAttribute("class","point")
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	var title = document.createElement('div')
	title.setAttribute("class","title")
	var owner = document.createElement('div')
	owner.setAttribute("class","owner")
	var track = document.createElement('div')
	track.setAttribute("class","track")
	detail.appendChild(point)
	detail.appendChild(cover)
	detail.appendChild(title)
	detail.appendChild(owner)
	detail.appendChild(track)
	detail.style.height = '0px'
	return detail
}

function newRecordDom(containerInstance,index,dataType){

	var id = containerInstance.items[index]

	if (dataType=="recipe"){
		var recordClass = "recipe"
		var coverUrl = recipeInfo[id]["coverUrl"]
		var nameText = recipeInfo[id]["recipeName"]
		var descriptionText = recipeInfo[id]["playCount"]
		// var keepClass = ["keep keeped","keep"][]
	}
	else if (dataType=="album"){
		var recordClass = "album"
		var coverUrl = albumInfo[id]["coverUrl"]
		var nameText = albumInfo[id]["albumName"]
		var descriptionText = albumInfo[id]["publishDate"]
	}
	else if (dataType=="chart"){
		var recordClass = "chart"
		var coverUrl = recipeInfo[id]["coverUrl"]
		var nameText = recipeInfo[id]["recipeName"]
		var descriptionText = recipeInfo[id]["updateTime"]
	}
	else if (dataType=="artist"){
		var recordClass = "artist"
		var coverUrl = artistInfo[id]["artistImage"]
		var nameText = artistInfo[id]["artistName"]
		var descriptionText = artistInfo[id]["musicSize"]
	}

	var record = document.createElement('div')
	record.setAttribute("class",recordClass)
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	cover.style.backgroundImage = "url("+coverUrl+"?param=240y240)"
	cover.onclick = function(){
		containerInstance.extendControl(index)
	}
	var name = document.createElement('div')
	name.setAttribute("class","name")
	name.innerHTML = nameText
	var description = document.createElement('div')
	description.setAttribute("class","description")
	description.innerHTML = descriptionText
	var operation = document.createElement('div')
	operation.setAttribute("class","operation")
	var play = document.createElement('button')
	play.setAttribute("class","play")
	play.onclick = function(){
		containerInstance.play(index)
	}
	var add = document.createElement('button')
	add.setAttribute("class","add")
	add.onclick = function(){

	}
	var detail = document.createElement('button')
	detail.setAttribute("class","detail")
	detail.onclick = function(){
		containerInstance.extendControl(index)
	}
	operation.appendChild(play)
	operation.appendChild(add)
	operation.appendChild(detail)
	record.appendChild(cover)
	record.appendChild(name)
	record.appendChild(description)
	record.appendChild(operation)
	return record
}


function playRecord(params){

	const id = params.id
	const dataType = params.dataType

	let musicTrack = []

	if (dataType=="recipe"){
		if (recipeInfo[id]["musicTrack"] == null){
			loadRecipeSongs(id,playRecord,params)
			return
		}
		musicTrack = recipeInfo[id]["musicTrack"]
	}
	else if (dataType=="chart"){
		if (recipeInfo[id]["musicTrack"] == null){
			loadRecipeSongs(id,playRecord,params)
			return
		}
		musicTrack = recipeInfo[id]["musicTrack"]
	}
	else if (dataType=="album"){
		if (albumInfo[id]["musicTrack"] == null){
			loadAlbumSongs(id,playRecord,params)
			return
		}
		musicTrack = albumInfo[id]["musicTrack"]
	}
	else if (dataType=="artist"){
		if (artistInfo[id]["musicTrack"] == null){
			loadArtistSongs(id,playRecord,params)
			return
		}
		musicTrack = artistInfo[id]["musicTrack"]
	}

	if (addToPlayList(musicTrack,1) == false){
		showDialog(5,"一首都听不了欸","好吧","哦",noOperation,null,noOperation,null)
		return
	}
	
	playSong()

}


window.onload = function(){
	for(let i=0;i<favoriteArtists.length;i++){
		tabs["mainTabs"][2]["subTabs"].push({
			"text":favoriteArtists[i]["name"],
			"containerInstance":new Container("album",loadArtistAlbum,{artistId:favoriteArtists[i]["id"]})
		})
	}
	mainTabs[0].onclick()
}

// const types = ["全部","华语","流行","摇滚","民谣","电子","轻音乐"]
// const types = ["全部","华语","欧美","日语","韩语","粤语","小语种","流行","摇滚","民谣","电子","舞曲","说唱","轻音乐","爵士","乡村","R&B/Soul","古典","民族","英伦","金属","朋克","蓝调","雷鬼","世界音乐","拉丁","另类/独立","NewAge","古风","后摇","BossaNova","清晨","夜晚","学习","工作","午休","下午茶","地铁","驾车","运动","旅行","散步","酒吧","怀旧","清新","浪漫","性感","伤感","治愈","放松","孤独","感动","兴奋","快乐","安静","思念","影视原声","ACG","校园","游戏","70后","80后","90后","网络歌曲","KTV","经典","翻唱","吉他","钢琴","器乐","儿童","榜单","00后"]


const tabs = {
	"mainTabs":[
		// playlist 0 
		{
			"subTabs":[
				{
					"text":"自建",
					"containerInstance":new Container("recipe",loadUserRecipe,{userId:userId,self:1})
				},
				{
					"text":"收藏",
					"containerInstance":new Container("recipe",loadUserRecipe,{userId:userId,self:0})
				},
				{
					"text":"推荐",
					"containerInstance":new Container("recipe",loadPersonalizedRecipe,{})
				},
				{
					"text":"精选",
					"containerInstance":new Container("recipe",loadHighQualityRecipe,{cat:"全部"})
				},
				{
					"text":"热门",
					"containerInstance":new Container("recipe",loadRecommandRecipe,{cat:"全部",order:"hot"})
				},
				{
					"text":"榜单",
					"containerInstance":new Container("chart",loadTopList,{})
				},
			],
			"focus":2,
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
					"containerInstance":new Container("album",loadHotAlbums,{})
				},
				{
					"text":"全部",
					"containerInstance":new Container("album",loadNewAlbums,{albumType:"ALL"})
				},
				{
					"text":"华语",
					"containerInstance":new Container("album",loadNewAlbums,{albumType:"ZH"})
				},
				{
					"text":"欧美",
					"containerInstance":new Container("album",loadNewAlbums,{albumType:"EA"})
				},
				{
					"text":"韩国",
					"containerInstance":new Container("album",loadNewAlbums,{albumType:"KR"})
				},
				{
					"text":"日本",
					"containerInstance":new Container("album",loadNewAlbums,{albumType:"JP"})
				},
				
			],
			"focus":0,
		},
		//artist 2
		{
			"subTabs":[
				// {
				// 	"text":"入驻歌手",
				// 	"containerInstance":new Container("artist",loadTopArtist,{})
				// },
				{
					"text":"热门",
					"containerInstance":new Container("artist",loadTopArtist,{})
				},
			],
			"focus":0,
		},
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
		cleanDomChilds(subtab)

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

function cleanDomChilds(dom){
	while(dom.childNodes.length!=0){
		dom.removeChild(dom.childNodes[0])
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
		if (checkSongUrlStatus(songIds[i])>=0){
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


function noOperation(){}


function showDialog(priority,message,prefer,alter,preferCallBack,preferArgument,alterCallBack,alterArgument){
	const btnAlter = document.getElementById("dialog").getElementsByClassName("option alter")[0]
	const btnPrefer = document.getElementById("dialog").getElementsByClassName("option prefer")[0]
	const maskArea = document.getElementById("mask")
	const messageArea = document.getElementById("message")

	maskArea.setAttribute("class","active")
	maskArea.style.zIndex = priority
	btnAlter.innerHTML = alter
	btnPrefer.innerHTML = prefer
	messageArea.innerHTML = message

	maskArea.onclick = function(){

		maskArea.setAttribute("class","")
		maskArea.onclick = null
		btnAlter.onclick = null
		btnPrefer.onclick = null
	}

	btnAlter.onclick = function(){
		alterCallBack(alterArgument)
		maskArea.setAttribute("class","")
		maskArea.onclick = null
		btnAlter.onclick = null
		btnPrefer.onclick = null
	}

	btnPrefer.onclick = function(){
		preferCallBack(preferArgument)
		maskArea.setAttribute("class","")
		maskArea.onclick = null
		btnAlter.onclick = null
		btnPrefer.onclick = null
	}

}


