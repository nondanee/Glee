(() => {
	const sideBar = createElement('div','sidebar')
	const backButton = sideBar.appendChild(createElement('button','back'))
	const searchButton = sideBar.appendChild(createElement('button','search'))
	const exploreButton = sideBar.appendChild(createElement('button','explore'))
	const userButton = sideBar.appendChild(createElement('button','user'))
	const playlistButton = sideBar.appendChild(createElement('button','playlist'))
	const albumButton = sideBar.appendChild(createElement('button','album'))
	const artistButton = sideBar.appendChild(createElement('button','artist'))
	const settingButton = sideBar.appendChild(createElement('button','setting'))

	document.body.insertBefore(sideBar, document.body.firstChild)
})()