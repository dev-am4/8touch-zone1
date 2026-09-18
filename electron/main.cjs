const { app, BrowserWindow, globalShortcut, powerSaveBlocker } = require('electron')
const path = require('path')

let mainWindow = null
let blockerId = null
const devUrl = process.env.VITE_DEV_SERVER_URL

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    backgroundColor: '#02070d',
    show: false,
    fullscreen: !devUrl,
    kiosk: !devUrl,
    frame: Boolean(devUrl),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.setMenuBarVisibility(false)
  if (devUrl) mainWindow.loadURL(devUrl)
  else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (!devUrl && input.key === 'F12') event.preventDefault()
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason !== 'clean-exit' && !app.isQuitting) {
      setTimeout(() => {
        if (!mainWindow || mainWindow.isDestroyed()) createWindow()
        else mainWindow.reload()
      }, 1200)
    }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    blockerId = powerSaveBlocker.start('prevent-display-sleep')
    globalShortcut.register('CommandOrControl+Shift+Q', () => {
      app.isQuitting = true
      app.quit()
    })
    createWindow()
  })
}

app.on('before-quit', () => {
  app.isQuitting = true
  globalShortcut.unregisterAll()
  if (blockerId !== null && powerSaveBlocker.isStarted(blockerId)) powerSaveBlocker.stop(blockerId)
})

app.on('window-all-closed', () => app.quit())
