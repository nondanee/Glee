var albumInfo = {}
var recipeInfo = {}
var chartInfo = {}
var artistInfo = {}
var songInfo = {}


function loadRecommandRecipe(containerInstance,params){

	if (loading == 1){console.log("loading");return;}
	else{loading = 1}

	const cat = params.cat ? params.cat : "全部"
	const order = params.order ? params.order : "hot"
	const offset = containerInstance.getOffset()

	const data = {
		cat: cat,
		order: order,
		offset: offset,
		total: "true",
		limit: 50
	}

	webApiRequest("POST","/weapi/playlist/list",data,dataArrive)

	function dataArrive(responseText) {

		var allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["playlists"]
		for (var i=0;i<allRecipe.length;i++)
		{
			var recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				var recipeName = allRecipe[i]["name"]
				var coverUrl = allRecipe[i]["coverImgUrl"]
				var playCount = allRecipe[i]["playCount"]
				// var description = allRecipe[i]["description"]
				// var creator = allRecipe[i]["creator"]["nickname"]
				var oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl}
				recipeInfo[recipeId] = oneRecipe
			}
			containerInstance.add(recipeId)
		}
		containerInstance.refresh()
		loading = 0

		if(offset==containerInstance.getOffset())
			containerInstance.scrollStop()
	}

}

function loadPersonalizedRecipe(containerInstance){

	const data = {}

	webApiRequest("POST","/weapi/personalized/playlist",data,dataArrive)

	function dataArrive(responseText) {

		var allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["result"]
		for (var i=0;i<allRecipe.length;i++)
		{
			var recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				var recipeName = allRecipe[i]["name"]
				var coverUrl = allRecipe[i]["picUrl"]
				var playCount = parseInt(allRecipe[i]["playCount"])
				var oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl}
				recipeInfo[recipeId] = oneRecipe
			}
			containerInstance.add(recipeId)
		}
		containerInstance.refresh()
		containerInstance.scrollStop()
	}

}


function loadHighQualityRecipe(containerInstance,params){

	const cat = params.cat ? params.cat : "全部"

	const data = {
		cat: cat,
		offset: 0,
		limit: 100,
		csrf_token: ""
	}

	webApiRequest("POST","/weapi/playlist/highquality/list",data,dataArrive)

	function dataArrive(responseText) {

		var allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["playlists"]
		for (var i=0;i<allRecipe.length;i++)
		{
			var recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				var recipeName = allRecipe[i]["name"]
				var coverUrl = allRecipe[i]["coverImgUrl"]
				var playCount = allRecipe[i]["playCount"]
				// var description = allRecipe[i]["description"]
				// var creator = allRecipe[i]["creator"]["nickname"]
				var oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl}
				recipeInfo[recipeId] = oneRecipe
			}
			containerInstance.add(recipeId)
		}
		containerInstance.refresh()
		containerInstance.scrollStop()
	}

}


function loadUserRecipe(containerInstance,params){

	const userId = params.userId
	const self = params.self

	const data = {
		offset: 0,
		uid: userId,
		limit: 1000,
		csrf_token: ""
	}

	webApiRequest("POST","/weapi/user/playlist",data,dataArrive)

	function dataArrive(responseText) {

		var allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["playlist"]
		for (var i=0;i<allRecipe.length;i++)
		{
			var creatorId = allRecipe[i]["creator"]["userId"]
			if(self==0&&creatorId==userId)
				continue
			else if(self==1&&creatorId!=userId)
				continue
			var recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				var recipeName = allRecipe[i]["name"]
				var coverUrl = allRecipe[i]["coverImgUrl"]
				var playCount = allRecipe[i]["playCount"]
				var description = allRecipe[i]["description"]
				var creator = allRecipe[i]["creator"]["nickname"]
				var oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl,"description":description,"creator":creator}
				recipeInfo[recipeId] = oneRecipe
			}
			containerInstance.add(recipeId)			
		}
		containerInstance.refresh()
		containerInstance.scrollStop()
	}
}

