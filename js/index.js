const BrowserWindow = require('electron').remote.BrowserWindow;
const Encrypt = require('./js/crypto.js');

var current_window = BrowserWindow.getFocusedWindow();
var loading = 0

document.getElementById('minimize').onclick = function(){
	current_window.minimize();
}
document.getElementById('close').onclick = function(){
	current_window.close();
}
// document.getElementById('maximize').onclick = function(){
// 	current_window.isMaximized() ?
// 	current_window.restore() :
// 	current_window.maximize();
// }


// var storeScene =false
// window.onbeforeunload = function(event){
// 	if(storeScene==0){
// 		event.returnValue = false;
// 		storage.set('player', { "list": player.list,"index":player.index,"random":player.random,"cycle":player.cycle }, function(error) {
// 			current_window.close();
// 			storeScene = true
// 		})
// 	}
// }; 






const container = document.getElementsByTagName("container")[0];

const artistTab = document.getElementsByTagName("li")[0]
const albumTab = document.getElementsByTagName("li")[1]
const recipeTab = document.getElementsByTagName("li")[2]
const chartTab = document.getElementsByTagName("li")[3]
const userTab = document.getElementsByTagName("li")[4]

const title = document.getElementById("title")
const subtitle = document.getElementById("subtitle")
const mainTabs = title.getElementsByTagName("li")

var artists = [
	{
		"text":"欅坂46",
		"param":"12009134"
	},
	{
		"text":"乃木坂46",
		"param":"20846"
	},
	{
		"text":"AKB48",
		"param":"18355"
	},
	// {
	// 	"text":"SKE48",
	// 	"param":"21401"
	// },
	{
		"text":"NMB48",
		"param":"20818"
	},
	{
		"text":"HKT48",
		"param":"711143"
	},
	{
		"text":"NGT48",
		"param":"12006263"
	},
	{
		"text":"SNH48",
		"param":"794014"
	}
]
const albumTypes = [
	{
		"text":"全部",
		"param":"ALL"
	},
	{
		"text":"华语",
		"param":"ZH"
	},
	{
		"text":"欧美",
		"param":"EA"
	},
	{
		"text":"韩国",
		"param":"KR"
	},
	{
		"text":"日本",
		"param":"JP"
	},
]

var recipeTypes = [
	{
		"text":"全部",
		"param":"全部"
	},
	{
		"text":"华语",
		"param":"华语"
	},
	{
		"text":"流行",
		"param":"流行"
	},
	{
		"text":"摇滚",
		"param":"摇滚"
	},
	{
		"text":"民谣",
		"param":"民谣"
	},
	{
		"text":"电子",
		"param":"电子"
	},
	{
		"text":"轻音乐",
		"param":"轻音乐"
	},
]


// const types = ["全部","华语","欧美","日语","韩语","粤语","小语种","流行","摇滚","民谣","电子","舞曲","说唱","轻音乐","爵士","乡村","R&B/Soul","古典","民族","英伦","金属","朋克","蓝调","雷鬼","世界音乐","拉丁","另类/独立","NewAge","古风","后摇","BossaNova","清晨","夜晚","学习","工作","午休","下午茶","地铁","驾车","运动","旅行","散步","酒吧","怀旧","清新","浪漫","性感","伤感","治愈","放松","孤独","感动","兴奋","快乐","安静","思念","影视原声","ACG","校园","游戏","70后","80后","90后","网络歌曲","KTV","经典","翻唱","吉他","钢琴","器乐","儿童","榜单","00后"]




window.onload = function(){
	mainTabClickBind(artistTab,artists,loadArtistAlbum)
	mainTabClickBind(albumTab,albumTypes,loadNewAlbums)
	mainTabClickBind(recipeTab,recipeTypes,loadRecommandRecipe)
	artistTab.click()
}

function setScrollLoad(loadFunc,argument){
	container.onscroll = function(){
		if (container.scrollHeight-120<container.scrollTop+window.innerHeight) {
			loadFunc(argument)
		}
	}
}

