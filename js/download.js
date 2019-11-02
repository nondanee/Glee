const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const parse = require('url').parse
const nodeID3 = require('node-id3')
const remote = require('electron').remote

module.exports = song => {

	const musicFolder = path.join(remote.app.getPath('music'), 'Glee')
	const tempFolder = path.join(remote.app.getPath('temp'), 'Glee')
	const substitution = {':': '：', '\\*': '＊', '\\?': '？', '\"': '＂', '<': '＜', '>': '＞', '/': '／', '\\\\': '＼'}

	let songFile = `${song.artists.map(artist => artist.name).join(',')} - ${song.name}.mp3`
	let coverFile = `${song.id}.jpg`
	Object.keys(substitution).forEach(forbid => songFile = songFile.replace(new RegExp(forbid, 'g'), substitution[forbid]))

	let tag = {
		title: song.name,
		artist: song.artists.map(artist => artist.name).join('/'),
		album: song.album.name,
		image: path.join(tempFolder, coverFile),
		trackNumber: song.number
	}

	const download = (url, folder, file) => {
		return new Promise((resolve, reject) => {
			fs.mkdir(folder, '0777', () => {
				(url.protocol == 'http:' ? http : https)
				.get({path: parse(url).path, hostname: parse(url).hostname})
				.on('response', response => response.pipe(fs.createWriteStream(path.join(folder, file))))
				.on('error', error => reject(error))
				.on('close', () => resolve())
			})
		})
	}

	return Promise.all([
		download(song.url, musicFolder, songFile),
		download(song.cover, tempFolder, coverFile)
	])
	.then(() => {
		return new Promise((resolve, reject) => {
			nodeID3.write(tag, path.join(musicFolder, songFile), error => {
				fs.unlinkSync(path.join(tempFolder, coverFile))
				error ? reject(error) : resolve()
			})
		})
	})
}