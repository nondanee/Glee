const {app, BrowserWindow, session, ipcMain, Menu} = require('electron')
const path = require('path')
const crypto = require('crypto')
const url = require('url')
const os = require('os')
const childProcess = require('child_process')
const manifest = require('./package.json')
// app.commandLine.appendSwitch('enable-experimental-web-platform-features', true)
// app.commandLine.appendSwitch('enable-media-session-service', true)
// app.commandLine.appendSwitch('hardware-media-key-handling', true)
// app.commandLine.appendSwitch('global-media-controls', true)
// app.commandLine.appendSwitch('proxy-server', '127.0.0.1:1080')

// app.commandLine.appendSwitch('disable-blink-features', 'ShadowDOMV0,CustomElementsV0,HTMLImports')

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow
const taskbarIcon = path.join(__dirname, '/resource/glee.png')
const dockIcon = path.join(__dirname, '/resource/dock.png')

let swca = {}
try { swca = require('windows-swca') } catch(e) {}
const setWindowAttribute = swca.SetWindowCompositionAttribute

if(process.platform === 'win32'){
	cookie = {
		os: 'uwp',
		appver: '1.4.1',
		osver: childProcess.execSync('ver').toString().match(/[\d|\.]+/)[0],
		deviceId: ''
	}
}

const send = action => mainWindow && mainWindow.webContents.send(action)
const setThumbarButtons = play => mainWindow && mainWindow.setThumbarButtons(
	['previous', play ? 'pause' : 'play', 'next'].map(key => thumbarButton[key])
)

const thumbarButton = {
	previous: {
		tooltip: '上一个',
		icon: path.join(__dirname, 'resource', 'previous.png'),
		click: () => send('previous')
	},
	next: {
		tooltip: '下一个',
		icon: path.join(__dirname, 'resource', 'next.png'),
		click: () => send('next')
	},
	play: {
		tooltip: '播放',
		icon: path.join(__dirname, 'resource', 'play.png'),
		click: () => send('play')
	},
	pause: {
		tooltip: '暂停',
		icon: path.join(__dirname, 'resource', 'pause.png'),
		click: () => send('pause'),
		// flags: ['hidden'] // 有 BUG, 无法更新
	}
}

ipcMain
.on('play', () => setThumbarButtons(true))
.on('pause', () => setThumbarButtons(false))

const createWindow = () => {

	mainWindow = new BrowserWindow({
		width: 1080,
		height: 820,
		// minWidth: 1080,
		// minHeight: 820,
		// resizable: false,

		frame: false,
		thickFrame: true,
		transparent: false,
		backgroundColor: setWindowAttribute ? '#00000000' : '#bbbbbb',

		webPreferences: {
			nodeIntegration: true,
			experimentalFeatures: true
		},

		title: manifest.name,
		icon: taskbarIcon
	})

	if(process.platform === 'darwin'){
		app.dock.setIcon(dockIcon)
	}

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))


	if(process.platform === 'win32' && setWindowAttribute) setWindowAttribute(mainWindow.getNativeWindowHandle(), 4, 0x10000000)
	if(process.platform === 'win32') setThumbarButtons()

	// mainWindow.webContents.openDevTools()

	// Filter sensitive text from default User-Agent
	mainWindow.webContents.setUserAgent(
		mainWindow.webContents.getUserAgent().split(' ').filter(
			fragment => [manifest.name, 'Electron'].every(sensitive => !fragment.startsWith(sensitive))
		).join(' ')
	)

	// Add Referer to headers for api request
	session.defaultSession.webRequest.onBeforeSendHeaders(
		{urls: ['*://music.163.com/*']}, 
		(details, callback) => {
			details.requestHeaders['Referer'] = 'http://music.163.com/'
			details.requestHeaders['Origin'] = 'http://music.163.com/'
			callback({cancel: false, requestHeaders: details.requestHeaders})
		}
	)

	// mainWindow.once('ready-to-show', () => {
	// 	mainWindow.show()
	// })

	// mainWindow.on('focus', () => {
	// 	console.log('focus')
	// })
	// mainWindow.on('blur', () => {
	// 	console.log('blur')
	// })

	mainWindow.on('closed', () => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素
		mainWindow = null
	})
	
}
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数
// 部分 API 在 ready 事件触发后才能使用
app.setAppUserModelId('com.nondanee.glee')
app.setAsDefaultProtocolClient('glee')
app.on('ready', createWindow)

// 当全部窗口关闭时退出
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// 在这文件，你可以续写应用剩下主进程代码
	// 也可以拆分成几个文件，然后用 require 导入
	if (mainWindow === null) {
		createWindow()
	}
})