function loadTopArtist(containerInstance,params){

	// const type = params.type

	const data = {
		// type: type,
		offset: 0,
		limit: 100,
		total: false,
		csrf_token: ""
	}

	webApiRequest("POST","/weapi/artist/top",data,dataArrive)

	function dataArrive(responseText) {

		var allArtist = JSON.parse(responseText)
		allArtist = allArtist["artists"]
		for (var i=0;i<allArtist.length;i++)
		{
			var artistId = allArtist[i]["id"]
			var artistName = allArtist[i]["name"]
			var artistImage = allArtist[i]["img1v1Url"]
			var musicSize = allArtist[i]["musicSize"]
			if (allArtist[i]["trans"]!="")
				var description = allArtist[i]["trans"]
			else if (allArtist[i]["alias"].length!=0)
				var description = allArtist[i]["alias"][0]
			else
				var description = ""
			if (!(artistId in artistInfo)){
				var oneArtist = {"artistName":artistName,"artistImage":artistImage,"musicSize":musicSize,"description":description}
				artistInfo[artistId] = oneArtist
			}
			else{
				artistInfo[artistId]["artistImage"] = artistImage
				artistInfo[artistId]["musicSize"] = musicSize
				artistInfo[artistId]["description"] = description
			}
			containerInstance.add(artistId)
		}
		containerInstance.refresh()
		containerInstance.scrollStop()
	}

}


function loadArtistAlbum(containerInstance,params){

	if (loading == 1){console.log("loading");return;}
	else{loading = 1}

	const artistId = params.artistId
	const offset = containerInstance.getOffset()

	const data = {
		offset: offset,
		limit: 12,
		csrf_token: ""
	}


	webApiRequest("POST","/weapi/artist/albums/"+artistId,data,dataArrive)

	function dataArrive(responseText) {

		var artistData = JSON.parse(responseText)
		allAlbum = artistData["hotAlbums"]
		for (var i=0;i<allAlbum.length;i++)
		{
			var albumId = allAlbum[i]["id"]
			var artistId = allAlbum[i]["artist"]["id"]
			var albumName = allAlbum[i]["name"]
			var coverUrl = allAlbum[i]["picUrl"]
			var publishDate = transformPublishDate(allAlbum[i]["publishTime"])
			if (!(albumId in albumInfo)){
				var oneAlbum = {"albumName":albumName,"publishDate":publishDate,"coverUrl":coverUrl,"artistId":artistId}
				albumInfo[albumId] = oneAlbum
			}
			else if(!("publishDate" in albumInfo[albumId]))
				albumInfo[albumId]["publishDate"] = publishDate
			if (!(artistId in artistInfo)){
				var artistName = allAlbum[i]["artist"]["name"]
				var oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
			containerInstance.add(albumId)
		}
		containerInstance.refresh()
		loading = 0

		if(offset==containerInstance.getOffset())
			containerInstance.scrollStop()
	}

}

function loadHotAlbums(containerInstance){

	const data = {
		"csrf_token": ""
	}

	webApiRequest("POST","/api/discovery/newAlbum",data,dataArrive)

	function dataArrive(responseText) {
		var albumData = JSON.parse(responseText)
		allAlbum = albumData["albums"]
		for (var i=0;i<allAlbum.length;i++)
		{
			var albumId = allAlbum[i]["id"]
			var artistId = allAlbum[i]["artist"]["id"]
			if (!(albumId in albumInfo)){
				var albumName = allAlbum[i]["name"]
				var coverUrl = allAlbum[i]["picUrl"]
				var publishDate = transformPublishDate(allAlbum[i]["publishTime"])
				var oneAlbum = {"albumName":albumName,"publishDate":publishDate,"coverUrl":coverUrl,"artistId":artistId}
				albumInfo[albumId] = oneAlbum
			}
			else if(!("publishDate" in albumInfo[albumId]))
				albumInfo[albumId]["publishDate"] = publishDate
			if (!(artistId in artistInfo)){
				var artistName = allAlbum[i]["artist"]["name"]
				var oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
			containerInstance.add(albumId)
		}
		containerInstance.refresh()
		containerInstance.scrollStop()
	}

}

function loadNewAlbums(containerInstance,params){

	const albumType = params.albumType ? params.albumType : "ALL"
	const offset = containerInstance.getOffset()

	if (loading == 1){console.log("loading");return;}
	else{loading = 1}

	// type ALL,ZH,EA,KR,JP
	const data = {
		"offset": offset,
		"total": true,
		"limit": 35,
		"area": albumType,
		"csrf_token": ""
	}

	webApiRequest("POST","/weapi/album/new?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {

		var albumData = JSON.parse(responseText)
		allAlbum = albumData["albums"]
		for (var i=0;i<allAlbum.length;i++)
		{
			var albumId = allAlbum[i]["id"]
			var artistId = allAlbum[i]["artist"]["id"]
			if (!(albumId in albumInfo)){
				var albumName = allAlbum[i]["name"]
				var coverUrl = allAlbum[i]["picUrl"]
				var publishDate = transformPublishDate(allAlbum[i]["publishTime"])
				var oneAlbum = {"albumName":albumName,"publishDate":publishDate,"coverUrl":coverUrl,"artistId":artistId}
				albumInfo[albumId] = oneAlbum
			}
			else if(!("publishDate" in albumInfo[albumId]))
				albumInfo[albumId]["publishDate"] = publishDate
			if (!(artistId in artistInfo)){
				var artistName = allAlbum[i]["artist"]["name"]
				var oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
			containerInstance.add(albumId)
		}
		containerInstance.refresh()
		loading = 0

		if(offset==containerInstance.getOffset())
			containerInstance.scrollStop()
	}

}

function loadTopList(containerInstance){

	var xhr = new XMLHttpRequest()

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){

				try{
					var toplist = xhr.responseText.match(/(<div id="toplist"[^>]+?>[\s\S]+?)<div class="g-mn3">/)[0]
					var domParser = new DOMParser();
					var toplist = domParser.parseFromString(toplist,"text/html");
					var allChart = toplist.getElementsByTagName("li")
					for (var i=0;i<allChart.length;i++)
					{
						var chartId = allChart[i].getAttribute("data-res-id")
						if (!(chartId in chartInfo)){
							var chartName = allChart[i].getElementsByClassName("s-fc0")[0].innerHTML
							var coverUrl = allChart[i].getElementsByTagName("img")[0].getAttribute("src").slice(0,-12)
							var updateTime = allChart[i].getElementsByClassName("s-fc4")[0].innerHTML
							var oneChart = {"chartName":chartName,"updateTime":updateTime,"coverUrl":coverUrl}
							chartInfo[chartId] = oneChart
						}
						containerInstance.add(chartId)
					}
					containerInstance.refresh()
					containerInstance.scrollStop()
				}catch(e){
					console.log(e)
					loading = 0
				}
			}
			loading = 0
		}
	}

	xhr.open("GET","https://music.163.com/discover/toplist")
	xhr.send()

}


