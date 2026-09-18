const { app, BrowserWindow, globalShortcut, ipcMain, net, powerSaveBlocker, protocol } = require('electron')
const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')

let mainWindow = null
let blockerId = null
const devUrl = process.env.VITE_DEV_SERVER_URL

const REQUIRED_MEDIA = [
  'idle.mp4',
  'brain.mp4',
  'mouth.mp4',
  'lungs.mp4',
  'heart.mp4',
  'liver.mp4',
  'kidney.mp4',
  'digestive.mp4',
  'muscle.mp4',
]

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'zone1-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
])

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

function getMediaRoot() {
  if (process.env.ZONE1_MEDIA_DIR) {
    return path.resolve(process.env.ZONE1_MEDIA_DIR)
  }

  if (app.isPackaged) {
    return path.join(path.dirname(app.getPath('exe')), 'media')
  }

  return path.join(__dirname, '..', 'media')
}

function safeMediaPath(filename) {
  const safeName = path.basename(filename)
  if (!REQUIRED_MEDIA.includes(safeName)) return null
  return path.join(getMediaRoot(), safeName)
}

async function readMediaInventory() {
  const root = getMediaRoot()
  const files = []

  for (const name of REQUIRED_MEDIA) {
    const filePath = safeMediaPath(name)
    try {
      const stat = await fs.promises.stat(filePath)
      files.push({
        name,
        exists: stat.isFile(),
        size: stat.isFile() ? stat.size : 0,
      })
    } catch {
      files.push({ name, exists: false, size: 0 })
    }
  }

  const present = files.filter((item) => item.exists).length
  const missing = files.filter((item) => !item.exists).map((item) => item.name)

  return {
    root,
    required: REQUIRED_MEDIA.length,
    present,
    missing,
    files,
  }
}

function registerMediaProtocol() {
  protocol.handle('zone1-media', async (request) => {
    try {
      const url = new URL(request.url)
      const filename = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
      const filePath = safeMediaPath(filename)

      if (!filePath) {
        return new Response('Not found', { status: 404 })
      }

      return net.fetch(pathToFileURL(filePath).toString())
    } catch {
      return new Response('Media error', { status: 500 })
    }
  })
}

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
      spellcheck: false,
      backgroundThrottling: false,
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
    if (!devUrl && (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i'))) {
      event.preventDefault()
    }
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason !== 'clean-exit' && !app.isQuitting) {
      setTimeout(() => {
        if (!mainWindow || mainWindow.isDestroyed()) createWindow()
        else mainWindow.reload()
      }, 1200)
    }
  })

  mainWindow.on('unresponsive', () => {
    if (!app.isQuitting && mainWindow && !mainWindow.isDestroyed()) {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.reload()
      }, 1500)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
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
    registerMediaProtocol()

    ipcMain.handle('zone1:get-media-status', async () => readMediaInventory())

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
  ipcMain.removeHandler('zone1:get-media-status')

  if (blockerId !== null && powerSaveBlocker.isStarted(blockerId)) {
    powerSaveBlocker.stop(blockerId)
  }
})

app.on('window-all-closed', () => app.quit())
