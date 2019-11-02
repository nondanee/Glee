'use strict'

const crypto = require('crypto')
const netease = require('./js/netease.js')

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
		description: dateFormatter(album.publishTime)
	}),
	playlist: playlist => ({
		type: 'playlist',
		id: playlist.id,
		name: playlist.name,
		cover: playlist.coverImgUrl || playlist.picUrl,
		description: numberFormatter(playlist.playCount) //updateTime
	}),
	song: song => ({
		type: 'song',
		id: song.id,
		name: song.name,
		state: !([-1, -200].includes(song.privilege.st) || [1, 4, 16].includes(song.privilege.fee)),
		number: song.no,
		duration: song.dt / 1000,
		cover: song.al.picUrl || netease.decode(song.al.pic_str),
		album: {id: song.al.id, name: song.al.name},
		artists: song.ar.map(artist => ({id: artist.id, name: artist.name})),
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

const track = {
	artist: id => apiRequest(`v1/artist/${id}`, {})
		.then(data => data.hotSongs).then(data => data.map(extractor.song)),
	album: id => apiRequest(`v1/album/${id}`, {})
		.then(data => data.songs).then(data => data.map(extractor.song)),
	playlist: id => apiRequest('v3/playlist/detail', {id: id, offset: 0, n: 10000, limit: 1000})
		.then(data => {
			data.playlist.tracks.forEach((song, index) => {
				if(data.privileges.length > index) song.privilege = data.privileges[index]
			})
			return data.playlist.tracks
		}).then(data => data.map(extractor.song)),
	url: id => apiRequest('song/enhance/player/url', {ids: [id], br: 320000})
		.then(data => data.data[0].url ? data.data[0] : Promise.reject())
}

const random = space => crypto.randomBytes(1)[0] % space
const apiRequest = (path, data) => new Promise((resolve, reject) => {
	data.header = {os: 'pc'}
	const query = netease.encrypt.eapi(`https://music.163.com/api/${path}`, data || {})
	
	const xhr = new XMLHttpRequest()
	xhr.onreadystatechange = () => {
		if(xhr.readyState == 4){
			xhr.status == 200 ? resolve(JSON.parse(xhr.responseText)) : reject()
		}
	}

	xhr.open('POST', query.url)
	xhr.setRequestHeader('X-Real-IP', `119.29.${random(256)}.${random(256)}`)
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
	xhr.send(Object.keys(query.body).map(key => (key + '=' + encodeURIComponent(query.body[key]))).join('&'))
})

const cookie = {
	'_ntes_nuid': crypto.randomBytes(16).toString('hex'),
}

Object.keys(cookie).map(key => ({url: 'http://music.163.com', name: key, value: cookie[key]}))
.forEach(item => require('electron').remote.session.defaultSession.cookies.set(item, (error) => {
	if (error) console.error(error)
}))

require('electron').remote.session.defaultSession.cookies.get({url: 'http://music.163.com'}, (error, cookies) => {
	const keys = cookies.map(cookie => {cookie.name})
})


// const os = require('os')

// function eapiRequest(path,data,callBack) {

// 	let cookie = []
// 	let header = {
// 		// "MUSIC_A": "",
// 		"MUSIC_A": "8aae43f148f990410b9a2af38324af24e87ab9227c9265627ddd10145db744295fcd8701dc45b1ab8985e142f491516295dd965bae848761274a577a62b0fdc54a50284d1e434dcc04ca6d1a52333c9a",
// 		"MUSIC_U": "",
// 		// "MUSIC_U": "3b7dffec18ad0e7f31eda5961c9a157f4af3aefa0477470ad1c1f3e23d620f4c506a7f8aaaa414613a6e33d6ec1509eb7c20e481d928ce977955a739ab43dce1",
// 		"appver": "1.4.1",
// 		"deviceId": "a9474b0f7f5f10f851a7f519f07842d1",
// 		"os": "uwp",
// 		"osver": "10.0.16299.371",
// 		"requestId": "6c30f907-176b-4ca4-8334-d3d2589e641d",
// 	}
// 	for (let key in header){
// 		if (header[key] != '' && key != 'requestId'){
// 			cookie.push(`${key}=${header[key]}`)
// 		}
// 	}
// 	cookie = cookie.join('; ')

// 	data["header"] = JSON.stringify(header)
// 	data["e_r"] = "true"

// 	let params = Encrypt(path.replace('eapi','api'),JSON.stringify(data))

// 	let headers = {
// 		"X-Real-IP": "118.88.88.88",
// 		"Referer": "http://music.163.com/",
// 		"Accept-Encoding": "gzip, deflate",
// 		"Cookie": cookie,
// 		"Content-Type": "application/x-www-form-urlencoded",
// 		"Host": "music.163.com",
// 		"Connection": "Keep-Alive",
// 		"Pragma": "no-cache",
// 	}

// }