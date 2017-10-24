'use strict'

var albumInfo = {}
var recipeInfo = {}
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

	webApiRequest("/weapi/playlist/list",data,dataArrive)

	function dataArrive(responseText) {

		let allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["playlists"]
		for (let i=0;i<allRecipe.length;i++)
		{
			let recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				let recipeName = allRecipe[i]["name"]
				let coverUrl = allRecipe[i]["coverImgUrl"]
				let playCount = allRecipe[i]["playCount"]
				// let description = allRecipe[i]["description"]
				// let creator = allRecipe[i]["creator"]["nickname"]
				let oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl}
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

	webApiRequest("/weapi/personalized/playlist",data,dataArrive)

	function dataArrive(responseText) {

		let allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["result"]
		for (let i=0;i<allRecipe.length;i++)
		{
			let recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				let recipeName = allRecipe[i]["name"]
				let coverUrl = allRecipe[i]["picUrl"]
				let playCount = parseInt(allRecipe[i]["playCount"])
				let oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl}
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

	webApiRequest("/weapi/playlist/highquality/list",data,dataArrive)

	function dataArrive(responseText) {

		let allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["playlists"]
		for (let i=0;i<allRecipe.length;i++)
		{
			let recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				let recipeName = allRecipe[i]["name"]
				let coverUrl = allRecipe[i]["coverImgUrl"]
				let playCount = allRecipe[i]["playCount"]
				// let description = allRecipe[i]["description"]
				// let creator = allRecipe[i]["creator"]["nickname"]
				let oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl}
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

	webApiRequest("/weapi/user/playlist",data,dataArrive)

	function dataArrive(responseText) {

		let allRecipe = JSON.parse(responseText)
		allRecipe = allRecipe["playlist"]
		for (let i=0;i<allRecipe.length;i++)
		{
			let creatorId = allRecipe[i]["creator"]["userId"]
			if(self==0&&creatorId==userId)
				continue
			else if(self==1&&creatorId!=userId)
				continue
			let recipeId = allRecipe[i]["id"]
			if (!(recipeId in recipeInfo)){
				let recipeName = allRecipe[i]["name"]
				let coverUrl = allRecipe[i]["coverImgUrl"]
				let playCount = allRecipe[i]["playCount"]
				let description = allRecipe[i]["description"]
				let creator = allRecipe[i]["creator"]["nickname"]
				let oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl,"description":description,"creator":creator}
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

	webApiRequest("/weapi/artist/top",data,dataArrive)

	function dataArrive(responseText) {

		let allArtist = JSON.parse(responseText)
		allArtist = allArtist["artists"]
		for (let i=0;i<allArtist.length;i++)
		{
			let artistId = allArtist[i]["id"]
			let artistName = allArtist[i]["name"]
			let artistImage = allArtist[i]["img1v1Url"]
			let musicSize = allArtist[i]["musicSize"]
			let description = allArtist[i]["trans"] || allArtist[i]["alias"][0] || ""
			if (!(artistId in artistInfo)){
				let oneArtist = {"artistName":artistName,"artistImage":artistImage,"musicSize":musicSize,"description":description}
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


	webApiRequest("/weapi/artist/albums/"+artistId,data,dataArrive)

	function dataArrive(responseText) {

		let artistData = JSON.parse(responseText)
		let allAlbum = artistData["hotAlbums"]
		for (let i=0;i<allAlbum.length;i++)
		{
			let albumId = allAlbum[i]["id"]
			let artistId = allAlbum[i]["artist"]["id"]
			let artistName = allAlbum[i]["artist"]["name"]
			artistId = artistId == 0 ? artistName : artistId
			let publishDate = transformPublishDate(allAlbum[i]["publishTime"])
			if (!(albumId in albumInfo)){
				let albumName = allAlbum[i]["name"]
				let coverUrl = allAlbum[i]["picUrl"]
				let oneAlbum = {"albumName":albumName,"publishDate":publishDate,"coverUrl":coverUrl,"artistId":artistId}
				albumInfo[albumId] = oneAlbum
			}
			else if(!("publishDate" in albumInfo[albumId]))
				albumInfo[albumId]["publishDate"] = publishDate
			if (!(artistId in artistInfo)){
				let oneArtist = {"artistName":artistName}
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

	webApiRequest("/api/discovery/newAlbum",data,dataArrive)

	function dataArrive(responseText) {
		let albumData = JSON.parse(responseText)
		let allAlbum = albumData["albums"]
		for (let i=0;i<allAlbum.length;i++)
		{
			let albumId = allAlbum[i]["id"]
			let artistId = allAlbum[i]["artist"]["id"]
			let artistName = allAlbum[i]["artist"]["name"]
			artistId = artistId == 0 ? artistName : artistId
			let publishDate = transformPublishDate(allAlbum[i]["publishTime"])
			if (!(albumId in albumInfo)){
				let albumName = allAlbum[i]["name"]
				let coverUrl = allAlbum[i]["picUrl"]
				let oneAlbum = {"albumName":albumName,"publishDate":publishDate,"coverUrl":coverUrl,"artistId":artistId}
				albumInfo[albumId] = oneAlbum
			}
			else if(!("publishDate" in albumInfo[albumId]))
				albumInfo[albumId]["publishDate"] = publishDate
			if (!(artistId in artistInfo)){
				let oneArtist = {"artistName":artistName}
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

	webApiRequest("/weapi/album/new?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {

		let albumData = JSON.parse(responseText)
		let allAlbum = albumData["albums"]
		for (let i=0;i<allAlbum.length;i++)
		{
			let albumId = allAlbum[i]["id"]
			let artistId = allAlbum[i]["artist"]["id"]
			let artistName = allAlbum[i]["artist"]["name"]
			artistId = artistId == 0 ? artistName : artistId
			let publishDate = transformPublishDate(allAlbum[i]["publishTime"])
			if (!(albumId in albumInfo)){
				let albumName = allAlbum[i]["name"]
				let coverUrl = allAlbum[i]["picUrl"]
				let oneAlbum = {"albumName":albumName,"publishDate":publishDate,"coverUrl":coverUrl,"artistId":artistId}
				albumInfo[albumId] = oneAlbum
			}
			else if(!("publishDate" in albumInfo[albumId]))
				albumInfo[albumId]["publishDate"] = publishDate
			if (!(artistId in artistInfo)){
				let oneArtist = {"artistName":artistName}
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

	let xhr = new XMLHttpRequest()

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){

				try{
					let toplist = xhr.responseText.match(/(<div id="toplist"[^>]+?>[\s\S]+?)<div class="g-mn3">/)[0]
					let domParser = new DOMParser()
					toplist = domParser.parseFromString(toplist,"text/html")
					let allChart = toplist.getElementsByTagName("li")
					for (let i=0;i<allChart.length;i++)
					{
						let recipeId = allChart[i].getAttribute("data-res-id")
						if (!(recipeId in recipeInfo)){
							let chartName = allChart[i].getElementsByClassName("s-fc0")[0].innerHTML
							let coverUrl = allChart[i].getElementsByTagName("img")[0].getAttribute("src").slice(0,-12)
							let updateTime = allChart[i].getElementsByClassName("s-fc4")[0].innerHTML
							let oneChart = {"recipeName":chartName,"updateTime":updateTime,"coverUrl":coverUrl}
							recipeInfo[recipeId] = oneChart
						}
						containerInstance.add(recipeId)
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

function loadArtistSongs(artistId,callBack,callBackParams){

	if (artistInfo[artistId]["musicTrack"] != null){
		console.log("already get");return;
	}

	const data = {
		csrf_token: ""
	}

	webApiRequest("/weapi/v1/artist/"+artistId,data,dataArrive)

	function dataArrive(responseText) {
		let artistData = JSON.parse(responseText)
		let trackInfo = artistData["hotSongs"]
		let musicTrack = []
		for (let i=0;i<trackInfo.length;i++)
		{
			let songId = trackInfo[i]["id"]
			let albumId = trackInfo[i]["al"]["id"]
			musicTrack.push(songId)

			if (!(albumId in albumInfo)){
				let albumName = trackInfo[i]["al"]["name"]
				let picStr = trackInfo[i]["al"]["pic_str"] || trackInfo[i]["al"]["pic"]	
				let coverUrl = strToUrl(picStr) + '.jpg'
				let oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
				albumInfo[albumId] = oneAlbum
			}

			if (!(songId in songInfo)){
				let songName = trackInfo[i]["name"]
				let duration = trackInfo[i]["dt"]
				let track = trackInfo[i]["no"]
				let status = trackInfo[i]["privilege"]["st"]
				let fee = trackInfo[i]["privilege"]["fee"]
				let expiration = new Date().getTime()
				let oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee,"expiration":expiration,"track":track}
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

	webApiRequest("/weapi/v1/album/"+albumId,data,dataArrive)

	function dataArrive(responseText) {
		let albumData = JSON.parse(responseText)
		let trackInfo = albumData["songs"]
		let musicTrack = []
		for (let i=0;i<trackInfo.length;i++)
		{
			let songId = trackInfo[i]["id"]
			let artistId = trackInfo[i]["ar"][0]["id"]
			let artistName = trackInfo[i]["ar"][0]["name"]
			artistId = artistId == 0 ? artistName : artistId
			musicTrack.push(songId)

			if (!(songId in songInfo)){
				let songName = trackInfo[i]["name"]
				let duration = trackInfo[i]["dt"]
				let track = trackInfo[i]["no"]
				let status = trackInfo[i]["privilege"]["st"]
				let fee = trackInfo[i]["privilege"]["fee"]
				let expiration = new Date().getTime()
				let oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee,"expiration":expiration,"track":track}
				songInfo[songId] = oneSong
			}
			if (!(artistId in artistInfo)){
				let oneArtist = {"artistName":artistName}
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
	}

	webApiRequest("/weapi/v3/playlist/detail?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {

		let recipeData = JSON.parse(responseText)
		recipeInfo[recipeId]["description"] = recipeData["playlist"]["description"]
		recipeInfo[recipeId]["creator"] = recipeData["playlist"]["creator"]["nickname"]

		let musicTrack = []
		let trackInfo = recipeData["playlist"]["tracks"]
		let privileges = recipeData["privileges"]

		if(trackInfo.length!=privileges.length){console.log("error","tracks",trackInfo.length,"privileges",privileges.length)}//debug
		for (let i=0;i<trackInfo.length;i++)
		{
			let songId = trackInfo[i]["id"]
			let artistId = trackInfo[i]["ar"][0]["id"]
			let artistName = trackInfo[i]["ar"][0]["name"]
			artistId = artistId == 0 ? artistName : artistId
			let albumId = trackInfo[i]["al"]["id"]
			musicTrack.push(songId)

			if (!(albumId in albumInfo)){
				let albumName = trackInfo[i]["al"]["name"]
				let coverUrl = trackInfo[i]["al"]["picUrl"]
				let oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
				albumInfo[albumId] = oneAlbum
			}
			if (!(artistId in artistInfo)){
				let oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
			if (!(songId in songInfo)){
				let songName = trackInfo[i]["name"]
				let duration = trackInfo[i]["dt"]
				let track = trackInfo[i]["no"]
				let status = privileges[i]["st"]
				let fee = privileges[i]["fee"]
				let expiration = new Date().getTime()
				let oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee,"expiration":expiration,"track":track}
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
	let now = new Date().getTime()
	if(songInfo[songId]["songUrl"] != null&&now<songInfo[songId]["expiration"])
		return 1
	else if (songInfo[songId]["status"] == -1||songInfo[songId]["status"] == -200)
		return -2
	else if(songInfo[songId]["fee"] == 1||songInfo[songId]["fee"] == 4||songInfo[songId]["fee"] == 16)//try old api
		return -1
	else//fee = 8 is ok
		return 0
}

function getSongsInfo(songIds,callBack,callBackParams){

	const c = []
	const ids = []

	for(let i=0;i<songIds.length;i++){
		if (songIds[i] in songInfo)
			continue
		c.push({"id":songIds[i]})
		ids.push(songIds[i])
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

	webApiRequest("/weapi/v3/song/detail",data,dataArrive)

	function dataArrive(responseText) {
		let songData = JSON.parse(responseText)
		let privileges = songData["privileges"]
		songData = songData["songs"]
		for(let i=0;i<songData.length;i++){

			let songId = songData[i]["id"]
			let artistId = songData[i]["ar"][0]["id"]
			let artistName = songData[i]["ar"][0]["name"]
			artistId = artistId == 0 ? artistName : artistId
			let albumId = songData[i]["al"]["id"]

			if (!(albumId in albumInfo)){
				let picStr = songData[i]["al"]["pic_str"] || songData[i]["al"]["pic"]
				let coverUrl = strToUrl(picStr) + '.jpg'
				let albumName = songData[i]["al"]["name"]
				let oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
				albumInfo[albumId] = oneAlbum
			}
			if (!(artistId in artistInfo)){
				let oneArtist = {"artistName":artistName}
				artistInfo[artistId] = oneArtist
			}
			if (!(songId in songInfo)){
				let songName = songData[i]["name"]
				let duration = songData[i]["dt"]
				let track = songData[i]["no"]
				let status = privileges[i]["st"]
				let fee = songData[i]["fee"]//more credible than privileges[i]["fee"]
				let expiration = new Date().getTime()
				let oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee,"expiration":expiration,"track":track}
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
	}

	webApiRequest("/weapi/song/enhance/player/url?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {
		let songData = JSON.parse(responseText)
		for (let i=0;i<songData["data"].length;i++)
		{
			let songId = songData["data"][i]["id"]
			let songUrl = songData["data"][i]["url"]
			let expire = songData["data"][i]["expi"]
			// let fee = songData["data"][i]["fee"]
			// songInfo[songId]["fee"] = fee
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
function trySongUrl(songId,callBack,callBackParams){//付费歌曲

	if (!(songId in songInfo)){return}
	if (checkSongUrlStatus(songId)!=-1){return}

	const keyword = songInfo[songId]["songName"] + "-" + artistInfo[songInfo[songId]["artistId"]]["artistName"]

	const data = {
		s: keyword,
		limit: 1,
		type: 1,
		offset: 0,
	};

	webApiRequest("/weapi/search/pc",data,dataArrive)

	function dataArrive(responseText) {
		let result = JSON.parse(responseText)
		let songUrl
		if (result["result"]["songs"] && result["result"]["songs"][0]["id"] == songId) {
			let song = result.result.songs[0]
			let music = song["hMusic"] || song["mMusic"] || song["lMusic"] || song["bMusic"]
			let dfsId_str = music.dfsId_str || music.dfsId
			if (music && dfsId_str != 0)
				songUrl = strToUrl(dfsId_str) + '.mp3'
			else if (!song.mp3Url.endsWith("==/0.mp3"))
				songUrl = song.mp3Url
		}
		if(songUrl){
			songInfo[songId]["songUrl"] = songUrl
			songInfo[songId]["expiration"] = new Date().getTime() + 24*60*60*1000
			callBack(callBackParams)
		}
		else{
			// showDialog(20,"是真的听不了","好吧","哦",noOperation,null,noOperation,null)
			reallyCantPlay(songId)
			callBack(callBackParams)
		}
	}
}

function reallyCantPlay(songId){
	songInfo[songId]["status"] = -1
	let index = inPlayList(songId)
	let list = player.list
	list.splice(index,1)
	player.list = list
	player.index = index //avoid overflow
	let entries = document.getElementsByClassName("entry")
	for(let i=0;i<entries.length;i++){
		if(entries[i].getAttribute("songId")==songId){
			entries[i].setAttribute("class","entry unable")
			if(entries[i].ondblclick!=null)
				entries[i].ondblclick=null
		}
	}
}

//参考 https://greasyfork.org/en/scripts/23222-网易云下载/code
const crypto = require('crypto')
function strToUrl(str) {
	let byte1 = '3go8&$8*3*3h0k(2)2'
	let byte2 = str + ''
	let byte3 = []
	for (let i=0;i<byte2.length;i++) {
		byte3[i] = byte2.charCodeAt(i) ^ byte1.charCodeAt(i % byte1.length)
	}
	byte3 = byte3.map(function(i) {
		return String.fromCharCode(i)
	}).join('')
	let results = crypto.createHash('md5').update(byte3.toString()).digest('base64').replace(/\//g, '_').replace(/\+/g, '-')
	let url = 'http://p2.music.126.net/' + results + '/' + byte2
	return url
}

function transformPublishDate(millseconds){
	let date = new Date(millseconds)
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()
	day = (day < 10) ? "0"+day.toString() : day.toString()
	return year + "." + month + "." + day
}


const maxRetry = 15
var retry = 0

const request = require('request')
// const request = require('request').defaults({'proxy':'http://127.0.0.1:1080'})

function webApiRequest(path,data,callBack) {

	const cryptoreq = Encrypt(data)
	request({
		url: 'http://music.163.com' + path,
		method: "POST",
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
			webApiRequest(path,data,callBack)
			return
		}
		else if(body==""){
			retry = retry + 1
			console.log("retry-request",retry)
			if(retry > maxRetry){return}
			webApiRequest(path,data,callBack)
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

	let albumId = songInfo[songId]["albumId"]
	let artistId = songInfo[songId]["artistId"]

	let coverUrl = albumInfo[albumId]["coverUrl"]
	let songName = songInfo[songId]["songName"]
	let artistName = artistInfo[artistId]["artistName"]
	let albumName = albumInfo[albumId]["albumName"]
	let songUrl = songInfo[songId]["songUrl"]
	let track = songInfo[songId]["track"]
	let songFile = artistName + " - " + songName + ".mp3"
	let coverFile = albumId + ".jpg"

	songFile = songFile.replace(":","：")
	songFile = songFile.replace("*","＊")
	songFile = songFile.replace("?","？")
	songFile = songFile.replace("\"","＂")
	songFile = songFile.replace("<","＜")
	songFile = songFile.replace(">","＞")
	songFile = songFile.replace("/","／")
	songFile = songFile.replace("\\","＼")

	let songPath = path.join(songDir,songFile)
	let coverPath = path.join(coverDir,coverFile)

	downloadMusic()

	function downloadMusic(){
		fs.mkdir(songDir, "0777", function(error){
			let songStream = fs.createWriteStream(songPath)
			request(songUrl).pipe(songStream).on("close", downloadCover)
		})
	}

	function downloadCover(){
		fs.mkdir(coverDir, "0777", function(error){
			let coverStream = fs.createWriteStream(coverPath)
			request(coverUrl).pipe(coverStream).on("close", writeTag)
		})
	}

	function writeTag(){
		let tags = {
			title: songName,
			artist: artistName,
			album: albumName,
			image: coverPath,
			trackNumber: track
		}
		// nodeID3.removeTags(songPath)
		// let success = nodeID3.write(tags, songPath)
		nodeID3.write(tags,songPath, function(error){
			if(!error){
				let notification = new Notification(artistName + " - " + songName, {
					icon: coverUrl, 
					body: "下载完成, 点击查看"
				})
				notification.onclick = function(){
					shell.showItemInFolder(songPath)
				}
				btn.download.setAttribute("class","download")
			}
		})
		
	}
}