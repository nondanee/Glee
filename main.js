const {app, BrowserWindow, session, ipcMain, Menu} = require('electron')
const path = require('path')
const crypto = require('crypto')
const url = require('url')
const os = require('os')
const childProcess = require('child_process')
const package = require('./package.json')
// app.commandLine.appendSwitch('proxy-server', '127.0.0.1:1080')

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow
const taskbarIcon = path.join(__dirname, '/resource/glee.png')
const dockIcon = path.join(__dirname, '/resource/dock.png')
const swca = require('windows-swca')

if(process.platform === 'win32'){
	cookie = {
		os: 'uwp',
		appver: '1.4.1',
		osver: childProcess.execSync('ver').toString().match(/[\d|\.]+/)[0],
		deviceId: ''
	}
}

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
		backgroundColor: '#00000000',

		webPreferences: {experimentalFeatures: true},

		title: package.name,
		icon: taskbarIcon
	})

	if(process.platform === 'darwin'){
		app.dock.setIcon(dockIcon)
	}

	// electronAcrylic.setAcrylic(mainWindow, 0xFFFFFF)

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))


	if(process.platform === 'win32') swca.SetWindowCompositionAttribute(mainWindow.getNativeWindowHandle(), 4, 0x10000000)

	// mainWindow.webContents.openDevTools()

	// Filter sensitive text from default User-Agent
	mainWindow.webContents.setUserAgent(
		mainWindow.webContents.getUserAgent().split(' ').filter(
			fragment => [package.name, 'Electron'].every(sensitive => !fragment.startsWith(sensitive))
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

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})

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

// ipcMain.on('download', (event, task) => {
// 	console.log('get download request', task)
// 	downloadTask = JSON.parse(task)
// 	event.sender.send('feedback','i will download')
// 	mainWindow.webContents.downloadURL(downloadTask.url;
// });







