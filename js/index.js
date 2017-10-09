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


function showAlbum(albumId){
	var album = document.createElement('div')
	album.setAttribute("class","album")
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	var img = document.createElement('img')
	img.setAttribute('src', albumInfo[albumId]["coverUrl"])
	cover.appendChild(img)
	var name = document.createElement('div')
	name.setAttribute("class","name")
	name.innerHTML = albumInfo[albumId]["albumName"]
	var description = document.createElement('div')
	description.setAttribute("class","description")
	description.innerHTML = albumInfo[albumId]["publishDate"]
	album.appendChild(cover)
	album.appendChild(name)
	album.appendChild(description)
	album.setAttribute("albumId",albumId)
	album.addEventListener("click", playAlbum)
	container.appendChild(album)
}


function showRecipe(recipeId){
	var recipe = document.createElement('div')
	recipe.setAttribute("class","recipe")
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	var img = document.createElement('img')
	img.setAttribute('src', recipeInfo[recipeId]["coverUrl"])
	cover.appendChild(img)
	var name = document.createElement('div')
	name.setAttribute("class","name")
	name.innerHTML = recipeInfo[recipeId]["recipeName"]
	var description = document.createElement('div')
	description.setAttribute("class","description")
	description.innerHTML = recipeInfo[recipeId]["playCount"]
	recipe.appendChild(cover)
	recipe.appendChild(name)
	recipe.appendChild(description)
	recipe.setAttribute("recipeId",recipeId)
	recipe.addEventListener("click", playRecipe)
	container.appendChild(recipe)
}

function showChart(chartId){
	var chart = document.createElement('div')
	chart.setAttribute("class","chart")
	var cover = document.createElement('div')
	cover.setAttribute("class","cover")
	var img = document.createElement('img')
	img.setAttribute('src', chartInfo[chartId]["coverUrl"])
	cover.appendChild(img)
	var name = document.createElement('div')
	name.setAttribute("class","name")
	name.innerHTML = chartInfo[chartId]["chartName"]
	var description = document.createElement('div')
	description.setAttribute("class","description")
	description.innerHTML = chartInfo[chartId]["updateTime"]
	chart.appendChild(cover)
	chart.appendChild(name)
	chart.appendChild(description)
	chart.setAttribute("chartId",chartId)
	chart.addEventListener("click", playChart)
	container.appendChild(chart)
}


function playAlbum(albumId){

	if (albumId.toString() === "[object MouseEvent]"){
		albumId = this.getAttribute("albumId")
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
		recipeId = this.getAttribute("recipeId")
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
		chartId = this.getAttribute("chartId")
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


