var albumInfo = {}
var recipeInfo = {}
var chartInfo = {}
var artistInfo = {}
var songInfo = {}


function loadRecommandRecipe(recipeType="全部",sortBy="hot"){

	if (loading == 1){console.log("loading");return;}
	else{loading = 1}

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){

				try{
					var plContainer = xhr.responseText.match(/<ul[^>]+id="m-pl-container"[^>]*>([\s\S]+?)<\/ul>/)[0]
					var domParser = new DOMParser();
					var plContainer = domParser.parseFromString(plContainer,'text/html');
					var allRecipe = plContainer.getElementsByTagName("li")
					for (var i=0;i<allRecipe.length;i++)
					{
						var recipeId = allRecipe[i].getElementsByClassName("msk")[0].getAttribute("href").slice(13)
						if (!(recipeId in recipeInfo)){
							var recipeName = allRecipe[i].getElementsByClassName("msk")[0].getAttribute("title")
							var coverUrl = allRecipe[i].getElementsByTagName("img")[0].getAttribute("src").slice(0,-14)
							var playCount = allRecipe[i].getElementsByClassName("nb")[0].innerHTML
							var oneRecipe = {"recipeName":recipeName,"playCount":playCount,"coverUrl":coverUrl}
							recipeInfo[recipeId] = oneRecipe
						}
						showRecipe(recipeId)
					}
				}catch(e){
					console.log(e)
					container.onscroll = null
					loading = 0
				}
			}
			loading = 0
		}
	}
	let offset = container.getElementsByClassName("recipe").length

	xhr.open('GET',"http://music.163.com/discover/playlist/?order="+sortBy+"&cat="+recipeType+"&limit=35&offset="+offset);
	xhr.send();

}


function loadArtistAlbum(artistId){

	if (loading == 1){console.log("loading");return;}
	else{loading = 1}

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){
				try{
					var songModule = xhr.responseText.match(/<ul[^>]+id="m-song-module"[^>]*>([\s\S]+?)<\/ul>/)[0]
					var domParser = new DOMParser();
					var songModule = domParser.parseFromString(songModule,'text/html');
					var allAlbum = songModule.getElementsByTagName("li")
					for (var i=0;i<allAlbum.length;i++)
					{
						var albumId = allAlbum[i].getElementsByClassName("msk")[0].getAttribute("href").slice(10)
						if (!(albumId in albumInfo)){
							var albumName = allAlbum[i].getElementsByClassName("u-cover")[0].getAttribute("title")
							var coverUrl = allAlbum[i].getElementsByTagName("img")[0].getAttribute("src").slice(0,-14)
							var publishDate = allAlbum[i].getElementsByTagName("span")[0].innerHTML
							var oneAlbum = {"albumName":albumName,"publishDate":publishDate,"coverUrl":coverUrl,"artistId":artistId}
							albumInfo[albumId] = oneAlbum
						}
						showAlbum(albumId)
					}
				}catch(e){
					console.log(e)
					container.onscroll = null
					loading = 0
				}
			}
			loading = 0
		}
	}
	let offset = container.getElementsByClassName("album").length

	xhr.open('GET',"http://music.163.com/artist/album?id="+artistId+"&limit=12&offset="+offset);
	xhr.send();

}

function loadTopList(){
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){

				try{
					var toplist = xhr.responseText.match(/(<div id="toplist"[^>]+?>[\s\S]+?)<div class="g-mn3">/)[0]
					var domParser = new DOMParser();
					var toplist = domParser.parseFromString(toplist,'text/html');
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
						showChart(chartId)
					}
				}catch(e){
					console.log(e)
				}
			}
			loading = 0
		}
	}

	xhr.open('GET',"https://music.163.com/discover/toplist");
	xhr.send();
}


function loadChartSongs(chartId,callBack,argument){

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){

				try{
					var textArea = xhr.responseText.match(/<textarea style="display:none;">([\s\S]+?)<\/textarea>/)[1]
					var trackInfo = JSON.parse(textArea)
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
							var oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee}
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
					callBack(argument)
					// console.log(albumInfo)
				}catch(e){
					console.log(e)
				}
			}
		}
	}

	xhr.open('GET',"http://music.163.com/discover/toplist?id="+chartId);
	xhr.send();

}