function mainTabClickBind(mainTab,data,targetfunc){

	mainTab.onclick = function(){
		for(var i=0;i<mainTabs.length;i++){
			mainTabs[i].setAttribute("class","")
		}
		this.setAttribute("class","focus")

		while(container.childNodes.length!=0){
			container.removeChild(container.childNodes[0]);
		}
		while(subtitle.childNodes.length!=0){
			subtitle.removeChild(subtitle.childNodes[0]);
		}

		for(var i=0;i<data.length;i++){
			addSubTab(data[i]["text"],targetfunc,data[i]["param"])
			if (i!=data.length-1){
				var separator = document.createElement('span')
				separator.innerHTML = "/"
				subtitle.appendChild(separator)
			}
		}
		var view = this.getAttribute("view")
		view = view ? view : 0
		subtitle.getElementsByTagName("li")[view].click()
	}
}


function addSubTab(text,targetfunc,param){
	var subTab = document.createElement('li')
	subTab.innerHTML = text
	subTab.setAttribute("param",param)
	
	subTab.onclick = function (){
		loading = 0
		var subTabs = subtitle.getElementsByTagName("li")
		var focusedMainTab = title.getElementsByClassName("focus")[0]
		for(var i=0;i<subTabs.length;i++){
			if(subTabs[i]==this){
				focusedMainTab.setAttribute("view",i)
				this.setAttribute("class","focus")
			}
			else{
				subTabs[i].setAttribute("class","")
			}
		}
		while(container.childNodes.length!=0){
			container.removeChild(container.childNodes[0]);
		}
		var argument = this.getAttribute("param")
		setScrollLoad(targetfunc,argument)
		targetfunc(argument)
	}

	subtitle.appendChild(subTab)

}


chartTab.onclick = function(){
	for(var i=0;i<mainTabs.length;i++){
		mainTabs[i].setAttribute("class","")
	}
	chartTab.setAttribute("class","focus")

	while(container.childNodes.length!=0){
		container.removeChild(container.childNodes[0]);
	}
	while(subtitle.childNodes.length!=0){
		subtitle.removeChild(subtitle.childNodes[0]);
	}
	subtitle.innerHTML = "排行榜"
	container.onscroll = null
	loadTopList()
}


userTab.onclick = function(){
	for(var i=0;i<mainTabs.length;i++){
		mainTabs[i].setAttribute("class","")
	}
	userTab.setAttribute("class","focus")

	while(container.childNodes.length!=0){
		container.removeChild(container.childNodes[0]);
	}
	while(subtitle.childNodes.length!=0){
		subtitle.removeChild(subtitle.childNodes[0]);
	}
	subtitle.innerHTML = "用户歌单"
	container.onscroll = null
	loadUserRecipe(38050391)
}


function showAlbum(albumId){
	var albumAmount = document.querySelectorAll("container>.album").length
	if(albumAmount%4==0&&albumAmount!=0)
		insertDetailBlock()
	var album = document.createElement('div')
	album.setAttribute("class","album")
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	cover.style.backgroundImage = "url("+albumInfo[albumId]["coverUrl"]+"?param=240y240)"
	cover.addEventListener("click", showAlbumDetail)
	var name = document.createElement('div')
	name.setAttribute("class","name")
	name.innerHTML = albumInfo[albumId]["albumName"]
	var description = document.createElement('div')
	description.setAttribute("class","description")
	description.innerHTML = albumInfo[albumId]["publishDate"]
	var operation = document.createElement('div')
	operation.setAttribute("class","operation")
	var play = document.createElement('button')
	play.setAttribute("class","play")
	play.addEventListener("click", playAlbum)
	var add = document.createElement('button')
	add.setAttribute("class","add")
	var detail = document.createElement('button')
	detail.setAttribute("class","detail")
	detail.addEventListener("click", showAlbumDetail)
	operation.appendChild(play)
	operation.appendChild(add)
	operation.appendChild(detail)
	album.appendChild(cover)
	album.appendChild(name)
	album.appendChild(description)
	album.appendChild(operation)
	album.setAttribute("albumId",albumId)
	container.appendChild(album)
}


function insertDetailBlock(){
	var detail = document.createElement('div')
	detail.setAttribute("class","detail hide")
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
	container.appendChild(detail)
}



