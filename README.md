<img src="resource/dock.png" alt="logo" width="144" height="144" align="right" />


# Glee
Built by Electron, Vanilla JS, Plain CSS

*The logo is a rebound of [Music Service Branding - G](https://dribbble.com/shots/1203920-Music-Service-Branding-G) by [Zack McBride](https://dribbble.com/zMcBride) in [Dribbble](https://dribbble.com/)*

> ~~勉强算是 "目前最好的网易云音乐客户端 [trazyn/ieaseMusic](https://github.com/trazyn/ieaseMusic)" 的竞品~~ ieaseMusic 都改 slogan 了...

## Whisper
- 因为发现 Electron 的 UWP acrylic 背景实现而重写了之前几百行辣鸡 JS 代码
- 留着一些辣鸡代码没改 (tab 部分) 因为之后这些逻辑用不到了先撑一下
- 其实主要是因为写详情界面太累了所以一直鸽
- 依旧没有后端，弃用 request，请求改成 AJAX 方便调试 (改了 Electron 的请求头)
- 改用 localStorage 代替 electron-json-storage
- 改用 color-thief 代替 material-palette，应该会准一点，启用了 backdrop-filter (可能依旧有 bug)
- 预留了 linuxapi 和 eapi，之后会换，登录和搜索都会有的
- 默认开了 CDN 重定向因为目前人在海外
- 用了 Native Node Modules 可能安装需要开发环境？不太懂

## Acrylic
> 感兴趣亚克力效果实现可以看看这些
- [vscode/issues/32257](https://github.com/Microsoft/vscode/issues/32257)
- [vscode/pull/52707](https://github.com/Microsoft/vscode/pull/52707)
- [arkenthera/electron-vibrancy](https://github.com/arkenthera/electron-vibrancy)
- [23phy/electron-acrylic](https://github.com/23phy/electron-acrylic)
- [sylveon/windows-swca](https://github.com/sylveon/windows-swca)

## Run & Package
```
$ npm install
$ npm start
$ npm run package-win
```

## Preview
![image](https://user-images.githubusercontent.com/26399680/63419786-ff7ae400-c437-11e9-9eb0-59cc80ab78bd.png)
![image](https://user-images.githubusercontent.com/26399680/50385326-d79f7900-070e-11e9-95da-0d5a905e4979.png)
![image](https://user-images.githubusercontent.com/26399680/63419659-c5a9dd80-c437-11e9-87e4-b9f300271561.png)

## Credit
- [lokesh/color-thief](https://github.com/lokesh/color-thief)
- [marijnvdwerf/material-palette](https://github.com/marijnvdwerf/material-palette)
- [Zazama/node-id3](https://github.com/Zazama/node-id3)
- [flozz/StackBlur](https://github.com/flozz/StackBlur)
- [sylveon/windows-swca](https://github.com/sylveon/windows-swca)

## License
MIT

