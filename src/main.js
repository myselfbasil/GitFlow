const { app, BrowserWindow, globalShortcut, ipcMain, shell, dialog, Tray, Menu, screen } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

let mainWindow;
let tray = null;
let isVisible = false;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 650,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    movable: true, // Enable window movement
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer.html'));

  // Hide window when it loses focus - only if not dragging
  mainWindow.on('blur', () => {
    if (isVisible && !mainWindow.webContents.isDevToolsOpened() && !isDragging) {
      hideWindow();
    }
  });

  // Prevent window from being closed
  mainWindow.on('close', (event) => {
    event.preventDefault();
    hideWindow();
  });

  // Center the window
  mainWindow.center();
}

function showWindow() {
  if (!mainWindow) return;
  
  isVisible = true;
  mainWindow.center();
  mainWindow.show();
  mainWindow.focus();
  mainWindow.webContents.send('window-shown');
}

function hideWindow() {
  if (!mainWindow) return;
  
  isVisible = false;
  mainWindow.hide();
}

function toggleWindow() {
  if (isVisible) {
    hideWindow();
  } else {
    showWindow();
  }
}

// Create system tray
function createTray() {
  // Use a default icon for now, will be replaced with proper icon later
  tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Open GitFlow Spotlight', 
      click: () => { showWindow(); }
    },
    { type: 'separator' },
    { 
      label: 'About GitFlow Spotlight',
      click: () => {
        dialog.showMessageBox(mainWindow, {
          title: 'About GitFlow Spotlight',
          message: 'GitFlow Spotlight v1.0.0',
          detail: 'A beautiful Spotlight-like Git interface for macOS\n\nCreated with ❤️',
          buttons: ['OK'],
          icon: path.join(__dirname, '../assets/icon.png')
        });
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => { 
        app.isQuitting = true;
        app.quit(); 
      }
    }
  ]);
  
  tray.setToolTip('GitFlow Spotlight');
  tray.setContextMenu(contextMenu);
  
  // Toggle window on tray icon click
  tray.on('click', () => {
    toggleWindow();
  });
}

// Git command execution
async function executeGitCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const gitProcess = spawn('git', [command, ...args], {
      cwd: options.cwd || process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    gitProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    gitProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    gitProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout.trim(), error: null });
      } else {
        resolve({ success: false, output: stdout.trim(), error: stderr.trim() });
      }
    });

    gitProcess.on('error', (error) => {
      reject({ success: false, output: '', error: error.message });
    });
  });
}

// Check if directory is a git repository
async function isGitRepository(dir = process.cwd()) {
  try {
    const result = await executeGitCommand('rev-parse', ['--is-inside-work-tree'], { cwd: dir });
    return result.success;
  } catch {
    return false;
  }
}

