'use strict'

const crypto = require('crypto')
const key = 'e82ckenh8dichen8'

function decrypt(cipherText) {
	const decipher = crypto.createDecipheriv('aes-128-ecb',key,'')
	let text = decipher.update(cipherText,'utf8','utf8')
	text += decipher.final('utf8')
	return text
}

function encrypt(uri,data){
	const message = `nobody${uri}use${data}md5forencrypt`
	const hash = crypto.createHash('md5')
	hash.update(message)
	const md5 = hash.digest('hex')
	const text = `${uri}-36cd479b6b5-${data}-36cd479b6b5-${md5}`
	const cipher = crypto.createCipheriv('aes-128-ecb',key,'')
	let cipherText = cipher.update(text,'utf8','hex')
	cipherText += cipher.final('hex')
	return cipherText.toUpperCase()
}

module.exports = {Decrypt:decrypt, Encrypt:encrypt}