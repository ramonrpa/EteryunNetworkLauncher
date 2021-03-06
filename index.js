// Requirements
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const autoUpdater = require('electron-updater').autoUpdater
const ejse = require('ejs-electron')
const fs = require('fs')
const isDev = require('./app/assets/js/isdev')
const path = require('path')
const semver = require('semver')
const url = require('url')
let settings = require('./app/config/settings.json')

const redirectUriPrefix = 'https://login.microsoftonline.com/common/oauth2/nativeclient?'

// Setup auto updater.
function initAutoUpdater(event, data) {

    if (data) {
        autoUpdater.allowPrerelease = true
    } else {
        // Defaults to true if application version contains prerelease components (e.g. 0.12.1-alpha.1)
        // autoUpdater.allowPrerelease = true
    }

    if (isDev) {
        autoUpdater.autoInstallOnAppQuit = false
        autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
    }
    if (process.platform === 'darwin') {
        autoUpdater.autoDownload = false
    }

    autoUpdater.on('update-available', (info) => {
        console.log(info)
        event.sender.send('autoUpdateNotification', 'update-available', info)
    })
    autoUpdater.on('update-downloaded', (info) => {
        console.log(info)
        event.sender.send('autoUpdateNotification', 'update-downloaded', info)
    })
    autoUpdater.on('update-not-available', (info) => {
        console.log(info)
        event.sender.send('autoUpdateNotification', 'update-not-available', info)
    })

    autoUpdater.on('download-progress', (progressObj) => {
        event.sender.send('download-progress', progressObj)
    })

    autoUpdater.on('checking-for-update', () => {
        event.sender.send('autoUpdateNotification', 'checking-for-update')
    })
    autoUpdater.on('error', (err) => {
        console.log(error)
        event.sender.send('autoUpdateNotification', 'realerror', err)
    })
}

// Open channel to listen for update actions.
ipcMain.on('autoUpdateAction', (event, arg, data) => {
    switch (arg) {
        case 'initAutoUpdater':
            console.log('Initializing auto updater.')
            initAutoUpdater(event, data)
            event.sender.send('autoUpdateNotification', 'ready')
            break
        case 'checkForUpdate':
            autoUpdater.checkForUpdates()
                .catch(err => {
                    event.sender.send('autoUpdateNotification', 'realerror', err)
                })
            break
        case 'allowPrereleaseChange':
            if (!data) {
                const preRelComp = semver.prerelease(app.getVersion())
                if (preRelComp != null && preRelComp.length > 0) {
                    autoUpdater.allowPrerelease = true
                } else {
                    autoUpdater.allowPrerelease = data
                }
            } else {
                autoUpdater.allowPrerelease = data
            }
            break
        case 'installUpdateNow':
            autoUpdater.quitAndInstall()
            break
        default:
            console.log('Unknown argument', arg)
            break
    }
})
// Redirect distribution index event from preloader to renderer.
ipcMain.on('distributionIndexDone', (event, res) => {
    event.sender.send('distributionIndexDone', res)
})

// Disable hardware acceleration.
// https://electronjs.org/docs/tutorial/offscreen-rendering
app.disableHardwareAcceleration()

let MSALoginWindow = null

// Open the Microsoft Account Login window
ipcMain.on('openMSALoginWindow', (ipcEvent, args) => {
    if(MSALoginWindow != null){
        ipcEvent.sender.send('MSALoginWindowNotification', 'error', 'AlreadyOpenException')
        return
    }
    MSALoginWindow = new BrowserWindow({
        minWidth: 600,
        minHeight: 400,
        width: 600,
        height: 400,
        contextIsolation: false
    })

    MSALoginWindow.on('closed', () => {
        MSALoginWindow = null
    })

    MSALoginWindow.webContents.on('did-navigate', (event, uri, responseCode, statusText) => {
        if(uri.startsWith(redirectUriPrefix)) {
            let querys = uri.substring(redirectUriPrefix.length).split('#', 1).toString().split('&')
            let queryMap = new Map()

            querys.forEach(query => {
                let arr = query.split('=')
                queryMap.set(arr[0], decodeURI(arr[1]))
            })

            ipcEvent.reply('MSALoginWindowReply', queryMap)

            MSALoginWindow.close()
            MSALoginWindow = null
        }
    })

    MSALoginWindow.removeMenu()
    MSALoginWindow.loadURL('https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id=6bfd5487-f049-48d8-b886-bd8b0263f27e&response_type=code&scope=XboxLive.signin%20offline_access&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient')
})