function loadChartSongs(chartId,callBack,callBackParams){

	var xhr = new XMLHttpRequest()

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){

				var trackInfo = JSON.parse(xhr.responseText)
				trackInfo = trackInfo["result"]["tracks"]
				var musicTrack = []
				for (var i=0;i<trackInfo.length;i++)
				{
					var albumId = trackInfo[i]["album"]["id"]
					var artistId = trackInfo[i]["artists"][0]["id"]
					var songId = trackInfo[i]["id"]
					musicTrack.push(songId)

					if (!(albumId in albumInfo)){
						var albumName = trackInfo[i]["album"]["name"]
						var coverUrl = trackInfo[i]["album"]["picUrl"]
						var oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
						albumInfo[albumId] = oneAlbum
					}
					if (!(songId in songInfo)){
						var songName = trackInfo[i]["name"]
						var duration = trackInfo[i]["duration"]
						var status = trackInfo[i]["status"]
						var fee = trackInfo[i]["fee"]
						var expiration = new Date().getTime()
						var oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee,"expiration":expiration}
						songInfo[songId] = oneSong
					}
					if (!(artistId in artistInfo)){
						var artistName = trackInfo[i]["artists"][0]["name"]
						var oneArtist = {"artistName":artistName}
						artistInfo[artistId] = oneArtist
					}
				}
				if (!("musicTrack" in chartInfo[chartId])){
					chartInfo[chartId]["musicTrack"] = musicTrack
				}
				callBack(callBackParams)

			}
		}
	}

	xhr.open("GET","http://music.163.com/api/playlist/detail?id="+chartId)
	xhr.send()

}

