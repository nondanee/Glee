'use strict'

// let albumInfo = {}
// let recipeInfo = {}
// let artistInfo = {}
let songInfo = {}

const extractor = {
	artist: artist => ({
		type: 'artist',
		id: artist.id,
		name: artist.name,
		cover: artist.img1v1Url,
		description: artist.musicSize
	}),
	album: album => ({
		type: 'album',
		id: album.id,
		name: album.name,
		cover: album.picUrl,
		description: album.publishTime //transformPublishDate
	}),
	playlist: playlist => ({
		type: 'playlist',
		id: playlist.id,
		name: playlist.name,
		cover: playlist.coverImgUrl || playlist.picUrl,
		description: playlist.playCount //updateTime
	}),
	song: song => ({
		type: 'song',
		id: song.id,
		name: song.name,
		state: !([-1, -200].includes(song.privilege ? song.privilege.st : song.st) || [1, 4, 16].includes(song.privilege ? song.privilege.fee : song.fee)),
		number: song.no,
		duration: song.dt,
		cover: song.al.picUrl || song.al.pic_str,
		album: {id: song.al.id, name: song.al.name},
		artist: song.ar.map(artist => ({id: artist.id, name: artist.name})),
	})
}


const display = {
	playlist: {
		user: (id, self = false, size = 1000) => {
			let more = true
			const query = {
				uid: id,
				limit: size,
				offset: 0
			}
			
			return{
				next: () => {
					if(!more) return Promise.resolve([])
                    return apiRequest('user/playlist', query)
					.then(data => data.playlist.filter(playlist => !(playlist.creator.userId === id ^ self)))
					.then(data => {
						more = data.length === size
						query.offset += size
						return data.map(extractor.playlist)
					})
				}
			}
		},
		awesome: (type, size = 50) => {
			let more = true
			const query = {
				cat: type || '全部',
				limit: size,
				lasttime: 0
			}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('playlist/highquality/list', query)
					.then(data => data.playlists)
					.then(data => {
						more = data.length === size
						if(more) query.lasttime = data[size - 1].updateTime
						return data.map(extractor.playlist)
					})
				}
			}
		},
		recommend: (size = 10) => {
			let more = true
			const query = {
                limit: size,
                offset: 0
			}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('personalized/playlist', query)
					.then(data => data.result)
					.then(data => {
                        more = false
						return data.map(extractor.playlist)
					})
				}
			}
		},
		hot: (type, order, size = 50) => {
			let more = true
			const query = {
				cat: type || '全部',
				order: order || 'hot',
				limit: size,
				offset: 0,
				total: true
			}
		
			return {
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('playlist/list', query)
					.then(data => data.playlists)
					.then(data => {
						more = data.length === size
						query.offset += size
						return data.map(extractor.playlist)
					})
				}
			}
		},
		chart: () => {
			let more = true
			const query = {}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('toplist', query)
					.then(data => data.list)
					.then(data => {
                        more = false
						return data.map(extractor.playlist)
					})
				}
			}
		}
	},
	artist: {
		top: (size = 100) => {
			let more = true
			const query = {
				limit: size,
				offset: 0,
				total: true
			}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('artist/top', query)
					.then(data => data.artists)
					.then(data => {
						more = data.length === size
						query.offset += size
						return data.map(extractor.artist)
					})
				}
			}
		},
		all: (type, size = 50) => {
			let more = true
			const query = {
				categoryCode: type,
				limit: size,
				offset: 0,
				total: true
			}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('artist/list', query)
					.then(data => data.artists)
					.then(data => {
						more = data.length === size
						query.offset += size
						return data.map(extractor.artist)
					})
				}
			}
		}
	},
	album: {
		artist: (id, size = 12) => {
			let more = true
			const query = {
				limit: size,
				offset: 0
			}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest(`artist/albums/${id}`, query)
					.then(data => data.hotAlbums)
					.then(data => {
						more = data.length === size
						query.offset += size
						return data.map(extractor.album)
					})
				}
			}
		},
		hot: () => {
			let more = true
			const query = {}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('discovery/newAlbum', query)
					.then(data => data.albums)
					.then(data => {
						more = false
						return data.map(extractor.album)
					})
				}
			}
		
		},
		new: (type, size = 35) => {
			let more = true
			const query = {
				area: type || 'ALL', //ALL,ZH,EA,KR,JP
				limit: size,
				offset: 0,
				total: true
			}
		
			return{
				next: () => {
					if(!more) return Promise.resolve([])
					return apiRequest('album/new', query)
					.then(data => data.albums)
					.then(data => {
						more = data.length === size
						query.offset += size
						return data.map(extractor.album)
					})
				}
			}
		}
	}
}

