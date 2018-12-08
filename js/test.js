const encrypt = require('./crypto.js')
const request = require('request')

const apiRequest = (path, data) => new Promise((resolve, reject) => {
    data = encrypt.weapi(data || {})

    const headers = {}
    headers['Referer'] = 'http://music.163.com/'
    headers['Origin'] = 'http://music.163.com/'
    headers['Cookie'] = 'os=pc'
    
    request(
        {method: 'POST', url: `http://music.163.com/weapi/${path}`, headers: headers, form: data},
        (error, _, body) =>  error ? reject() : resolve(JSON.parse(body))
    )
})

// console.log(Object.keys(display.album))

// const test = display.album.artist(20455)

// test.next().then(data => {
//     console.log(data)
//     test.next().then(data => console.log(data.length))
// })

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
		type: 'recipe',
		id: playlist.id,
		name: playlist.name,
		cover: playlist.coverImgUrl || playlist.picUrl,
		description: playlist.playCount
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


const track = {
	artist: id => apiRequest(`v1/artist/${id}`, {})
		.then(data => data.hotSongs).then(data => data.map(extractor.song)),
	album: id => apiRequest(`v1/album/${id}`, {})
		.then(data => data.songs).then(data => data.map(extractor.song)),
	playlist: id => apiRequest('v3/playlist/detail', {id: id, offset: 0, n: 10000, limit: 1000})
        .then(data => data.playlist.tracks).then(data => data.map(extractor.song))
}