function loadArtistSongs(artistId,callBack,callBackParams){

	if (artistInfo[artistId]["musicTrack"] != null){
		console.log("already get");return;
	}

	const data = {
		csrf_token: ""
	}

	webApiRequest("POST","/weapi/v1/artist/"+artistId,data,dataArrive)

	function dataArrive(responseText) {
		var artistData = JSON.parse(responseText)
		var trackInfo = artistData["hotSongs"]
		var musicTrack = []
		for (var i=0;i<trackInfo.length;i++)
		{
			var songId = trackInfo[i]["id"]
			var albumId = trackInfo[i]["al"]["id"]
			musicTrack.push(songId)

			if (!(albumId in albumInfo)){
				var albumName = trackInfo[i]["al"]["name"]
				if(trackInfo[i]["al"]["pic_str"]!=null)
					var picStr = trackInfo[i]["al"]["pic_str"]
				else
					var picStr = trackInfo[i]["al"]["pic"]
				var coverUrl = getCoverUrl(picStr)
				var oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
				albumInfo[albumId] = oneAlbum
			}

			if (!(songId in songInfo)){
				var songName = trackInfo[i]["name"]
				var duration = trackInfo[i]["dt"]
				var status = trackInfo[i]["privilege"]["st"]
				var fee = trackInfo[i]["privilege"]["fee"]
				var expiration = new Date().getTime()
				var oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee,"expiration":expiration}
				songInfo[songId] = oneSong
			}
		}
		if (!("musicTrack" in artistInfo[artistId])){
			artistInfo[artistId]["musicTrack"] = musicTrack
		}
		callBack(callBackParams)
	}
}


function loadAlbumSongs(albumId,callBack,callBackParams){

	if (albumInfo[albumId]["musicTrack"] != null){
		console.log("already get");return;
	}

	const data = {
		csrf_token: ""
	}

	webApiRequest("POST","/weapi/v1/album/"+albumId,data,dataArrive)

	function dataArrive(responseText) {
		var albumData = JSON.parse(responseText)
		var trackInfo = albumData["songs"]
		var musicTrack = []
		for (var i=0;i<trackInfo.length;i++)
		{
			var artistId = trackInfo[i]["ar"][0]["id"]
			var songId = trackInfo[i]["id"]
			musicTrack.push(songId)

			if (!(songId in songInfo)){
				var songName = trackInfo[i]["name"]
				var duration = trackInfo[i]["dt"]
				var status = trackInfo[i]["privilege"]["st"]
				var fee = trackInfo[i]["privilege"]["fee"]
				var expiration = new Date().getTime()
				var oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee,"expiration":expiration}
				songInfo[songId] = oneSong
			}
			if (!(artistId in artistInfo)){
				var artistName = trackInfo[i]["ar"][0]["name"]
				var oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
		}
		if (!("musicTrack" in albumInfo[albumId])){
			albumInfo[albumId]["musicTrack"] = musicTrack
		}
		callBack(callBackParams)
	}

}


