const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('zone1Kiosk', {
  platform: process.platform,
  isElectron: true,
  mediaProtocol: 'zone1-media',
  getMediaStatus: () => ipcRenderer.invoke('zone1:get-media-status'),
})