// Get repository name
async function getRepositoryName(dir = process.cwd()) {
  try {
    // Try to get the repo name from the remote URL
    const remoteResult = await executeGitCommand('remote', ['get-url', 'origin'], { cwd: dir });
    
    if (remoteResult.success) {
      const url = remoteResult.output;
      // Extract repo name from URL (works for both HTTPS and SSH URLs)
      const match = url.match(/\/([^\/]+?)(\.git)?$/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no remote or couldn't extract name, use the directory name
    const dirParts = dir.split(path.sep);
    return dirParts[dirParts.length - 1];
  } catch {
    // Fallback to directory name
    const dirParts = dir.split(path.sep);
    return dirParts[dirParts.length - 1];
  }
}

// Get list of remotes
async function getRemotes(dir = process.cwd()) {
  try {
    const result = await executeGitCommand('remote', ['-v'], { cwd: dir });
    if (!result.success) return [];
    
    const remotes = [];
    const lines = result.output.split('\n');
    
    // Parse remote output and create a unique list of remotes with URLs
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Format: name URL (fetch/push)
      const match = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
      if (match) {
        const name = match[1];
        const url = match[2];
        const type = match[3];
        
        // Only add fetch remotes to avoid duplicates
        if (type === 'fetch') {
          remotes.push({ name, url });
        }
      }
    }
    
    return remotes;
  } catch {
    return [];
  }
}

// Get current git status
async function getGitStatus() {
  try {
    const isRepo = await isGitRepository();
    if (!isRepo) {
      return { isRepo: false, branch: null, remote: null, status: null, repoName: null, remotes: [] };
    }

    const [branchResult, remoteResult, statusResult] = await Promise.all([
      executeGitCommand('rev-parse', ['--abbrev-ref', 'HEAD']),
      executeGitCommand('remote', ['-v']),
      executeGitCommand('status', ['--porcelain'])
    ]);
    
    const repoName = await getRepositoryName();
    const remotes = await getRemotes();

    return {
      isRepo: true,
      repoName: repoName,
      branch: branchResult.success ? branchResult.output : 'unknown',
      remote: remoteResult.success ? remoteResult.output.split('\n')[0] : null,
      remotes: remotes,
      status: statusResult.success ? statusResult.output : '',
      hasChanges: statusResult.success && statusResult.output.length > 0,
      currentDirectory: process.cwd()
    };
  } catch (error) {
    return { 
      isRepo: false, 
      branch: null, 
      remote: null, 
      status: null, 
      repoName: null, 
      remotes: [],
      error: error.message,
      currentDirectory: process.cwd()
    };
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register global shortcut
  const shortcutRegistered = globalShortcut.register('CommandOrControl+Shift+G', () => {
    toggleWindow();
  });

  if (!shortcutRegistered) {
    console.error('Failed to register global shortcut');
    // Notify user that shortcut registration failed
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Shortcut Registration Failed',
      message: 'Failed to register global shortcut (Cmd+Shift+G)',
      detail: 'You can still use the app through the system tray icon.',
      buttons: ['OK']
    });
  }

  // Hide dock icon (optional - makes it more like Spotlight)
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

// IPC handlers for git operations
ipcMain.handle('get-git-status', async () => {
  return await getGitStatus();
});

ipcMain.handle('execute-git-operation', async (event, operation, input = '') => {
  try {
    let result;
    
    switch (operation) {
      case 'init':
        result = await executeGitCommand('init');
        break;
        
      case 'clone':
        if (!input) throw new Error('Repository URL required');
        result = await executeGitCommand('clone', [input]);
        break;
        
      case 'add':
        result = await executeGitCommand('add', ['.']);
        break;
        
      case 'commit':
        if (!input) throw new Error('Commit message required');
        result = await executeGitCommand('commit', ['-m', input]);
        break;
        
      case 'push':
        const currentBranch = await executeGitCommand('rev-parse', ['--abbrev-ref', 'HEAD']);
        if (currentBranch.success) {
          result = await executeGitCommand('push', ['-u', 'origin', currentBranch.output]);
        } else {
          result = await executeGitCommand('push');
        }
        break;
        
      case 'quickpush':
        if (!input) throw new Error('Commit message required');
        const addResult = await executeGitCommand('add', ['.']);
        if (!addResult.success) throw new Error(addResult.error);
        
        const commitResult = await executeGitCommand('commit', ['-m', input]);
        if (!commitResult.success) throw new Error(commitResult.error);
        
        result = await executeGitCommand('push');
        break;
        
      case 'pull':
        result = await executeGitCommand('pull');
        break;
        
      case 'branch':
        if (!input) throw new Error('Branch name required');
        result = await executeGitCommand('branch', [input]);
        break;
        
      case 'checkout':
        if (!input) throw new Error('Branch name required');
        result = await executeGitCommand('checkout', [input]);
        break;
        
      case 'merge':
        if (!input) throw new Error('Branch name required');
        result = await executeGitCommand('merge', [input]);
        break;
        
      case 'status':
        result = await executeGitCommand('status');
        break;
        
      case 'log':
        result = await executeGitCommand('log', ['--oneline', '--graph', '--decorate', '-n', '10']);
        break;
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    return result;
  } catch (error) {
    return { success: false, output: '', error: error.message };
  }
});

// Remote management
ipcMain.handle('get-remotes', async () => {
  return await getRemotes();
});

ipcMain.handle('add-remote', async (event, name, url) => {
  if (!name || !url) {
    return { success: false, error: 'Remote name and URL are required' };
  }
  
  try {
    const result = await executeGitCommand('remote', ['add', name, url]);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('remove-remote', async (event, name) => {
  if (!name) {
    return { success: false, error: 'Remote name is required' };
  }
  
  try {
    const result = await executeGitCommand('remote', ['remove', name]);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('hide-window', () => {
  hideWindow();
});

// Window dragging handlers
ipcMain.handle('start-drag', (event) => {
  isDragging = true;
  const windowPosition = mainWindow.getPosition();
  const cursorPosition = screen.getCursorScreenPoint();
  
  // Calculate the offset between cursor and window position
  dragOffset = {
    x: cursorPosition.x - windowPosition[0],
    y: cursorPosition.y - windowPosition[1]
  };
  
  return true;
});

ipcMain.handle('drag-window', (event, cursorPosition) => {
  if (!isDragging) return false;
  
  // Set the new window position based on cursor position and initial offset
  mainWindow.setPosition(
    cursorPosition.x - dragOffset.x,
    cursorPosition.y - dragOffset.y
  );
  
  return true;
});

ipcMain.handle('end-drag', () => {
  isDragging = false;
  return true;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Directory for Git Repository'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    process.chdir(result.filePaths[0]);
    return { success: true, path: result.filePaths[0] };
  }
  
  return { success: false, path: null };
});

app.on('window-all-closed', () => {
  // Keep app running on macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