function loadAlbumSongs(albumId,callBack,argument){

	if (albumInfo[albumId]["musicTrack"] != null){
		console.log("already get");return;
	}

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){
				
				try{
					var textArea = xhr.responseText.match(/<textarea style="display:none;">([\s\S]+?)<\/textarea>/)[1]
					var trackInfo = JSON.parse(textArea)
					var musicTrack = []
					for (var i=0;i<trackInfo.length;i++)
					{
						// var albumId = trackInfo[i]["album"]["id"]
						var artistId = trackInfo[i]["artists"][0]["id"]
						var songId = trackInfo[i]["id"]
						musicTrack.push(songId)

						if (!(songId in songInfo)){
							var songName = trackInfo[i]["name"]
							var duration = trackInfo[i]["duration"]
							var status = trackInfo[i]["status"]
							var fee = trackInfo[i]["fee"]
							var oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"duration":duration,"status":status,"fee":fee}
							songInfo[songId] = oneSong
						}
						if (!(artistId in artistInfo)){
							var artistName = trackInfo[i]["artists"][0]["name"]
							var oneArtist = {"artistName":artistName}
							artistInfo[artistId] = oneArtist
						}
					}
					if (!("musicTrack" in albumInfo[albumId])){
						albumInfo[albumId]["musicTrack"] = musicTrack
					}
					callBack(argument)
					// console.log(albumInfo)
				}catch(e){
					console.log(e)
				}
			}
		}
	}

	xhr.open('GET',"http://music.163.com/album?id="+albumId);
	xhr.send();

}

//use weapi
function loadNewAlbums(albumType="ALL"){

	if (loading == 1){console.log("loading");return;}
	else{loading = 1}

	let offset = container.getElementsByClassName("album").length
	if(offset==500){
		container.onscroll = null
		loading = 0
	}

	// type ALL,ZH,EA,KR,JP
	var data = {
		'offset': offset,
		'total': true,
		'limit': 35,
		'area': albumType,
		"csrf_token": ""
	}

	webApiRequest("POST","/weapi/album/new?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {
		try{
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
				if (!(artistId in artistInfo)){
					var artistName = allAlbum[i]["artist"]["name"]
					var oneArtist = {"artistName":artistName}
					artistInfo[artistId] = oneArtist
				}
				showAlbum(albumId)
			}
			loading = 0
		}
		catch(e){
			console.log(e)
			loading = 0
		}

		function transformPublishDate(num){
			var date = new Date(num)
			var year = date.getFullYear()
			var month = date.getMonth() + 1
			var day = date.getDate()
			day = (day < 10) ? "0"+day.toString() : day.toString()
			return year + "." + month + "." + day
		}
	}
}


//use weapi 
function loadRecipeSongs(recipeId,callBack,argument){

	if (recipeInfo[recipeId]["musicTrack"] != null){
		console.log("already get");return;
	}

	var data = {
		"id": recipeId,
		"offset": 0,
		"total": 1000,
		"n": 1000,
		"limit": 1000,
		"csrf_token": ""
	};

	webApiRequestAjax("POST","/weapi/v3/playlist/detail?csrf_token=",data,dataArrive)
	// webApiRequestHttp("POST","/weapi/v3/playlist/detail?csrf_token=",data,dataArrive)

	function dataArrive(responseText) {
		var recipeData = JSON.parse(responseText)
		recipeInfo[recipeId]["description"] = recipeData["playlist"]["description"]
		recipeInfo[recipeId]["description"] = recipeData["playlist"]["playCount"]
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
				var oneSong = {"songName":songName,"artistId":artistId,"albumId":albumId,"duration":duration,"status":status,"fee":fee}
				songInfo[songId] = oneSong
			}
		}
		if (!("musicTrack" in recipeInfo[recipeId])){
			recipeInfo[recipeId]["musicTrack"] = musicTrack
		}
		callBack(argument)
	}

}


function checkSongUrlStatus(songId){
	if (songInfo[songId]["status"] < 0)/*offshelf*/
		return -2
	if(songInfo[songId]["fee"] == 1)/*toll*/
		return -1
	else if(songInfo[songId]["songUrl"] == null)
		return 0
	else
		return 1
}