function showRecipe(recipeId){
	var recipeAmount = document.querySelectorAll("container>.recipe").length
	if(recipeAmount%4==0&&recipeAmount!=0)
		insertDetailBlock()
	var recipe = document.createElement('div')
	recipe.setAttribute("class","recipe")
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	cover.style.backgroundImage = "url("+recipeInfo[recipeId]["coverUrl"]+"?param=240y240)"
	cover.addEventListener("click", showRecipeDetail)
	var name = document.createElement('div')
	name.setAttribute("class","name")
	name.innerHTML = recipeInfo[recipeId]["recipeName"]
	var description = document.createElement('div')
	description.setAttribute("class","description")
	description.innerHTML = recipeInfo[recipeId]["playCount"]
	var operation = document.createElement('div')
	operation.setAttribute("class","operation")
	var play = document.createElement('button')
	play.setAttribute("class","play")
	play.addEventListener("click", playRecipe)
	var add = document.createElement('button')
	add.setAttribute("class","add")
	var detail = document.createElement('button')
	detail.setAttribute("class","detail")
	detail.addEventListener("click", showRecipeDetail)
	operation.appendChild(play)
	operation.appendChild(add)
	operation.appendChild(detail)
	recipe.appendChild(cover)
	recipe.appendChild(name)
	recipe.appendChild(description)
	recipe.appendChild(operation)
	recipe.setAttribute("recipeId",recipeId)
	// recipe.addEventListener("click", playRecipe)
	container.appendChild(recipe)
}

function showChart(chartId){
	var chartAmount = document.querySelectorAll("container>.chart").length
	if(chartAmount%4==0&&chartAmount!=0)
		insertDetailBlock()
	var chart = document.createElement('div')
	chart.setAttribute("class","chart")
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	cover.style.backgroundImage = "url("+chartInfo[chartId]["coverUrl"]+"?param=240y240)"
	cover.addEventListener("click", showChartDetail)
	var name = document.createElement('div')
	name.setAttribute("class","name")
	name.innerHTML = chartInfo[chartId]["chartName"]
	var description = document.createElement('div')
	description.setAttribute("class","description")
	description.innerHTML = chartInfo[chartId]["updateTime"]
	var operation = document.createElement('div')
	operation.setAttribute("class","operation")
	var play = document.createElement('button')
	play.setAttribute("class","play")
	play.addEventListener("click", playChart)
	var add = document.createElement('button')
	add.setAttribute("class","add")
	var detail = document.createElement('button')
	detail.setAttribute("class","detail")
	detail.addEventListener("click", showChartDetail)
	operation.appendChild(play)
	operation.appendChild(add)
	operation.appendChild(detail)
	chart.appendChild(cover)
	chart.appendChild(name)
	chart.appendChild(description)
	chart.appendChild(operation)
	chart.setAttribute("chartId",chartId)
	// chart.addEventListener("click", playChart)
	container.appendChild(chart)
}


function playAlbum(albumId){

	if (albumId.toString() === "[object MouseEvent]"){
		var thisAlbum = this
		while (thisAlbum.getAttribute("class")!="album"){
			var thisAlbum = thisAlbum.parentNode
		}
		albumId = thisAlbum.getAttribute("albumId")
	}

	if (albumInfo[albumId]["musicTrack"] == null){
		loadAlbumSongs(albumId,playAlbum,albumId)
		return
	}

	
	if (addToPlayList(albumInfo[albumId]["musicTrack"],1) == false){
		showDialog(5,"一首都听不了欸","好吧","哦",noOperation,null,noOperation,null)
		return
	}
	
	readyPlay()

}

function playRecipe(recipeId){

	if (recipeId.toString() === "[object MouseEvent]"){
		var thisRecipe = this
		while (thisRecipe.getAttribute("class")!="recipe"){
			var thisRecipe = thisRecipe.parentNode
		}
		recipeId = thisRecipe.getAttribute("recipeId")
	}

	if (recipeInfo[recipeId]["musicTrack"] == null){
		loadRecipeSongs(recipeId,playRecipe,recipeId)
		return
	}

	if (addToPlayList(recipeInfo[recipeId]["musicTrack"],1) == false){
		showDialog(5,"一首都听不了欸","好吧","哦",noOperation,null,noOperation,null)
		return
	}

	readyPlay()

}

