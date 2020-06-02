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
		description: formatDate(album.publishTime)
	}),
	playlist: playlist => ({
		type: 'playlist',
		id: playlist.id,
		name: playlist.name,
		cover: playlist.coverImgUrl || playlist.picUrl,
		description: formatNumber(playlist.playCount) // updateTime
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
			
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
					return apiRequest('playlist/highquality/list', query)
					.then(data => data.playlists)
					.then(data => {
						more = data.length === size
						if (more) query.lasttime = data[size - 1].updateTime
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
					if (!more) return Promise.resolve([])
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
		
			return {
				next: () => {
					if (!more) return Promise.resolve([])
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
	playlist: id => apiRequest('v3/playlist/detail', { id: id, n: 0 })
		.then(data => {
			data.playlist.tracks.forEach((song, index) => {
				if (data.privileges.length > index) song.privilege = data.privileges[index]
			})
			return data.playlist.tracks
		}).then(data => data.map(extractor.song)),
	url: id => apiRequest('song/enhance/player/url', { ids: [id], br: 320000 })
		.then(data => data.data[0].url ? data.data[0] : Promise.reject())
}

const random = space => crypto.randomBytes(1)[0] % space
const apiRequest = (path, data) => {
	data.header = { os: 'pc' }
	const query = netease.encrypt.eapi(`https://music.163.com/api/${path}`, data || {})

	return fetch(query.url, {
		method: 'POST',
		headers: {
			'X-Real-IP': `119.29.${random(256)}.${random(256)}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: Object.entries(query.body).map(entry => entry.map(encodeURIComponent).join('=')).join('&')
	})
	.then(response => response.json())
}

const cookie = {
	'_ntes_nuid': crypto.randomBytes(16).toString('hex')
}

Object.keys(cookie).map(key => ({ url: 'http://music.163.com', name: key, value: cookie[key] }))
.forEach(item => require('electron').remote.session.defaultSession.cookies.set(item, (error) => {
	if (error) console.error(error)
}))

require('electron').remote.session.defaultSession.cookies.get({url: 'http://music.163.com'}, (error, cookies) => {

})


// 	let cookie = []
// 	let header = {
// 		"MUSIC_A": "",
// 		"MUSIC_U": "",
// 		"appver": "1.4.1",
// 		"deviceId": "a9474b0f7f5f10f851a7f519f07842d1",
// 		"os": "uwp",
// 		"osver": "10.0.16299.371",
// 		"requestId": "6c30f907-176b-4ca4-8334-d3d2589e641d",
// 	}
// 	for (let key in header) {
// 		if (header[key] != '' && key != 'requestId'){
// 			cookie.push(`${key}=${header[key]}`)
// 		}
// 	}
// 	cookie = cookie.join('; ')

// 	data["header"] = JSON.stringify(header)
// 	data["e_r"] = "true"