function getSongUrl(songId,callBack,argument1,argument2,argument3){

	if (!(songId in songInfo)){return}
	if (checkSongUrlStatus(songId)!=0){return}

	var data = {
		"ids": [songId],
		// "br": 999000,
		"br":320000,
		"csrf_token": ""
	};

	webApiRequestAjax("POST","/weapi/song/enhance/player/url?csrf_token=",data,dataArrive)
	// webApiRequestHttp("POST","/weapi/song/enhance/player/url?csrf_token=",data,dataArrive)


	function dataArrive(responseText) {
		var songData = JSON.parse(responseText)
		for (var x=0;x<songData["data"].length;x++)
		{
			var songId = songData["data"][x]["id"]
			var fee = songData["data"][x]["fee"]
			var songUrl = songData["data"][x]["url"]
			if (fee==1){
				songInfo[songId]["fee"] = fee
				showDialog(20,"收费的听不了额","好吧","哦",noOperation,null,noOperation,null)
				return
			}
			if (songUrl==null){
				songInfo[songId]["status"] = -1
				showDialog(20,"貌似是下架了额","好吧","哦",noOperation,null,noOperation,null)
				return
			}
			else if (songInfo[songId]["songUrl"]==null){
				songInfo[songId]["songUrl"] = songUrl
			}
		}
		callBack(argument1,argument2,argument3)
	}

}

function getSongInfo(songId,callBack,argument1,argument2,argument3){
	if (songId in songInfo){return;}
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){
				
				try{
					var fcb = xhr.responseText.match(/(<div class="f-cb">[\s\S]+?)<div id="user-operation" class="lrc-user">/)[1]
					var domParser = new DOMParser();
					var fcb = domParser.parseFromString(fcb,'text/html');

					var songName = fcb.getElementsByClassName("tit")[0].getElementsByTagName("em")[0].innerHTML
					var artistId = fcb.getElementsByClassName("des s-fc4")[0].getElementsByTagName("a")[0].getAttribute("href").slice(11)
					var albumId = fcb.getElementsByClassName("des s-fc4")[1].getElementsByTagName("a")[0].getAttribute("href").slice(10)

					var status = 0 - fcb.getElementById("content-operation").getElementsByClassName('u-btni-play-dis').length
					var fee = 0

					if (!(albumId in albumInfo)){
						var coverUrl = fcb.getElementsByTagName("img")[0].getAttribute("data-src")
						var albumName = fcb.getElementsByClassName("des s-fc4")[1].getElementsByTagName("a")[0].innerHTML
						var oneAlbum = {"albumName":albumName,"artistId":artistId,"coverUrl":coverUrl}
						albumInfo[albumId] = oneAlbum
					}
					if (!(artistId in artistInfo)){
						var artistName = fcb.getElementsByClassName("des s-fc4")[0].getElementsByTagName("a")[0].innerHTML
						var oneArtist = {"artistName":artistName}
						artistInfo[artistId] = oneArtist
					}

					var oneSong = {"songName":songName,"albumId":albumId,"artistId":artistId,"status":status,"fee":fee}
					songInfo[songId] = oneSong
					callBack(argument1,argument2,argument3)
				}catch(e){
					console.log(e)
				}
			}
		}
	}

	xhr.open('GET',"http://music.163.com/song?id="+songId);
	xhr.send();
}

const maxRetry = 300
var retry = 0

function webApiRequestAjax(method="POST",path,data,callBack){

	var cryptoreq = Encrypt(data);
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange=function()
	{
		if(xhr.readyState==4){
			if(xhr.status==200){
				if (xhr.responseText=="")
				{
					retry = retry + 1
					console.log("retry-ajax",retry)
					if(retry > maxRetry){return}
					webApiRequestAjax(method,path,data,callBack)
					return
				}
				try{
					retry = 0
					callBack(xhr.responseText)
				}catch(e){
					console.log(e)
				}
			}
		}
	}

	xhr.open(method,"http://music.163.com" + path)
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded")
	xhr.setRequestHeader("Accept","*/*")
	xhr.setRequestHeader("Accept-Language","zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4")
	xhr.send('params=' + cryptoreq.params + '&encSecKey=' + cryptoreq.encSecKey);
}

// const http = require('http')
const request = require('request')