function loadRecipeSongs(recipeId,callBack,callBackParams){

	if (recipeInfo[recipeId]["musicTrack"] != null){
		console.log("already get");return;
	}

	const data = {
		"id": recipeId,
		"offset": 0,
		"total": 1000,
		"n": 1000,
		"limit": 1000,
		"csrf_token": ""
	};

	webApiRequest("POST","/weapi/v3/playlist/detail?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {

		var recipeData = JSON.parse(responseText)
		recipeInfo[recipeId]["description"] = recipeData["playlist"]["description"]
		recipeInfo[recipeId]["creator"] = recipeData["playlist"]["creator"]["nickname"]

		var musicTrack = []
		var trackInfo = recipeData["playlist"]["tracks"]
		var privileges = recipeData["privileges"]

		if(trackInfo.length!=privileges.length){console.log("error","tracks",trackInfo.length,"privileges",privileges.length)}//debug
		for (var x=0;x<trackInfo.length;x++)
		{
			var songId = trackInfo[x]["id"]
			var songIdDup = privileges[x]["id"]
			if(songId!=songIdDup){console.log("error","songId",songId,"songIdDup",songIdDup)}//debug
			var artistId = trackInfo[x]["ar"][0]["id"]
			var albumId = trackInfo[x]["al"]["id"]
			musicTrack.push(songId)

			if (!(albumId in albumInfo)){
				var albumName = trackInfo[x]["al"]["name"]
				var coverUrl = trackInfo[x]["al"]["picUrl"]
				var oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
				albumInfo[albumId] = oneAlbum
			}
			if (!(artistId in artistInfo)){
				var artistName = trackInfo[x]["ar"][0]["name"]
				var oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
			if (!(songId in songInfo)){
				var songName = trackInfo[x]["name"]
				var duration = trackInfo[x]["dt"]
				var status = privileges[x]["st"]
				var fee = privileges[x]["fee"]
				var expiration = new Date().getTime()
				var oneSong = {"songName":songName,"artistId":artistId,"albumId":albumId,"duration":duration,"status":status,"fee":fee,"expiration":expiration}
				songInfo[songId] = oneSong
			}
		}
		if (!("musicTrack" in recipeInfo[recipeId])){
			recipeInfo[recipeId]["musicTrack"] = musicTrack
		}
		callBack(callBackParams)
	}

}


function checkSongUrlStatus(songId){
	var now = new Date().getTime()
	if (songInfo[songId]["status"] == -1||songInfo[songId]["status"] == -200)
		return -2
	else if(songInfo[songId]["fee"] == 1||songInfo[songId]["fee"] == 4||songInfo[songId]["fee"] == 16)// fee = 8 is ok
		return -1
	else if(songInfo[songId]["songUrl"] == null||now>songInfo[songId]["expiration"])
		return 0
	else
		return 1
}

function getSongsInfo(songIds,callBack,callBackParams){

	const c = []
	const ids = []

	for(var x=0;x<songIds.length;x++){
		if (songIds[x] in songInfo)
			continue
		c.push({"id":songIds[x]})
		ids.push(songIds[x])
	}

	if (ids.length==0){return}

	const data = {
		c: JSON.stringify(c),
		ids: JSON.stringify(ids),
		csrf_token: ""
	}

	// const data = {
	// 	c: JSON.stringify([{id:songId}]),
	// 	ids: JSON.stringify([songId]),
	// 	csrf_token: ""
	// }

	webApiRequest("POST","/weapi/v3/song/detail",data,dataArrive)

	function dataArrive(responseText) {
		var songData = JSON.parse(responseText)
		privileges = songData["privileges"]
		songData = songData["songs"]
		for(var x=0;x<songData.length;x++){

			var songId = songData[x]["id"]
			var artistId = songData[x]["ar"][0]["id"]
			var albumId = songData[x]["al"]["id"]

			if (!(albumId in albumInfo)){
				if(songData[x]["al"]["pic_str"]!=null)
					var picStr = songData[x]["al"]["pic_str"]
				else
					var picStr = songData[x]["al"]["pic"]
				var coverUrl = getCoverUrl(picStr)
				var albumName = songData[x]["al"]["name"]
				var oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
				albumInfo[albumId] = oneAlbum
			}
			if (!(artistId in artistInfo)){
				var artistName = songData[x]["ar"][0]["name"]
				var oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
			if (!(songId in songInfo)){
				var songName = songData[x]["name"]
				var status = privileges[x]["st"]
				var fee = privileges[x]["fee"]
				var duration = songData[x]["dt"]
				var expiration = new Date().getTime()
				var oneSong = {"songName":songName,"artistId":artistId,"albumId":albumId,"duration":duration,"status":status,"fee":fee,"expiration":expiration}
				songInfo[songId] = oneSong
			}

			
		}		
		callBack(callBackParams)
	}
}

function getSongUrl(songId,callBack,callBackParams){

	if (!(songId in songInfo)){return}
	if (checkSongUrlStatus(songId)!=0){return}

	const data = {
		"ids": [songId],
		// "br": 999000,
		"br":320000,
		"csrf_token": ""
	};

	webApiRequest("POST","/weapi/song/enhance/player/url?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {
		var songData = JSON.parse(responseText)
		for (var x=0;x<songData["data"].length;x++)
		{
			var songId = songData["data"][x]["id"]
			var fee = songData["data"][x]["fee"]
			var songUrl = songData["data"][x]["url"]
			var songUrl = songData["data"][x]["url"]
			var expire = songData["data"][x]["expi"]
			songInfo[songId]["fee"] = fee
			if (songUrl==null){
				showDialog(20,"听不了额","好吧","哦",noOperation,null,noOperation,null)
				return
			}
			songInfo[songId]["songUrl"] = songUrl
			songInfo[songId]["expiration"] = new Date().getTime() + expire*1000
		}
		callBack(callBackParams)
	}

}


//参考 https://greasyfork.org/en/scripts/23222-网易云下载/code
const crypto = require('crypto')
function getCoverUrl(pic_str) {
	var byte1 = '3go8&$8*3*3h0k(2)2'
	var byte2 = pic_str + ''
	var byte3 = []
	for (var i = 0; i < byte2.length; i++) {
		byte3[i] = byte2.charCodeAt(i) ^ byte1.charCodeAt(i % byte1.length)
	}
	byte3 = byte3.map(function(i) {
		return String.fromCharCode(i)
	}).join('')
	var results = crypto.createHash('md5').update(byte3.toString()).digest('base64').replace(/\//g, '_').replace(/\+/g, '-')
	var url = 'http://p2.music.126.net/' + results + '/' + byte2 + '.jpg'
	return url
}

function transformPublishDate(millseconds){
	var date = new Date(millseconds)
	var year = date.getFullYear()
	var month = date.getMonth() + 1
	var day = date.getDate()
	day = (day < 10) ? "0"+day.toString() : day.toString()
	return year + "." + month + "." + day
}


const maxRetry = 300
var retry = 0

const request = require('request')

function webApiRequest(method="POST",path,data,callBack) {

	const cryptoreq = Encrypt(data)
	request({
		url: 'http://music.163.com/' + path,
		method: method,
		// headers: {
		// 	'Accept': '*/*',
		// 	'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
		// 	'Connection': 'keep-alive',
		// 	'Content-Type': 'application/x-www-form-urlencoded',
		// 	'Referer': 'http://music.163.com',
		// 	'Host': 'music.163.com',
		// 	'User-Agent': randomUserAgent()
		// },
		headers: {
			'Origin': 'http://music.163.com',
			'X-Real-IP': '118.88.88.88',
			'Accept-Language': 'q=0.8,zh-CN;q=0.6,zh;q=0.2',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
			'Referer': 'http://music.163.com/',
			'Cookie': 'os=uwp;'
		},
		form:{
			params: cryptoreq.params,
			encSecKey: cryptoreq.encSecKey
		}
	},function(error, response, body){
		if (error){
			console.log("request",error)
			webApiRequest(method,path,data,callBack)
			return
		}
		else if(body==""){
			retry = retry + 1
			console.log("retry-request",retry)
			if(retry > maxRetry){return}
			webApiRequest(method,path,data,callBack)
			return
		}
		else{
			retry = 0
			callBack(body)
		}
	})
}


// const os = require('os')
const path = require('path')
const fs = require('fs')
const nodeID3 = require('node-id3')
const shell = require('electron').shell

function songDownload(songId){

	const songDir = path.join(__dirname,"download")
	const coverDir = path.join(__dirname,"cache")

	var albumId = songInfo[songId]["albumId"]
	var artistId = songInfo[songId]["artistId"]

	var coverUrl = albumInfo[albumId]["coverUrl"]
	var songName = songInfo[songId]["songName"]
	var artistName = artistInfo[artistId]["artistName"]
	var albumName = albumInfo[albumId]["albumName"]
	var songUrl = songInfo[songId]["songUrl"]
	var songFile = artistName + " - " + songName + ".mp3"

	// songFile = songFile.replace(/[\\|\/|:|*|?|"|<|>|\|]/," ")
	songFile = songFile.replace(":","：")
	songFile = songFile.replace("*","＊")
	songFile = songFile.replace("?","？")
	songFile = songFile.replace("\"","＂")
	songFile = songFile.replace("<","＜")
	songFile = songFile.replace(">","＞")
	songFile = songFile.replace("/","／")
	songFile = songFile.replace("\\","＼")

	var coverFile = albumId + ".jpg"

	var songPath = path.join(songDir,songFile)
	var coverPath = path.join(coverDir,coverFile)

	downloadMusic()

	function downloadMusic(){
		fs.mkdir(songDir, 0777, function(error){
			var songStream = fs.createWriteStream(songPath)
			request(songUrl).pipe(songStream).on("close", downloadCover)
		})
	}

	function downloadCover(){
		fs.mkdir(coverDir, 0777, function(error){
			var coverStream = fs.createWriteStream(coverPath)
			request(coverUrl).pipe(coverStream).on("close", writeTag)
		})
	}

	function writeTag(){
		var tags = {
			title: songName,
			artist: artistName,
			album: albumName,
			// composer: "",
			image: coverPath
		}
		// nodeID3.removeTags(songPath)
		// var success = nodeID3.write(tags, songPath)
		nodeID3.write(tags,songPath, function(error){
			if(!error){
				let notification = new Notification(artistName + " " + songName, {
					icon: coverUrl, 
					body: "下载完成, 点击查看"
				});
				notification.onclick = function(){
					shell.showItemInFolder(songPath)
				}
			}
		})
		btn.download.setAttribute("class","download")
	}
}