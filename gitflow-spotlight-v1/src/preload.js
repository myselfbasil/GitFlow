const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getGitStatus: () => ipcRenderer.invoke('get-git-status'),
  executeGitOperation: (operation, input) => ipcRenderer.invoke('execute-git-operation', operation, input),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  onWindowShown: (callback) => ipcRenderer.on('window-shown', callback),
  
  // Remote management
  getRemotes: () => ipcRenderer.invoke('get-remotes'),
  addRemote: (name, url) => ipcRenderer.invoke('add-remote', name, url),
  removeRemote: (name) => ipcRenderer.invoke('remove-remote', name)
});