function playChart(chartId){

	if (chartId.toString() === "[object MouseEvent]"){
		var thisChart = this
		while (thisChart.getAttribute("class")!="chart"){
			var thisChart = thisChart.parentNode
		}
		chartId = thisChart.getAttribute("chartId")
	}

	if (chartInfo[chartId]["musicTrack"] == null){
		loadChartSongs(chartId,playChart,chartId)
		return
	}

	if(addToPlayList(chartInfo[chartId]["musicTrack"],1) == false){
		showDialog(5,"一首都听不了欸","好吧","哦",noOperation,null,noOperation,null)
		return
	}

	readyPlay()

}

function showAlbumDetail(albumId){

	if (albumId.toString() === "[object MouseEvent]"){
		var thisAlbum = this
		while (thisAlbum.getAttribute("class")!="album"){
			var thisAlbum = thisAlbum.parentNode
		}
		albumId = thisAlbum.getAttribute("albumId")
		var allAlbums = document.querySelectorAll("container>.album")
		var albumIndex = 0
		for (var x=0;x<allAlbums.length;x++){
			if (allAlbums[x]==thisAlbum){
				albumIndex = x
				break
			}
		}
		var detailIndex = Math.floor(albumIndex/4)
		var pointIndex = albumIndex%4
		if(prepareDetail(detailIndex,pointIndex)==0){
			return
		}
	}

	if (albumInfo[albumId]["musicTrack"] == null){
		loadAlbumSongs(albumId,showAlbumDetail,albumId)
		return
	}

	var coverUrl = albumInfo[albumId]["coverUrl"]+"?param=360y360"
	var titleText = albumInfo[albumId]["albumName"]
	var ownerText = artistInfo[albumInfo[albumId]["artistId"]]["artistName"]
	var musicTrack = albumInfo[albumId]["musicTrack"]

	showDetail(coverUrl,titleText,ownerText,musicTrack)
	
}

function showRecipeDetail(recipeId){

	if (recipeId.toString() === "[object MouseEvent]"){
		var thisRecipe = this
		while (thisRecipe.getAttribute("class")!="recipe"){
			var thisRecipe = thisRecipe.parentNode
		}
		recipeId = thisRecipe.getAttribute("recipeId")
		var allRecipes = document.querySelectorAll("container>.recipe")
		var recipeIndex = 0
		for (var x=0;x<allRecipes.length;x++){
			if (allRecipes[x]==thisRecipe){
				recipeIndex = x
				break
			}
		}
		var detailIndex = Math.floor(recipeIndex/4)
		var pointIndex = recipeIndex%4
		if(prepareDetail(detailIndex,pointIndex)==0){
			return
		}
	}

	if (recipeInfo[recipeId]["musicTrack"] == null){
		loadRecipeSongs(recipeId,showRecipeDetail,recipeId)
		return
	}

	var coverUrl = recipeInfo[recipeId]["coverUrl"]+"?param=360y360"
	var titleText = recipeInfo[recipeId]["recipeName"]
	var ownerText = recipeInfo[recipeId]["creator"]
	var musicTrack = recipeInfo[recipeId]["musicTrack"]

	showDetail(coverUrl,titleText,ownerText,musicTrack)
	
}

function showChartDetail(chartId){

	if (chartId.toString() === "[object MouseEvent]"){
		var thisChart = this
		while (thisChart.getAttribute("class")!="chart"){
			var thisChart = thisChart.parentNode
		}
		chartId = thisChart.getAttribute("chartId")
		var allCharts = document.querySelectorAll("container>.chart")
		var chartIndex = 0
		for (var x=0;x<allCharts.length;x++){
			if (allCharts[x]==thisChart){
				chartIndex = x
				break
			}
		}
		var detailIndex = Math.floor(chartIndex/4)
		var pointIndex = chartIndex%4
		if(prepareDetail(detailIndex,pointIndex)==0){
			return
		}
	}

	if (chartInfo[chartId]["musicTrack"] == null){
		loadChartSongs(chartId,showChartDetail,chartId)
		return
	}

	var coverUrl = chartInfo[chartId]["coverUrl"]+"?param=360y360"
	var titleText = chartInfo[chartId]["chartName"]
	var ownerText = chartInfo[chartId]["updateTime"]
	var musicTrack = chartInfo[chartId]["musicTrack"]

	showDetail(coverUrl,titleText,ownerText,musicTrack)
	
}