// function loadTopList(containerInstance){

// 	let xhr = new XMLHttpRequest()

// 	xhr.onreadystatechange=function()
// 	{
// 		if(xhr.readyState==4){
// 			if(xhr.status==200){

// 				try{
// 					let toplist = xhr.responseText.match(/(<div id="toplist"[^>]+?>[\s\S]+?)<div class="g-mn3">/)[0]
// 					let domParser = new DOMParser()
// 					toplist = domParser.parseFromString(toplist,"text/html")
// 					let allChart = toplist.getElementsByTagName("li")
// 					for (let i=0;i<allChart.length;i++)
// 					{
// 						let recipeId = allChart[i].getAttribute("data-res-id")
// 						if (!(recipeId in recipeInfo)){
// 							let chartName = allChart[i].getElementsByClassName("s-fc0")[0].innerHTML
// 							let coverUrl = allChart[i].getElementsByTagName("img")[0].getAttribute("src").slice(0,-12)
// 							let updateTime = allChart[i].getElementsByClassName("s-fc4")[0].innerHTML
// 							let oneChart = {"recipeName":chartName,"updateTime":updateTime,"coverUrl":coverUrl}
// 							recipeInfo[recipeId] = oneChart
// 						}
// 						containerInstance.add(recipeId)
// 					}
// 					containerInstance.refresh()
// 					containerInstance.scrollStop()
// 				}catch(e){
// 					console.log(e)
// 					loading = 0
// 				}
// 			}
// 			loading = 0
// 		}
// 	}

// 	xhr.open("GET","https://music.163.com/discover/toplist")
// 	xhr.send()

// }

const track = {
	artist: id => apiRequest(`v1/artist/${id}`, {})
		.then(data => data.hotSongs).then(data => data.map(extractor.song)),
	album: id => apiRequest(`v1/album/${id}`, {})
		.then(data => data.songs).then(data => data.map(extractor.song)),
	playlist: id => apiRequest('v3/playlist/detail', {id: id, offset: 0, n: 10000, limit: 1000})
        .then(data => data.playlist.tracks).then(data => data.map(extractor.song))
}

function getSongUrl(songId,callBack,callBackParams){

	if (!(songId in songInfo)){return}
	if (checkSongUrlStatus(songId)!=0){return}

	const query = {
		"ids": JSON.stringify([songId]),
		"br": "320000",
	}

	apiRequest("song/enhance/player/url", query)
	.then(data => {
		let songData = data
		// console.log(songData)
		for (let i=0;i<songData["data"].length;i++)
		{
			let bitRate = songData["data"][i]["br"]
			let songId = songData["data"][i]["id"]
			let songUrl = songData["data"][i]["url"]
			let expire = songData["data"][i]["expi"]
			// let fee = songData["data"][i]["fee"]
			// songInfo[songId]["fee"] = fee

			songUrl = songUrl.replace(/m(\d+)?.music.126.net/g,'m$1c.music.126.net')
			console.log(songUrl)

			if (songUrl==null){
				// showDialog(20,"听不了额","好吧","哦",noOperation,null,noOperation,null)
				return
			}
			songInfo[songId]["songUrl"] = songUrl
			songInfo[songId]["bitRate"] = bitRate
			songInfo[songId]["expiration"] = new Date().getTime() + expire*1000
		}
		callBack(callBackParams)
	})

}