// https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = true

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {

    win = new BrowserWindow({
        width: 980,
        height: 552,
        icon: getPlatformIcon('SealCircle'),
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'app', 'assets', 'js', 'preloader.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            worldSafeExecuteJavaScript: true
        },
        backgroundColor: '#171614'
    })
    ejse.data('backgrounds', fs.readdirSync(path.join(__dirname, 'app', 'assets', 'images', 'backgrounds')).length)

    ejse.data('bkid', Math.floor((Math.random() * fs.readdirSync(path.join(__dirname, 'app', 'assets', 'images', 'backgrounds')).length)))

    Object.keys(settings).forEach(function (key) {
        ejse.data(key, settings[key])
    })

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'app', 'app.ejs'),
        protocol: 'file:',
        slashes: true
    }))

    /*win.once('ready-to-show', () => {
        win.show()
    })*/

    win.removeMenu()

    win.resizable = true

    win.on('closed', () => {
        win = null
    })

    ipcMain.on('closeApp', (event, res) => {
        app.isQuiting = true
        app.quit()
        if (MSALoginWindow !== null) MSALoginWindow.close()
        MSALoginWindow = null
    })

    // Hide Windows and Create Tray
    let tray = null
    ipcMain.on('createTray', (event, res) => {
        win.hide()
        tray = createTray(win)
    })
}

function createTray(mainWindow) {
    let appIcon = new Tray(getPlatformIcon('SealCircle'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Mostrar', click: function () {
                mainWindow.show()
            }
        },
        {
            label: 'Sair', click: function () {
                app.isQuiting = true
                app.quit()
                if (MSALoginWindow !== null) MSALoginWindow.close()
                MSALoginWindow = null
            }
        }
    ])

    appIcon.on('double-click', function (event) {
        mainWindow.show()
    })
    appIcon.setToolTip('Eteryun Network')
    appIcon.setContextMenu(contextMenu)
    return appIcon
}

function createMenu() {

    if (process.platform === 'darwin') {

        // Extend default included application menu to continue support for quit keyboard shortcut
        let applicationSubMenu = {
            label: 'Application',
            submenu: [{
                label: 'About Application',
                selector: 'orderFrontStandardAboutPanel:'
            }, {
                type: 'separator'
            }, {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => {
                    app.quit()
                }
            }]
        }

        // New edit menu adds support for text-editing keyboard shortcuts
        let editSubMenu = {
            label: 'Edit',
            submenu: [{
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                selector: 'undo:'
            }, {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                selector: 'redo:'
            }, {
                type: 'separator'
            }, {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                selector: 'cut:'
            }, {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                selector: 'copy:'
            }, {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                selector: 'paste:'
            }, {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                selector: 'selectAll:'
            }]
        }

        // Bundle submenus into a single template and build a menu object with it
        let menuTemplate = [applicationSubMenu, editSubMenu]
        let menuObject = Menu.buildFromTemplate(menuTemplate)

        // Assign it to the application
        Menu.setApplicationMenu(menuObject)

    }

}

function getPlatformIcon(filename) {
    let ext
    switch (process.platform) {
        case 'win32':
            ext = 'ico'
            break
        case 'darwin':
        case 'linux':
        default:
            ext = 'png'
            break
    }

    return path.join(__dirname, 'app', 'assets', 'images', `${filename}.${ext}`)
}

app.on('ready', createWindow)
app.on('ready', createMenu)

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})