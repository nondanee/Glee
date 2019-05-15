const remote = require('electron').remote
const BrowserWindow = remote.BrowserWindow

const createElement = (tagName, className, innerHTML) => {
	let element = document.createElement(tagName)
	if(className != undefined) element.className = className
	if(innerHTML != undefined) element.innerHTML = innerHTML 
	return element
}

const dateFormatter = timestamp => {
	if (!timestamp) return ''
	let date = new Date(timestamp)
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate()
	return `${year}.${month}.${day}`
}

const numberFormatter = number => {
	if (number / 100000 >= 1)
		return parseInt(number / 10000) + '万'
	else
		return parseInt(number)
}

const secondFormatter = value => {
	if(isNaN(value)) return '0:00'
	let minute = Math.floor(value / 60)
	let second = Math.floor(value - minute * 60)
	second = (second < 10) ? '0' + second.toString() : second.toString()
	return minute.toString() + ':' + second
}

const colorConverter = {
	rgbToHsl: color => {
		let r = color[0] / 255, g = color[1] / 255, b = color[2] / 255
		let max = Math.max(r, g, b)
		let min = Math.min(r, g, b)
		let d = max - min
		let h
		if (d === 0) h = 0
		else if (max === r) h = (g - b) / d % 6
		else if (max === g) h = (b - r) / d + 2
		else if (max === b) h = (r - g) / d + 4
		let l = (min + max) / 2
		let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
		return [h * 60, s, l]
	},
	hslToRgb: color => {
		let h = color[0], s = color[1], l = color[2]
		let c = (1 - Math.abs(2 * l - 1)) * s
		let hp = h / 60.0
		let x = c * (1 - Math.abs((hp % 2) - 1))
		let rgb1
		if (isNaN(h)) rgb1 = [0, 0, 0]
		else if (hp <= 1) rgb1 = [c, x, 0]
		else if (hp <= 2) rgb1 = [x, c, 0]
		else if (hp <= 3) rgb1 = [0, c, x]
		else if (hp <= 4) rgb1 = [0, x, c]
		else if (hp <= 5) rgb1 = [x, 0, c]
		else if (hp <= 6) rgb1 = [c, 0, x]
		let m = l - c * 0.5
		return [
			Math.round(255 * (rgb1[0] + m)),
			Math.round(255 * (rgb1[1] + m)),
			Math.round(255 * (rgb1[2] + m))
		]
	}
}