//参考 https://greasyfork.org/en/scripts/23222-网易云下载/code
// function trySongUrl(songId,callBack,callBackParams){//付费歌曲

// 	if (!(songId in songInfo)){return}
// 	if (checkSongUrlStatus(songId)!=-1){return}

// 	const keyword = songInfo[songId]["songName"] + "-" + artistInfo[songInfo[songId]["artistId"]]["artistName"]

// 	const data = {
// 		s: keyword,
// 		limit: 1,
// 		type: 1,
// 		offset: 0,
// 	};

// 	weapiRequest("search/pc",data,dataArrive)

// 	function dataArrive(responseText) {
// 		let result = JSON.parse(responseText)
// 		let songUrl
// 		if (result["result"]["songs"] && result["result"]["songs"][0]["id"] == songId) {
// 			let song = result.result.songs[0]
// 			let music = song["hMusic"] || song["mMusic"] || song["lMusic"] || song["bMusic"]
// 			let dfsId_str = music.dfsId_str || music.dfsId
// 			if (music && dfsId_str != 0)
// 				songUrl = strToUrl(dfsId_str) + '.mp3'
// 			else if (!song.mp3Url.endsWith("==/0.mp3"))
// 				songUrl = song.mp3Url
// 		}
// 		if(songUrl){
// 			songInfo[songId]["songUrl"] = songUrl
// 			songInfo[songId]["expiration"] = new Date().getTime() + 24*60*60*1000
// 			callBack(callBackParams)
// 		}
// 		else{
// 			// showDialog(20,"是真的听不了","好吧","哦",noOperation,null,noOperation,null)
// 			reallyCantPlay(songId)
// 			callBack(callBackParams)
// 		}
// 	}
// }

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

const encrypt = require('./js/crypto.js')
const apiRequest = (path, data) => new Promise((resolve, reject) => {
	data = encrypt.weapi(data || {})
	data = Object.keys(data).map(key => (key + '=' + encodeURIComponent(data[key]))).join('&')
	
	const xhr = new XMLHttpRequest()
	xhr.onreadystatechange = () => {
		if(xhr.readyState == 4){
			xhr.status == 200 ? resolve(JSON.parse(xhr.responseText)) : reject()
		}
	}

	xhr.open('POST', `http://music.163.com/weapi/${path}`)
	xhr.setRequestHeader('X-Real-IP', '118.88.88.88')
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
	xhr.send(data)
})








const { Decrypt, Encrypt } = require('./js/crypto2.js')
const os = require('os')

function eapiRequest(path,data,callBack) {

	let cookie = []
	let header = {
		// "MUSIC_A": "",
		"MUSIC_A": "8aae43f148f990410b9a2af38324af24e87ab9227c9265627ddd10145db744295fcd8701dc45b1ab8985e142f491516295dd965bae848761274a577a62b0fdc54a50284d1e434dcc04ca6d1a52333c9a",
		"MUSIC_U": "",
		// "MUSIC_U": "3b7dffec18ad0e7f31eda5961c9a157f4af3aefa0477470ad1c1f3e23d620f4c506a7f8aaaa414613a6e33d6ec1509eb7c20e481d928ce977955a739ab43dce1",
		"appver": "1.4.1",
		"deviceId": "a9474b0f7f5f10f851a7f519f07842d1",
		"os": "uwp",
		"osver": "10.0.16299.371",
		"requestId": "6c30f907-176b-4ca4-8334-d3d2589e641d",
	}
	for (let key in header){
		if (header[key] != '' && key != 'requestId'){
			cookie.push(`${key}=${header[key]}`)
		}
	}
	cookie = cookie.join('; ')

	data["header"] = JSON.stringify(header)
	data["e_r"] = "true"

	let params = Encrypt(path.replace('eapi','api'),JSON.stringify(data))

	let headers = {
		"X-Real-IP": "118.88.88.88",
		"Referer": "http://music.163.com/",
		"Accept-Encoding": "gzip, deflate",
		"Cookie": cookie,
		"Content-Type": "application/x-www-form-urlencoded",
		"Host": "music.163.com",
		"Connection": "Keep-Alive",
		"Pragma": "no-cache",
	}

	request({
		url: `http://music.163.com${path}`,
		method: "POST",
		gzip: true,
		encoding: null,
		headers: headers,
		form: {params: params}
	},function(error, response, body){
		if (error){
			return
		}
		else{
			callBack(Decrypt(body))
		}
	})
}