function prepareDetail(detailIndex,pointIndex){

	var allDetails = document.querySelectorAll("container>.detail")
	var speed = 3200
	if(detailIndex>=allDetails.length){
		insertDetailBlock()
		var allDetails = document.querySelectorAll("container>.detail")
	}
	if(allDetails[detailIndex].getAttribute("belong")==pointIndex){
		var heightbefore = parseInt(allDetails[detailIndex].style.height.slice(0,-2))
		if (heightbefore == 0)
			var heightafter = allDetails[detailIndex].scrollHeight
		else
			var heightafter = 0
		var duration = (Math.abs(heightafter-heightbefore))/speed
		allDetails[detailIndex].style.transitionDuration = duration+"s"
		allDetails[detailIndex].style.height = heightafter+"px"

		return 0
	}

	for (var x=0;x<allDetails.length;x++){
		var heightbefore = parseInt(allDetails[x].style.height.slice(0,-2))
		if (heightbefore==0)
			continue
		allDetails[x].style.transitionDuration = heightbefore/speed+"s"
		allDetails[x].style.height = "0px"
	}
	allDetails[detailIndex].setAttribute("class","detail prepare")
	allDetails[detailIndex].setAttribute("belong",pointIndex)
	return 1

}

function showDetail(coverUrl,titleText,ownerText,musicTrack){
	
	var img = document.createElement('img');
	img.setAttribute("src",coverUrl)

	// albumColors = new AlbumColors(coverUrl);
	// albumColors.getColors(function(colors) 

	img.onload = function() {

		var colorThief = new ColorThief()
		var textColor = colorThief.getColor(this).toString()

		var detail = document.querySelectorAll("container>.detail.prepare")[0]
	
		var pointIndex = detail.getAttribute("belong")
		var point = detail.getElementsByClassName("point")[0]
		if (pointIndex==0)
			point.setAttribute("class","point first")
		else if (pointIndex==1)
			point.setAttribute("class","point second")
		else if (pointIndex==2)
			point.setAttribute("class","point third")
		else if (pointIndex==3)
			point.setAttribute("class","point fourth")

		var cover = detail.getElementsByClassName("cover")[0]
		cover.style.backgroundImage = "url(" + coverUrl + ")"


		var title = detail.getElementsByClassName("title")[0]
		title.innerHTML = titleText
		
		var owner = detail.getElementsByClassName("owner")[0]
		owner.innerHTML = ownerText
		owner.style.color = "rgb(" + textColor + ")"
		
		var track = detail.getElementsByClassName("track")[0]
		while(track.childNodes.length!=0){
			track.removeChild(track.childNodes[0])
		}
		track.setAttribute("list",musicTrack.toString())
		
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
					var musicTrack = this.parentNode.getAttribute("list").split(',')
					addToPlayList(musicTrack,1)
					player.index = inPlayList(songId)
					readyPlay()
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
		var heightbefore = parseInt(detail.style.height.slice(0,-2))
		var heightafter = track.offsetTop + track.offsetHeight + 28
		var duration = (Math.abs(heightafter-heightbefore))/speed
		detail.style.transitionDuration = duration+"s"
		detail.style.height = heightafter+"px"

		detail.setAttribute("class","detail")
	}

}

function inPlayList(songId){
	for(var x=0;x<player.list.length;x++){
		if(player.list[x]==songId)
			return x
	}
	return -1
}


function addToPlayList(songIds,cover=0){
	var checked = []
	for(var x=0;x<songIds.length;x++){
		if (checkSongUrlStatus(songIds[x])>=0){
			checked.push(songIds[x])
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
		player.list = player.list.concat(checked);
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


