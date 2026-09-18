const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('zone1Kiosk', {
  platform: process.platform,
  isElectron: true,
})
