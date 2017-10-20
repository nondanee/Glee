const {app, BrowserWindow, session, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let mainWindow
let Menu = require('electron').Menu
let mac = process.platform === 'darwin'
let taskbarIcon = path.join(__dirname, '/resource/glee.png')
let dockIcon = path.join(__dirname, '/resource/dock.png')

var downloadTask = {}

// Modify the user agent for all requests to the following urls.
function createWindow () {
	// 去掉默认菜单栏。
	// Menu.setApplicationMenu(null);
	// 创建浏览器窗口。
	mainWindow = new BrowserWindow({
		width: 1080,
		height: 820,
		resizable: false,
		// minWidth: 1080,
		// minHeight: 820,
		frame: false,
		// webPreferences: {
		//	 experimentalFeatures: true
		// },
		// transparent: true
		title: "Glee",
		icon: taskbarIcon
	})

	if(mac){
		app.dock.setIcon(dockIcon)
	}

	// 加载应用的 index.html。
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))

	// 打开开发者工具。
	// mainWindow.webContents.openDevTools()

	// 当 window 被关闭，这个事件会被触发。
	mainWindow.on('closed', () => {
		// 取消引用 window 对象，如果你的应用支持多窗口的话，
		// 通常会把多个 window 对象存放在一个数组里面，
		// 与此同时，你应该删除相应的元素。
		mainWindow = null
	})
	
}
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// 在这文件，你可以续写应用剩下主进程代码。
	// 也可以拆分成几个文件，然后用 require 导入。
	if (mainWindow === null) {
		createWindow()
	}
})

// ipcMain.on('download', (event, task) => {
// 	console.log('get download request', task)
// 	downloadTask = JSON.parse(task)
// 	event.sender.send('feedback','i will download')
// 	mainWindow.webContents.downloadURL(downloadTask["url"]);
// });