function webApiRequest(method="POST",path,data,callBack) {

	var cryptoreq = Encrypt(data)
	request({
		url: 'http://music.163.com/' + path,
		method: method,
		headers: {
			'Accept': '*/*',
			'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
			'Connection': 'keep-alive',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Referer': 'http://music.163.com',
			'Host': 'music.163.com',
			'User-Agent': randomUserAgent()
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
	
	// var responseText = '';
	// var cryptoreq = Encrypt(data);
	// var http_client = http.request({
	// 	hostname: 'music.163.com',
	// 	method: method,
	// 	path: path,
	// 	headers: {
	// 		'Accept': '*/*',
	// 		'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
	// 		'Connection': 'keep-alive',
	// 		'Content-Type': 'application/x-www-form-urlencoded',
	// 		'Referer': 'http://music.163.com',
	// 		'Host': 'music.163.com',
	// 		'User-Agent': randomUserAgent()
	// 	}
	// }, function(response) {
	// 	response.on('error', function(err) {
	// 		return
	// 	});
	// 	response.setEncoding('utf8');
	// 	if(response.statusCode != 200) {
	// 		retry = retry + 1
	// 		console.log("retry-http",retry)
	// 		if(retry > maxRetry){return}
	// 		webApiRequestHttp(method="POST",path,data,callBack);
	// 		return;
	// 	}
	// 	else 
	// 	{
	// 		response.on('data', function(chunk) {
	// 			responseText += chunk;
	// 		});
	// 		response.on('end', function() {
	// 			if(responseText == '') {
	// 				retry = retry + 1
	// 				console.log("retry",retry)
	// 				if(retry > maxRetry){return}
	// 				webApiRequestHttp(method="POST",path,data,callBack);
	// 				return;
	// 			}
	// 			else{
	// 				retry = 0
	// 				callBack(responseText)
	// 			}
				
	// 		})
	// 	}
	// });
	// http_client.write('params=' + cryptoreq.params + '&encSecKey=' + cryptoreq.encSecKey);
	// http_client.end();
}


function randomUserAgent() {
	const userAgentList = [
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36',
		'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36',
		'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Mobile Safari/537.36',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Mobile/14F89;GameHelper',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4',
		'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:46.0) Gecko/20100101 Firefox/46.0',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:46.0) Gecko/20100101 Firefox/46.0',
		'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
		'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
		'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
		'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)',
		'Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; rv:11.0) like Gecko',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/13.10586',
		'Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1',
		
	]
	const num = Math.floor(Math.random() * userAgentList.length)
	return userAgentList[num]
}



// const os = require('os')
const path = require('path')
const fs = require('fs')
const nodeID3 = require('node-id3')
const shell = require('electron').shell

function songDownload(songId){

	var albumId = songInfo[songId]["albumId"]
	var artistId = songInfo[songId]["artistId"]

	var coverUrl = albumInfo[albumId]["coverUrl"]
	var songName = songInfo[songId]["songName"]
	var artistName = artistInfo[artistId]["artistName"]
	var albumName = albumInfo[albumId]["albumName"]
	var songUrl = songInfo[songId]["songUrl"]
	var songFile = artistName + " - " + songName + ".mp3"

	songFile = songFile.replace(/[\\|\/|:|*|?|"|<|>|\|]/," ") //illegal filename
	// songFile = songFile.replace(":","：")
	// songFile = songFile.replace("*","＊")
	// songFile = songFile.replace("?","？")
	// songFile = songFile.replace("\"","”")
	// songFile = songFile.replace("<","《")
	// songFile = songFile.replace(">","》")
	// songFile = songFile.replace(">","》")

	var coverFile = albumId + ".jpg"
	var songPath = path.join(__dirname+"/download",songFile)
	var coverPath = path.join(__dirname+"/cache",coverFile)

	// console.log(songUrl)
	// console.log(coverUrl)
	// console.log(songPath)
	// console.log(coverPath)

    var songStream = fs.createWriteStream(songPath)
    request(songUrl).pipe(songStream).on('close', downloadCover)

	function downloadCover(){
		var coverStream = fs.createWriteStream(coverPath)
		request(coverUrl).pipe(coverStream).on('close', writeTag)
	}

	function writeTag(){
    	var tags = {
			title: songName,
			artist: artistName,
			album: albumName,
			// composer: "",
			image: coverPath
		}
		
		nodeID3.removeTags(songPath)
		var success = nodeID3.write(tags, songPath);
		if(success){
			let notification = new Notification(artistName + " " + songName, {
				icon: coverUrl, 
				body: "下载完成, 点击查看"
			});
			notification.onclick = function(){
				shell.showItemInFolder(songPath)
			}
		}
    }
}