const path = require('path')
const fs = require('fs')
const nodeID3 = require('node-id3')
const shell = require('electron').shell

// function songDownload(songId){

// 	const songDir = path.join(remote.app.getPath("music"),"Glee")
// 	const coverDir = path.join(remote.app.getPath("temp"),"Glee")

// 	let albumId = songInfo[songId]["albumId"]
// 	let artistId = songInfo[songId]["artistId"]

// 	let coverUrl = albumInfo[albumId]["coverUrl"]
// 	let songName = songInfo[songId]["songName"]
// 	let artistName = artistInfo[artistId]["artistName"]
// 	let albumName = albumInfo[albumId]["albumName"]
// 	let songUrl = songInfo[songId]["songUrl"]
// 	let track = songInfo[songId]["track"]
// 	let songFile = artistName + " - " + songName + ".mp3"
// 	let coverFile = albumId + ".jpg"

// 	songFile = songFile.replace(":","：")
// 	songFile = songFile.replace("*","＊")
// 	songFile = songFile.replace("?","？")
// 	songFile = songFile.replace("\"","＂")
// 	songFile = songFile.replace("<","＜")
// 	songFile = songFile.replace(">","＞")
// 	songFile = songFile.replace("/","／")
// 	songFile = songFile.replace("\\","＼")

// 	let songPath = path.join(songDir,songFile)
// 	let coverPath = path.join(coverDir,coverFile)

// 	function download(url,dirPath,filePath){
// 		return new Promise(function (resolve, reject){
// 			fs.mkdir(dirPath, "0777", function(error){
// 				let writeStream = fs.createWriteStream(filePath)
// 				request(url).pipe(writeStream)
// 				.on("error", function(error){reject(error)})
// 				.on("close", function(){resolve()})
// 			})
// 		})
// 	}

// 	Promise.all([
// 		download(songUrl,songDir,songPath),
// 		download(coverUrl,coverDir,coverPath)
// 	])
// 	.then(function(){
// 		let tags = {
// 			title: songName,
// 			artist: artistName,
// 			album: albumName,
// 			image: coverPath,
// 			trackNumber: track
// 		}
// 		return new Promise(function (resolve, reject){
// 			nodeID3.write(tags,songPath, function(error){
// 				fs.unlink(coverPath,function(){})
// 				if(error)
// 					reject(error)
// 				else
// 					resolve()
// 			})
// 		})
// 	})
// 	.then(function(){
// 		btn.download.setAttribute("class","download")
// 		let notification = new Notification(artistName + " - " + songName, {
// 			icon: coverUrl, 
// 			body: "下载完成, 点击查看"
// 		})
// 		notification.onclick = function(){
// 			shell.showItemInFolder(songPath)
// 		}
// 	})
// 	.catch(function(error){
// 		console.log(`[error]${error}`)
// 	})
// }


// const filter = {
// 	urls: ['*://music.163.com/*']
// }


// require('electron').remote.session.defaultSession.webRequest
// .onSendHeaders(filter, (details) => {
// 	console.log(details)
// })
// require('electron').remote.session.defaultSession

const cookie = {url: 'http://music.163.com', name: '_ntes_nuid', value: crypto.randomBytes(16).toString('hex')}
require('electron').remote.session.defaultSession.cookies.set(cookie, (error) => {
	if (error) console.error(error)
})

require('electron').remote.session.defaultSession.cookies.get({url: 'http://music.163.com'}, (error, cookies) => {
	const keys = cookies.map(cookie => {cookie.name})
})